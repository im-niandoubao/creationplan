import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Flame,
  MapPin,
  Moon,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Star,
  Sun,
  Trophy,
  UsersRound
} from "lucide-react";

const APP_BASE = import.meta.env.BASE_URL;
const LOCAL_DATA_URL = `${APP_BASE}data/worldcup-2026-schedule.json`;
const LIVE_DATA_URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300";

const TEAM_ALIASES = {
  Argentina: ["阿根廷", "argentina", "梅西", "messi"],
  Brazil: ["巴西", "brazil", "内马尔", "neymar", "维尼修斯", "vini", "罗德里戈"],
  France: ["法国", "france", "姆巴佩", "mbappe", "登贝莱"],
  England: ["英格兰", "england", "凯恩", "kane", "贝林厄姆", "bellingham", "福登"],
  Portugal: ["葡萄牙", "portugal", "c罗", "ronaldo", "b费"],
  Spain: ["西班牙", "spain", "亚马尔", "yamal", "佩德里", "pedri"],
  Germany: ["德国", "germany", "穆西亚拉", "musiala", "维尔茨", "wirtz"],
  Netherlands: ["荷兰", "netherlands", "范戴克", "van dijk"],
  Belgium: ["比利时", "belgium", "德布劳内", "de bruyne"],
  Uruguay: ["乌拉圭", "uruguay", "努涅斯", "nunez"],
  Croatia: ["克罗地亚", "croatia", "莫德里奇", "modric"],
  Morocco: ["摩洛哥", "morocco", "阿什拉夫", "hakimi"],
  Mexico: ["墨西哥", "mexico", "东道主"],
  "United States": ["美国", "usa", "usmnt", "普利西奇", "pulisic", "东道主"],
  Canada: ["加拿大", "canada", "戴维", "david", "东道主"],
  Japan: ["日本", "japan", "三笘薰", "mitoma", "久保"],
  "South Korea": ["韩国", "south korea", "孙兴慜", "son"],
  Norway: ["挪威", "norway", "哈兰德", "haaland", "厄德高", "odegaard"],
  Sweden: ["瑞典", "sweden"],
  Switzerland: ["瑞士", "switzerland"],
  Australia: ["澳大利亚", "australia"],
  Türkiye: ["土耳其", "turkiye", "turkey"],
  Colombia: ["哥伦比亚", "colombia"],
  Senegal: ["塞内加尔", "senegal"],
  Ghana: ["加纳", "ghana"],
  Egypt: ["埃及", "egypt", "萨拉赫", "salah"],
  "South Africa": ["南非", "south africa"],
  Qatar: ["卡塔尔", "qatar"],
  Iran: ["伊朗", "iran"],
  Scotland: ["苏格兰", "scotland"],
  Austria: ["奥地利", "austria"],
  Paraguay: ["巴拉圭", "paraguay"]
};

const CHINESE_TEAM_NAMES = {
  Algeria: "阿尔及利亚",
  Argentina: "阿根廷",
  Australia: "澳大利亚",
  Austria: "奥地利",
  Belgium: "比利时",
  "Bosnia-Herzegovina": "波黑",
  Brazil: "巴西",
  Canada: "加拿大",
  "Cape Verde": "佛得角",
  Colombia: "哥伦比亚",
  "Congo DR": "刚果民主共和国",
  Croatia: "克罗地亚",
  "Curaçao": "库拉索",
  Czechia: "捷克",
  Ecuador: "厄瓜多尔",
  Egypt: "埃及",
  England: "英格兰",
  France: "法国",
  Germany: "德国",
  Ghana: "加纳",
  Haiti: "海地",
  Iran: "伊朗",
  Iraq: "伊拉克",
  "Ivory Coast": "科特迪瓦",
  Japan: "日本",
  Jordan: "约旦",
  Mexico: "墨西哥",
  Morocco: "摩洛哥",
  Netherlands: "荷兰",
  "New Zealand": "新西兰",
  Norway: "挪威",
  Panama: "巴拿马",
  Paraguay: "巴拉圭",
  Portugal: "葡萄牙",
  Qatar: "卡塔尔",
  "Saudi Arabia": "沙特",
  Scotland: "苏格兰",
  Senegal: "塞内加尔",
  "South Africa": "南非",
  "South Korea": "韩国",
  Spain: "西班牙",
  Sweden: "瑞典",
  Switzerland: "瑞士",
  Tunisia: "突尼斯",
  Türkiye: "土耳其",
  "United States": "美国",
  Uruguay: "乌拉圭",
  Uzbekistan: "乌兹别克斯坦"
};

