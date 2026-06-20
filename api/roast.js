// ─── ScoreClash: Last Place Roast Generator ───────────────────────────────────
// Generates a short, funny, pointed roast aimed at whoever is currently in
// last place in a league's standings. Uses the Anthropic API with a tightly
// scoped system prompt to keep the tone "friend-group banter" rather than
// anything that could genuinely hurt — no race/gender/identity content ever,
// stays focused on their prediction performance and a bit of personal jab,
// kept short and punchy.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const { username, points, rank, totalPlayers, pointsBehindNext, worstMiss } = req.body || {};

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  const systemPrompt = `You write short, funny, pointed roasts for a friend-group football prediction app called ScoreClash. The roast targets whoever is currently in last place in their mini-league, based on their prediction performance.

Tone: friend-group banter — funny and a bit insulting/personal, similar to how close friends rib each other. Sharp and a little cutting is fine and encouraged.

Hard rules, never break these:
- NEVER reference race, ethnicity, gender, sexuality, religion, nationality, disability, or any protected characteristic, even obliquely.
- NEVER body-shame or comment on physical appearance.
- NEVER suggest self-harm or anything genuinely cruel — this should sting like friendly ribbing, not actually wound.
- Stay focused on their prediction performance, football knowledge (or lack of it), and light personal jabs about being clueless/hopeless/cursed — nothing outside that frame.
- Keep it SHORT: 1-2 sentences max, punchy.
- Output ONLY the roast text, no preamble, no quotation marks, no explanation.`;

  const userPrompt = `Write a roast for this person:
Username: ${username}
Current rank: ${rank} out of ${totalPlayers}
Points: ${points}
Points behind the next person up: ${pointsBehindNext ?? "unknown"}
${worstMiss ? `Their worst prediction: predicted ${worstMiss.predicted}, actual result was ${worstMiss.actual} for ${worstMiss.match}` : ""}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 150,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || "API error" });
    }

    const roastText = data.content?.find(c => c.type === "text")?.text?.trim();

    if (!roastText) {
      return res.status(500).json({ error: "No roast generated" });
    }

    return res.status(200).json({ roast: roastText });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
