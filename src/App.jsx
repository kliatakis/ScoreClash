import { useState, useEffect, useRef } from "react";
import { fsGet, fsSet, fsDel, fsSubscribe, fsWriteUser, fsReadUser, fsDeleteUser, fsSubscribeUsers, fsGetAllUsers, fbRegister, fbLogin, fbLogout, fbResetPassword, fbDeleteAccount, fbOnAuthChange, auth } from "./firebase.js";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const WC2026_GROUPS = {
  A: ["Mexico", "South Africa", "Korea Republic", "Czechia"],
  B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["United States", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

const WC2026_FIXTURES = [
  { id: "gs1", group: "A", home: "Mexico", away: "South Africa", date: "2026-06-11", time: "22:00 EEST", stage: "Group Stage", venue: "Mexico City" },
  { id: "gs2", group: "A", home: "Korea Republic", away: "Czechia", date: "2026-06-12", time: "05:00 EEST", stage: "Group Stage", venue: "Guadalajara" },
  { id: "gs3", group: "B", home: "Canada", away: "Bosnia and Herzegovina", date: "2026-06-12", time: "22:00 EEST", stage: "Group Stage", venue: "Toronto" },
  { id: "gs4", group: "D", home: "United States", away: "Paraguay", date: "2026-06-13", time: "04:00 EEST", stage: "Group Stage", venue: "Inglewood" },
  { id: "gs5", group: "B", home: "Qatar", away: "Switzerland", date: "2026-06-13", time: "22:00 EEST", stage: "Group Stage", venue: "Santa Clara" },
  { id: "gs6", group: "C", home: "Brazil", away: "Morocco", date: "2026-06-14", time: "01:00 EEST", stage: "Group Stage", venue: "East Rutherford" },
  { id: "gs7", group: "C", home: "Haiti", away: "Scotland", date: "2026-06-14", time: "04:00 EEST", stage: "Group Stage", venue: "Foxborough" },
  { id: "gs8", group: "D", home: "Australia", away: "Türkiye", date: "2026-06-14", time: "07:00 EEST", stage: "Group Stage", venue: "Vancouver" },
  { id: "gs9", group: "E", home: "Germany", away: "Curaçao", date: "2026-06-14", time: "20:00 EEST", stage: "Group Stage", venue: "Houston" },
  { id: "gs10", group: "F", home: "Netherlands", away: "Japan", date: "2026-06-14", time: "23:00 EEST", stage: "Group Stage", venue: "Arlington" },
  { id: "gs11", group: "E", home: "Ivory Coast", away: "Ecuador", date: "2026-06-15", time: "02:00 EEST", stage: "Group Stage", venue: "Philadelphia" },
  { id: "gs12", group: "F", home: "Sweden", away: "Tunisia", date: "2026-06-15", time: "05:00 EEST", stage: "Group Stage", venue: "Monterrey" },
  { id: "gs13", group: "H", home: "Spain", away: "Cape Verde", date: "2026-06-15", time: "19:00 EEST", stage: "Group Stage", venue: "Atlanta" },
  { id: "gs14", group: "G", home: "Belgium", away: "Egypt", date: "2026-06-15", time: "22:00 EEST", stage: "Group Stage", venue: "Seattle" },
  { id: "gs15", group: "H", home: "Saudi Arabia", away: "Uruguay", date: "2026-06-16", time: "01:00 EEST", stage: "Group Stage", venue: "Miami Gardens" },
  { id: "gs16", group: "G", home: "Iran", away: "New Zealand", date: "2026-06-16", time: "04:00 EEST", stage: "Group Stage", venue: "Inglewood" },
  { id: "gs17", group: "I", home: "France", away: "Senegal", date: "2026-06-16", time: "22:00 EEST", stage: "Group Stage", venue: "East Rutherford" },
  { id: "gs18", group: "I", home: "Iraq", away: "Norway", date: "2026-06-17", time: "01:00 EEST", stage: "Group Stage", venue: "Foxborough" },
  { id: "gs19", group: "J", home: "Argentina", away: "Algeria", date: "2026-06-17", time: "04:00 EEST", stage: "Group Stage", venue: "Kansas City" },
  { id: "gs20", group: "J", home: "Austria", away: "Jordan", date: "2026-06-17", time: "07:00 EEST", stage: "Group Stage", venue: "Santa Clara" },
  { id: "gs21", group: "K", home: "Portugal", away: "DR Congo", date: "2026-06-17", time: "20:00 EEST", stage: "Group Stage", venue: "Houston" },
  { id: "gs22", group: "L", home: "England", away: "Croatia", date: "2026-06-17", time: "23:00 EEST", stage: "Group Stage", venue: "Arlington" },
  { id: "gs23", group: "L", home: "Ghana", away: "Panama", date: "2026-06-18", time: "02:00 EEST", stage: "Group Stage", venue: "Toronto" },
  { id: "gs24", group: "K", home: "Uzbekistan", away: "Colombia", date: "2026-06-18", time: "05:00 EEST", stage: "Group Stage", venue: "Mexico City" },
  { id: "gs25", group: "A", home: "Czechia", away: "South Africa", date: "2026-06-18", time: "19:00 EEST", stage: "Group Stage", venue: "Atlanta" },
  { id: "gs26", group: "B", home: "Switzerland", away: "Bosnia and Herzegovina", date: "2026-06-18", time: "22:00 EEST", stage: "Group Stage", venue: "Inglewood" },
  { id: "gs27", group: "B", home: "Canada", away: "Qatar", date: "2026-06-19", time: "01:00 EEST", stage: "Group Stage", venue: "Vancouver" },
  { id: "gs28", group: "A", home: "Mexico", away: "Korea Republic", date: "2026-06-19", time: "04:00 EEST", stage: "Group Stage", venue: "Guadalajara" },
  { id: "gs29", group: "D", home: "United States", away: "Australia", date: "2026-06-19", time: "22:00 EEST", stage: "Group Stage", venue: "Seattle" },
  { id: "gs30", group: "C", home: "Scotland", away: "Morocco", date: "2026-06-20", time: "01:00 EEST", stage: "Group Stage", venue: "Foxborough" },
  { id: "gs31", group: "C", home: "Brazil", away: "Haiti", date: "2026-06-20", time: "04:00 EEST", stage: "Group Stage", venue: "Philadelphia" },
  { id: "gs32", group: "D", home: "Türkiye", away: "Paraguay", date: "2026-06-20", time: "07:00 EEST", stage: "Group Stage", venue: "Santa Clara" },
  { id: "gs33", group: "F", home: "Netherlands", away: "Sweden", date: "2026-06-20", time: "20:00 EEST", stage: "Group Stage", venue: "Houston" },
  { id: "gs34", group: "E", home: "Germany", away: "Ivory Coast", date: "2026-06-20", time: "23:00 EEST", stage: "Group Stage", venue: "Toronto" },
  { id: "gs35", group: "E", home: "Ecuador", away: "Curaçao", date: "2026-06-21", time: "03:00 EEST", stage: "Group Stage", venue: "Kansas City" },
  { id: "gs36", group: "F", home: "Tunisia", away: "Japan", date: "2026-06-21", time: "07:00 EEST", stage: "Group Stage", venue: "Monterrey" },
  { id: "gs37", group: "H", home: "Spain", away: "Saudi Arabia", date: "2026-06-21", time: "19:00 EEST", stage: "Group Stage", venue: "Atlanta" },
  { id: "gs38", group: "G", home: "Belgium", away: "Iran", date: "2026-06-21", time: "22:00 EEST", stage: "Group Stage", venue: "Inglewood" },
  { id: "gs39", group: "H", home: "Uruguay", away: "Cape Verde", date: "2026-06-22", time: "01:00 EEST", stage: "Group Stage", venue: "Miami Gardens" },
  { id: "gs40", group: "G", home: "New Zealand", away: "Egypt", date: "2026-06-22", time: "04:00 EEST", stage: "Group Stage", venue: "Vancouver" },
  { id: "gs41", group: "J", home: "Argentina", away: "Austria", date: "2026-06-22", time: "20:00 EEST", stage: "Group Stage", venue: "Arlington" },
  { id: "gs42", group: "I", home: "France", away: "Iraq", date: "2026-06-23", time: "00:00 EEST", stage: "Group Stage", venue: "Philadelphia" },
  { id: "gs43", group: "I", home: "Norway", away: "Senegal", date: "2026-06-23", time: "03:00 EEST", stage: "Group Stage", venue: "East Rutherford" },
  { id: "gs44", group: "J", home: "Jordan", away: "Algeria", date: "2026-06-23", time: "06:00 EEST", stage: "Group Stage", venue: "Santa Clara" },
  { id: "gs45", group: "K", home: "Portugal", away: "Uzbekistan", date: "2026-06-23", time: "20:00 EEST", stage: "Group Stage", venue: "Houston" },
  { id: "gs46", group: "L", home: "England", away: "Ghana", date: "2026-06-23", time: "23:00 EEST", stage: "Group Stage", venue: "Foxborough" },
  { id: "gs47", group: "L", home: "Panama", away: "Croatia", date: "2026-06-24", time: "02:00 EEST", stage: "Group Stage", venue: "Toronto" },
  { id: "gs48", group: "K", home: "Colombia", away: "DR Congo", date: "2026-06-24", time: "05:00 EEST", stage: "Group Stage", venue: "Guadalajara" },
  { id: "gs49", group: "B", home: "Switzerland", away: "Canada", date: "2026-06-24", time: "22:00 EEST", stage: "Group Stage", venue: "Vancouver" },
  { id: "gs50", group: "B", home: "Bosnia and Herzegovina", away: "Qatar", date: "2026-06-24", time: "22:00 EEST", stage: "Group Stage", venue: "Seattle" },
  { id: "gs51", group: "C", home: "Scotland", away: "Brazil", date: "2026-06-25", time: "01:00 EEST", stage: "Group Stage", venue: "Miami" },
  { id: "gs52", group: "C", home: "Morocco", away: "Haiti", date: "2026-06-25", time: "01:00 EEST", stage: "Group Stage", venue: "Atlanta" },
  { id: "gs53", group: "A", home: "Czechia", away: "Mexico", date: "2026-06-25", time: "04:00 EEST", stage: "Group Stage", venue: "Mexico City" },
  { id: "gs54", group: "A", home: "South Africa", away: "Korea Republic", date: "2026-06-25", time: "04:00 EEST", stage: "Group Stage", venue: "Monterrey" },
  { id: "gs55", group: "E", home: "Ecuador", away: "Germany", date: "2026-06-25", time: "23:00 EEST", stage: "Group Stage", venue: "East Rutherford" },
  { id: "gs56", group: "E", home: "Curaçao", away: "Ivory Coast", date: "2026-06-25", time: "23:00 EEST", stage: "Group Stage", venue: "Philadelphia" },
  { id: "gs57", group: "F", home: "Japan", away: "Sweden", date: "2026-06-26", time: "02:00 EEST", stage: "Group Stage", venue: "Arlington" },
  { id: "gs58", group: "F", home: "Tunisia", away: "Netherlands", date: "2026-06-26", time: "02:00 EEST", stage: "Group Stage", venue: "Kansas City" },
  { id: "gs59", group: "D", home: "Türkiye", away: "United States", date: "2026-06-26", time: "05:00 EEST", stage: "Group Stage", venue: "Inglewood" },
  { id: "gs60", group: "D", home: "Paraguay", away: "Australia", date: "2026-06-26", time: "05:00 EEST", stage: "Group Stage", venue: "Santa Clara" },
  { id: "gs61", group: "I", home: "Norway", away: "France", date: "2026-06-26", time: "22:00 EEST", stage: "Group Stage", venue: "Foxborough" },
  { id: "gs62", group: "I", home: "Senegal", away: "Iraq", date: "2026-06-26", time: "22:00 EEST", stage: "Group Stage", venue: "Toronto" },
  { id: "gs63", group: "H", home: "Cape Verde", away: "Saudi Arabia", date: "2026-06-27", time: "03:00 EEST", stage: "Group Stage", venue: "Houston" },
  { id: "gs64", group: "H", home: "Uruguay", away: "Spain", date: "2026-06-27", time: "03:00 EEST", stage: "Group Stage", venue: "Guadalajara" },
  { id: "gs65", group: "G", home: "Egypt", away: "Iran", date: "2026-06-27", time: "06:00 EEST", stage: "Group Stage", venue: "Seattle" },
  { id: "gs66", group: "G", home: "New Zealand", away: "Belgium", date: "2026-06-27", time: "06:00 EEST", stage: "Group Stage", venue: "Vancouver" },
  { id: "gs67", group: "L", home: "Panama", away: "England", date: "2026-06-28", time: "00:00 EEST", stage: "Group Stage", venue: "East Rutherford" },
  { id: "gs68", group: "L", home: "Croatia", away: "Ghana", date: "2026-06-28", time: "00:00 EEST", stage: "Group Stage", venue: "Philadelphia" },
  { id: "gs69", group: "K", home: "Colombia", away: "Portugal", date: "2026-06-28", time: "02:30 EEST", stage: "Group Stage", venue: "Miami" },
  { id: "gs70", group: "K", home: "DR Congo", away: "Uzbekistan", date: "2026-06-28", time: "02:30 EEST", stage: "Group Stage", venue: "Atlanta" },
  { id: "gs71", group: "J", home: "Algeria", away: "Austria", date: "2026-06-28", time: "05:00 EEST", stage: "Group Stage", venue: "Kansas City" },
  { id: "gs72", group: "J", home: "Jordan", away: "Argentina", date: "2026-06-28", time: "05:00 EEST", stage: "Group Stage", venue: "Arlington" },
  { id: "r32_1", home: "TBD (A2)", away: "TBD (B2)", date: "2026-06-28", time: "22:00 EEST", stage: "Round of 32", venue: "Inglewood" },
  { id: "r32_2", home: "TBD (C1)", away: "TBD (F2)", date: "2026-06-29", time: "20:00 EEST", stage: "Round of 32", venue: "Houston" },
  { id: "r32_3", home: "TBD (E1)", away: "TBD (3rd)", date: "2026-06-29", time: "23:30 EEST", stage: "Round of 32", venue: "Foxborough" },
  { id: "r32_4", home: "TBD (F1)", away: "TBD (C2)", date: "2026-06-29", time: "04:00 EEST", stage: "Round of 32", venue: "Guadalajara" },
  { id: "r32_5", home: "TBD (E2)", away: "TBD (I2)", date: "2026-06-30", time: "20:00 EEST", stage: "Round of 32", venue: "Arlington" },
  { id: "r32_6", home: "TBD (I1)", away: "TBD (3rd)", date: "2026-06-30", time: "00:00 EEST", stage: "Round of 32", venue: "East Rutherford" },
  { id: "r32_7", home: "TBD (A1)", away: "TBD (3rd)", date: "2026-06-30", time: "04:00 EEST", stage: "Round of 32", venue: "Mexico City" },
  { id: "r32_8", home: "TBD (L1)", away: "TBD (3rd)", date: "2026-07-01", time: "19:00 EEST", stage: "Round of 32", venue: "Atlanta" },
  { id: "r32_9", home: "TBD (G1)", away: "TBD (3rd)", date: "2026-07-01", time: "23:00 EEST", stage: "Round of 32", venue: "Seattle" },
  { id: "r32_10", home: "TBD (D1)", away: "TBD (3rd)", date: "2026-07-01", time: "03:00 EEST", stage: "Round of 32", venue: "Santa Clara" },
  { id: "r32_11", home: "TBD (H1)", away: "TBD (J2)", date: "2026-07-02", time: "22:00 EEST", stage: "Round of 32", venue: "Inglewood" },
  { id: "r32_12", home: "TBD (K2)", away: "TBD (L2)", date: "2026-07-02", time: "02:00 EEST", stage: "Round of 32", venue: "Toronto" },
  { id: "r32_13", home: "TBD (B1)", away: "TBD (3rd)", date: "2026-07-02", time: "06:00 EEST", stage: "Round of 32", venue: "Vancouver" },
  { id: "r32_14", home: "TBD (D2)", away: "TBD (G2)", date: "2026-07-03", time: "21:00 EEST", stage: "Round of 32", venue: "Arlington" },
  { id: "r32_15", home: "TBD (J1)", away: "TBD (H2)", date: "2026-07-03", time: "01:00 EEST", stage: "Round of 32", venue: "Miami" },
  { id: "r32_16", home: "TBD (K1)", away: "TBD (3rd)", date: "2026-07-03", time: "04:30 EEST", stage: "Round of 32", venue: "Kansas City" },
  { id: "r16_1", home: "TBD", away: "TBD", date: "2026-07-04", time: "20:00 EEST", stage: "Round of 16", venue: "Houston" },
  { id: "r16_2", home: "TBD", away: "TBD", date: "2026-07-04", time: "00:00 EEST", stage: "Round of 16", venue: "Philadelphia" },
  { id: "r16_3", home: "TBD", away: "TBD", date: "2026-07-05", time: "23:00 EEST", stage: "Round of 16", venue: "East Rutherford" },
  { id: "r16_4", home: "TBD", away: "TBD", date: "2026-07-05", time: "03:00 EEST", stage: "Round of 16", venue: "Mexico City" },
  { id: "r16_5", home: "TBD", away: "TBD", date: "2026-07-06", time: "22:00 EEST", stage: "Round of 16", venue: "Arlington" },
  { id: "r16_6", home: "TBD", away: "TBD", date: "2026-07-06", time: "00:00 EEST", stage: "Round of 16", venue: "Seattle" },
  { id: "r16_7", home: "TBD", away: "TBD", date: "2026-07-07", time: "19:00 EEST", stage: "Round of 16", venue: "Atlanta" },
  { id: "r16_8", home: "TBD", away: "TBD", date: "2026-07-07", time: "23:00 EEST", stage: "Round of 16", venue: "Vancouver" },
  { id: "qf1", home: "TBD", away: "TBD", date: "2026-07-09", time: "23:00 EEST", stage: "Quarterfinal", venue: "Foxborough" },
  { id: "qf2", home: "TBD", away: "TBD", date: "2026-07-10", time: "22:00 EEST", stage: "Quarterfinal", venue: "Inglewood" },
  { id: "qf3", home: "TBD", away: "TBD", date: "2026-07-11", time: "00:00 EEST", stage: "Quarterfinal", venue: "Miami Gardens" },
  { id: "qf4", home: "TBD", away: "TBD", date: "2026-07-11", time: "04:00 EEST", stage: "Quarterfinal", venue: "Kansas City" },
  { id: "sf1", home: "TBD", away: "TBD", date: "2026-07-14", time: "22:00 EEST", stage: "Semifinal", venue: "Arlington" },
  { id: "sf2", home: "TBD", away: "TBD", date: "2026-07-15", time: "22:00 EEST", stage: "Semifinal", venue: "Atlanta" },
  { id: "3p", home: "TBD", away: "TBD", date: "2026-07-18", time: "00:00 EEST", stage: "Third Place", venue: "Miami Gardens" },
  { id: "final", home: "TBD", away: "TBD", date: "2026-07-19", time: "22:00 EEST", stage: "Final", venue: "East Rutherford" },
];

const ALL_TEAMS = Object.values(WC2026_GROUPS).flat().sort();

// ─── FIRESTORE-BACKED STORAGE ─────────────────────────────────────────────────
// Synchronous cache so all existing components read data without awaiting.
// App component populates and keeps this live via real-time Firestore subscriptions.
let _cache = {};
const storage = {
  get: (k) => _cache[k] ?? null,
  set: async (k, v) => { _cache[k] = v; await fsSet(k, v); },
  del: async (k) => { delete _cache[k]; await fsDel(k); },
};

// Keep sc_users cache in sync with individual user docs
function mergeUserIntoCache(uid, profile) {
  if (!_cache["sc_users"]) _cache["sc_users"] = {};
  if (profile) _cache["sc_users"][uid] = profile;
  else delete _cache["sc_users"][uid];
}

// In-memory leaderboard snapshots for movement arrows
const _lbSnapshots = {};

const STORE_KEYS = ["sc_leagues", "sc_predictions", "sc_results"];

function generateCode(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

// ─── SCORING ──────────────────────────────────────────────────────────────────
const DEFAULT_SCORING = { outcomePoints: 1, exactPoints: 3, winnerPoints: 15 };

function getScoringSettings(league) {
  const s = league?.settings || {};
  return {
    outcomePoints: Number(s.outcomePoints ?? DEFAULT_SCORING.outcomePoints),
    exactPoints:   Number(s.exactPoints   ?? DEFAULT_SCORING.exactPoints),
    winnerPoints:  Number(s.winnerPoints  ?? DEFAULT_SCORING.winnerPoints),
  };
}

function calcMatchScore(pred, result, scoring = DEFAULT_SCORING) {
  if (!pred || !result) return 0;
  const { homeGoals: ph, awayGoals: pa } = pred;
  const { homeGoals: rh, awayGoals: ra } = result;
  if (ph == null || pa == null || rh == null || ra == null) return 0;
  if (Number(ph) === Number(rh) && Number(pa) === Number(ra)) return scoring.exactPoints;
  const predOutcome = ph > pa ? "H" : pa > ph ? "A" : "D";
  const realOutcome = rh > ra ? "H" : ra > rh ? "A" : "D";
  if (predOutcome === realOutcome) return scoring.outcomePoints;
  return 0;
}

function calcLeaderboard(leagueId, withMovement = false) {
  const leagues = storage.get("sc_leagues") || {};
  const users = storage.get("sc_users") || {};
  const predictions = storage.get("sc_predictions") || {};
  const results = storage.get("sc_results") || {};
  const league = leagues[leagueId];
  if (!league) return [];

  const scoring = getScoringSettings(league);

  const entries = league.members.map(uid => {
    const user = users[uid];
    let pts = 0;
    let exact = 0, correct = 0, total = 0;
    WC2026_FIXTURES.forEach(f => {
      const pred = (predictions[uid] || {})[leagueId]?.[f.id];
      const result = results[f.id];
      const s = calcMatchScore(pred, result, scoring);
      pts += s;
      if (result != null && pred?.homeGoals != null) {
        total++;
        if (s === scoring.exactPoints) exact++;
        else if (s === scoring.outcomePoints) correct++;
      }
    });
    if (league.settings?.tournamentWinnerBonus) {
      const twPred = (predictions[uid] || {})[leagueId]?.tournament_winner;
      const twResult = results["tournament_winner"];
      const correctWinner = twPred && twResult && twPred === twResult ? 1 : 0;
      if (correctWinner) pts += scoring.winnerPoints;
    }
    return { uid, username: user?.username || _cache["sc_users"]?.[uid]?.username || uid, points: pts, exact, correct, total, correctWinner: (predictions[uid] || {})[leagueId]?.tournament_winner && results["tournament_winner"] && (predictions[uid] || {})[leagueId]?.tournament_winner === results["tournament_winner"] ? 1 : 0 };
  }).sort((a, b) => b.points - a.points || b.exact - a.exact || b.correctWinner - a.correctWinner);

  if (!withMovement) return entries;

  // In-memory snapshot — persists for session, no Firestore needed
  const snapKey = `sc_lb_prev_${leagueId}`;
  const prev = _lbSnapshots[snapKey] || {};
  entries.forEach((entry, i) => {
    const prevRank = prev[entry.uid];
    if (prevRank == null) { entry.movement = "new"; }
    else if (prevRank > i + 1) { entry.movement = "up"; entry.moveDiff = prevRank - (i + 1); }
    else if (prevRank < i + 1) { entry.movement = "down"; entry.moveDiff = (i + 1) - prevRank; }
    else { entry.movement = "same"; }
  });
  const snap = {};
  entries.forEach((e, i) => { snap[e.uid] = i + 1; });
  _lbSnapshots[snapKey] = snap;

  return entries;
}

// ─── COUNTDOWN HELPER ─────────────────────────────────────────────────────────
function useCountdown(targetDateStr, targetTimeStr) {
  const [countdown, setCountdown] = useState(null);
  useEffect(() => {
    const eestHour = parseInt(targetTimeStr?.split(":")[0] || "15");
    const eestMin = parseInt(targetTimeStr?.split(":")[1]?.split(" ")[0] || "0");
    // Use timezone offset notation to avoid negative hour arithmetic
    const target = new Date(`${targetDateStr}T${String(eestHour).padStart(2,"0")}:${String(eestMin).padStart(2,"0")}:00+03:00`);

    const update = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) { setCountdown(null); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown({ days, hours, mins, secs, diff });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDateStr, targetTimeStr]);
  return countdown;
}

// ─── LOCK HELPER ──────────────────────────────────────────────────────────────
// First match kickoff — tournament winner locks 1 hour before this
const TOURNAMENT_START = new Date("2026-06-11T19:00:00Z"); // 22:00 EEST = 19:00 UTC

function kickoffUTC(dateStr, timeStr) {
  const h = parseInt(timeStr?.split(":")[0] || "0");
  const m = parseInt(timeStr?.split(":")[1]?.split(" ")[0] || "0");
  // Convert EEST (UTC+3) to UTC by subtracting 3 hours using proper date arithmetic
  const eestDate = new Date(`${dateStr}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00+03:00`);
  return eestDate;
}

function useFixtureLock(dateStr, timeStr) {
  const [status, setStatus] = useState(null); // null | { locked, minsLeft, hoursLeft }
  useEffect(() => {
    const update = () => {
      const kickoff = kickoffUTC(dateStr, timeStr);
      const lockAt = new Date(kickoff.getTime() - 60 * 60 * 1000); // 1h before
      const now = new Date();
      const msLeft = lockAt - now;
      if (msLeft <= 0) {
        setStatus({ locked: true });
      } else {
        const totalMins = Math.floor(msLeft / 60000);
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        setStatus({ locked: false, hoursLeft: h, minsLeft: m });
      }
    };
    update();
    const id = setInterval(update, 30000); // update every 30s
    return () => clearInterval(id);
  }, [dateStr, timeStr]);
  return status;
}

function useTournamentWinnerLock() {
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    const update = () => {
      const lockAt = new Date(TOURNAMENT_START.getTime() - 60 * 60 * 1000);
      setLocked(new Date() >= lockAt);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  return locked;
}
const FLAGS = {
  "Mexico": "🇲🇽", "South Africa": "🇿🇦", "Korea Republic": "🇰🇷", "Czechia": "🇨🇿",
  "Canada": "🇨🇦", "Bosnia and Herzegovina": "🇧🇦", "Qatar": "🇶🇦", "Switzerland": "🇨🇭",
  "Brazil": "🇧🇷", "Morocco": "🇲🇦", "Haiti": "🇭🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "United States": "🇺🇸", "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Türkiye": "🇹🇷",
  "Germany": "🇩🇪", "Curaçao": "🇨🇼", "Ivory Coast": "🇨🇮", "Ecuador": "🇪🇨",
  "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Sweden": "🇸🇪", "Tunisia": "🇹🇳",
  "Belgium": "🇧🇪", "Egypt": "🇪🇬", "Iran": "🇮🇷", "New Zealand": "🇳🇿",
  "Spain": "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", "Uruguay": "🇺🇾",
  "France": "🇫🇷", "Senegal": "🇸🇳", "Iraq": "🇮🇶", "Norway": "🇳🇴",
  "Argentina": "🇦🇷", "Algeria": "🇩🇿", "Austria": "🇦🇹", "Jordan": "🇯🇴",
  "Portugal": "🇵🇹", "DR Congo": "🇨🇩", "Uzbekistan": "🇺🇿", "Colombia": "🇨🇴",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croatia": "🇭🇷", "Ghana": "🇬🇭", "Panama": "🇵🇦",
};
const flag = (team) => FLAGS[team] || "🏳";

// Small icon version — just the football with lightning bolt, for header + favicon
function ScoreClashIcon({ size = 36, style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"
      width={size} height={size} style={{ display: "block", ...style }}>
      <defs>
        <filter id="ic-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur1"/>
          <feGaussianBlur stdDeviation="6" result="blur2"/>
          <feMerge><feMergeNode in="blur2"/><feMergeNode in="blur1"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ic-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="ic-blue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#06d6f7"/>
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="40" cy="40" r="36" fill="none" stroke="url(#ic-blue)" strokeWidth="1.2" opacity="0.3"/>
      {/* Ball */}
      <circle cx="40" cy="40" r="30" fill="none" stroke="url(#ic-blue)" strokeWidth="2" filter="url(#ic-soft)"/>
      <circle cx="40" cy="40" r="27" fill="#0d0d16"/>
      {/* Hex pattern */}
      <g stroke="url(#ic-blue)" strokeWidth="0.8" fill="url(#ic-blue)" fillOpacity="0.08" opacity="0.7">
        <polygon points="40,24 52,31 52,45 40,52 28,45 28,31"/>
        <line x1="40" y1="10" x2="40" y2="24"/>
        <line x1="52" y1="31" x2="64" y2="24"/>
        <line x1="52" y1="45" x2="64" y2="52"/>
        <line x1="40" y1="52" x2="40" y2="66"/>
        <line x1="28" y1="45" x2="16" y2="52"/>
        <line x1="28" y1="31" x2="16" y2="24"/>
      </g>
      {/* Lightning bolt */}
      <path d="M44 16 L32 40 L40 40 L28 64 L52 36 L43 36 Z"
        fill="url(#ic-blue)" filter="url(#ic-glow)"/>
    </svg>
  );
}
function ScoreClashLogo({ width = 420, style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 260"
      width={width} style={{ display: "block", ...style }}>
      <defs>
        <filter id="sc-neon-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sc-neon-strong" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur1"/>
          <feGaussianBlur stdDeviation="12" result="blur2"/>
          <feMerge><feMergeNode in="blur2"/><feMergeNode in="blur1"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="sc-blue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#06d6f7"/>
        </linearGradient>
        <linearGradient id="sc-blue-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#06d6f7"/>
        </linearGradient>
        <linearGradient id="sc-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e"/>
          <stop offset="100%" stopColor="#fb923c"/>
        </linearGradient>
        <radialGradient id="sc-bg-glow" cx="35%" cy="50%" r="40%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
        </radialGradient>
      </defs>

      <rect width="780" height="260" fill="url(#sc-bg-glow)"/>

      {/* Football icon */}
      <circle cx="135" cy="118" r="88" fill="none" stroke="url(#sc-blue)" strokeWidth="1.5" opacity="0.2"/>
      <circle cx="135" cy="118" r="72" fill="none" stroke="url(#sc-blue)" strokeWidth="2.5" filter="url(#sc-neon-soft)"/>
      <circle cx="135" cy="118" r="68" fill="#0d0d16"/>
      <g stroke="url(#sc-blue)" strokeWidth="1.2" fill="url(#sc-blue)" fillOpacity="0.08" opacity="0.7">
        <polygon points="135,92 156,105 156,131 135,144 114,131 114,105"/>
        <line x1="135" y1="50" x2="135" y2="92"/>
        <line x1="156" y1="105" x2="182" y2="91"/>
        <line x1="156" y1="131" x2="182" y2="145"/>
        <line x1="135" y1="144" x2="135" y2="184"/>
        <line x1="114" y1="131" x2="88" y2="145"/>
        <line x1="114" y1="105" x2="88" y2="91"/>
      </g>
      <path d="M143 76 L122 118 L136 118 L118 160 L154 110 L139 110 Z"
        fill="url(#sc-blue)" filter="url(#sc-neon-strong)"/>

      {/* Divider */}
      <rect x="228" y="42" width="2" height="154" rx="1" fill="url(#sc-blue-v)" opacity="0.35"/>

      {/* Wordmark */}
      <text x="250" y="110" fontFamily="'Bebas Neue', 'Arial Black', Impact, sans-serif"
        fontSize="86" letterSpacing="6" fill="url(#sc-blue)" filter="url(#sc-neon-soft)">SCORE</text>
      <text x="250" y="186" fontFamily="'Bebas Neue', 'Arial Black', Impact, sans-serif"
        fontSize="86" letterSpacing="6" fill="url(#sc-red)" filter="url(#sc-neon-soft)">CLASH</text>

      {/* Separator */}
      <rect x="250" y="196" width="492" height="1.5" rx="1" fill="url(#sc-red)" opacity="0.35"/>

      {/* Slogan */}
      <text x="250" y="228" fontFamily="'Bebas Neue', 'Arial Black', Impact, sans-serif"
        fontSize="19" letterSpacing="3" fill="#5c6380">
        PREDICT. COMPETE. WIN BRAGGING RIGHTS.
      </text>
    </svg>
  );
}

// ─── AVATARS ──────────────────────────────────────────────────────────────────
const PRESET_AVATARS = [
  { id: "a1",  emoji: "🦁", label: "Lion" },
  { id: "a2",  emoji: "🐯", label: "Tiger" },
  { id: "a3",  emoji: "🦅", label: "Eagle" },
  { id: "a4",  emoji: "🐺", label: "Wolf" },
  { id: "a5",  emoji: "🦊", label: "Fox" },
  { id: "a6",  emoji: "🐉", label: "Dragon" },
  { id: "a7",  emoji: "🦈", label: "Shark" },
  { id: "a8",  emoji: "🦏", label: "Rhino" },
  { id: "a9",  emoji: "🐻", label: "Bear" },
  { id: "a10", emoji: "🦋", label: "Butterfly" },
  { id: "a11", emoji: "🐸", label: "Frog" },
  { id: "a12", emoji: "🦄", label: "Unicorn" },
  { id: "a13", emoji: "🔥", label: "Fire" },
  { id: "a14", emoji: "⚡", label: "Lightning" },
  { id: "a15", emoji: "🌟", label: "Star" },
  { id: "a16", emoji: "💎", label: "Diamond" },
  { id: "a17", emoji: "🎯", label: "Target" },
  { id: "a18", emoji: "👑", label: "Crown" },
  { id: "a19", emoji: "🚀", label: "Rocket" },
  { id: "a21", emoji: "🐐", label: "Goat" },
];

// Get avatar for a user — returns { type: 'emoji'|'image', value }
function getUserAvatar(uid) {
  const users = storage.get("sc_users") || {};
  const u = users[uid];
  if (!u) return null;
  return u.avatar || null;
}

// Simple hash function to derive a consistent hue from a username
function usernameToHue(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// Render avatar as a small circle element (React)
function Avatar({ uid, size = 32, username }) {
  const users = storage.get("sc_users") || {};
  const u = users[uid];
  const av = u?.avatar;
  const name = username || u?.username || "?";
  const initials = name.slice(0, 2).toUpperCase();
  const hue = usernameToHue(name);

  const style = {
    width: size, height: size, borderRadius: "50%",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, overflow: "hidden",
    background: "var(--surface3)", border: "1.5px solid var(--border2)",
    fontSize: size * 0.48,
    fontWeight: 700, color: "var(--muted)",
    userSelect: "none",
  };

  if (!av) {
    return (
      <div style={{
        ...style,
        fontSize: size * 0.38, letterSpacing: "-0.5px",
        background: `hsla(${hue}, 65%, 50%, 0.18)`,
        border: `1.5px solid hsla(${hue}, 65%, 55%, 0.4)`,
        color: `hsl(${hue}, 70%, 65%)`,
      }}>{initials}</div>
    );
  }
  if (av.type === "emoji") {
    return <div style={style}>{av.value}</div>;
  }
  if (av.type === "image") {
    return <img src={av.value} alt="avatar" style={{ ...style, objectFit: "cover", fontSize: undefined, background: undefined }} />;
  }
  return <div style={{ ...style, fontSize: size * 0.38, color: "var(--accent)" }}>{initials}</div>;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = (dark = true) => `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       ${dark ? "#0a0a0f"                   : "#f5f6fa"};
    --surface:  ${dark ? "#13131a"                   : "#ffffff"};
    --surface2: ${dark ? "#1a1a24"                   : "#eef0f6"};
    --surface3: ${dark ? "#22222f"                   : "#dde1ee"};
    --border:   ${dark ? "rgba(255,255,255,0.07)"    : "rgba(0,0,0,0.08)"};
    --border2:  ${dark ? "rgba(255,255,255,0.13)"    : "rgba(0,0,0,0.14)"};
    --accent:   ${dark ? "#3b82f6"                   : "#2563eb"};
    --accent-glow: ${dark ? "rgba(59,130,246,0.3)"  : "rgba(37,99,235,0.2)"};
    --accent2:  ${dark ? "#f43f5e"                   : "#e11d48"};
    --gold:     ${dark ? "#f59e0b"                   : "#d97706"};
    --text:     ${dark ? "#eceef5"                   : "#0f1120"};
    --muted:    ${dark ? "#5c6380"                   : "#7280a0"};
    --green:    ${dark ? "#22c55e"                   : "#16a34a"};
    --font-display: 'Bebas Neue', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --r: 12px;
    --r2: 16px;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 2px; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* HEADER */
  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 28px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    position: sticky; top: 0; z-index: 100;
  }
  .logo {
    font-family: var(--font-display);
    font-size: 26px; letter-spacing: 3px;
    color: var(--accent);
  }
  .logo span { color: var(--accent2); }
  .header-user { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--muted); }
  .header-user strong { color: var(--text); font-weight: 600; }

  /* PROFILE BUTTON & DROPDOWN */
  .profile-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); border-radius: 10px; padding: 5px 12px 5px 6px;
    cursor: pointer; font-family: var(--font-body); font-size: 13px;
    font-weight: 600; transition: border-color 0.2s, background 0.2s;
    position: relative;
  }
  .profile-btn:hover { border-color: var(--border2); background: var(--surface3); }
  .profile-btn-caret { font-size: 9px; color: var(--muted); margin-left: 2px; transition: transform 0.2s; }
  .profile-btn.open .profile-btn-caret { transform: rotate(180deg); }

  .profile-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 14px; width: 300px;
    box-shadow: ${dark ? "0 20px 60px rgba(0,0,0,0.7)" : "0 16px 48px rgba(0,0,0,0.14)"};
    z-index: 300; overflow: hidden;
    animation: dropIn 0.18s ease;
  }
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .profile-dd-header {
    padding: 20px; display: flex; align-items: center; gap: 14px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, rgba(59,130,246,0.06) 0%, transparent 100%);
  }
  .profile-dd-info { flex: 1; min-width: 0; }
  .profile-dd-name { font-weight: 700; font-size: 15px; }
  .profile-dd-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .profile-dd-section { padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .profile-dd-section-title { font-size: 10px; color: var(--muted); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }

  .avatar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 7px; }
  .avatar-option {
    aspect-ratio: 1; border-radius: 10px; border: 2px solid var(--border);
    background: var(--surface2); display: flex; align-items: center; justify-content: center;
    font-size: 22px; cursor: pointer; transition: border-color 0.15s, transform 0.15s, background 0.15s;
  }
  .avatar-option:hover { border-color: var(--border2); background: var(--surface3); transform: scale(1.08); }
  .avatar-option.selected { border-color: var(--accent); background: rgba(59,130,246,0.1); box-shadow: 0 0 0 1px var(--accent); }

  .avatar-upload-btn {
    width: 100%; margin-top: 10px;
    background: var(--surface2); border: 1px dashed var(--border2);
    color: var(--muted); border-radius: 8px; padding: 9px;
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .avatar-upload-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(59,130,246,0.05); }

  .profile-dd-footer { padding: 12px 16px; display: flex; gap: 8px; }
  .profile-username-input {
    flex: 1; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); font-family: var(--font-body); font-size: 13px;
    padding: 8px 12px; border-radius: 8px; outline: none; transition: border-color 0.2s;
  }
  .profile-username-input:focus { border-color: var(--accent); }
  .btn-profile-save {
    background: var(--accent); color: #fff; border: none; border-radius: 8px;
    padding: 8px 14px; font-family: var(--font-body); font-size: 12px;
    font-weight: 700; cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .btn-profile-save:hover { filter: brightness(1.15); }
  .btn-profile-signout {
    width: 100%; background: none; border: 1px solid rgba(244,63,94,0.3);
    color: var(--accent2); border-radius: 8px; padding: 9px;
    font-family: var(--font-body); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: block;
  }
  .btn-profile-signout:hover { background: rgba(244,63,94,0.08); border-color: var(--accent2); }

  /* NAV */
  .nav {
    display: flex; align-items: center;
    padding: 8px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    gap: 5px; overflow-x: auto;
    scrollbar-width: none;
  }
  .nav::-webkit-scrollbar { display: none; }

  .nav-tab {
    position: relative;
    background: transparent;
    border: 1px solid transparent;
    color: var(--muted);
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    padding: 7px 18px;
    border-radius: 20px;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s, color 0.15s, border-color 0.15s, box-shadow 0.15s;
    letter-spacing: 0.1px;
    flex-shrink: 0;
  }
  .nav-tab:hover { background: var(--surface2); color: var(--text); border-color: var(--border); }
  .nav-tab.active {
    background: rgba(59,130,246,0.15);
    color: var(--accent);
    border-color: rgba(59,130,246,0.35);
    font-weight: 700;
    box-shadow: 0 0 12px rgba(59,130,246,0.15);
  }

  /* MAIN */
  .main { flex: 1; padding: 24px 28px; max-width: 1100px; margin: 0 auto; width: 100%; }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 11px 22px; border-radius: 8px; font-family: var(--font-body);
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    border: none; text-decoration: none;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 8px 24px var(--accent-glow); }
  .btn-danger { background: var(--accent2); color: #fff; }
  .btn-danger:hover { filter: brightness(1.1); }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-full { width: 100%; }
  .btn-sm { padding: 6px 12px; font-size: 11px; }

  .error-msg { background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.3); color: var(--accent2); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
  .success-msg { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: var(--green); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }

  /* FORM */
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 11px; color: var(--muted); margin-bottom: 6px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; }
  .form-input, .form-select {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); font-family: var(--font-body); font-size: 16px;
    padding: 12px 14px; border-radius: 8px; outline: none; transition: border-color 0.2s;
    min-height: 44px; /* iOS minimum tap target */
    -webkit-appearance: none; /* Remove iOS styling */
  }
  .form-input:focus, .form-select:focus { border-color: var(--accent); }
  .form-select option { background: var(--surface2); }

  /* PAGE */
  .page-title { font-family: var(--font-display); font-size: 34px; letter-spacing: 2px; color: var(--text); margin-bottom: 4px; }
  .page-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }

  /* CARDS */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 24px; }
  .card-title { font-family: var(--font-display); font-size: 16px; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 16px; }

  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }

  /* Section header with left accent bar */
  .section-label { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .section-label-text {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 700; color: var(--text); letter-spacing: 0.3px;
  }
  .section-label-text::before {
    content: ''; display: inline-block; width: 3px; height: 16px;
    border-radius: 2px; background: var(--accent); flex-shrink: 0;
  }

  /* ─── DASHBOARD ─────────────────────────────────────────────── */
  .dash-hero {
    position: relative; overflow: hidden;
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 14px; padding: 20px 28px;
    margin-bottom: 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
    flex-wrap: wrap;
  }
  .dash-hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 0% 50%, rgba(59,130,246,0.06) 0%, transparent 55%);
    pointer-events: none;
  }
  .dash-hero-content { position: relative; z-index: 1; }
  .dash-hero-eyebrow { font-size: 10px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
  .dash-hero-title { font-family: var(--font-display); font-size: 28px; letter-spacing: 2px; line-height: 1; }
  .dash-hero-title span { color: var(--accent); }
  .dash-hero-sub { font-size: 12px; color: var(--muted); margin-top: 5px; }
  .dash-hero-stats { display: flex; gap: 24px; flex-wrap: wrap; position: relative; z-index: 1; }
  .dash-stat { display: flex; flex-direction: column; gap: 2px; align-items: flex-end; }
  .dash-stat-val { font-family: var(--font-display); font-size: 28px; color: var(--text); line-height: 1; }
  .dash-stat-val.accent { color: var(--accent); }
  .dash-stat-val.gold   { color: var(--gold); }
  .dash-stat-val.green  { color: var(--green); }
  .dash-stat-label { font-size: 10px; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; }

  /* Stat cards */
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r2); padding: 18px 20px;
    display: flex; flex-direction: column; gap: 4px;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--card-accent, var(--accent));
    border-radius: 2px 2px 0 0;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: ${dark ? "0 8px 24px rgba(0,0,0,0.35)" : "0 8px 24px rgba(0,0,0,0.1)"}; }
  .stat-card-icon { font-size: 18px; margin-bottom: 2px; }
  .stat-card-val { font-family: var(--font-display); font-size: 34px; letter-spacing: 1px; line-height: 1; }
  .stat-card-label { font-size: 12px; color: var(--muted); font-weight: 600; }
  .stat-card-sub { font-size: 11px; color: var(--muted); margin-top: 1px; opacity: 0.7; }

  /* Upcoming matches */
  .upcoming-scroll {
    display: flex; gap: 12px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: thin;
  }
  .upcoming-scroll::-webkit-scrollbar { height: 3px; }
  .upcoming-scroll::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 2px; }

  /* Mini match card */
  .match-card-mini {
    flex-shrink: 0; width: 250px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r2); overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .match-card-mini:hover { border-color: rgba(59,130,246,0.4); transform: translateY(-2px); box-shadow: ${dark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 20px rgba(0,0,0,0.1)"}; }
  .match-card-mini.has-pred { border-color: rgba(59,130,246,0.25); }

  .match-card-group-bar {
    padding: 7px 14px;
    background: rgba(59,130,246,0.06);
    border-bottom: 1px solid var(--border);
  }
  .match-card-group-name { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--accent); text-transform: uppercase; }
  .match-card-stage-name { font-size: 10px; font-weight: 600; color: var(--muted); letter-spacing: 0.8px; text-transform: uppercase; }

  .match-card-body { padding: 11px 14px 13px; }
  .match-card-matchup { display: flex; align-items: center; gap: 6px; margin-bottom: 9px; }
  .match-card-team-name { flex: 1; font-size: 13px; font-weight: 700; color: var(--text); }
  .match-card-team-name.away { text-align: right; }
  .match-card-vs-divider { font-size: 10px; letter-spacing: 1px; color: var(--muted); flex-shrink: 0; }

  .match-card-countdown { display: flex; gap: 4px; align-items: center; margin-bottom: 9px; }
  .match-card-cd-unit {
    display: flex; flex-direction: column; align-items: center;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 5px; padding: 3px 6px; min-width: 32px;
  }
  .match-card-cd-val { font-family: var(--font-display); font-size: 15px; line-height: 1; color: var(--accent); }
  .match-card-cd-label { font-size: 8px; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .match-card-cd-sep { font-size: 11px; color: var(--border2); margin-bottom: 8px; }

  .match-card-meta { font-size: 11px; color: var(--muted); margin-bottom: 8px; display: flex; align-items: center; gap: 4px; }
  .match-card-pred-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; color: var(--green);
    background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
    padding: 4px 10px; border-radius: 6px; width: 100%; justify-content: center;
  }
  .match-card-nopred-badge {
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--muted); font-style: italic;
    background: var(--surface2); border: 1px solid var(--border);
    padding: 4px 10px; border-radius: 6px; width: 100%;
  }

  /* Prediction confirm */
  .pred-confirm-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 16px 12px; border-top: 1px solid var(--border);
  }
  .btn-confirm {
    background: var(--accent); color: #fff;
    border: none; border-radius: 7px;
    padding: 7px 18px; font-family: var(--font-body);
    font-size: 12px; font-weight: 700; cursor: pointer;
    transition: all 0.15s; letter-spacing: 0.3px;
  }
  .btn-confirm:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 4px 14px var(--accent-glow); }
  .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-confirm.dirty { animation: pulse-confirm 0.4s ease; }
  @keyframes pulse-confirm { 0%,100% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 0 4px var(--accent-glow); } }
  .pred-saved-tag { font-size: 11px; color: var(--green); font-weight: 600; }
  .pred-dirty-tag { font-size: 11px; color: var(--accent); }

  .lock-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 6px;
    font-variant-numeric: tabular-nums;
  }
  .lock-badge.locked {
    color: var(--accent2);
    background: rgba(244,63,94,0.08);
    border: 1px solid rgba(244,63,94,0.25);
  }
  .lock-badge.open {
    color: var(--green);
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.2);
  }
  .lock-badge.closing-soon {
    color: var(--gold);
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.25);
  }

  /* Countdown */
  .countdown { display: flex; gap: 6px; align-items: center; margin: 8px 0 4px; }
  .cd-unit {
    display: flex; flex-direction: column; align-items: center; gap: 1px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 6px; padding: 4px 8px; min-width: 38px;
  }
  .cd-val { font-family: var(--font-display); font-size: 18px; line-height: 1; color: var(--accent); }
  .cd-label { font-size: 8px; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .cd-sep { font-family: var(--font-display); font-size: 18px; color: var(--muted); margin-bottom: 10px; }

  /* Mini leaderboard */
  .mini-lb-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid var(--border);
  }
  .mini-lb-row:last-child { border-bottom: none; }
  .mini-lb-rank { font-family: var(--font-display); font-size: 16px; color: var(--muted); width: 24px; flex-shrink: 0; }
  .mini-lb-rank.gold   { color: var(--gold); }
  .mini-lb-rank.silver { color: #9aa0b4; }
  .mini-lb-rank.bronze { color: #b87c4a; }
  .mini-lb-name { flex: 1; font-size: 13px; font-weight: 500; }
  .mini-lb-name.you { color: var(--accent2); font-weight: 700; }
  .mini-lb-pts { font-family: var(--font-display); font-size: 20px; color: var(--accent); }

  /* ─── FIXTURE CARDS ─────────────────────────────────────────── */
  .stage-header {
    font-family: var(--font-display); font-size: 13px; letter-spacing: 2px;
    color: var(--muted); padding: 12px 0 8px; border-bottom: 1px solid var(--border);
    margin-bottom: 12px; margin-top: 24px; display: flex; justify-content: space-between;
  }
  .fixture-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r2); margin-bottom: 8px; overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s, opacity 0.2s;
    position: relative;
  }
  .fixture-card:hover { border-color: var(--border2); box-shadow: ${dark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)"}; }
  .fixture-card.predicted { border-color: rgba(59,130,246,0.3); border-left: 3px solid var(--accent); }
  .fixture-card.has-result { border-color: rgba(34,197,94,0.2); }
  .fixture-card.locked { opacity: 0.6; }
  .fixture-card.locked:hover { opacity: 0.75; }
  .fixture-card.in-progress { border-color: rgba(244,63,94,0.35); border-left: 3px solid var(--accent2); opacity: 1 !important; }

  /* Predicted corner badge */
  .fixture-pred-corner {
    font-size: 10px; font-weight: 700; color: var(--accent);
    background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3);
    padding: 2px 8px; border-radius: 10px;
    pointer-events: none; white-space: nowrap; flex-shrink: 0;
  }

  /* Date group header */
  .fixture-date-header {
    display: flex; align-items: center; gap: 12px;
    padding: 18px 0 8px; margin-top: 4px;
  }
  .fixture-date-header-text {
    font-size: 12px; font-weight: 700; color: var(--muted);
    letter-spacing: 0.5px; white-space: nowrap;
  }
  .fixture-date-header-line {
    flex: 1; height: 1px; background: var(--border);
  }

  /* Progress bar */
  .pred-progress-wrap {
    margin-bottom: 18px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r2); padding: 14px 18px;
  }
  .pred-progress-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px; font-size: 12px;
  }
  .pred-progress-label { font-weight: 600; color: var(--text); }
  .pred-progress-count { color: var(--muted); }
  .pred-progress-bar-bg {
    height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden;
  }
  .pred-progress-bar-fill {
    height: 100%; border-radius: 3px;
    background: linear-gradient(90deg, var(--accent), var(--green));
    transition: width 0.4s ease;
  }
  .pred-progress-stats {
    display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap;
  }
  .pred-progress-stat { font-size: 11px; color: var(--muted); }
  .pred-progress-stat span { font-weight: 700; }

  .fixture-venue-strip { position: relative; height: 52px; overflow: hidden; }
  .fixture-venue-img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.35) saturate(0.5); }
  .fixture-venue-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to right, rgba(10,10,15,0.92) 0%, rgba(10,10,15,0.3) 40%, rgba(10,10,15,0.3) 60%, rgba(10,10,15,0.92) 100%);
  }
  .fixture-venue-content {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: space-between; padding: 0 16px;
  }
  .fixture-venue-name { font-size: 10px; color: rgba(255,255,255,0.55); letter-spacing: 1px; text-transform: uppercase; font-weight: 500; }
  .fixture-venue-date { font-size: 10px; color: rgba(255,255,255,0.4); }

  .fixture-body { display: flex; align-items: center; gap: 14px; padding: 12px 16px; }
  .fixture-teams { flex: 1; display: flex; align-items: center; gap: 10px; }
  .fixture-team { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .fixture-vs { font-size: 10px; color: var(--muted); letter-spacing: 1px; padding: 0 4px; }
  .fixture-pred { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .score-input {
    width: 42px; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text); font-family: var(--font-body); font-size: 17px; font-weight: 700;
    padding: 5px; border-radius: 7px; text-align: center; outline: none; transition: border-color 0.2s;
  }
  .score-input:focus { border-color: var(--accent); }
  .score-input:disabled { opacity: 0.5; cursor: not-allowed; }
  .score-sep { color: var(--muted); font-size: 15px; }

  .fixture-cd-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 16px 10px; border-top: 1px solid var(--border);
  }
  .fixture-cd-inner { display: flex; align-items: center; gap: 5px; }
  .fcd-unit {
    display: flex; flex-direction: column; align-items: center;
    background: var(--surface2); border-radius: 4px; padding: 3px 6px; min-width: 32px;
  }
  .fcd-val { font-family: var(--font-display); font-size: 14px; line-height: 1; color: var(--text); }
  .fcd-label { font-size: 7px; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .fcd-sep { font-size: 11px; color: var(--border2); margin-bottom: 7px; }

  /* Outcome colours */
  .fixture-team-name.winner { color: var(--green); }
  .fixture-team-name.loser  { color: var(--accent2); opacity: 0.8; }
  .fixture-team-name.draw   { color: var(--gold); }

  .pts-badge { font-family: var(--font-display); font-size: 15px; padding: 3px 10px; border-radius: 6px; background: rgba(59,130,246,0.1); color: var(--accent); }
  .pts-badge.pts-3 { background: rgba(245,158,11,0.12); color: var(--gold); }
  .pts-badge.pts-0 { background: rgba(244,63,94,0.1); color: var(--accent2); }

  .deadline-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 700; color: var(--gold);
    background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
    padding: 3px 10px; border-radius: 6px;
  }

  /* Match in progress badge */
  .in-progress-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; color: #fff;
    background: var(--accent2); border: 1px solid var(--accent2);
    padding: 4px 12px; border-radius: 6px;
    animation: progress-pulse 1.5s ease-in-out infinite;
  }
  .in-progress-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #fff; animation: dot-blink 1s ease-in-out infinite;
  }
  @keyframes progress-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
  @keyframes dot-blink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  .result-box { text-align: center; min-width: 56px; }
  .score-col-label {
    font-size: 9px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.6px;
    text-align: center; margin-bottom: 4px;
  }
  .result-score { font-family: var(--font-display); font-size: 19px; letter-spacing: 1px; }
  .result-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }

  /* Match card prediction status banner */
  .match-card-status-banner {
    text-align: center; font-size: 11px; font-weight: 700;
    padding: 5px 0; letter-spacing: 0.3px;
  }
  .match-card-status-banner.predicted {
    background: rgba(34,197,94,0.15); color: var(--green);
  }
  .match-card-status-banner.missing {
    background: rgba(148,163,184,0.12); color: var(--muted);
  }
  .match-card-status-banner.urgent {
    background: var(--accent2); color: #fff;
    animation: status-flash 1s ease-in-out infinite;
  }
  @keyframes status-flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  /* Exact high-score prediction highlight banner */
  .highlight-pick-banner {
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(244,63,94,0.12) 100%);
    border: 1.5px solid rgba(249,115,22,0.5);
    border-radius: var(--r); padding: 14px 16px; margin-bottom: 16px;
    animation: banner-slide-in 0.3s ease, highlight-glow 1.8s ease-in-out infinite;
    position: relative; overflow: hidden;
  }
  @keyframes highlight-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
    50% { box-shadow: 0 0 20px 2px rgba(249,115,22,0.25); }
  }
  .highlight-pick-flame {
    font-size: 26px; flex-shrink: 0;
    animation: flame-flicker 0.6s ease-in-out infinite alternate;
  }
  @keyframes flame-flicker {
    from { transform: scale(1) rotate(-3deg); }
    to   { transform: scale(1.12) rotate(3deg); }
  }
  .highlight-pick-text { font-size: 14px; font-weight: 700; color: #fb923c; }
  .highlight-pick-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .highlight-pick-dismiss {
    background: none; border: none; color: var(--muted);
    font-size: 16px; cursor: pointer; padding: 0 0 0 8px; line-height: 1;
    flex-shrink: 0;
  }

  /* Nobody-got-it-right upset banner */
  .upset-banner {
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(59,130,246,0.1) 100%);
    border: 1.5px solid rgba(139,92,246,0.4);
    border-radius: var(--r); padding: 14px 16px; margin-bottom: 16px;
    animation: banner-slide-in 0.3s ease;
  }
  .upset-banner-icon {
    font-size: 24px; flex-shrink: 0;
    animation: upset-shake 2.2s ease-in-out infinite;
  }
  @keyframes upset-shake {
    0%, 80%, 100% { transform: rotate(0deg); }
    82% { transform: rotate(-8deg); }
    86% { transform: rotate(8deg); }
    90% { transform: rotate(-5deg); }
    94% { transform: rotate(0deg); }
  }
  .upset-banner-text { font-size: 14px; font-weight: 700; color: #a78bfa; }
  .upset-banner-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .missing-preds-banner {
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(244,63,94,0.06) 100%);
    border: 1px solid rgba(245,158,11,0.35);
    border-radius: var(--r); padding: 12px 16px; margin-bottom: 16px;
    animation: banner-slide-in 0.3s ease;
  }
  .missing-preds-banner-text { font-size: 13px; font-weight: 600; color: var(--gold); }
  .missing-preds-banner-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .missing-preds-banner-btn {
    background: var(--gold); color: #000; border: none;
    border-radius: 6px; padding: 6px 14px; font-size: 12px;
    font-weight: 700; cursor: pointer; font-family: var(--font-body);
    transition: filter 0.15s; white-space: nowrap;
  }
  .missing-preds-banner-btn:hover { filter: brightness(1.1); }
  .new-results-banner {
    display: flex; align-items: center; justify-content: space-between;
    background: linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(59,130,246,0.08) 100%);
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: var(--r); padding: 12px 16px; margin-bottom: 16px;
    animation: banner-slide-in 0.3s ease;
  }
  @keyframes banner-slide-in {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .new-results-banner-left { display: flex; align-items: center; gap: 10px; }
  .new-results-banner-icon { font-size: 20px; }
  .new-results-banner-text { font-size: 13px; font-weight: 600; color: var(--green); }
  .new-results-banner-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .new-results-banner-btn {
    background: var(--green); color: #fff; border: none;
    border-radius: 6px; padding: 6px 14px; font-size: 12px;
    font-weight: 700; cursor: pointer; font-family: var(--font-body);
    transition: filter 0.15s; white-space: nowrap;
  }
  .new-results-banner-btn:hover { filter: brightness(1.1); }
  .new-results-banner-dismiss {
    background: none; border: none; color: var(--muted);
    font-size: 16px; cursor: pointer; padding: 0 0 0 8px; line-height: 1;
  }
  .tab-content {
    animation: tab-fade 0.15s ease;
  }
  @keyframes tab-fade {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Grouped stage filter */
  .stage-filter-wrap { margin-bottom: 18px; }
  .stage-filter-group { margin-bottom: 8px; }
  .stage-filter-group-label {
    font-size: 9px; font-weight: 700; color: var(--muted);
    letter-spacing: 1.5px; text-transform: uppercase;
    margin-bottom: 5px; padding-left: 2px;
  }
  .stage-filter-row { display: flex; gap: 6px; flex-wrap: wrap; }

  .filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px; }
  .filter-btn {
    background: var(--surface2); border: 1px solid var(--border); color: var(--muted);
    font-family: var(--font-body); font-size: 11px; padding: 5px 13px; border-radius: 20px;
    cursor: pointer; transition: all 0.2s; font-weight: 500;
  }
  .filter-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(59,130,246,0.08); }

  /* LEADERBOARD */
  .lb-table { width: 100%; border-collapse: collapse; }
  .lb-table th { text-align: left; font-size: 10px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; padding: 6px 10px; border-bottom: 1px solid var(--border); }
  .lb-table td { padding: 10px 10px; border-bottom: 1px solid var(--border); font-size: 13px; }
  .lb-table tr:last-child td { border-bottom: none; }
  .lb-rank { font-family: var(--font-display); font-size: 18px; color: var(--muted); width: 36px; }
  .lb-rank.gold   { color: var(--gold); }
  .lb-rank.silver { color: #9aa0b4; }
  .lb-rank.bronze { color: #b87c4a; }
  .lb-pts { font-family: var(--font-display); font-size: 20px; color: var(--accent); text-align: right; }
  .lb-you { color: var(--accent2) !important; font-weight: 700; }
  .lb-acc { font-size: 11px; color: var(--muted); text-align: right; }
  .lb-movement { font-size: 11px; font-weight: 700; min-width: 36px; text-align: center; white-space: nowrap; }
  .lb-movement.up   { color: var(--green); }
  .lb-movement.down { color: var(--accent2); }
  .lb-movement.same { color: var(--muted); }
  .lb-movement.new  { color: var(--accent); font-size: 10px; }

  /* LEAGUES */
  .league-item {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r2); padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between;
    cursor: pointer; transition: border-color 0.2s;
  }
  .league-item:hover { border-color: var(--border2); }
  .league-item.selected { border-color: var(--accent); background: rgba(59,130,246,0.04); border-radius: var(--r2) var(--r2) 0 0; border-bottom: none; }
  .league-name { font-weight: 600; font-size: 15px; }
  .league-meta { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .league-code { font-family: monospace; background: var(--surface); padding: 4px 10px; border-radius: 6px; font-size: 12px; color: var(--accent); border: 1px solid rgba(59,130,246,0.2); }

  .copy-code-wrap {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .copy-code-box {
    font-family: monospace; font-size: 22px; letter-spacing: 6px;
    color: var(--accent); background: var(--surface2);
    border: 1px solid rgba(59,130,246,0.25); border-radius: 10px;
    padding: 10px 18px; cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    user-select: all;
  }
  .copy-code-box:hover { border-color: var(--accent); background: rgba(59,130,246,0.06); }
  .btn-copy {
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--muted); border-radius: 8px; padding: 8px 14px;
    font-family: var(--font-body); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .btn-copy:hover { border-color: var(--accent); color: var(--accent); }
  .btn-copy.copied { border-color: var(--green); color: var(--green); background: rgba(34,197,94,0.08); }

  .league-expanded {
    background: var(--surface); border: 1px solid var(--accent);
    border-top: none; border-radius: 0 0 var(--r2) var(--r2);
    margin-bottom: 16px; overflow: hidden;
  }
  .league-expanded-tabs { display: flex; border-bottom: 1px solid var(--border); padding: 0 20px; }
  .league-expanded-tab {
    background: none; border: none; color: var(--muted);
    font-family: var(--font-body); font-size: 12px; font-weight: 500;
    padding: 10px 16px; cursor: pointer; border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s; white-space: nowrap;
  }
  .league-expanded-tab:hover { color: var(--text); }
  .league-expanded-tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 700; }
  .league-expanded-body { padding: 20px; }
  .league-wrapper { margin-bottom: 16px; }

  /* GROUPS */
  .group-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r2); padding: 20px; }
  .group-letter { font-family: var(--font-display); font-size: 30px; color: var(--accent); margin-bottom: 12px; }
  .group-team { font-size: 13px; color: var(--text); padding: 6px 0; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
  .group-team:last-child { border-bottom: none; }

  /* MISC */
  .chip { display: inline-flex; align-items: center; background: var(--surface2); border: 1px solid var(--border); color: var(--muted); font-size: 10px; padding: 3px 10px; border-radius: 20px; }
  .chip.active { border-color: var(--accent); color: var(--accent); background: rgba(59,130,246,0.08); }
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .empty-state { text-align: center; padding: 48px 24px; color: var(--muted); }
  .empty-state-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-state-title { font-family: var(--font-display); font-size: 22px; color: var(--text); margin-bottom: 8px; letter-spacing: 1px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: var(--font-display); font-size: 20px; letter-spacing: 1px; }

  /* TOGGLE */
  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); }
  .toggle-info strong { font-size: 14px; }
  .toggle-info p { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .toggle { position: relative; width: 44px; height: 24px; background: var(--surface3); border-radius: 12px; cursor: pointer; border: 1px solid var(--border2); transition: background 0.3s; }
  .toggle.on { background: var(--accent); border-color: var(--accent); }
  .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--muted); transition: transform 0.3s, background 0.3s; }
  .toggle.on::after { transform: translateX(20px); background: #fff; }

  /* MODAL */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
  .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 20px; padding: 36px; width: 100%; max-width: 440px; box-shadow: ${dark ? "0 32px 80px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.15)"}; }
  .modal-title { font-family: var(--font-display); font-size: 26px; letter-spacing: 1px; margin-bottom: 4px; }
  .modal-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; }

  /* AUTH */
  .auth-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 16px;
    background: var(--bg);
    position: relative; overflow: hidden;
    /* Allow scrolling on small phones when keyboard is open */
    align-items: flex-start;
    padding-top: max(24px, env(safe-area-inset-top));
  }

  /* Animated background grid */
  .auth-wrap::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: grid-drift 20s linear infinite;
    pointer-events: none;
  }
  @keyframes grid-drift {
    0% { transform: translateY(0); }
    100% { transform: translateY(48px); }
  }

  /* Floating orbs */
  .auth-wrap::after {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.12) 0%, transparent 45%),
      radial-gradient(ellipse at 80% 80%, rgba(244,63,94,0.1) 0%, transparent 45%),
      radial-gradient(ellipse at 60% 10%, rgba(6,214,247,0.07) 0%, transparent 35%);
    animation: orb-pulse 8s ease-in-out infinite alternate;
    pointer-events: none;
  }
  @keyframes orb-pulse {
    0% { opacity: 0.6; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.05); }
  }

  .auth-card {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 24px; padding: 48px 40px; width: 100%; max-width: 420px;
    box-shadow: ${dark ? "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)" : "0 16px 48px rgba(0,0,0,0.1)"};
    position: relative; z-index: 1;
    animation: card-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .auth-logo { font-family: var(--font-display); font-size: 42px; letter-spacing: 3px; text-align: center; color: var(--accent); margin-bottom: 4px; }
  .auth-logo span { color: var(--accent2); }
  .auth-sub { text-align: center; font-size: 13px; color: var(--muted); margin-bottom: 36px; }
  .auth-tabs { display: flex; margin-bottom: 28px; background: var(--surface2); border-radius: 8px; padding: 4px; }
  .auth-tab { flex: 1; background: none; border: none; color: var(--muted); font-family: var(--font-body); font-size: 13px; font-weight: 500; padding: 8px; cursor: pointer; border-radius: 6px; transition: all 0.2s; }
  .auth-tab.active { background: var(--accent); color: #fff; font-weight: 700; }

  /* Password input with eye toggle */
  .password-wrap { position: relative; }
  .password-wrap .form-input { padding-right: 44px; }
  .password-eye {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--muted);
    font-size: 18px; line-height: 1; padding: 4px;
    transition: color 0.15s; display: flex; align-items: center;
  }
  .password-eye:hover { color: var(--text); }
  @keyframes confirm-burst {
    0%   { transform: scale(1); }
    30%  { transform: scale(1.18); }
    60%  { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  @keyframes saved-fade {
    0%   { opacity: 0; transform: translateY(4px); }
    20%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; }
  }
  .pred-saved-tag {
    font-size: 11px; color: var(--green); font-weight: 700;
    animation: saved-fade 1.5s ease forwards;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .btn-confirm.just-saved {
    animation: confirm-burst 0.4s cubic-bezier(0.34,1.56,0.64,1);
    background: var(--green) !important; color: #fff !important;
  }

  /* Fetch results debug panel */
  .fetch-debug-panel {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r2); padding: 12px 14px; margin-bottom: 12px;
    font-size: 11px;
  }
  .fetch-debug-row {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 0; border-bottom: 1px solid var(--border);
    font-family: monospace;
  }
  .fetch-debug-row:last-child { border-bottom: none; }
  .fetch-debug-status {
    font-weight: 700; min-width: 90px; flex-shrink: 0;
    padding: 1px 6px; border-radius: 4px; text-align: center; font-size: 10px;
  }
  .fetch-debug-status.added { background: rgba(34,197,94,0.15); color: var(--green); }
  .fetch-debug-status.already_exists { background: rgba(148,163,184,0.15); color: var(--muted); }
  .fetch-debug-status.no_match {
    background: rgba(244,63,94,0.2); color: var(--accent2);
    font-size: 11px; border: 1px solid rgba(244,63,94,0.4);
    box-shadow: 0 0 0 1px rgba(244,63,94,0.1);
  }
  .see-preds-btn {
    background: none; border: 1px solid var(--border);
    color: var(--muted); border-radius: 6px; padding: 4px 10px;
    font-size: 11px; font-weight: 600; cursor: pointer;
    font-family: var(--font-body); transition: all 0.15s;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .see-preds-btn:hover { border-color: var(--accent); color: var(--accent); }
  .see-preds-btn.open { border-color: var(--accent); color: var(--accent); background: rgba(59,130,246,0.06); }

  .preds-panel {
    border-top: 1px solid var(--border);
    padding: 12px 16px;
    background: var(--surface2);
    animation: panel-in 0.15s ease;
  }
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .preds-panel-title {
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;
  }
  .preds-panel-row {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 0; border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .preds-panel-row:last-child { border-bottom: none; }
  .preds-panel-row.winner-row {
    background: linear-gradient(90deg, rgba(245,158,11,0.1), transparent);
    border-radius: 6px; margin: 0 -8px; padding: 6px 8px;
    border-bottom: 1px solid transparent;
  }
  .preds-panel-name { flex: 1; font-weight: 500; }
  .preds-panel-name.you { color: var(--accent2); font-weight: 700; }
  .preds-panel-score { font-family: var(--font-display); font-size: 16px; min-width: 48px; text-align: center; }
  .preds-panel-pts { font-size: 11px; font-weight: 700; min-width: 40px; text-align: right; }
  .preds-panel-pts.exact { color: var(--gold); }
  .preds-panel-pts.correct { color: var(--green); }
  .preds-panel-pts.wrong { color: var(--muted); }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  @media (max-width: 640px) {
    .main { padding: 12px; }
    .header { padding: 10px 14px; }
    .nav { padding: 6px 10px; gap: 4px; }
    .nav-tab { font-size: 11px; padding: 7px 11px; border-radius: 8px; }

    /* Fixture cards — larger touch targets */
    .fixture-body { flex-wrap: wrap; gap: 8px; padding: 10px 12px; }
    .fixture-teams { order: 1; width: 100%; }
    .fixture-pred { order: 2; width: 100%; justify-content: center; gap: 12px; }
    .result-box { order: 3; }
    .score-input { width: 52px; font-size: 20px; padding: 8px; }
    .btn-confirm { padding: 10px 22px; font-size: 13px; }
    .pred-confirm-row { padding: 8px 12px 12px; flex-wrap: wrap; gap: 8px; }
    .fixture-pred-corner { display: none; } /* too cluttered on mobile */

    /* Fixture countdown tighter on mobile */
    .fixture-cd-row { padding: 5px 12px 8px; }
    .fcd-unit { padding: 3px 5px; min-width: 28px; }
    .fcd-val { font-size: 13px; }

    /* Dashboard */
    .dash-hero { padding: 16px 14px; flex-direction: column; gap: 12px; }
    .dash-hero-title { font-size: 22px; }
    .dash-hero-stats { gap: 16px; justify-content: flex-start; }
    .dash-stat-val { font-size: 22px; }
    .dash-stat { align-items: flex-start; }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .stat-card { padding: 14px 16px; }
    .stat-card-val { font-size: 28px; }

    /* Upcoming match cards — full width on mobile instead of horizontal scroll */
    .upcoming-scroll { flex-direction: column; overflow-x: visible; padding-bottom: 0; }
    .match-card-mini { width: 100%; }

    /* Modal */
    .modal { padding: 20px; }
    .modal-title { font-size: 22px; }
    .auth-card { padding: 24px 20px; border-radius: 18px; margin: auto 0; }
    .auth-wrap { padding-top: 16px; padding-bottom: 16px; }

    /* League expanded */
    .league-expanded-body { padding: 14px; }
    .lb-table th, .lb-table td { padding: 8px 6px; font-size: 11px; }
    .lb-rank { font-size: 15px; width: 28px; }
    .lb-pts { font-size: 15px; }

    /* Profile dropdown full width on mobile */
    .profile-dropdown { width: calc(100vw - 32px); right: -14px; }

    /* Filter row scrollable on mobile */
    .filter-row { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
    .filter-row::-webkit-scrollbar { display: none; }
    .filter-btn { flex-shrink: 0; }

    /* Progress bar */
    .pred-progress-wrap { padding: 12px 14px; }
    .pred-progress-stats { gap: 10px; }
  }
`;


// ─── COUNTDOWN UNIT COMPONENT ─────────────────────────────────────────────────
function FixtureCountdown({ date, time }) {
  const cd = useCountdown(date, time);
  if (!cd) return null;

  if (cd.days > 60) return (
    <div className="fixture-cd-row">
      <span style={{ fontSize: 11, color: "var(--muted)" }}>⚽ {date} · {time}</span>
    </div>
  );

  return (
    <div className="fixture-cd-row">
      <div className="fixture-cd-inner">
        {cd.days > 0 && (
          <>
            <div className="fcd-unit"><div className="fcd-val">{cd.days}</div><div className="fcd-label">d</div></div>
            <span className="fcd-sep">·</span>
          </>
        )}
        <div className="fcd-unit"><div className="fcd-val">{String(cd.hours).padStart(2,"0")}</div><div className="fcd-label">h</div></div>
        <span className="fcd-sep">:</span>
        <div className="fcd-unit"><div className="fcd-val">{String(cd.mins).padStart(2,"0")}</div><div className="fcd-label">m</div></div>
        <span className="fcd-sep">:</span>
        <div className="fcd-unit"><div className="fcd-val">{String(cd.secs).padStart(2,"0")}</div><div className="fcd-label">s</div></div>
      </div>
    </div>
  );
}

// ─── RICH FIXTURE CARD ────────────────────────────────────────────────────────
function RichFixtureCard({ fixture, pred, result, onSave, showCountdown = true, scoring = DEFAULT_SCORING, allPreds = {}, leagueMembers = [], currentUid = null }) {
  const [draftHome, setDraftHome] = useState(pred?.homeGoals != null ? String(pred.homeGoals) : "");
  const [draftAway, setDraftAway] = useState(pred?.awayGoals != null ? String(pred.awayGoals) : "");
  const [justSaved, setJustSaved] = useState(false);
  const [showPreds, setShowPreds] = useState(false);
  const lockStatus = useFixtureLock(fixture.date, fixture.time);

  useEffect(() => {
    setDraftHome(pred?.homeGoals != null ? String(pred.homeGoals) : "");
    setDraftAway(pred?.awayGoals != null ? String(pred.awayGoals) : "");
  }, [pred?.homeGoals, pred?.awayGoals]);

  const pts = calcMatchScore(pred, result, scoring);
  const hasResult = result != null;
  const hasPred = pred?.homeGoals != null;
  const isLocked = hasResult || lockStatus?.locked === true;

  // Match in progress: locked (kicked off) but no result yet
  const kickoff = kickoffUTC(fixture.date, fixture.time);
  const now = new Date();
  const isInProgress = !hasResult && lockStatus?.locked && now >= kickoff;

  // Dirty if either draft differs from saved, but only count as a valid prediction
  // if both fields are filled in
  const bothFilled = draftHome !== "" && draftAway !== "";
  const isDirty = !isLocked && bothFilled && (
    String(draftHome) !== String(pred?.homeGoals ?? "") ||
    String(draftAway) !== String(pred?.awayGoals ?? "")
  );

  const handleConfirm = () => {
    if (!onSave || isLocked) return;
    onSave(fixture.id, draftHome, draftAway);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  // Build lock badge
  const renderLockBadge = () => {
    if (hasResult) return null;
    if (lockStatus?.locked) {
      return <span className="lock-badge locked">🔒 Locked</span>;
    }
    if (!lockStatus) return null;
    const { hoursLeft, minsLeft } = lockStatus;
    const daysLeft = Math.floor(hoursLeft / 24);
    const remHours = hoursLeft % 24;
    const closingSoon = hoursLeft < 3;
    const timeStr = daysLeft > 0
      ? `${daysLeft}d ${remHours}h`
      : hoursLeft > 0
        ? `${hoursLeft}h ${minsLeft}m`
        : `${minsLeft}m`;
    return (
      <span className={`lock-badge ${closingSoon ? "closing-soon" : "open"}`}>
        🔓 Locks in {timeStr}
      </span>
    );
  };

  return (
    <div className={`fixture-card ${hasPred ? "predicted" : ""} ${hasResult ? "has-result" : ""} ${isLocked && !hasResult ? "locked" : ""} ${isInProgress ? "in-progress" : ""}`}>
      {hasPred && !hasResult && !isInProgress && <div className="fixture-pred-corner">✓ Predicted</div>}
      {isInProgress && <div className="fixture-pred-corner" style={{ background: "rgba(244,63,94,0.15)", borderColor: "rgba(244,63,94,0.4)", color: "var(--accent2)" }}>⚽ Live</div>}
      {/* Venue + date bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 16px", background: "var(--surface2)",
        borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--muted)",
        gap: 8,
      }}>
        <span>📍 {fixture.venue}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {hasPred && !hasResult && !isInProgress && (
            <div className="fixture-pred-corner">✓ Predicted</div>
          )}
          {isInProgress && (
            <div className="fixture-pred-corner" style={{ background: "rgba(244,63,94,0.15)", borderColor: "rgba(244,63,94,0.4)", color: "var(--accent2)" }}>⚽ Live</div>
          )}
          <span>{fixture.date} · {fixture.time}</span>
        </div>
      </div>

      {/* Teams + inputs */}
      <div className="fixture-body">
        {fixture.group && (
          <span className="chip active" style={{ fontSize: 10, flexShrink: 0 }}>GRP {fixture.group}</span>
        )}
        {!fixture.group && (
          <span className="chip" style={{ fontSize: 9, flexShrink: 0 }}>{fixture.stage.slice(0,6)}</span>
        )}

        <div className="fixture-teams">
          {(() => {
            let homeClass = "", awayClass = "";
            if (hasResult) {
              const rh = result.homeGoals, ra = result.awayGoals;
              if (rh > ra)      { homeClass = "winner"; awayClass = "loser"; }
              else if (ra > rh) { homeClass = "loser";  awayClass = "winner"; }
              else              { homeClass = "draw";   awayClass = "draw"; }
            }
            return (
              <>
                <div className="fixture-team">
                  <span className={`fixture-team-name ${homeClass}`}>{fixture.home}</span>
                </div>
                <span className="fixture-vs">VS</span>
                <div className="fixture-team" style={{ justifyContent: "flex-end" }}>
                  <span className={`fixture-team-name ${awayClass}`}>{fixture.away}</span>
                </div>
              </>
            );
          })()}
        </div>

        <div className="fixture-pred">
          {hasResult && <div className="score-col-label">Predicted</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number" min="0" max="20" className="score-input"
              value={draftHome}
              disabled={isLocked}
              placeholder="–"
              onChange={e => setDraftHome(e.target.value)}
            />
            <span className="score-sep">–</span>
            <input
              type="number" min="0" max="20" className="score-input"
              value={draftAway}
              disabled={isLocked}
              placeholder="–"
              onChange={e => setDraftAway(e.target.value)}
            />
          </div>
        </div>

        {hasResult && (
          <div className="result-box">
            <div className="result-label">Final Score</div>
            <div className="result-score">{result.homeGoals}–{result.awayGoals}</div>
            <span className={`pts-badge ${pts === scoring.exactPoints ? "pts-3" : pts === 0 ? "pts-0" : ""}`}>{pts}pt{pts !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Confirm / lock row */}
      {!hasResult && (
        <div className="pred-confirm-row">
          {isInProgress && (
            <span className="in-progress-badge">
              <span className="in-progress-dot" />
              Match in progress — awaiting result
            </span>
          )}
          {!isInProgress && !isLocked && (
            <button
              className={`btn-confirm${isDirty ? " dirty" : ""}${justSaved && !isDirty ? " just-saved" : ""}`}
              onClick={handleConfirm}
              disabled={!bothFilled || (!isDirty && hasPred && !justSaved)}
              title={!bothFilled ? "Enter both scores first" : ""}
            >
              {hasPred && !isDirty ? "✓ Saved" : "Confirm"}
            </button>
          )}
          {!isInProgress && isDirty && <span className="pred-dirty-tag">Unsaved changes</span>}
          {!isInProgress && justSaved && !isDirty && <span className="pred-saved-tag">⚽ Prediction saved!</span>}
          {!isInProgress && !isLocked && !hasPred && !bothFilled && (
            <span style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>No prediction yet</span>
          )}
          {!isInProgress && renderLockBadge()}
        </div>
      )}

      {/* Countdown */}
      {showCountdown && !hasResult && !isLocked && <FixtureCountdown date={fixture.date} time={fixture.time} />}

      {/* See predictions panel — only for finished matches */}
      {hasResult && leagueMembers.length > 0 && (
        <>
          <div style={{ padding: "8px 16px 10px", borderTop: "1px solid var(--border)" }}>
            <button
              className={`see-preds-btn ${showPreds ? "open" : ""}`}
              onClick={() => setShowPreds(s => !s)}
            >
              👥 {showPreds ? "Hide" : "See"} predictions ({leagueMembers.length})
            </button>
          </div>
          {showPreds && (
            <div className="preds-panel">
              <div className="preds-panel-title">What everyone predicted</div>
              {leagueMembers.map(uid => {
                const users = storage.get("sc_users") || {};
                const username = users[uid]?.username || uid;
                const memberPred = (allPreds[uid] || {})[fixture.id];
                const pts = calcMatchScore(memberPred, result, scoring);
                const isExact = pts === scoring.exactPoints;
                const isCorrect = pts === scoring.outcomePoints;
                const isYou = uid === currentUid;
                return (
                  <div key={uid} className={`preds-panel-row ${isExact ? "winner-row" : ""}`}>
                    <Avatar uid={uid} size={28} username={username} />
                    <span className={`preds-panel-name ${isYou ? "you" : ""}`}>
                      {isYou ? "⭐ You" : username}
                    </span>
                    {memberPred?.homeGoals != null ? (
                      <>
                        <span className="preds-panel-score">{memberPred.homeGoals}–{memberPred.awayGoals}</span>
                        <span className={`preds-panel-pts ${isExact ? "exact" : isCorrect ? "correct" : "wrong"}`}>
                          {isExact ? `🎯 ${pts}pts` : isCorrect ? `✅ ${pts}pt` : "❌ 0pts"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="preds-panel-score" style={{ color: "var(--muted)", fontSize: 12 }}>—</span>
                        <span className="preds-panel-pts wrong">No pick</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── MINI MATCH CARD (for dashboard upcoming strip) ───────────────────────────
const GROUP_NAMES = {
  A: "Group A", B: "Group B", C: "Group C", D: "Group D",
  E: "Group E", F: "Group F", G: "Group G", H: "Group H",
  I: "Group I", J: "Group J", K: "Group K", L: "Group L",
};

function MiniMatchCard({ fixture, pred, onClick }) {
  const cd = useCountdown(fixture.date, fixture.time);
  const hasPred = pred?.homeGoals != null;
  const lockStatus = useFixtureLock(fixture.date, fixture.time);
  const isClosingSoon = !hasPred && lockStatus && !lockStatus.locked &&
    lockStatus.hoursLeft < 3;
  const isLocked = !hasPred && lockStatus?.locked;

  return (
    <div
      className={`match-card-mini ${hasPred ? "has-pred" : ""}`}
      onClick={onClick}
      style={{
        borderColor: isClosingSoon
          ? "rgba(245,158,11,0.5)"
          : isLocked
            ? "rgba(244,63,94,0.2)"
            : undefined,
      }}
    >
      {/* Prediction status banner */}
      <div className={`match-card-status-banner ${hasPred ? "predicted" : isClosingSoon ? "urgent" : "missing"}`}>
        {hasPred ? "✓ Predicted" : isClosingSoon ? "⚠️ Predict now!" : "No prediction yet"}
      </div>

      {/* Group / stage bar */}
      <div className="match-card-group-bar">
        {fixture.group
          ? <span className="match-card-group-name">{GROUP_NAMES[fixture.group] || `Group ${fixture.group}`}</span>
          : <span className="match-card-stage-name">{fixture.stage}</span>
        }
      </div>

      <div className="match-card-body">

        {/* Teams */}
        <div className="match-card-matchup">
          <div className="match-card-team-name">
            <span>{fixture.home}</span>
          </div>
          <span className="match-card-vs-divider">VS</span>
          <div className="match-card-team-name away">
            <span>{fixture.away}</span>
          </div>
        </div>

        {/* Countdown */}
        {cd && cd.days <= 60 && (
          <div className="match-card-countdown">
            {cd.days > 0 && (
              <>
                <div className="match-card-cd-unit">
                  <div className="match-card-cd-val">{cd.days}</div>
                  <div className="match-card-cd-label">d</div>
                </div>
                <span className="match-card-cd-sep">:</span>
              </>
            )}
            <div className="match-card-cd-unit">
              <div className="match-card-cd-val">{String(cd.hours).padStart(2,"0")}</div>
              <div className="match-card-cd-label">h</div>
            </div>
            <span className="match-card-cd-sep">:</span>
            <div className="match-card-cd-unit">
              <div className="match-card-cd-val">{String(cd.mins).padStart(2,"0")}</div>
              <div className="match-card-cd-label">m</div>
            </div>
            <span className="match-card-cd-sep">:</span>
            <div className="match-card-cd-unit">
              <div className="match-card-cd-val">{String(cd.secs).padStart(2,"0")}</div>
              <div className="match-card-cd-label">s</div>
            </div>
          </div>
        )}

        {/* Location · time */}
        <div className="match-card-meta">
          <span>📍</span>
          <span>{fixture.venue}</span>
          <span>·</span>
          <span>{fixture.time}</span>
        </div>

        {/* Prediction */}
        {hasPred
          ? <span className="match-card-pred-badge">🎯 {fixture.home} {pred.homeGoals} – {pred.awayGoals} {fixture.away}</span>
          : (() => {
              const eestHour = parseInt(fixture.time?.split(":")[0] || "15");
              const eestMin  = parseInt(fixture.time?.split(":")[1]?.split(" ")[0] || "0");
              const kickoff = new Date(`${fixture.date}T${String(eestHour).padStart(2,"0")}:${String(eestMin).padStart(2,"0")}:00+03:00`);
              const hoursLeft = (kickoff - new Date()) / 3600000;
              if (hoursLeft > 0 && hoursLeft <= 24)
                return <span className="deadline-badge" style={{ width: "100%", justifyContent: "center" }}>⚠️ Deadline in {Math.ceil(hoursLeft)}h — predict now!</span>;
              return <span className="match-card-nopred-badge">No prediction yet</span>;
            })()
        }
      </div>
    </div>
  );
}

// ─── DASHBOARD TAB ────────────────────────────────────────────────────────────
function DashboardTab({ user, leagueId, setTab, refresh }) {
  const leagues = storage.get("sc_leagues") || {};
  const league = leagues[leagueId];
  const allPreds = storage.get("sc_predictions") || {};
  const myPreds = leagueId ? (allPreds[user.uid] || {})[leagueId] || {} : {};
  const results = storage.get("sc_results") || {};
  const scoring = getScoringSettings(league);

  // ── Missing predictions warning ───────────────────────────────────────────
  const missingSoon = leagueId ? WC2026_FIXTURES.filter(f => {
    if (results[f.id]) return false; // already has result
    if (myPreds[f.id]?.homeGoals != null) return false; // already predicted
    const kickoff = kickoffUTC(f.date, f.time);
    const lockAt = new Date(kickoff.getTime() - 3600000);
    const hoursLeft = (lockAt - new Date()) / 3600000;
    return hoursLeft > 0 && hoursLeft <= 24; // locking within 24 hours
  }) : [];
  const [newResultsCount, setNewResultsCount] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const currentCount = Object.keys(results).length;
    const seenKey = `sc_seen_results_${leagueId}`;
    const seenCount = parseInt(localStorage.getItem(seenKey) || "0");
    const diff = currentCount - seenCount;
    if (diff > 0 && seenCount > 0) {
      setNewResultsCount(diff);
    }
    // Update seen count
    localStorage.setItem(seenKey, String(currentCount));
  }, [leagueId, Object.keys(results).length]);

  // ── Highlight: exact prediction with 4+ total goals ───────────────────────
  const [highlightPick, setHighlightPick] = useState(null);
  useEffect(() => {
    if (!leagueId || !league) return;

    const computeHighlights = async () => {
      const seenKey = `sc_seen_highlights_${leagueId}`;
      const seenIds = new Set(JSON.parse(localStorage.getItem(seenKey) || "[]"));
      const newHighlights = [];

      // Always fetch fresh user data — the cache may be partially populated
      // (e.g. has the current user but not every league member), and this
      // effect only runs when results change, so the extra read is cheap.
      const users = await fsGetAllUsers();
      _cache["sc_users"] = users;

      for (const fid of Object.keys(results)) {
        const result = results[fid];
        if (!result || result.homeGoals == null || result.awayGoals == null) continue;
        const totalGoals = Number(result.homeGoals) + Number(result.awayGoals);
        if (totalGoals < 4) continue; // threshold: 4+ combined goals

        const fixture = WC2026_FIXTURES.find(f => f.id === fid);
        if (!fixture) continue;

        for (const memberUid of league.members || []) {
          const memberPred = ((allPreds[memberUid] || {})[leagueId] || {})[fid];
          if (!memberPred || memberPred.homeGoals == null) continue;
          const isExact = Number(memberPred.homeGoals) === Number(result.homeGoals) &&
            Number(memberPred.awayGoals) === Number(result.awayGoals);
          if (!isExact) continue;

          const highlightId = `${fid}:${memberUid}`;
          if (seenIds.has(highlightId)) continue;

          newHighlights.push({
            id: highlightId,
            username: users[memberUid]?.username || "Someone",
            isYou: memberUid === user.uid,
            fixture,
            score: `${result.homeGoals}-${result.awayGoals}`,
            leagueName: league.name,
          });
        }
      }

      if (newHighlights.length > 0) {
        setHighlightPick(newHighlights[0]); // show the first/most relevant one
        // Mark all found highlights as seen so they don't repeat
        const allSeen = [...seenIds, ...newHighlights.map(h => h.id)];
        localStorage.setItem(seenKey, JSON.stringify(allSeen));
      }
    };

    computeHighlights();
  }, [leagueId, Object.keys(results).length]);

  // ── Highlight: nobody in the league predicted the correct outcome ─────────
  const [upsetPick, setUpsetPick] = useState(null);
  useEffect(() => {
    if (!leagueId || !league) return;

    const computeUpsets = () => {
      const seenKey = `sc_seen_upsets_${leagueId}`;
      const seenIds = new Set(JSON.parse(localStorage.getItem(seenKey) || "[]"));
      const newUpsets = [];
      const members = league.members || [];
      // Require at least 3 members with a prediction for this to feel
      // meaningful — a 1-2 person "upset" isn't really a story.
      const minPredictors = 3;

      for (const fid of Object.keys(results)) {
        const result = results[fid];
        if (!result || result.homeGoals == null || result.awayGoals == null) continue;

        const fixture = WC2026_FIXTURES.find(f => f.id === fid);
        if (!fixture) continue;

        const realOutcome = result.homeGoals > result.awayGoals ? "H"
          : result.awayGoals > result.homeGoals ? "A" : "D";

        let predictorCount = 0;
        let correctCount = 0;

        for (const memberUid of members) {
          const memberPred = ((allPreds[memberUid] || {})[leagueId] || {})[fid];
          if (!memberPred || memberPred.homeGoals == null) continue;
          predictorCount++;
          const predOutcome = memberPred.homeGoals > memberPred.awayGoals ? "H"
            : memberPred.awayGoals > memberPred.homeGoals ? "A" : "D";
          if (predOutcome === realOutcome) correctCount++;
        }

        if (predictorCount < minPredictors) continue;
        if (correctCount > 0) continue; // someone got it — not a clean upset

        const upsetId = fid;
        if (seenIds.has(upsetId)) continue;

        newUpsets.push({
          id: upsetId,
          fixture,
          score: `${result.homeGoals}-${result.awayGoals}`,
          predictorCount,
          leagueName: league.name,
        });
      }

      if (newUpsets.length > 0) {
        setUpsetPick(newUpsets[0]);
        const allSeen = [...seenIds, ...newUpsets.map(u => u.id)];
        localStorage.setItem(seenKey, JSON.stringify(allSeen));
      }
    };

    computeUpsets();
  }, [leagueId, Object.keys(results).length]);

  // Stats
  const totalPreds = Object.keys(myPreds).filter(k => k !== "tournament_winner" && myPreds[k]?.homeGoals != null).length;
  const scoredFixtures = WC2026_FIXTURES.filter(f => results[f.id] != null);
  let totalPts = 0, exactHits = 0, correctOutcomes = 0;
  scoredFixtures.forEach(f => {
    const s = calcMatchScore(myPreds[f.id], results[f.id], scoring);
    totalPts += s;
    if (s === scoring.exactPoints) exactHits++;
    else if (s === scoring.outcomePoints) correctOutcomes++;
  });

  // Upcoming unplayed fixtures — chronological order, max 8
  const upcoming = WC2026_FIXTURES
    .filter(f => !results[f.id] && f.home !== "TBD" && !f.home.startsWith("TBD"))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 8);

  // Count unpredicted upcoming fixtures that aren't locked
  const unpredictedUrgent = upcoming.filter(f => {
    const hasPred = myPreds[f.id]?.homeGoals != null;
    if (hasPred) return false;
    const kickoff = kickoffUTC(f.date, f.time);
    const hoursLeft = (kickoff - new Date()) / 3600000;
    return hoursLeft > 0 && hoursLeft <= 24;
  }).length;

  // Mini leaderboard
  const lb = leagueId ? calcLeaderboard(leagueId) : [];
  const myRank = lb.findIndex(e => e.uid === user.uid) + 1;

  const tournamentStart = new Date("2026-06-11T19:00:00Z");
  const now = new Date();
  const daysToTournament = Math.max(0, Math.ceil((tournamentStart - now) / 86400000));
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      {/* Exact high-scoring prediction highlight */}
      {highlightPick && (
        <div className="highlight-pick-banner">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="highlight-pick-flame">🔥</span>
            <div>
              <div className="highlight-pick-text">
                {highlightPick.isYou ? "You" : highlightPick.username} called {highlightPick.fixture.home} {highlightPick.score} {highlightPick.fixture.away} EXACTLY!
              </div>
              <div className="highlight-pick-sub">
                {highlightPick.leagueName} · An incredible exact prediction with {highlightPick.score.split("-").reduce((a, b) => Number(a) + Number(b), 0)} goals total 🎯
              </div>
            </div>
          </div>
          <button className="highlight-pick-dismiss" onClick={() => setHighlightPick(null)}>✕</button>
        </div>
      )}

      {/* Nobody got it right upset */}
      {upsetPick && (
        <div className="upset-banner">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="upset-banner-icon">💩</span>
            <div>
              <div className="upset-banner-text">
                Nobody saw that coming! {upsetPick.fixture.home} {upsetPick.score} {upsetPick.fixture.away}
              </div>
              <div className="upset-banner-sub">
                {upsetPick.leagueName} · All {upsetPick.predictorCount} predictions missed this one
              </div>
            </div>
          </div>
          <button className="highlight-pick-dismiss" onClick={() => setUpsetPick(null)}>✕</button>
        </div>
      )}

      {/* New results banner */}
      {newResultsCount > 0 && !bannerDismissed && (
        <div className="new-results-banner">
          <div className="new-results-banner-left">
            <span className="new-results-banner-icon">🎯</span>
            <div>
              <div className="new-results-banner-text">
                {newResultsCount} new result{newResultsCount > 1 ? "s" : ""} since your last visit!
              </div>
              <div className="new-results-banner-sub">Check your points and standings</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="new-results-banner-btn" onClick={() => setTab("predictions")}>
              View Points →
            </button>
            <button className="new-results-banner-dismiss" onClick={() => setBannerDismissed(true)}>✕</button>
          </div>
        </div>
      )}

      {/* Missing predictions warning */}
      {missingSoon.length > 0 && (
        <div className="missing-preds-banner">
          <div className="new-results-banner-left">
            <span className="new-results-banner-icon">⚠️</span>
            <div>
              <div className="missing-preds-banner-text">
                {missingSoon.length} match{missingSoon.length > 1 ? "es" : ""} locking soon — no prediction yet!
              </div>
              <div className="missing-preds-banner-sub">
                {missingSoon.slice(0, 2).map(f => `${f.home} vs ${f.away}`).join(" · ")}
                {missingSoon.length > 2 ? ` · +${missingSoon.length - 2} more` : ""}
              </div>
            </div>
          </div>
          <button className="missing-preds-banner-btn" onClick={() => setTab("predictions")}>
            Predict Now →
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-hero-bg" />
        <div className="dash-hero-content">
          <ScoreClashLogo width={320} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>
            {greeting}, <span style={{ color: "var(--text)", fontWeight: 700 }}>{user.username}</span> 👋
          </div>
          <div className="dash-hero-sub">
            {league ? `Playing in: ${league.name}` : "Select a league to start predicting"}
            {daysToTournament > 0 && ` · ${daysToTournament} days until kick-off`}
          </div>
        </div>
        {myRank > 0 && (
          <div className="dash-hero-stats">
            <div className="dash-stat">
              <div className="dash-stat-val gold">#{myRank}</div>
              <div className="dash-stat-label">League Rank</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-val accent">{totalPts}</div>
              <div className="dash-stat-label">Points</div>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards — 4 distinct metrics */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ "--card-accent": "var(--accent)" }}>
          <div className="stat-card-icon">🏅</div>
          <div className="stat-card-val" style={{ color: totalPts > 0 ? "var(--accent)" : "var(--muted)" }}>{totalPts}</div>
          <div className="stat-card-label">Total Points</div>
          <div className="stat-card-sub">{scoredFixtures.length > 0 ? `${exactHits} exact · ${correctOutcomes} correct outcome` : "Tournament not started yet"}</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "var(--muted)" }}>
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-val" style={{ color: totalPreds > 0 ? "var(--text)" : "var(--muted)" }}>{totalPreds}</div>
          <div className="stat-card-label">Predictions Made</div>
          <div className="stat-card-sub">of {WC2026_FIXTURES.filter(f => !f.home.startsWith("TBD")).length} available</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "var(--green)" }}>
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-val" style={{ color: scoredFixtures.length > 0 ? "var(--green)" : "var(--muted)" }}>
            {scoredFixtures.length > 0 ? `${Math.round(((exactHits + correctOutcomes) / scoredFixtures.length) * 100)}%` : "—"}
          </div>
          <div className="stat-card-label">Prediction Accuracy</div>
          <div className="stat-card-sub">{scoredFixtures.length > 0 ? `correct outcomes out of ${scoredFixtures.length} played` : "Awaiting first results"}</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "var(--gold)" }}>
          <div className="stat-card-icon">🎯</div>
          <div className="stat-card-val" style={{ color: scoredFixtures.length > 0 ? "var(--gold)" : "var(--muted)" }}>
            {scoredFixtures.length > 0 ? `${Math.round((exactHits / scoredFixtures.length) * 100)}%` : "—"}
          </div>
          <div className="stat-card-label">Exact Score Accuracy</div>
          <div className="stat-card-sub">{scoredFixtures.length > 0 ? `${exactHits} exact scores out of ${scoredFixtures.length} played` : "Awaiting first results"}</div>
        </div>
      </div>
      {/* Upcoming matches */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-label">
          <span className="section-label-text">
            Upcoming Matches
            {unpredictedUrgent > 0 && (
              <span style={{
                marginLeft: 8, fontSize: 10, fontWeight: 700,
                color: "#fff", background: "var(--accent2)",
                padding: "2px 8px", borderRadius: 10,
              }}>
                ⚠️ {unpredictedUrgent} need predictions
              </span>
            )}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setTab("predictions")}>View all →</button>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>No upcoming fixtures found.</div>
        ) : (
          <div className="upcoming-scroll">
            {upcoming.map(f => (
              <MiniMatchCard
                key={f.id}
                fixture={f}
                pred={myPreds[f.id]}
                onClick={() => setTab("predictions")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mini leaderboard */}
      {league && lb.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span className="section-label-text">League Standings</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setTab("leagues")}>Full table →</button>
          </div>
          <div className="mini-lb">
            {lb.slice(0, 5).map((entry, i) => (
              <div key={entry.uid} className="mini-lb-row">
                <div className={`mini-lb-rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i === lb.slice(0,5).length - 1 && lb.length > 3 ? "🚽" : i + 1}
                </div>
                <Avatar uid={entry.uid} size={28} username={entry.username} />
                <div className={`mini-lb-name ${entry.uid === user.uid ? "you" : ""}`}>
                  {entry.uid === user.uid ? "⭐ " : ""}{entry.username}
                </div>
                <div className="mini-lb-pts">{entry.points}</div>
              </div>
            ))}
            {/* Show user's own rank if they're outside the top 5 */}
            {myRank > 5 && (() => {
              const myEntry = lb.find(e => e.uid === user.uid);
              return myEntry ? (
                <>
                  <div style={{ padding: "6px 0", textAlign: "center", fontSize: 11, color: "var(--muted)" }}>
                    · · ·
                  </div>
                  <div className="mini-lb-row" style={{ background: "rgba(244,63,94,0.04)", borderRadius: 8, padding: "8px 6px" }}>
                    <div className="mini-lb-rank">{myRank === lb.length && lb.length > 3 ? "🚽" : myRank}</div>
                    <Avatar uid={user.uid} size={28} username={user.username} />
                    <div className="mini-lb-name you">⭐ {user.username}</div>
                    <div className="mini-lb-pts">{myEntry.points}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", paddingTop: 6 }}>
                    You are {myRank - 5} place{myRank - 5 !== 1 ? "s" : ""} behind 5th
                  </div>
                </>
              ) : null;
            })()}
            {lb.length > 5 && myRank <= 5 && (
              <div style={{ padding: "8px 0 0", textAlign: "center", fontSize: 11, color: "var(--muted)" }}>
                +{lb.length - 5} more · <button className="btn btn-ghost btn-sm" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => setTab("leaderboard")}>See all</button>
              </div>
            )}
          </div>
        </div>
      )}

      {!league && (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">No League Selected</div>
          <p style={{ marginBottom: 24, color: "var(--muted)", fontSize: 14 }}>Join or create a league to see standings and start predicting!</p>
          <button className="btn btn-primary" onClick={() => setTab("leagues")}>Go to My Leagues</button>
        </div>
      )}
    </>
  );
}

// ─── PREDICTIONS TAB ───────────────────────────────────────────────────────────
function PredictionsTab({ user, leagueId, refresh }) {
  const [stageFilter, setStageFilter] = useState("Upcoming");

  const leagues = storage.get("sc_leagues") || {};
  const league = leagues[leagueId];
  if (!league) return null;

  const allPreds = storage.get("sc_predictions") || {};
  const myPreds = (allPreds[user.uid] || {})[leagueId] || {};
  const results = storage.get("sc_results") || {};
  const scoring = getScoringSettings(league);

  const stageGroups = [
    { label: "Group Stage", stages: ["Group Stage"] },
    { label: "Knockout", stages: ["Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Third Place", "Final"] },
  ];

  // Today's date in YYYY-MM-DD (EEST — UTC+3)
  const todayStr = new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString().split("T")[0];
  const todayFixtures = WC2026_FIXTURES.filter(f => f.date === todayStr);
  const hasTodayMatches = todayFixtures.length > 0;

  // Upcoming: all fixtures without a result, sorted chronologically
  const upcomingFixtures = WC2026_FIXTURES
    .filter(f => !results[f.id])
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // Completed: all fixtures with a result, sorted chronologically
  const completedFixtures = WC2026_FIXTURES
    .filter(f => results[f.id])
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const filtered = stageFilter === "Upcoming"
    ? upcomingFixtures
    : stageFilter === "Completed"
      ? completedFixtures
      : stageFilter === "Today"
        ? todayFixtures
        : WC2026_FIXTURES.filter(f => f.stage === stageFilter);

  const twLocked = useTournamentWinnerLock();

  const twLockBadge = () => {
    if (twLocked) return <span className="lock-badge locked" style={{ marginLeft: 8 }}>🔒 Locked</span>;
    const msLeft = (TOURNAMENT_START.getTime() - 60 * 60 * 1000) - new Date().getTime();
    if (msLeft <= 0) return null;
    const totalMins = Math.floor(msLeft / 60000);
    const daysLeft = Math.floor(totalMins / 1440);
    const remHours = Math.floor((totalMins % 1440) / 60);
    const remMins = totalMins % 60;
    const totalHours = Math.floor(msLeft / 3600000);
    const closingSoon = totalHours < 3;
    const timeStr = daysLeft > 0
      ? `${daysLeft}d ${remHours}h`
      : totalHours > 0
        ? `${totalHours}h ${remMins}m`
        : `${remMins}m`;
    return <span className={`lock-badge ${closingSoon ? "closing-soon" : "open"}`} style={{ marginLeft: 8 }}>🔓 Locks in {timeStr}</span>;
  };

  const savePred = async (fixtureId, homeGoals, awayGoals) => {
    const all = storage.get("sc_predictions") || {};
    if (!all[user.uid]) all[user.uid] = {};
    if (!all[user.uid][leagueId]) all[user.uid][leagueId] = {};
    all[user.uid][leagueId][fixtureId] = { homeGoals: Number(homeGoals), awayGoals: Number(awayGoals) };
    storage.set("sc_predictions", all);
    refresh();
  };

  const saveTournamentWinner = (team) => {
    const all = storage.get("sc_predictions") || {};
    if (!all[user.uid]) all[user.uid] = {};
    if (!all[user.uid][leagueId]) all[user.uid][leagueId] = {};
    all[user.uid][leagueId]["tournament_winner"] = team;
    storage.set("sc_predictions", all);
    refresh();
  };

  // Progress stats for current filter
  const stageFixtures = filtered;
  const stagePredicted = stageFixtures.filter(f => myPreds[f.id]?.homeGoals != null).length;
  const stageLocked = stageFixtures.filter(f => {
    const kickoff = kickoffUTC(f.date, f.time);
    return new Date() >= new Date(kickoff.getTime() - 3600000);
  }).length;
  const stageWithResult = stageFixtures.filter(f => results[f.id] != null).length;
  const progressPct = stageFixtures.length > 0 ? Math.round((stagePredicted / stageFixtures.length) * 100) : 0;

  // Group filtered fixtures by date
  const fixturesByDate = filtered.reduce((acc, f) => {
    if (!acc[f.date]) acc[f.date] = [];
    acc[f.date].push(f);
    return acc;
  }, {});

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  };

  const totalPts = WC2026_FIXTURES.reduce((acc, f) => acc + calcMatchScore(myPreds[f.id], results[f.id], scoring), 0);

  return (
    <>
      <div className="section-header">
        <div>
          <div className="page-title">PREDICTIONS</div>
          <div className="page-sub">{league.name} · <span style={{ color: "var(--accent)" }}>{totalPts} pts earned</span></div>
        </div>
      </div>

      {league.settings?.tournamentWinnerBonus && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ display: "flex", alignItems: "center" }}>
            🏆 TOURNAMENT WINNER <span style={{ color: "var(--gold)", fontSize: 13, marginLeft: 8 }}>(+{scoring.winnerPoints} pts)</span>
            {twLockBadge()}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              className="form-select"
              value={myPreds["tournament_winner"] || ""}
              disabled={twLocked}
              onChange={e => !twLocked && saveTournamentWinner(e.target.value)}
              style={{ opacity: twLocked ? 0.5 : 1, cursor: twLocked ? "not-allowed" : "pointer" }}
            >
              <option value="">-- Select winner --</option>
              {ALL_TEAMS.map(t => <option key={t} value={t}>{flag(t)} {t}</option>)}
            </select>
          </div>
          {myPreds["tournament_winner"] && (
            <p style={{ marginTop: 10, fontSize: 13, color: "var(--accent)" }}>
              Your pick: {flag(myPreds["tournament_winner"])} {myPreds["tournament_winner"]}
              {twLocked && <span style={{ marginLeft: 8, color: "var(--accent2)", fontSize: 11 }}>(locked)</span>}
            </p>
          )}
          {twLocked && !myPreds["tournament_winner"] && (
            <p style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>No prediction made before the deadline.</p>
          )}
        </div>
      )}

      <div className="stage-filter-wrap">
        {/* Primary filters */}
        <div className="stage-filter-group">
          <div className="stage-filter-group-label">View</div>
          <div className="stage-filter-row">
            <button
              className={`filter-btn ${stageFilter === "Upcoming" ? "active" : ""}`}
              onClick={() => setStageFilter("Upcoming")}
            >
              📅 Upcoming
              <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, opacity: 0.7 }}>
                {upcomingFixtures.filter(f => myPreds[f.id]?.homeGoals != null).length}/{upcomingFixtures.length}
              </span>
            </button>
            <button
              className={`filter-btn ${stageFilter === "Completed" ? "active" : ""}`}
              onClick={() => setStageFilter("Completed")}
            >
              ✅ Completed
              <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, opacity: 0.7 }}>
                {completedFixtures.length}
              </span>
            </button>
            {hasTodayMatches && (
              <button
                className={`filter-btn ${stageFilter === "Today" ? "active" : ""}`}
                onClick={() => setStageFilter("Today")}
                style={{
                  borderColor: stageFilter === "Today" ? "var(--accent2)" : undefined,
                  color: stageFilter === "Today" ? "var(--accent2)" : undefined,
                  background: stageFilter === "Today" ? "rgba(244,63,94,0.08)" : undefined,
                }}
              >
                ⚽ Today
                <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, opacity: 0.7 }}>
                  {todayFixtures.filter(f => myPreds[f.id]?.homeGoals != null).length}/{todayFixtures.length}
                </span>
              </button>
            )}
          </div>
        </div>
        {/* Stage filters — for drilling into specific stages */}
        {stageGroups.map(group => (
          <div key={group.label} className="stage-filter-group">
            <div className="stage-filter-group-label">{group.label}</div>
            <div className="stage-filter-row">
              {group.stages.map(s => {
                const count = WC2026_FIXTURES.filter(f => f.stage === s).length;
                const predicted = WC2026_FIXTURES.filter(f => f.stage === s && myPreds[f.id]?.homeGoals != null).length;
                return (
                  <button
                    key={s}
                    className={`filter-btn ${stageFilter === s ? "active" : ""}`}
                    onClick={() => setStageFilter(s)}
                  >
                    {s}
                    {count > 0 && (
                      <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, opacity: 0.7 }}>
                        {predicted}/{count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="pred-progress-wrap">
        <div className="pred-progress-row">
          <span className="pred-progress-label">
            {stageFilter === "Upcoming" ? "Upcoming Fixtures" : stageFilter === "Completed" ? "Completed Fixtures" : stageFilter === "Today" ? "Today's Fixtures" : `${stageFilter} Predictions`}
          </span>
          <span className="pred-progress-count">{stagePredicted} / {stageFixtures.length}</span>
        </div>
        <div className="pred-progress-bar-bg">
          <div className="pred-progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="pred-progress-stats">
          <span className="pred-progress-stat"><span style={{ color: "var(--green)" }}>{stagePredicted}</span> predicted</span>
          <span className="pred-progress-stat"><span style={{ color: "var(--muted)" }}>{stageFixtures.length - stagePredicted}</span> remaining</span>
          {stageLocked > 0 && <span className="pred-progress-stat"><span style={{ color: "var(--accent2)" }}>{stageLocked}</span> locked</span>}
          {stageWithResult > 0 && <span className="pred-progress-stat"><span style={{ color: "var(--gold)" }}>{stageWithResult}</span> results in</span>}
        </div>
      </div>

      {/* Fixtures grouped by date */}
      {Object.entries(fixturesByDate).map(([date, fixtures]) => (
        <div key={date}>
          <div className="fixture-date-header">
            <span className="fixture-date-header-text">📅 {formatDate(date)}</span>
            <div className="fixture-date-header-line" />
            <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
              {fixtures.filter(f => myPreds[f.id]?.homeGoals != null).length}/{fixtures.length} predicted
            </span>
          </div>
          {fixtures.map(fixture => (
            <RichFixtureCard
              key={fixture.id}
              fixture={fixture}
              pred={myPreds[fixture.id]}
              result={results[fixture.id]}
              onSave={savePred}
              showCountdown={true}
              scoring={scoring}
              allPreds={Object.fromEntries(
                (league.members || []).map(uid => [uid, ((storage.get("sc_predictions") || {})[uid] || {})[leagueId] || {}])
              )}
              leagueMembers={league.members || []}
              currentUid={user.uid}
            />
          ))}
        </div>
      ))}
    </>
  );
}


// ─── GROUP STANDINGS CALCULATOR ───────────────────────────────────────────────
function calcGroupStandings(groupLetter) {
  const results = storage.get("sc_results") || {};
  const teams = WC2026_GROUPS[groupLetter];

  // Initialise table rows
  const table = {};
  teams.forEach(t => {
    table[t] = { team: t, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, GD: 0, Pts: 0 };
  });

  // Process each group fixture that has a result
  WC2026_FIXTURES
    .filter(f => f.group === groupLetter && f.stage === "Group Stage" && results[f.id])
    .forEach(f => {
      const { homeGoals: hg, awayGoals: ag } = results[f.id];
      const h = table[f.home], a = table[f.away];
      if (!h || !a) return;
      h.P++; a.P++;
      h.GF += hg; h.GA += ag;
      a.GF += ag; a.GA += hg;
      h.GD = h.GF - h.GA;
      a.GD = a.GF - a.GA;
      if (hg > ag)      { h.W++; h.Pts += 3; a.L++; }
      else if (ag > hg) { a.W++; a.Pts += 3; h.L++; }
      else              { h.D++; h.Pts++; a.D++; a.Pts++; }
    });

  // FIFA tiebreaker: Pts → GD → GF → team name (alphabetical as last resort)
  return Object.values(table).sort((a, b) =>
    b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF || a.team.localeCompare(b.team)
  );
}

// ─── GROUPS TAB ───────────────────────────────────────────────────────────────
function GroupsTab() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tick, setTick] = useState(0);

  // Auto-refresh every 30s so new results appear without navigating away
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const results = storage.get("sc_results") || {};

  const groupLetters = Object.keys(WC2026_GROUPS);

  // Count played matches per group for summary badge
  const playedCount = (letter) =>
    WC2026_FIXTURES.filter(f => f.group === letter && f.stage === "Group Stage" && results[f.id]).length;
  const totalCount = (letter) =>
    WC2026_FIXTURES.filter(f => f.group === letter && f.stage === "Group Stage").length;

  const renderStandingsTable = (letter) => {
    const rows = calcGroupStandings(letter);
    const played = playedCount(letter);

    return (
      <div key={letter} style={{ marginBottom: 20 }}>
        {/* Group header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent)", letterSpacing: 1 }}>
              GROUP {letter}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: played > 0 ? "var(--green)" : "var(--muted)",
              background: played > 0 ? "rgba(34,197,94,0.1)" : "var(--surface2)",
              border: `1px solid ${played > 0 ? "rgba(34,197,94,0.25)" : "var(--border)"}`,
              padding: "2px 8px", borderRadius: 20,
            }}>
              {played}/{totalCount(letter)} played
            </span>
          </div>
        </div>

        {/* Standings table */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--r2)", overflow: "hidden",
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 32px 28px 28px 28px 40px 40px 40px 44px",
            padding: "7px 14px",
            background: "var(--surface2)", borderBottom: "1px solid var(--border)",
            fontSize: 10, fontWeight: 700, color: "var(--muted)",
            letterSpacing: "0.8px", textTransform: "uppercase",
          }}>
            <span>Team</span>
            <span style={{ textAlign: "center" }}>P</span>
            <span style={{ textAlign: "center" }}>W</span>
            <span style={{ textAlign: "center" }}>D</span>
            <span style={{ textAlign: "center" }}>L</span>
            <span style={{ textAlign: "center" }}>GF</span>
            <span style={{ textAlign: "center" }}>GA</span>
            <span style={{ textAlign: "center" }}>GD</span>
            <span style={{ textAlign: "center" }}>Pts</span>
          </div>

          {rows.map((row, i) => {
            // Top 2 qualify directly; show qualifier highlight only once matches have been played
            const qualifies = i < 2;
            const borderLeft = qualifies
              ? "3px solid var(--green)"
              : i === 2
                ? "3px solid var(--gold)"
                : "3px solid transparent";

            return (
              <div
                key={row.team}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 32px 28px 28px 28px 40px 40px 40px 44px",
                  padding: "9px 14px",
                  borderBottom: i < 3 ? "1px solid var(--border)" : "none",
                  borderLeft,
                  background: qualifies
                    ? "rgba(34,197,94,0.03)"
                    : i === 2
                      ? "rgba(245,158,11,0.03)"
                      : "transparent",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
              >
                {/* Team */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ fontSize: 16 }}>{flag(row.team)}</span>
                  <span style={{ color: qualifies ? "var(--text)" : "var(--text)" }}>{row.team}</span>
                  {qualifies && row.P > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green)", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", padding: "1px 6px", borderRadius: 10 }}>Q</span>
                  )}
                </div>

                {/* Stats */}
                {[row.P, row.W, row.D, row.L, row.GF, row.GA].map((val, vi) => (
                  <span key={vi} style={{ textAlign: "center", fontSize: 13, color: val === 0 ? "var(--muted)" : "var(--text)" }}>{val}</span>
                ))}

                {/* GD with +/- colour */}
                <span style={{
                  textAlign: "center", fontSize: 13,
                  color: row.GD > 0 ? "var(--green)" : row.GD < 0 ? "var(--accent2)" : "var(--muted)",
                  fontWeight: row.GD !== 0 ? 700 : 400,
                }}>
                  {row.GD > 0 ? `+${row.GD}` : row.GD}
                </span>

                {/* Points */}
                <span style={{
                  textAlign: "center",
                  fontFamily: "var(--font-display)", fontSize: 18,
                  color: row.Pts > 0 ? "var(--accent)" : "var(--muted)",
                }}>{row.Pts}</span>
              </div>
            );
          })}
        </div>

        {/* Legend — only show once, under first group */}
        {letter === "A" && (
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
            <span><span style={{ color: "var(--green)", fontWeight: 700 }}>▌</span> Qualify (Round of 32)</span>
            <span><span style={{ color: "var(--gold)", fontWeight: 700 }}>▌</span> Potential best 3rd</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="page-title">GROUPS & STANDINGS</div>
      <p className="page-sub">FIFA World Cup 2026 · 48 Teams · 12 Groups · Live from entered results</p>

      {Object.values(results).length === 0 && (
        <div style={{
          background: "var(--surface2)", border: "1px solid var(--border)",
          borderRadius: "var(--r)", padding: "12px 16px", marginBottom: 20,
          fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>ℹ️</span>
          <span>Standings will update automatically as the league admin enters match results.</span>
        </div>
      )}

      {/* Group selector pills */}
      <div className="filter-row" style={{ marginBottom: 24 }}>
        <button
          className={`filter-btn ${selectedGroup === null ? "active" : ""}`}
          onClick={() => setSelectedGroup(null)}
        >All Groups</button>
        {groupLetters.map(l => (
          <button
            key={l}
            className={`filter-btn ${selectedGroup === l ? "active" : ""}`}
            onClick={() => setSelectedGroup(l)}
          >
            Group {l}
            {playedCount(l) > 0 && (
              <span style={{ marginLeft: 4, color: "var(--green)", fontSize: 9 }}>●</span>
            )}
          </button>
        ))}
      </div>

      {/* Render selected or all groups */}
      {selectedGroup
        ? renderStandingsTable(selectedGroup)
        : (
          <div className="grid-2">
            {groupLetters.map(l => renderStandingsTable(l))}
          </div>
        )
      }
    </>
  );
}


// ─── INLINE CONFIRM MODAL ─────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title" style={{ color: danger ? "var(--accent2)" : "var(--text)" }}>{title}</div>
        <p className="modal-sub">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── INLINE ADMIN PANEL (inside league expanded) ──────────────────────────────
function InlineAdminPanel({ user, league, leagueId, refresh, onLeagueDeleted }) {
  const [resultInputs, setResultInputs] = useState({});
  const [stageFilter, setStageFilter] = useState("Group Stage");
  const [msg, setMsg] = useState("");
  const [scoringError, setScoringError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'delete'|'kick', uid? }
  const [fetchingResults, setFetchingResults] = useState(false);
  const [fetchMsg, setFetchMsg] = useState("");
  const [fetchDetails, setFetchDetails] = useState(null);
  const [showFetchDebug, setShowFetchDebug] = useState(false);
  const scoring = getScoringSettings(league);
  const [draftScoring, setDraftScoring] = useState({ ...scoring });

  const fetchLatestResults = async () => {
    setFetchingResults(true);
    setFetchMsg("");
    try {
      const res = await fetch("/api/fetch-results?manual=true");
      const data = await res.json();
      setFetchDetails(data);
      if (data.success) {
        if (data.updated > 0) {
          setFetchMsg(`✅ ${data.updated} new result${data.updated > 1 ? "s" : ""} added!`);
          refresh();
        } else {
          setFetchMsg("ℹ️ No new finished matches found.");
        }
      } else {
        setFetchMsg(`⚠️ ${data.error || "Something went wrong."}`);
      }
    } catch (e) {
      setFetchMsg("⚠️ Could not reach the results service.");
      setFetchDetails({ success: false, error: "Network error — could not reach the endpoint." });
    } finally {
      setFetchingResults(false);
      setTimeout(() => setFetchMsg(""), 5000);
    }
  };

  const results = storage.get("sc_results") || {};
  const users = storage.get("sc_users") || {};
  const stages = ["Group Stage", "Round of 32", "Round of 16", "Quarterfinal", "Semifinal", "Third Place", "Final"];
  const filtered = WC2026_FIXTURES.filter(f => f.stage === stageFilter);

  const saveResult = (fid) => {
    const inp = resultInputs[fid];
    if (!inp || inp.home === "" || inp.away === "") return;
    const all = storage.get("sc_results") || {};
    all[fid] = { homeGoals: Number(inp.home), awayGoals: Number(inp.away) };
    storage.set("sc_results", all);
    setMsg("Result saved!");
    setTimeout(() => setMsg(""), 2000);
    refresh();
  };

  const clearResult = (fid) => {
    const all = storage.get("sc_results") || {};
    delete all[fid];
    storage.set("sc_results", all);
    refresh();
  };

  const toggleSetting = (key) => {
    const fresh = storage.get("sc_leagues") || {};
    fresh[leagueId].settings = fresh[leagueId].settings || {};
    fresh[leagueId].settings[key] = !fresh[leagueId].settings[key];
    storage.set("sc_leagues", fresh);
    refresh();
  };

  const saveScoring = () => {
    setScoringError("");
    const { outcomePoints, exactPoints, winnerPoints } = draftScoring;
    if (Number(exactPoints) <= Number(outcomePoints)) {
      setScoringError("Exact score points must be greater than correct outcome points.");
      return;
    }
    const fresh = storage.get("sc_leagues") || {};
    fresh[leagueId].settings = { ...fresh[leagueId].settings, outcomePoints: Number(outcomePoints), exactPoints: Number(exactPoints), winnerPoints: Number(winnerPoints) };
    storage.set("sc_leagues", fresh);
    setMsg("Scoring settings saved!");
    setTimeout(() => setMsg(""), 2000);
    refresh();
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete") {
      const fresh = storage.get("sc_leagues") || {};
      delete fresh[leagueId];
      storage.set("sc_leagues", fresh);
      setConfirmAction(null);
      onLeagueDeleted();
      refresh();
    } else if (confirmAction.type === "kick") {
      const fresh = storage.get("sc_leagues") || {};
      fresh[leagueId].members = fresh[leagueId].members.filter(m => m !== confirmAction.uid);
      storage.set("sc_leagues", fresh);
      setConfirmAction(null);
      setMsg("Member removed.");
      setTimeout(() => setMsg(""), 2000);
      refresh();
    }
  };

  const pointOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const otherMembers = league.members.filter(m => m !== user.uid);

  return (
    <div>
      {/* Confirm modal */}
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.type === "delete" ? "Delete League" : "Remove Member"}
          message={
            confirmAction.type === "delete"
              ? `Are you sure you want to delete "${league.name}"? All predictions and results will be lost. This cannot be undone.`
              : `Remove ${users[confirmAction.uid]?.username || "this member"} from the league? They can rejoin with the league code.`
          }
          confirmLabel={confirmAction.type === "delete" ? "Delete League" : "Remove Member"}
          danger={true}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {msg && <div className="success-msg" style={{ marginBottom: 16 }}>{msg}</div>}

      {/* Scoring Settings */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Scoring Settings</div>
        {scoringError && <div className="error-msg">{scoringError}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 14 }}>
          <div>
            <div className="form-label">✅ Correct Outcome</div>
            <select className="form-select" value={draftScoring.outcomePoints}
              onChange={e => setDraftScoring(d => ({ ...d, outcomePoints: Number(e.target.value) }))}>
              {pointOptions.map(n => <option key={n} value={n}>{n} pt{n !== 1 ? "s" : ""}</option>)}
            </select>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Win / draw / loss</div>
          </div>
          <div>
            <div className="form-label">🎯 Exact Score</div>
            <select className="form-select" value={draftScoring.exactPoints}
              onChange={e => setDraftScoring(d => ({ ...d, exactPoints: Number(e.target.value) }))}>
              {pointOptions.map(n => <option key={n} value={n}>{n} pt{n !== 1 ? "s" : ""}</option>)}
            </select>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Must be &gt; outcome pts</div>
          </div>
          {league.settings?.tournamentWinnerBonus && (
            <div>
              <div className="form-label">🏆 Winner Bonus</div>
              <select className="form-select" value={draftScoring.winnerPoints}
                onChange={e => setDraftScoring(d => ({ ...d, winnerPoints: Number(e.target.value) }))}>
                {pointOptions.map(n => <option key={n} value={n}>{n} pt{n !== 1 ? "s" : ""}</option>)}
              </select>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Tournament winner</div>
            </div>
          )}
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveScoring}>Save Scoring</button>
      </div>

      <div className="divider" style={{ margin: "16px 0" }} />

      {/* League Options */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>League Options</div>
        <div className="toggle-row" style={{ paddingTop: 0 }}>
          <div className="toggle-info">
            <strong>Tournament Winner Bonus</strong>
            <p>Members predict the tournament winner for bonus points</p>
          </div>
          <div className={`toggle ${league.settings?.tournamentWinnerBonus ? "on" : ""}`} onClick={() => toggleSetting("tournamentWinnerBonus")} />
        </div>
      </div>

      <div className="divider" style={{ margin: "16px 0" }} />

      {/* Members */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
          Members ({league.members.length})
        </div>
        {league.members.map(uid => {
          const u = users[uid];
          const isAdmin = uid === user.uid;
          return (
            <div key={uid} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 0", borderBottom: "1px solid var(--border)",
            }}>
              <Avatar uid={uid} size={28} username={u?.username} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{u?.username || uid}</span>
                {isAdmin && (
                  <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", padding: "1px 7px", borderRadius: 10 }}>Admin</span>
                )}
              </div>
              {!isAdmin && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11, color: "var(--accent2)", borderColor: "rgba(244,63,94,0.3)" }}
                  onClick={() => setConfirmAction({ type: "kick", uid })}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="divider" style={{ margin: "16px 0" }} />

      {/* Enter Results */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Enter Results</div>
          <button
            className="btn btn-sm"
            onClick={fetchLatestResults}
            disabled={fetchingResults}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.35)",
              color: "var(--accent)",
              fontWeight: 600,
            }}
          >
            {fetchingResults ? "Fetching..." : "🔄 Fetch Latest Results"}
          </button>
        </div>
        {fetchMsg && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: fetchMsg.startsWith("✅") ? "var(--green)" : fetchMsg.startsWith("⚠️") ? "var(--accent2)" : "var(--muted)" }}>
              {fetchMsg}
            </span>
            {fetchDetails && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 10, padding: "2px 8px" }}
                onClick={() => setShowFetchDebug(s => !s)}
              >
                {showFetchDebug ? "Hide details" : "Show details"}
              </button>
            )}
          </div>
        )}
        {showFetchDebug && fetchDetails && (
          <div className="fetch-debug-panel">
            {fetchDetails.error && (
              <div style={{ color: "var(--accent2)", marginBottom: 8 }}>Error: {fetchDetails.error}</div>
            )}
            {fetchDetails.apiErrors && (
              <div style={{ color: "var(--accent2)", marginBottom: 8, fontFamily: "monospace", fontSize: 11 }}>
                API-Football returned an error: {JSON.stringify(fetchDetails.apiErrors)}
              </div>
            )}
            {fetchDetails.requestedDate && (
              <div style={{ color: "var(--muted)", marginBottom: 4, fontSize: 10 }}>
                Requested date: {fetchDetails.requestedDate} · API reported {fetchDetails.apiResultsCount ?? "?"} total result(s)
              </div>
            )}
            {fetchDetails.checked != null && (
              <div style={{ color: "var(--muted)", marginBottom: 8 }}>
                Checked {fetchDetails.checked} fixture{fetchDetails.checked !== 1 ? "s" : ""} from the API today.
              </div>
            )}
            {fetchDetails.details && fetchDetails.details.length === 0 && (
              <div style={{ color: "var(--muted)" }}>No finished matches found for today yet.</div>
            )}
            {fetchDetails.details?.map((d, i) => (
              <div key={i} className="fetch-debug-row">
                <span className={`fetch-debug-status ${d.status}`}>{d.status.replace("_", " ")}</span>
                {d.status === "no_match" ? (
                  <span style={{ color: "var(--muted)" }}>{d.apiHome} vs {d.apiAway} ({d.apiDate}) — name didn't match any fixture</span>
                ) : d.status === "added" ? (
                  <span style={{ color: "var(--text)" }}>{d.fixtureId}: {d.home} {d.score} {d.away}</span>
                ) : (
                  <span style={{ color: "var(--muted)" }}>{d.fixtureId} already has a result</span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="filter-row">
          {stages.map(s => (
            <button key={s} className={`filter-btn ${stageFilter === s ? "active" : ""}`} onClick={() => setStageFilter(s)}>{s}</button>
          ))}
        </div>
        {filtered.map(f => {
          const existing = results[f.id];
          const inp = resultInputs[f.id] || { home: existing?.homeGoals ?? "", away: existing?.awayGoals ?? "" };
          return (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.home}</span>
                <span style={{ color: "var(--muted)", fontSize: 10, flexShrink: 0 }}>VS</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.away}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, width: 168, justifyContent: "flex-end" }}>
                <input type="number" min="0" max="30" className="score-input" style={{ width: 38, flexShrink: 0 }} value={inp.home}
                  onChange={e => setResultInputs(r => ({ ...r, [f.id]: { ...inp, home: e.target.value } }))} placeholder="0" />
                <span style={{ color: "var(--muted)", flexShrink: 0 }}>–</span>
                <input type="number" min="0" max="30" className="score-input" style={{ width: 38, flexShrink: 0 }} value={inp.away}
                  onChange={e => setResultInputs(r => ({ ...r, [f.id]: { ...inp, away: e.target.value } }))} placeholder="0" />
                <button className="btn btn-primary btn-sm" onClick={() => saveResult(f.id)} style={{ flexShrink: 0 }}>Save</button>
                {existing && <button className="btn btn-ghost btn-sm" onClick={() => clearResult(f.id)} style={{ flexShrink: 0 }}>✕</button>}
              </div>
              <span style={{ fontSize: 11, color: "var(--green)", flexShrink: 0, width: 48, textAlign: "right" }}>
                {existing ? `✓ ${existing.homeGoals}–${existing.awayGoals}` : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="divider" style={{ margin: "16px 0" }} />

      {/* Danger zone */}
      <div>
        <div style={{ fontSize: 11, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Danger Zone</div>
        <button className="btn btn-danger btn-sm" onClick={() => setConfirmAction({ type: "delete" })}>Delete League</button>
      </div>
    </div>
  );
}

// ─── COPY CODE COMPONENT ──────────────────────────────────────────────────────
function CopyCode({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="copy-code-wrap">
      <div className="copy-code-box" onClick={copy}>{code}</div>
      <button className={`btn-copy ${copied ? "copied" : ""}`} onClick={copy}>
        {copied ? "✓ Copied!" : "Copy"}
      </button>
    </div>
  );
}

// ─── LEAGUES TAB ──────────────────────────────────────────────────────────────
function LeaguesTab({ user, myLeagues, selectedLeague, onSetLeague, onOpenModal, refresh }) {
  const [expandedId, setExpandedId] = useState(selectedLeague || null);
  const [expandedTab, setExpandedTab] = useState("standings");
  const [leaveConfirm, setLeaveConfirm] = useState(null);
  const [roastText, setRoastText] = useState(null);
  const [lastRoastIdx, setLastRoastIdx] = useState(-1);

  const generateRoast = (lastPlaceEntry, secondLastPoints) => {
    const name = lastPlaceEntry.username;
    const pts = lastPlaceEntry.points;
    const gap = secondLastPoints != null ? secondLastPoints - lastPlaceEntry.points : null;

    const templates = [
      `${name}, dead last with ${pts} points. Even a coin flip would've done better.`,
      `${gap != null ? `${gap} points behind 2nd-to-last. ${name}, that's not a gap, that's a canyon.` : `${name} is rock bottom. Football clearly isn't your sport — maybe try competitive napping.`}`,
      `${name} predicting scores is like watching someone play darts with their eyes closed. In the dark. Underwater.`,
      `Last place, ${pts} points. ${name}, did you even watch the matches or just vibe-guess every score?`,
      `${name} is so far behind, the other players forgot they're even in a competition with you.`,
      `Congratulations ${name}, you've achieved something special: being statistically worse than random guessing.`,
      `${name}'s predictions have the accuracy of a broken clock — except the clock is right twice a day, and you're not.`,
      `Bottom of the table, ${pts} points. ${name}, maybe football just isn't for you. Have you tried chess?`,
      `${name}, your World Cup knowledge peaked at "the ball is round." Last place confirmed.`,
      `Somewhere, a goat is making better predictions than ${name}. With ${pts} points, that's not even an insult, it's a fact.`,
      `${name} really said "trust me" before every single wrong prediction. Bold strategy.`,
      `Last place with ${pts} points — ${name}, even your bracket has given up on you.`,
      `${name}, watching you predict scores is like watching someone try to parallel park for the first time. Painful.`,
      `${pts} points. ${name}, at this point we're rooting for you out of pity, not respect.`,
      `${name} is in last place and somehow still confident. That confidence is doing a lot of heavy lifting.`,
    ];

    // Pick a different one than last time if possible
    let idx;
    do {
      idx = Math.floor(Math.random() * templates.length);
    } while (templates.length > 1 && idx === lastRoastIdx);

    setLastRoastIdx(idx);
    setRoastText(templates[idx]);
  };

  // Refresh users cache when this tab mounts so usernames always show correctly
  useEffect(() => {
    fsGetAllUsers().then(users => {
      if (users && Object.keys(users).length > 0) {
        _cache["sc_users"] = users;
        refresh();
      }
    });
  }, []);

  const handleLeave = (leagueId) => {
    const leagues = storage.get("sc_leagues") || {};
    leagues[leagueId].members = leagues[leagueId].members.filter(m => m !== user.uid);
    if (leagues[leagueId].members.length === 0) delete leagues[leagueId];
    storage.set("sc_leagues", leagues);
    if (expandedId === leagueId) setExpandedId(null);
    setLeaveConfirm(null);
    refresh();
  };

  const toggleExpand = (leagueId) => {
    if (expandedId === leagueId) { setExpandedId(null); return; }
    setExpandedId(leagueId);
    setExpandedTab("standings");
    onSetLeague(leagueId); // also sets as active league for predictions
  };

  const movementLabel = (m, d) => {
    if (!m || m === "new") return <span className="lb-movement same">—</span>;
    if (m === "up")   return <span className="lb-movement up">▲ {d}</span>;
    if (m === "down") return <span className="lb-movement down">▼ {d}</span>;
    return <span className="lb-movement same">—</span>;
  };

  return (
    <>
      {leaveConfirm && (
        <ConfirmModal
          title="Leave League"
          message={`Are you sure you want to leave "${(storage.get("sc_leagues") || {})[leaveConfirm]?.name}"? You can rejoin later with the league code.`}
          confirmLabel="Leave League"
          danger={true}
          onConfirm={() => handleLeave(leaveConfirm)}
          onCancel={() => setLeaveConfirm(null)}
        />
      )}
      <div className="section-header">
        <div>
          <div className="page-title">MY LEAGUES</div>
          <div className="page-sub">Click a league to see the standings</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => onOpenModal("join")}>Join League</button>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenModal("create")}>+ Create</button>
        </div>
      </div>

      {myLeagues.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">No Leagues Yet</div>
          <p style={{ marginBottom: 24, color: "var(--muted)", fontSize: 14 }}>Create a league and invite your friends with the unique code!</p>
          <button className="btn btn-primary" onClick={() => onOpenModal("create")}>Create a League</button>
        </div>
      ) : (
        myLeagues.map(league => {
          const lb = calcLeaderboard(league.id);
          const myEntry = lb.find(e => e.uid === user.uid);
          const myRank = lb.findIndex(e => e.uid === user.uid) + 1;
          const isOpen = expandedId === league.id;

          return (
            <div key={league.id} className="league-wrapper">
              {/* League header row */}
              <div
                className={`league-item ${isOpen ? "selected" : ""}`}
                onClick={() => toggleExpand(league.id)}
              >
                <div>
                  <div className="league-name">{league.name}</div>
                  <div className="league-meta">
                    {league.members.length} member{league.members.length !== 1 ? "s" : ""}
                    {myEntry ? ` · Rank #${myRank} · ${myEntry.points} pts` : ""}
                  </div>
                  {league.settings?.tournamentWinnerBonus && (
                    <div style={{ marginTop: 6 }}><span className="chip active">🏆 Tournament winner bonus</span></div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className="league-code">{league.id}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {league.adminId !== user.uid && (
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 10 }} onClick={(e) => { e.stopPropagation(); setLeaveConfirm(league.id); }}>Leave</button>
                    )}
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>

              {/* Expanded panel */}
              {isOpen && (
                <div className="league-expanded">
                  <div className="league-expanded-tabs">
                    <button className={`league-expanded-tab ${expandedTab === "standings" ? "active" : ""}`} onClick={() => setExpandedTab("standings")}>Standings</button>
                    <button className={`league-expanded-tab ${expandedTab === "info" ? "active" : ""}`} onClick={() => setExpandedTab("info")}>Info & Rules</button>
                    {league.adminId === user.uid && (
                      <button className={`league-expanded-tab ${expandedTab === "admin" ? "active" : ""}`} onClick={() => setExpandedTab("admin")} style={{ color: expandedTab === "admin" ? "var(--accent2)" : undefined }}>⚙️ Admin</button>
                    )}
                  </div>

                  <div className="league-expanded-body">
                    {expandedTab === "standings" && (
                      lb.length === 0
                        ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No members yet.</p>
                        : (
                          <table className="lb-table" style={{ width: "100%" }}>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th style={{ textAlign: "right" }}>Exact Score</th>
                                <th style={{ textAlign: "right" }}>Outcome</th>
                                <th style={{ textAlign: "right" }}>Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lb.map((entry, i) => (
                                <>
                                  <tr key={entry.uid} style={{
                                    borderTop: i === lb.length - 1 && lb.length > 4
                                      ? "2px solid var(--border2)"
                                      : undefined,
                                  }}>
                                    <td className={`lb-rank ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}`}>
                                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i === lb.length - 1 && lb.length > 3 ? "🚽" : i + 1}
                                    </td>
                                    <td className={entry.uid === user.uid ? "lb-you" : ""}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <Avatar uid={entry.uid} size={28} username={entry.username} />
                                        <span>{entry.uid === user.uid ? "⭐ " : ""}{entry.username}</span>
                                      </div>
                                    </td>
                                    <td className="lb-acc">{entry.exact}</td>
                                    <td className="lb-acc">{entry.correct}</td>
                                    <td className="lb-pts" style={{ fontSize: 16 }}>{entry.points}</td>
                                  </tr>
                                  {i === 2 && lb.length > 4 && (
                                    <tr key={`sep-${i}`}>
                                      <td colSpan={5} style={{ padding: 0, borderBottom: "2px solid var(--border2)" }} />
                                    </tr>
                                  )}
                                </>
                              ))}
                            </tbody>
                          </table>
                        )
                    )}

                    {/* Roast last place button — only with 4+ players */}
                    {expandedTab === "standings" && lb.length >= 4 && (
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => generateRoast(lb[lb.length - 1], lb[lb.length - 2]?.points)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: "rgba(244,63,94,0.08)",
                            border: "1px solid rgba(244,63,94,0.3)",
                            color: "var(--accent2)",
                          }}
                        >
                          🔥 Roast Last Place
                        </button>
                        {roastText && (
                          <div style={{
                            marginTop: 10, padding: "12px 14px",
                            background: "var(--surface2)", borderRadius: "var(--r2)",
                            border: "1px solid var(--border)", fontSize: 13,
                            fontStyle: "italic", color: "var(--text)",
                          }}>
                            "{roastText}"
                            <div style={{ marginTop: 8 }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: 11, padding: "2px 8px" }}
                                onClick={() => generateRoast(lb[lb.length - 1], lb[lb.length - 2]?.points)}
                              >
                                🔄 Another one
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {expandedTab === "info" && (
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Invite Code</div>
                          <CopyCode code={league.id} />
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Share this code with friends so they can join.</div>
                        </div>
                        <div className="divider" />
                        {(() => {
                          const sc = getScoringSettings(league);
                          return (
                            <div style={{ fontSize: 14, lineHeight: 2, color: "var(--text)", marginTop: 12 }}>
                              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Scoring Rules</div>
                              <div>✅ <strong>Correct outcome</strong> (win/draw/loss) = <span style={{ color: "var(--accent)" }}>{sc.outcomePoints} pt{sc.outcomePoints !== 1 ? "s" : ""}</span></div>
                              <div>🎯 <strong>Exact correct score</strong> = <span style={{ color: "var(--gold)" }}>{sc.exactPoints} pts</span></div>
                              {league.settings?.tournamentWinnerBonus && (
                                <div>🏆 <strong>Correct tournament winner</strong> = <span style={{ color: "var(--gold)" }}>{sc.winnerPoints} pts</span></div>
                              )}
                              <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>Tiebreaker: most exact scores wins.</div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {expandedTab === "admin" && league.adminId === user.uid && (
                      <InlineAdminPanel user={user} league={league} leagueId={league.id} refresh={refresh} onLeagueDeleted={() => { setExpandedId(null); }} />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

// ─── CREATE / JOIN MODALS ─────────────────────────────────────────────────────
function CreateLeagueModal({ user, onClose, onDone }) {
  const [name, setName] = useState("");
  const [bonus, setBonus] = useState(false);
  const [error, setError] = useState("");

  const create = () => {
    if (!name.trim()) return setError("Please enter a league name.");
    const leagues = storage.get("sc_leagues") || {};
    const id = generateCode(6);
    leagues[id] = {
      id, name: name.trim(), adminId: user.uid, members: [user.uid],
      settings: {
        tournamentWinnerBonus: bonus,
        outcomePoints: DEFAULT_SCORING.outcomePoints,
        exactPoints: DEFAULT_SCORING.exactPoints,
        winnerPoints: DEFAULT_SCORING.winnerPoints,
      },
      createdAt: Date.now()
    };
    storage.set("sc_leagues", leagues);
    onDone(id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Create League</div>
        <p className="modal-sub">A unique code will be generated for your friends to join.</p>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label className="form-label">League Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Office Rivals 2026" />
        </div>
        <div className="toggle-row">
          <div className="toggle-info"><strong>Tournament Winner Bonus</strong><p>Allow tournament winner prediction (+15 pts)</p></div>
          <div className={`toggle ${bonus ? "on" : ""}`} onClick={() => setBonus(b => !b)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={create}>Create League</button>
        </div>
      </div>
    </div>
  );
}

function JoinLeagueModal({ user, onClose, onDone }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [joining, setJoining] = useState(false);

  const join = async () => {
    setError("");
    const trimmed = code.toUpperCase().trim();
    if (trimmed.length === 0) {
      setError("Please enter a league code.");
      triggerShake(); return;
    }
    if (trimmed.length < 6) {
      setError("League codes are 6 characters — looks like yours is too short.");
      triggerShake(); return;
    }

    setJoining(true);
    try {
      // Always fetch fresh from Firestore to avoid cache race conditions
      const freshLeagues = await fsGet("sc_leagues") || {};
      const league = freshLeagues[trimmed];

      if (!league) {
        setError(`No league found with code "${trimmed}". Double-check with the league admin.`);
        triggerShake(); return;
      }
      if (league.members.includes(user.uid)) {
        setError("You're already a member of this league.");
        triggerShake(); return;
      }
      league.members.push(user.uid);
      storage.set("sc_leagues", freshLeagues);
      onDone(league.id);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      triggerShake();
    } finally {
      setJoining(false);
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Join a League</div>
        <p className="modal-sub">Enter the 6-character league code shared by the league admin.</p>
        {error && <div className="error-msg">❌ {error}</div>}
        <div className="form-group">
          <label className="form-label">League Code</label>
          <input
            className="form-input"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={e => e.key === "Enter" && join()}
            placeholder="e.g. AB1234"
            maxLength={6}
            style={{
              fontFamily: "monospace", letterSpacing: 4, fontSize: 20,
              borderColor: error ? "var(--accent2)" : undefined,
              animation: shake ? "shake 0.4s ease" : undefined,
            }}
          />
          {code.length > 0 && (
            <div style={{ fontSize: 11, color: code.length === 6 ? "var(--green)" : "var(--muted)", marginTop: 6 }}>
              {code.length}/6 characters {code.length === 6 ? "✓" : ""}
            </div>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={join} disabled={code.length !== 6 || joining}>
            {joining ? "Joining..." : "Join League"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setInfo("");
    if (!email.trim()) return setError("Please enter your email.");
    if (mode === "forgot") {
      setLoading(true);
      try {
        await fbResetPassword(email.trim());
        setInfo("Password reset email sent! Check your inbox.");
      } catch (e) {
        setError(e.code === "auth/user-not-found"
          ? "No account found with that email."
          : "Failed to send reset email. Please try again.");
      } finally { setLoading(false); }
      return;
    }
    if (!password.trim()) return setError("Please enter your password.");
    if (mode === "register" && !username.trim()) return setError("Please choose a username.");
    setLoading(true);
    try {
      if (mode === "register") {
        // Check username uniqueness from individual docs (no race condition)
        const allUsers = await fsGetAllUsers();
        if (Object.values(allUsers).find(u => u.username.toLowerCase() === username.trim().toLowerCase()))
          return setError("Username already taken. Please choose another.");
        const fbUser = await fbRegister(email.trim(), password);
        const uid = fbUser.uid;
        const profile = { uid, username: username.trim(), email: email.trim() };
        // Write only to individual user doc — no blob write, no race condition
        await fsWriteUser(uid, profile);
        mergeUserIntoCache(uid, profile);
        onLogin(profile);
      } else {
        const fbUser = await fbLogin(email.trim(), password);
        // Try reading from individual user doc first (new atomic approach)
        let profile = await fsReadUser(fbUser.uid);
        if (!profile) {
          // Fall back to sc_users blob
          const freshUsers = await fsGet("sc_users") || {};
          profile = freshUsers[fbUser.uid];
        }
        if (!profile) return setError("Account not found in database. Please register.");
        mergeUserIntoCache(fbUser.uid, profile);
        onLogin({ uid: fbUser.uid, username: profile.username, email: fbUser.email });
      }
    } catch (e) {
      if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password" || e.code === "auth/invalid-credential")
        setError("Incorrect email or password.");
      else if (e.code === "auth/email-already-in-use")
        setError("An account with this email already exists. Try signing in.");
      else if (e.code === "auth/weak-password")
        setError("Password must be at least 6 characters.");
      else if (e.code === "auth/invalid-email")
        setError("Please enter a valid email address.");
      else setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <ScoreClashLogo width={320} />
        </div>

        {mode !== "forgot" && (
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>Sign in</button>
            <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); setInfo(""); }}>Register</button>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}
        {info && <div className="success-msg">{info}</div>}

        {mode === "forgot" ? (
          <>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                placeholder="your@email.com" autoFocus />
            </div>
            <button className="btn btn-primary btn-full" onClick={handle} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
            <button
              style={{ width: "100%", background: "none", border: "none", color: "var(--muted)", fontSize: 12, cursor: "pointer", marginTop: 12, fontFamily: "var(--font-body)" }}
              onClick={() => { setMode("login"); setError(""); setInfo(""); }}
            >← Back to sign in</button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                placeholder="your@email.com" />
            </div>
            {mode === "register" && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handle()}
                  placeholder="Choose a display name" maxLength={20} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrap">
                <input className="form-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handle()}
                  placeholder={mode === "register" ? "At least 6 characters" : "Enter password"} />
                <button className="password-eye" type="button" onClick={() => setShowPassword(s => !s)}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: -4, marginBottom: 16 }}>
                <button
                  style={{
                    background: "none", border: "none", color: "var(--accent)",
                    fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)",
                    fontWeight: 600, padding: "8px 0", minHeight: 44,
                    display: "inline-flex", alignItems: "center",
                  }}
                  onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
                >Forgot password?</button>
              </div>
            )}
            <button className="btn btn-primary btn-full" onClick={handle} disabled={loading}>
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </>
        )}
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 20 }}>
          ⚽ Predict. Compete. Win bragging rights.
        </p>
      </div>
    </div>
  );
}

// ─── PROFILE DROPDOWN ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, onLogout, onUpdate, darkMode, onToggleDark }) {
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [newUsername, setNewUsername] = useState(user.username);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const dropRef = useRef(null);
  const fileRef = useRef(null);

  // Load current avatar from storage on open
  const users = storage.get("sc_users") || {};
  const currentAvatar = users[user.uid]?.avatar || null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeAvatar = selectedAvatar ?? currentAvatar;

  const handleSelectPreset = (av) => setSelectedAvatar({ type: "emoji", value: av.emoji });

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSelectedAvatar({ type: "image", value: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const allUsers = await fsGetAllUsers();
    const trimmed = newUsername.trim();
    if (trimmed && trimmed !== user.username) {
      const taken = Object.values(allUsers).find(u => u.uid !== user.uid && u.username.toLowerCase() === trimmed.toLowerCase());
      if (taken) { alert("Username already taken."); return; }
    }
    const updatedProfile = {
      ...allUsers[user.uid],
      username: trimmed || user.username,
      ...(selectedAvatar ? { avatar: selectedAvatar } : {}),
    };
    await fsWriteUser(user.uid, updatedProfile);
    mergeUserIntoCache(user.uid, updatedProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    onUpdate({ ...user, username: trimmed || user.username });
    setSelectedAvatar(null);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (!deletePassword) { setDeleteError("Please enter your password to confirm."); return; }
    try {
      await fbDeleteAccount(deletePassword);

      // Delete individual user doc
      await fsDeleteUser(user.uid);

      // Clean up leagues and predictions blobs
      const allLeagues = storage.get("sc_leagues") || {};
      const allPredictions = storage.get("sc_predictions") || {};

      Object.values(allLeagues).forEach(league => {
        if (!league.members.includes(user.uid)) return;
        if (league.adminId === user.uid) {
          const remaining = league.members.filter(m => m !== user.uid);
          if (remaining.length === 0) delete allLeagues[league.id];
          else { league.adminId = remaining[0]; league.members = remaining; }
        } else {
          league.members = league.members.filter(m => m !== user.uid);
          if (league.members.length === 0) delete allLeagues[league.id];
        }
      });

      delete allPredictions[user.uid];

      await storage.set("sc_leagues", allLeagues);
      await storage.set("sc_predictions", allPredictions);

      // Remove from cache
      if (_cache["sc_users"]) delete _cache["sc_users"][user.uid];

      setShowDeleteConfirm(false);
    } catch (e) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential")
        setDeleteError("Incorrect password. Please try again.");
      else setDeleteError("Failed to delete account. Please try again.");
    }
  };

  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div style={{ position: "relative" }} ref={dropRef}>
      {/* Delete account confirm modal — needs password re-auth */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: "var(--accent2)" }}>Delete Account</div>
            <p className="modal-sub">
              This will permanently delete your account "{user.username}", all your predictions, and transfer any leagues you admin. This cannot be undone.
            </p>
            {deleteError && <div className="error-msg">{deleteError}</div>}
            <div className="form-group">
              <label className="form-label">Confirm your password</label>
              <div className="password-wrap">
                <input
                  className="form-input"
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeleteError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleDeleteAccount()}
                  placeholder="Enter your password"
                  autoFocus
                />
                <button className="password-eye" type="button" onClick={() => setShowDeletePassword(s => !s)}>
                  {showDeletePassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(""); }}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={!deletePassword}>Delete My Account</button>
            </div>
          </div>
        </div>
      )}

      <button className={`profile-btn ${open ? "open" : ""}`} onClick={() => setOpen(o => !o)}>
        <Avatar uid={user.uid} size={28} username={user.username} />
        <span>{user.username}</span>
        <span className="profile-btn-caret">▼</span>
      </button>

      {open && (
        <div className="profile-dropdown">
          {/* Header */}
          <div className="profile-dd-header">
            <Avatar uid={user.uid} size={48} username={user.username} />
            <div className="profile-dd-info">
              <div className="profile-dd-name">{user.username}</div>
              <div className="profile-dd-sub">Edit your profile below</div>
            </div>
          </div>

          {/* Avatar grid */}
          <div className="profile-dd-section">
            <div className="profile-dd-section-title">Choose Avatar</div>
            <div className="avatar-grid">
              {PRESET_AVATARS.map(av => (
                <div
                  key={av.id}
                  className={`avatar-option ${activeAvatar?.type === "emoji" && activeAvatar?.value === av.emoji ? "selected" : ""}`}
                  onClick={() => handleSelectPreset(av)}
                  title={av.label}
                >
                  {av.emoji}
                </div>
              ))}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
            <button className="avatar-upload-btn" onClick={() => fileRef.current?.click()}>
              {activeAvatar?.type === "image" ? "📸 Photo selected — click to change" : "📸 Upload photo from computer"}
            </button>
          </div>

          {/* Username edit */}
          <div className="profile-dd-section">
            <div className="profile-dd-section-title">Username</div>
            <div className="profile-dd-footer" style={{ padding: 0 }}>
              <input
                className="profile-username-input"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                maxLength={20}
              />
              <button className="btn-profile-save" onClick={handleSave}>
                {saved ? "✓ Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="profile-dd-section">
            <div className="toggle-row" style={{ padding: 0, border: "none" }}>
              <div className="toggle-info">
                <strong style={{ fontSize: 13 }}>{darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</strong>
                <p style={{ fontSize: 11, marginTop: 2 }}>Switch to {darkMode ? "light" : "dark"} theme</p>
              </div>
              <div className={`toggle ${darkMode ? "on" : ""}`} onClick={onToggleDark} />
            </div>
          </div>

          {/* Sign out + Delete account */}
          <div style={{ padding: "12px 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn-profile-signout" style={{ width: "100%", margin: 0 }} onClick={() => { setOpen(false); onLogout(); }}>
              Sign out
            </button>
            <button
              style={{
                width: "100%", background: "none", border: "none",
                color: "var(--muted)", fontSize: 11, cursor: "pointer",
                padding: "4px 0", textDecoration: "underline",
                fontFamily: "var(--font-body)",
              }}
              onClick={() => { setOpen(false); setShowDeleteConfirm(true); }}
            >
              Delete account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [modal, setModal] = useState(null);
  const [tick, setTick] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  const refresh = () => setTick(t => t + 1);

  // ── Bootstrap: load all data from Firestore into cache ───────────────────────
  useEffect(() => {
    let unsubs = [];
    const bootstrap = async () => {
      const [allUsers, leagues, predictions, results] = await Promise.all([
        fsGetAllUsers(),
        fsGet("sc_leagues"),
        fsGet("sc_predictions"),
        fsGet("sc_results"),
      ]);
      _cache["sc_users"] = allUsers || {};
      _cache["sc_leagues"] = leagues || {};
      _cache["sc_predictions"] = predictions || {};
      _cache["sc_results"] = results || {};
      setLoading(false);

      // Single subscription per data source — no mixing
      unsubs = [
        fsSubscribeUsers((users) => {
          _cache["sc_users"] = users || {};
          setTick(t => t + 1);
        }),
        ...STORE_KEYS.map(k =>
          fsSubscribe(k, (val) => {
            _cache[k] = val ?? {};
            setTick(t => t + 1);
          })
        ),
      ];
    };
    bootstrap();
    return () => unsubs.forEach(u => u && u());
  }, []);

  // ── Listen to Firebase Auth state ─────────────────────────────────────────
  useEffect(() => {
    const unsub = fbOnAuthChange(async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setSelectedLeague(null);
        setTab("dashboard");
        return;
      }
      // Wait for bootstrap to finish (loading becomes false)
      // by reading profile AND all other data fresh
      const [profile, freshLeagues, freshPredictions, freshResults] = await Promise.all([
        fsReadUser(fbUser.uid),
        fsGet("sc_leagues"),
        fsGet("sc_predictions"),
        fsGet("sc_results"),
      ]);
      if (profile) {
        mergeUserIntoCache(fbUser.uid, profile);
        _cache["sc_leagues"] = freshLeagues || {};
        _cache["sc_predictions"] = freshPredictions || {};
        _cache["sc_results"] = freshResults || {};
        setUser({ uid: fbUser.uid, username: profile.username, email: fbUser.email });
      }
    });
    return () => unsub();
  }, []);

  // ── Persist dark mode preference in localStorage ────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("sc_darkMode");
    if (saved !== null) setDarkMode(saved === "true");
  }, []);
  const toggleDark = () => setDarkMode(d => {
    localStorage.setItem("sc_darkMode", String(!d));
    return !d;
  });

  // Auto-select league once data loads if user is in exactly one league
  useEffect(() => {
    if (!user || loading || selectedLeague) return;
    const leagues = storage.get("sc_leagues") || {};
    const myLeagues = Object.values(leagues).filter(l => l.members.includes(user.uid));
    if (myLeagues.length === 1) setSelectedLeague(myLeagues[0].id);
  }, [user, loading, tick]);

  const handleLogin = async (u) => {
    const [allUsers, freshLeagues, freshPredictions, freshResults] = await Promise.all([
      fsGetAllUsers(),
      fsGet("sc_leagues"),
      fsGet("sc_predictions"),
      fsGet("sc_results"),
    ]);
    _cache["sc_users"] = allUsers || {};
    _cache["sc_leagues"] = freshLeagues || {};
    _cache["sc_predictions"] = freshPredictions || {};
    _cache["sc_results"] = freshResults || {};
    setUser(u);
    setTab("dashboard");
    const myLeagues = Object.values(freshLeagues || {}).filter(l => l.members.includes(u.uid));
    if (myLeagues.length === 1) setSelectedLeague(myLeagues[0].id);
  };
  const handleLogout = async () => { await fbLogout(); };
  const handleProfileUpdate = (updated) => { setUser(updated); refresh(); };

  // Loading screen
  if (loading) return (
    <>
      <style>{css(darkMode)}</style>
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", background: "var(--bg)",
        gap: 24, position: "relative", overflow: "hidden",
      }}>
        {/* Animated background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          animation: "grid-drift 20s linear infinite",
          pointerEvents: "none",
        }}/>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 30% 30%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(244,63,94,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        }}/>
        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <ScoreClashLogo width={340} />
        </div>
        {/* Loading bar */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 220, height: 3, background: "var(--surface2)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, var(--accent), var(--green))", borderRadius: 2, animation: "loadbar 1.2s ease-in-out infinite" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>Loading</div>
        </div>
        <style>{`
          @keyframes loadbar {
            0% { width: 0%; margin-left: 0; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
          @keyframes grid-drift {
            0% { transform: translateY(0); }
            100% { transform: translateY(48px); }
          }
        `}</style>
      </div>
    </>
  );

  if (!user) return (
    <>
      <style>{css(darkMode)}</style>
      <AuthPage onLogin={handleLogin} />
    </>
  );

  const leagues = storage.get("sc_leagues") || {};
  const myLeagues = Object.values(leagues).filter(l => l.members.includes(user.uid));

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "leagues", label: "My Leagues" },
    { key: "predictions", label: "Predictions", disabled: !selectedLeague },
    { key: "groups", label: "Groups" },
  ];

  return (
    <>
      <style>{css(darkMode)}</style>
      <div className="app">
        <header className="header">
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setTab("dashboard")}>
            <ScoreClashIcon size={36} />
            <div className="logo">SCORE<span>CLASH</span></div>
          </div>
          <div className="header-user">
            <ProfileDropdown user={user} onLogout={handleLogout} onUpdate={handleProfileUpdate} darkMode={darkMode} onToggleDark={toggleDark} />
          </div>
        </header>

        <nav className="nav">
          {navItems.map(t => (
            <button
              key={t.key}
              className={`nav-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => !t.disabled && setTab(t.key)}
              style={{ opacity: t.disabled ? 0.4 : 1, cursor: t.disabled ? "not-allowed" : "pointer" }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className="main">
          <div className="tab-content" key={tab}>
            {tab === "dashboard" && <DashboardTab user={user} leagueId={selectedLeague} setTab={setTab} refresh={refresh} />}
            {tab === "leagues" && <LeaguesTab user={user} myLeagues={myLeagues} selectedLeague={selectedLeague} onSetLeague={setSelectedLeague} onOpenModal={setModal} refresh={refresh} />}
            {tab === "predictions" && selectedLeague && <PredictionsTab user={user} leagueId={selectedLeague} refresh={refresh} />}
            {tab === "groups" && <GroupsTab />}
          </div>
        </main>

        {modal === "create" && <CreateLeagueModal user={user} onClose={() => setModal(null)} onDone={(id) => { setSelectedLeague(id); setModal(null); setTab("leagues"); refresh(); }} />}
        {modal === "join" && <JoinLeagueModal user={user} onClose={() => setModal(null)} onDone={(id) => { setSelectedLeague(id); setModal(null); setTab("leagues"); refresh(); }} />}
      </div>
    </>
  );
}