const STYLE_TEAMS = {
  attacking: ["Argentina", "Brazil", "France", "Spain", "Germany", "Portugal", "Netherlands", "England"],
  control: ["Spain", "Germany", "Netherlands", "Portugal", "Argentina", "France"],
  speed: ["France", "Brazil", "United States", "Canada", "Senegal", "Japan", "Morocco"],
  defensive: ["Croatia", "Morocco", "Uruguay", "Switzerland", "Japan", "South Korea"],
  underdog: ["Cape Verde", "Curaçao", "Haiti", "Uzbekistan", "Jordan", "New Zealand", "Panama", "Qatar"]
};

const HEAVYWEIGHTS = [
  "Argentina",
  "Brazil",
  "France",
  "England",
  "Spain",
  "Germany",
  "Portugal",
  "Netherlands",
  "Belgium",
  "Uruguay",
  "Croatia",
  "Mexico",
  "United States",
  "Canada",
  "Morocco"
];

const HOSTS = ["Mexico", "United States", "Canada"];
const RIVALRY_PAIRS = [
  ["Mexico", "United States"],
  ["Brazil", "Argentina"],
  ["Germany", "Netherlands"],
  ["England", "Scotland"],
  ["France", "Germany"],
  ["Portugal", "Spain"],
  ["South Korea", "Japan"],
  ["Uruguay", "Argentina"]
];

const quickPrompts = [
  "喜欢阿根廷和梅西，最好是关键战",
  "想看巴西、法国这种进攻火力，越刺激越好",
  "工作日晚上能看，不要凌晨，推荐焦点战"
];

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

