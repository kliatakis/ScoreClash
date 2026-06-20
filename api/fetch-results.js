// ─── ScoreClash: Automatic Results Fetcher ────────────────────────────────────
// Runs on a schedule (see vercel.json) and pulls today's World Cup 2026 results
// from API-Football, then writes any new results to Firestore exactly as the
// admin's manual entry does. Never overwrites existing results. Never touches
// predictions, users, or leagues.
//
// Uses the Firebase ADMIN SDK (not the client SDK) because this is trusted
// backend code, not a logged-in user's browser. Firestore's security rules
// require request.auth != null for all reads/writes — the client SDK would
// be rejected with "Missing or insufficient permissions" since this function
// has no logged-in user. The Admin SDK authenticates via a service account
// key instead, which Firestore rules don't apply to at all (by design — it's
// meant for trusted server environments exactly like this one).
//
// This does NOT loosen security for regular users in any way — the existing
// Firestore rules are completely unchanged, and only this backend function
// (which only you control, via the Vercel environment variable) gets this
// elevated access.

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { WC2026_FIXTURES } from "./wc2026-fixtures.js";

// ── Firebase Admin setup ──────────────────────────────────────────────────────
// The service account key is stored as a Vercel environment variable
// (FIREBASE_SERVICE_ACCOUNT_KEY) containing the full JSON key as a string.
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({
    credential: cert(serviceAccount),
  });
}
const db = getFirestore();

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

    // Read current results from Firestore (Admin SDK syntax)
    const resultsDocRef = db.collection("store").doc("sc_results");
    const resultsSnap = await resultsDocRef.get();
    const currentResults = resultsSnap.exists ? JSON.parse(resultsSnap.data().value) : {};

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
      await resultsDocRef.set({ value: JSON.stringify(currentResults) });
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
