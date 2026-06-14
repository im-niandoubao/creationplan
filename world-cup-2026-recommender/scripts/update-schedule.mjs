import { mkdir, writeFile } from "node:fs/promises";

const SOURCE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300";

const STAGE_BY_SLUG = {
  "group-stage": "Group Stage",
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  quarterfinals: "Quarterfinal",
  semifinals: "Semifinal",
  "third-place": "Third Place",
  final: "Final"
};

function parseStage(note = "", slug = "") {
  const text = note.replace("FIFA World Cup, ", "").trim();
  if (text && text !== "FIFA World Cup") return text;
  return STAGE_BY_SLUG[slug] ?? text ?? "FIFA World Cup";
}

function pickScore(competitor) {
  if (competitor.score === undefined || competitor.score === null || competitor.score === "") {
    return null;
  }
  return Number(competitor.score);
}

function normalizeEvent(event) {
  const competition = event.competitions?.[0] ?? {};
  const competitors = competition.competitors ?? [];
  const teams = competitors
    .slice()
    .sort((a, b) => {
      if (a.homeAway === b.homeAway) return 0;
      return a.homeAway === "home" ? -1 : 1;
    })
    .map((competitor) => ({
      id: competitor.team?.id ?? competitor.id,
      name: competitor.team?.displayName ?? competitor.team?.name ?? "TBD",
      shortName: competitor.team?.shortDisplayName ?? competitor.team?.abbreviation ?? "TBD",
      abbreviation: competitor.team?.abbreviation ?? "",
      country: competitor.team?.location ?? competitor.team?.displayName ?? "TBD",
      logo: competitor.team?.logo ?? "",
      score: pickScore(competitor),
      homeAway: competitor.homeAway ?? "",
      winner: Boolean(competitor.winner)
    }));

  return {
    id: event.id,
    name: event.name,
    shortName: event.shortName,
    date: event.date,
    stage: parseStage(competition.altGameNote, event.season?.slug),
    venue: competition.venue?.fullName ?? "",
    city: competition.venue?.address?.city ?? "",
    country: competition.venue?.address?.country ?? "",
    status: {
      state: competition.status?.type?.state ?? "pre",
      completed: Boolean(competition.status?.type?.completed),
      description: competition.status?.type?.description ?? "",
      detail: competition.status?.type?.detail ?? "",
      shortDetail: competition.status?.type?.shortDetail ?? ""
    },
    broadcasts: competition.broadcasts?.flatMap((broadcast) => broadcast.names ?? []) ?? [],
    teams
  };
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Schedule fetch failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const events = (payload.events ?? []).map(normalizeEvent).sort((a, b) => a.date.localeCompare(b.date));
  if (events.length !== 104) {
    console.warn(`Expected 104 matches, received ${events.length}.`);
  }

  const output = {
    updatedAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    sourceName: "ESPN public scoreboard API",
    officialReferenceUrl:
      "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",
    tournament: "2026 FIFA World Cup",
    timezoneHint: "All match dates are ISO UTC. The app renders and recommends them in Asia/Shanghai time.",
    events
  };

  await mkdir("public/data", { recursive: true });
  await writeFile("public/data/worldcup-2026-schedule.json", `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${events.length} matches to public/data/worldcup-2026-schedule.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