function normalizeEspnEvent(event) {
  const competition = event.competitions?.[0] ?? {};
  const teams = (competition.competitors ?? [])
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
      logo: competitor.team?.logo ?? "",
      score:
        competitor.score === undefined || competitor.score === null || competitor.score === ""
          ? null
          : Number(competitor.score),
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

function parsePreference(input) {
  const text = input.trim().toLowerCase();
  const matchedTeams = Object.entries(TEAM_ALIASES)
    .filter(([team, aliases]) => team.toLowerCase().includes(text) || aliases.some((alias) => text.includes(alias)))
    .map(([team]) => team);

  return {
    text,
    matchedTeams,
    avoidNight: /不熬|不要熬|不想熬|别熬|早睡|白天|晚上|黄金/.test(text),
    acceptNight: /可以熬|能熬|熬夜|凌晨|夜猫/.test(text) && !/不熬|不要熬|不想熬|别熬/.test(text),
    weekend: /周末|星期六|星期天|星期日|礼拜六|礼拜天|礼拜日|weekend/.test(text),
    weekday: /工作日|周一|周二|周三|周四|周五|weekday/.test(text),
    focus: /焦点|强强|豪门|必须|必看|关键|重磅|热门|天王山|决赛|半决赛|淘汰/.test(text),
    rivalry: /恩怨|宿敌|德比|复仇|故事|历史|老对手|东道主/.test(text),
    attack: /进攻|对攻|火力|刺激|开放|速度|反击|快/.test(text),
    control: /控球|传控|技术|中场|节奏/.test(text),
    defense: /防守|硬朗|身体|稳|绞杀/.test(text),
    underdog: /黑马|冷门|小球队|新军|爆冷/.test(text),
    knockout: /淘汰|32强|十六强|16强|八强|8强|四强|半决赛|决赛|季军/.test(text),
    replay: /回看|补|已经踢|赛果|比分|录像/.test(text)
  };
}

function mergePreferences(rulePrefs, aiPreference) {
  if (!aiPreference) return rulePrefs;
  const matchTypes = new Set(aiPreference.matchTypes ?? []);
  const styles = new Set(aiPreference.styles ?? []);
  return {
    ...rulePrefs,
    matchedTeams: [...new Set([...rulePrefs.matchedTeams, ...(aiPreference.preferredTeams ?? [])])],
    avoidNight: rulePrefs.avoidNight || aiPreference.avoidNight === true,
    acceptNight: rulePrefs.acceptNight || aiPreference.acceptNight === true,
    weekend: rulePrefs.weekend || aiPreference.preferWeekend === true,
    weekday: rulePrefs.weekday || aiPreference.preferWeekday === true,
    focus: rulePrefs.focus || matchTypes.has("focus"),
    rivalry: rulePrefs.rivalry || matchTypes.has("rivalry") || matchTypes.has("host"),
    attack: rulePrefs.attack || styles.has("attacking") || styles.has("speed"),
    control: rulePrefs.control || styles.has("control"),
    defense: rulePrefs.defense || styles.has("defensive"),
    underdog: rulePrefs.underdog || styles.has("underdog"),
    knockout: rulePrefs.knockout || matchTypes.has("knockout"),
    replay: rulePrefs.replay || matchTypes.has("replay"),
    aiExplanation: aiPreference.explanation ?? ""
  };
}

function teamName(name) {
  return CHINESE_TEAM_NAMES[name] ?? name;
}

function isPlaceholder(name) {
  return /winner|place|third|semifinal|quarterfinal|round of|group [a-l]/i.test(name);
}

// 淘汰赛 + 对阵双方至少一方是占位 = 等前一轮赛果出来再确定，不进推荐
// 小组赛就算有 "Group X 2nd Place" 也是已知的真实球队对阵，不算 TBD
function isTbdKnockout(match) {
  if (/Group/i.test(match.stage)) return false;
  return match.teams.some((team) => isPlaceholder(team.name));
}

// 跟 scoreMatch 里的 focus 逻辑对齐：非小组赛 OR 小组赛但有 2+ 强队
function isFocusMatch(match) {
  if (!/Group/i.test(match.stage)) return true;
  return pairCount(match, HEAVYWEIGHTS) >= 2;
}

function isLateNightMatch(match) {
  const hour = match.dateInfo?.hour;
  if (hour === undefined) return false;
  return hour < 7 || hour >= 23;
}

function isWeekendMatch(match) {
  return Boolean(match.dateInfo?.isWeekend);
}

// 用户偏好真的影响赛程：每个被勾上的偏好都当过滤器，**任一不通过就排除**
function matchPassesPreferences(match, prefs) {
  if (prefs.avoidNight && isLateNightMatch(match)) return false;
  if (prefs.weekend && !isWeekendMatch(match)) return false;
  if (prefs.weekday && isWeekendMatch(match)) return false;
  if (prefs.focus && !isFocusMatch(match)) return false;
  if (prefs.knockout && /Group/i.test(match.stage)) return false;
  if (prefs.attack && !pairHas(match, STYLE_TEAMS.attacking)) return false;
  if (prefs.control && !pairHas(match, STYLE_TEAMS.control)) return false;
  if (prefs.defense && !pairHas(match, STYLE_TEAMS.defensive)) return false;
  if (prefs.underdog && !pairHas(match, STYLE_TEAMS.underdog)) return false;
  if (prefs.rivalry && !(isRivalry(match) || pairHas(match, HOSTS))) return false;
  if (prefs.matchedTeams.length > 0) {
    const hit = match.teams.some((t) => prefs.matchedTeams.includes(t.name));
    if (!hit) return false;
  }
  return true;
}

function beijingDateParts(date) {
  const value = new Date(date);
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(value);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdayText = get("weekday");
  return {
    label: `${get("month")}/${get("day")} ${get("weekday")} ${get("hour")}:${get("minute")}`,
    hour: Number(get("hour")),
    weekdayText,
    isWeekend: weekdayText.includes("六") || weekdayText.includes("日") || weekdayText.includes("天")
  };
}

function stageWeight(stage) {
  if (/Final/i.test(stage)) return 42;
  if (/Third Place/i.test(stage)) return 25;
  if (/Semifinal/i.test(stage)) return 36;
  if (/Quarterfinal/i.test(stage)) return 30;
  if (/Round of 16/i.test(stage)) return 24;
  if (/Round of 32/i.test(stage)) return 18;
  if (/Group/i.test(stage)) return 8;
  return 10;
}

function pairHas(match, list) {
  const names = match.teams.map((team) => team.name);
  return names.some((name) => list.includes(name));
}

function pairCount(match, list) {
  return match.teams.filter((team) => list.includes(team.name)).length;
}

function isRivalry(match) {
  const names = match.teams.map((team) => team.name);
  return RIVALRY_PAIRS.some(([a, b]) => names.includes(a) && names.includes(b));
}

function scoreMatch(match, prefs, hideCompleted) {
  const reasons = [];
  let score = stageWeight(match.stage);
  const dateInfo = beijingDateParts(match.date);
  const teamNames = match.teams.map((team) => team.name);
  const heavyweightCount = pairCount(match, HEAVYWEIGHTS);
  const isNight = dateInfo.hour < 7 || dateInfo.hour >= 23;
  const isLive = match.status.state === "in" || (!match.status.completed && new Date(match.date) < new Date());
  const isUpcoming = !match.status.completed && !isLive;

  if (hideCompleted && !isUpcoming && !isLive && !prefs.replay) score -= 90;
  if (isLive) {
    score += 6;
    reasons.push("比赛中，可加入实时关注");
  } else if (isUpcoming) {
    score += 10;
    reasons.push("未开赛，可纳入观看计划");
  } else {
    score -= 8;
    reasons.push("已完赛，适合回看或补比分");
  }

  if (heavyweightCount >= 2) {
    score += 36;
    reasons.push("强队直接对话，关注度高");
  } else if (heavyweightCount === 1) {
    score += 15;
    reasons.push("有热门球队登场");
  }

  if (prefs.matchedTeams.length) {
    const hits = prefs.matchedTeams.filter((team) => teamNames.includes(team));
    if (hits.length) {
      score += 75 + hits.length * 15;
      reasons.push(`命中偏好球队：${hits.map(teamName).join("、")}`);
    }
  }

  if (prefs.avoidNight) {
    if (isNight) {
      score -= 50;
    } else {
      score += 28;
      reasons.push("北京时间不算熬夜");
    }
  }

  if (prefs.acceptNight && isNight) {
    score += 14;
    reasons.push("符合可按北京时间熬夜看球");
  }

  if (prefs.weekend) {
    if (dateInfo.isWeekend) {
      score += 26;
      reasons.push("周末开球");
    } else {
      score -= 16;
    }
  }

  if (prefs.weekday) {
    if (!dateInfo.isWeekend) {
      score += 18;
      reasons.push("工作日赛程");
    } else {
      score -= 8;
    }
  }

  if (prefs.focus) {
    if (!/Group/i.test(match.stage) || heavyweightCount >= 2) {
      score += 30;
      reasons.push(/Group/i.test(match.stage) ? "小组赛焦点对话" : "淘汰赛天然高压");
    }
  }

  if (prefs.knockout && !/Group/i.test(match.stage)) {
    score += 38;
    reasons.push("符合淘汰赛偏好");
  }

  if (prefs.rivalry) {
    if (isRivalry(match)) {
      score += 42;
      reasons.push("有宿敌或历史故事线");
    } else if (pairHas(match, HOSTS)) {
      score += 22;
      reasons.push("东道主比赛，现场氛围通常更强");
    }
  }

  if (prefs.attack && pairHas(match, STYLE_TEAMS.attacking)) {
    score += 24;
    reasons.push("进攻型球队登场");
  }

  if (prefs.control && pairHas(match, STYLE_TEAMS.control)) {
    score += 20;
    reasons.push("更接近控球/技术流偏好");
  }

  if (prefs.defense && pairHas(match, STYLE_TEAMS.defensive)) {
    score += 18;
    reasons.push("有硬朗或防守韧性标签");
  }

  if (prefs.underdog && pairHas(match, STYLE_TEAMS.underdog)) {
    score += 28;
    reasons.push("有黑马或新鲜面孔");
  }

  if (teamNames.some(isPlaceholder)) {
    reasons.push("淘汰赛对阵会随赛果更新");
  }

  if (!reasons.length) reasons.push("综合时间、阶段和球队热度排序");
  return { ...match, score: Math.max(0, Math.round(score)), reasons: reasons.slice(0, 4), dateInfo };
}

function MatchCard({ match, compact = false, index = 0 }) {
  const teams = match.teams;
  const isLive = match.status.state === "in" || (!match.status.completed && new Date(match.date) < new Date());
  const statusClass = isLive ? "status live" : match.status.completed ? "status done" : "status";
  const statusText = isLive ? "比赛中" : (match.status.shortDetail || "TBD");
  const scoreText =
    match.status.completed && teams.every((team) => team.score !== null)
      ? `${teams[0]?.score ?? "-"} : ${teams[1]?.score ?? "-"}`
      : isLive
        ? "LIVE"
        : "vs";
  const matchNum = `M${String(index + 1).padStart(2, "0")}`;

  return (
    <article className={`match-card ${compact ? "compact" : ""} ${isLive ? "is-live" : ""}`}>
      <span className="match-num">{matchNum}</span>
      <div className="match-topline">
        <span>{match.stage}</span>
        <span className={statusClass}>{statusText}</span>
      </div>
      <div className="teams">
        {teams.map((team) => (
          <div className="team" key={`${match.id}-${team.id}-${team.homeAway}`}>
            {team.logo ? <img src={team.logo} alt="" /> : <span className="logo-fallback">{team.abbreviation || "TBD"}</span>}
            <strong>{teamName(team.name)}</strong>
          </div>
        ))}
        <div className="score">{scoreText}</div>
      </div>
      <div className="match-meta">
        <span>
          <Clock3 size={15} /> {match.dateInfo.label}
        </span>
        <span>
          <MapPin size={15} /> {match.city || match.venue}
        </span>
      </div>
      {!compact && (
        <div className="reasons">
          {match.reasons.map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
        </div>
      )}
    </article>
  );
}

function Stat({ icon: Icon, label, value, featured = false }) {
  return (
    <div className={featured ? "stat is-featured" : "stat"}>
      <div className="stat-head">
        <Icon size={15} />
        <span>{label}</span>
      </div>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiModel, setAiModel] = useState("deepseek-v4-flash");
  const [aiStatus, setAiStatus] = useState("规则解析");
  const [aiResult, setAiResult] = useState(null);
  const [hideCompleted, setHideCompleted] = useState(true);
  const [activeTab, setActiveTab] = useState("recommend");
  const [status, setStatus] = useState("载入本地赛程中");
  // 3 个用户可直接勾选的偏好（叠加在 query 解析和 AI 解析之上）
  const [toggles, setToggles] = useState({ avoidNight: false, weekend: false, focus: false });

  useEffect(() => {
    fetch(`${APP_BASE}api/ai-status`)
      .then((response) => response.json())
      .then((payload) => {
        setAiAvailable(Boolean(payload.enabled));
        setAiModel(payload.model ?? "deepseek-v4-flash");
        setAiStatus(payload.enabled ? `AI解析：${payload.model}` : "AI未启用，规则解析");
      })
      .catch(() => setAiStatus("AI状态未知，规则解析"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(LOCAL_DATA_URL)
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        setStatus(`已载入 ${payload.events.length} 场赛程快照`);
        refreshSchedule({ automatic: true });
      })
      .catch(() => {
        if (!cancelled) setStatus("本地赛程载入失败");
      });

    const timer = window.setInterval(() => refreshSchedule({ automatic: true }), 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!aiAvailable) {
      setAiResult(null);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const text = query.trim();
      if (!text) {
        setAiResult(null);
        setAiStatus(`AI解析：${aiModel}`);
        return;
      }

      setAiStatus("AI正在解析偏好");
      try {
        const response = await fetch(`${APP_BASE}api/parse-preference`, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ text }),
          signal: controller.signal
        });
        const payload = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setAiAvailable(false);
            setAiStatus("AI鉴权失败，规则解析");
            throw new Error("auth-failed");
          }
          throw new Error(payload.error ?? "AI parsing failed");
        }
        setAiResult({ text, preference: payload.preference });
        setAiStatus(`AI已解析：${payload.model ?? aiModel}`);
      } catch (error) {
        if (error.name === "AbortError") return;
        if (error.message === "auth-failed") return;
        setAiResult(null);
        setAiStatus("AI解析失败，规则解析");
      }
    }, 700);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [aiAvailable, aiModel, query]);

  async function refreshSchedule(options = {}) {
    setStatus(options.automatic ? "正在自动刷新在线赛程" : "正在从在线源刷新");
    const response = await fetch(LIVE_DATA_URL);
    if (!response.ok) {
      setStatus(options.automatic ? "自动刷新失败，继续使用当前赛程" : "在线刷新失败，继续使用本地快照");
      return;
    }
    const payload = await response.json();
    const events = (payload.events ?? []).map(normalizeEspnEvent).sort((a, b) => a.date.localeCompare(b.date));
    setData({
      updatedAt: new Date().toISOString(),
      sourceUrl: LIVE_DATA_URL,
      sourceName: "ESPN public scoreboard API",
      officialReferenceUrl: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",
      tournament: "2026 FIFA World Cup",
      events
    });
    setStatus(options.automatic ? `已自动刷新 ${events.length} 场赛程` : `刚刚刷新 ${events.length} 场赛程`);
  }

  const rulePrefs = useMemo(() => parsePreference(query), [query]);
  const prefs = useMemo(() => {
    const activeAiPreference = aiResult?.text === query.trim() ? aiResult.preference : null;
    const merged = mergePreferences(rulePrefs, activeAiPreference);
    // 用户直接勾的 3 个 toggle，叠加（任一为真就启用）
    return {
      ...merged,
      avoidNight: merged.avoidNight || toggles.avoidNight,
      weekend: merged.weekend || toggles.weekend,
      focus: merged.focus || toggles.focus
    };
  }, [aiResult, query, rulePrefs, toggles]);
  const scoredMatches = useMemo(() => {
    if (!data) return [];
    return data.events
      .map((match) => scoreMatch(match, prefs, hideCompleted))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data, hideCompleted, prefs]);

  // 推荐用：过滤掉淘汰赛 TBD（对阵还没定）
  // scoredMatches 保留原样（"全部" tab 仍然能看到，含 TBD 标识）
  const recommendableMatches = useMemo(
    () => scoredMatches.filter((match) => !isTbdKnockout(match)),
    [scoredMatches]
  );

  // 只要用户表达了任何偏好（3 个 toggle 任一被勾、文本触发了规则/AI 偏好、球队命中），
  // 就当作过滤器 — 不通过就不进推荐池
  const hasAnyPreference =
    toggles.avoidNight ||
    toggles.weekend ||
    toggles.focus ||
    prefs.avoidNight ||
    prefs.weekend ||
    prefs.weekday ||
    prefs.focus ||
    prefs.knockout ||
    prefs.attack ||
    prefs.control ||
    prefs.defense ||
    prefs.underdog ||
    prefs.rivalry ||
    prefs.matchedTeams.length > 0;

  // "推荐" tab 的真正内容：TBD 过滤 + 已开赛过滤（hideCompleted=true 时）+ 偏好过滤
  const shownMatches = useMemo(() => {
    let result = recommendableMatches;
    if (hideCompleted) {
      result = result.filter((match) => !match.status.completed);
    }
    if (hasAnyPreference) {
      result = result.filter((match) => matchPassesPreferences(match, prefs));
    }
    return result;
  }, [recommendableMatches, hideCompleted, hasAnyPreference, prefs]);

  const recommended = shownMatches;
  const upcomingCount = data?.events.filter((event) => !event.status.completed).length ?? 0;
  const completedCount = data?.events.filter((event) => event.status.completed).length ?? 0;
  const nextMatch = shownMatches.find((match) => !match.status.completed);
  const mustWatch = hasAnyPreference ? shownMatches.length : 0;

  return (
    <main>
      <section className="shell">
        <div className="brand-strip">
          <div className="brand-mark">
            <span className="brand-26">2026</span>
            <div className="brand-text">
              <p className="eyebrow">FIFA WORLD CUP · CANADA · MEXICO · USA</p>
              <h1>世界杯赛程推荐</h1>
            </div>
          </div>
          <button className="icon-button" type="button" onClick={refreshSchedule} title="刷新赛程">
            <RefreshCw size={19} />
            <span>刷新赛程</span>
          </button>
        </div>

        <div className="app-grid">
          <aside className="planner-panel">
            <div className="planner-head">Tactical Briefing</div>
            <div className="planner-body">
              <div className="panel-heading">
                <Sparkles size={20} />
                <h2>说出你的看球偏好</h2>
              </div>

              {/* 3 个快捷偏好 toggle（顶部） */}
              <div className="signal-list">
                <button
                  type="button"
                  className={toggles.avoidNight ? "on" : ""}
                  onClick={() => setToggles((t) => ({ ...t, avoidNight: !t.avoidNight }))}
                  aria-pressed={toggles.avoidNight}
                >
                  <Moon size={16} /> 不熬夜
                </button>
                <button
                  type="button"
                  className={toggles.weekend ? "on" : ""}
                  onClick={() => setToggles((t) => ({ ...t, weekend: !t.weekend }))}
                  aria-pressed={toggles.weekend}
                >
                  <Sun size={16} /> 周末
                </button>
                <button
                  type="button"
                  className={toggles.focus ? "on" : ""}
                  onClick={() => setToggles((t) => ({ ...t, focus: !t.focus }))}
                  aria-pressed={toggles.focus}
                >
                  <Flame size={16} /> 焦点战
                </button>
              </div>

              <div className={aiAvailable ? "ai-pill on" : "ai-pill"}>
                <Sparkles size={15} />
                <span>{aiStatus}</span>
              </div>
              <label className="search-box">
                <Search size={18} />
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  rows={5}
                  placeholder="例如：我在中国，喜欢阿根廷和梅西，最好是关键战（可选，留空看完整赛程）"
                />
              </label>

              <div className="prompt-grid">
                {quickPrompts.map((prompt) => (
                  <button type="button" key={prompt} onClick={() => setQuery(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="control-row">
                <label className="switch">
                  <input type="checkbox" checked={hideCompleted} onChange={(event) => setHideCompleted(event.target.checked)} />
                  <span>优先未开赛</span>
                </label>
              </div>
            </div>
          </aside>

          <section className="results-panel">
            <div className="results-head">
              <div className="head-meta">
                <span>Matchday</span>
                {status}
              </div>
              <div className="tabs">
                <button className={activeTab === "recommend" ? "active" : ""} onClick={() => setActiveTab("recommend")} type="button">
                  推荐
                </button>
                <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")} type="button">
                  全部
                </button>
              </div>
            </div>

            <div className="results-body">
              <div className="stats-grid">
                <Stat icon={CalendarDays} label="完整赛程" value={data?.events.length ?? "..."} />
                <Stat icon={Clock3} label="未开赛" value={upcomingCount} />
                <Stat icon={Trophy} label="已完赛" value={completedCount} />
                <Stat icon={Star} label="高匹配" value={mustWatch} featured />
              </div>

              {nextMatch && (
                <div className="next-strip">
                  <UsersRound size={18} />
                  <span className="label">下一场</span>
                  <strong>{nextMatch.teams.map((team) => teamName(team.name)).join(" vs ")}</strong>
                  <em>{nextMatch.dateInfo.label}</em>
                </div>
              )}

              <div className="match-list">
                {(activeTab === "recommend" ? recommended : scoredMatches).map((match, idx) => (
                  <MatchCard key={match.id} match={match} compact={activeTab === "all"} index={idx} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
