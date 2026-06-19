// ─── ScoreClash: Automatic Results Fetcher ────────────────────────────────────
// Runs on a schedule (see vercel.json) and pulls today's World Cup 2026 results
// from API-Football, then writes any new results to Firestore exactly as the
// admin's manual entry does. Never overwrites existing results. Never touches
// predictions, users, or leagues.
//
// NOTE: written in ES module syntax (import/export) as a plain .js file
// because:
//   1. Vercel's /api router only recognizes .js, .mjs, or .ts as valid
//      function entry-point extensions — .cjs is a valid helper file but
//      is NOT routable directly, which is why an earlier version of this
//      file (renamed to .cjs) returned 404 NOT_FOUND.
//   2. This project's package.json has "type": "module", which means any
//      plain .js file is parsed as ESM by Node — so import/export is the
//      correct, compatible syntax here (the earlier CommonJS attempt
//      crashed with "require is not defined in ES module scope" for
//      exactly this reason).

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { WC2026_FIXTURES } from "./wc2026-fixtures.js";

// ── Firebase setup (same project as the main app) ────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA6Eu8yKfYbpmfROUURTpvosEt7tDTwQYg",
  authDomain: "scoreclash-4fa78.firebaseapp.com",
  projectId: "scoreclash-4fa78",
  storageBucket: "scoreclash-4fa78.firebasestorage.app",
  messagingSenderId: "783244227672",
  appId: "1:783244227672:web:64d9992f23a41c837f062d",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── API-Football team name → our team name mapping ───────────────────────────
// API-Football uses some different naming conventions than FIFA's official
// names (which we use). This table translates their names to ours.
// IMPORTANT: this list should be verified/expanded after the first few
// real API calls — some entries are educated guesses based on known
// API-Football conventions and may need correction.
const NAME_MAP = {
  "Czech Republic": "Czechia",
  "South Korea": "Korea Republic",
  "Korea Republic": "Korea Republic",
  "USA": "United States",
  "United States": "United States",
  "Ivory Coast": "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Bosnia": "Bosnia and Herzegovina",
  "Bosnia and Herzegovina": "Bosnia and Herzegovina",
  "Turkey": "Türkiye",
  "Türkiye": "Türkiye",
  "DR Congo": "DR Congo",
  "Democratic Republic of the Congo": "DR Congo",
  "Curacao": "Curaçao",
  "Curaçao": "Curaçao",
  "Cape Verde": "Cape Verde",
  "Cabo Verde": "Cape Verde",
};

function normalizeTeamName(apiName) {
  return NAME_MAP[apiName] || apiName;
}

// ── Main handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Allow two ways to trigger this safely:
  // 1. Vercel's Cron Jobs — authenticated via CRON_SECRET header
  // 2. Manual trigger from inside the app itself — identified by the
  //    ?manual=true query param + a same-origin Referer check. This isn't
  //    bank-grade security, but it's appropriate for a private friends app:
  //    it stops random internet bots from spamming the endpoint and burning
  //    through the free API quota, without needing a full user-auth system
  //    wired into a standalone serverless function.
  const authHeader = req.headers["authorization"];
  const isCronRequest = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

  const isManualRequest = req.query?.manual === "true" &&
    (req.headers["referer"] || "").includes("score-clash.vercel.app");

  if (!isCronRequest && !isManualRequest) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API_FOOTBALL_KEY not configured" });
  }

  try {
    // Today's date in EEST (UTC+3) since that's our tournament's reference timezone
    const now = new Date();
    const eestNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const todayStr = eestNow.toISOString().split("T")[0];

    // Free tier is limited to 100 requests/day, so we only check "today"
    // (EEST) on each run.
    const url = `https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${todayStr}`;
    const response = await fetch(url, {
      headers: { "x-apisports-key": apiKey },
    });
    const data = await response.json();
    const allApiFixtures = Array.isArray(data.response) ? data.response : [];

    // Read current results from Firestore
    const resultsDocRef = doc(db, "store", "sc_results");
    const resultsSnap = await getDoc(resultsDocRef);
    const currentResults = resultsSnap.exists() ? JSON.parse(resultsSnap.data().value) : {};

    let updatedCount = 0;
    const updates = [];

    for (const apiFixture of allApiFixtures) {
      const status = apiFixture.fixture?.status?.short;
      // Only process finished matches: FT (full time), AET (extra time), PEN (penalties)
      const isFinished = ["FT", "AET", "PEN"].includes(status);
      if (!isFinished) continue;

      const apiHome = normalizeTeamName(apiFixture.teams?.home?.name);
      const apiAway = normalizeTeamName(apiFixture.teams?.away?.name);
      const homeGoals = apiFixture.goals?.home;
      const awayGoals = apiFixture.goals?.away;

      if (homeGoals == null || awayGoals == null) continue;

      // Find matching fixture in our data by team names
      const apiDate = apiFixture.fixture?.date?.split("T")[0];
      const match = WC2026_FIXTURES.find(f =>
        f.home === apiHome && f.away === apiAway
      );

      if (!match) {
        updates.push({ status: "no_match", apiHome, apiAway, apiDate });
        continue;
      }

      // Skip if we already have this result (never overwrite)
      if (currentResults[match.id]) {
        updates.push({ status: "already_exists", fixtureId: match.id });
        continue;
      }

      currentResults[match.id] = { homeGoals, awayGoals };
      updatedCount++;
      updates.push({ status: "added", fixtureId: match.id, home: apiHome, away: apiAway, score: `${homeGoals}-${awayGoals}` });
    }

    // Only write if we actually added something
    if (updatedCount > 0) {
      await setDoc(resultsDocRef, { value: JSON.stringify(currentResults) });
    }

    return res.status(200).json({
      success: true,
      checked: allApiFixtures.length,
      updated: updatedCount,
      details: updates,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
