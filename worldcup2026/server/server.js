// 2026 世界杯赛程推荐 · 偏好解析 API
// 独立 Node 进程，pm2 进程名 worldcup2026-server，监听 port 3003
// 暴露 2 个 API：GET /api/ai-status + POST /api/parse-preference
// DEEPSEEK_API_KEY 从 .env 读（不入 git），缺省时不报错，/api/ai-status 返回 enabled=false
//
// 偏好解析逻辑从原 vite.config.js 的 deepseekPreferencePlugin 平移过来：
// React 前端只关心"返回结构化 JSON"，跟实现细节解耦

require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json({ limit: '32kb' }));

const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
const PORT = Number(process.env.PORT) || 3003;

// ---------- 静态白名单（从 vite 配置原样搬过来）----------

const KNOWN_TEAMS = [
  "Algeria", "Argentina", "Australia", "Austria", "Belgium", "Bosnia-Herzegovina",
  "Brazil", "Canada", "Cape Verde", "Colombia", "Congo DR", "Croatia", "Curaçao",
  "Czechia", "Ecuador", "Egypt", "England", "France", "Germany", "Ghana", "Haiti",
  "Iran", "Iraq", "Ivory Coast", "Japan", "Jordan", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Norway", "Panama", "Paraguay", "Portugal", "Qatar", "Saudi Arabia",
  "Scotland", "Senegal", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
  "Tunisia", "Türkiye", "United States", "Uruguay", "Uzbekistan"
];

const VALID_STYLES = ["attacking", "control", "speed", "defensive", "underdog"];
const VALID_MATCH_TYPES = ["focus", "knockout", "rivalry", "host", "replay"];

// ---------- 工具函数（从 vite 配置平移）----------

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function extractJsonObject(content) {
  const trimmed = content.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Model response did not contain JSON');
  return JSON.parse(match[0]);
}

function normalizePreference(raw) {
  const object = raw && typeof raw === 'object' ? raw : {};
  const preferredTeams = Array.isArray(object.preferredTeams)
    ? object.preferredTeams.filter((team) => KNOWN_TEAMS.includes(team))
    : [];
  const styles = Array.isArray(object.styles)
    ? object.styles.filter((style) => VALID_STYLES.includes(style))
    : [];
  const matchTypes = Array.isArray(object.matchTypes)
    ? object.matchTypes.filter((type) => VALID_MATCH_TYPES.includes(type))
    : [];

  return {
    preferredTeams,
    preferredPlayers: Array.isArray(object.preferredPlayers)
      ? object.preferredPlayers.slice(0, 8).map(String)
      : [],
    avoidNight: object.avoidNight === true,
    acceptNight: object.acceptNight === true,
    preferWeekend: object.preferWeekend === true,
    preferWeekday: object.preferWeekday === true,
    styles,
    matchTypes,
    explanation: typeof object.explanation === 'string' ? object.explanation.slice(0, 160) : ''
  };
}

// ---------- 路由 ----------

// GET /api/ai-status — 让前端知道 AI 是否可用 + 当前模型
app.get('/api/ai-status', (req, res) => {
  res.json({
    enabled: Boolean(API_KEY),
    baseUrl: BASE_URL,
    model: MODEL
  });
});

// POST /api/parse-preference — 调用 DeepSeek 解析用户偏好文本
app.post('/api/parse-preference', async (req, res) => {
  if (!API_KEY) {
    return res.status(501).json({
      error: 'DEEPSEEK_API_KEY is not configured',
      model: MODEL
    });
  }

  try {
    // express.json() 已经把 body 解析到 req.body
    const body = req.body || {};
    const userText = String(body.text ?? '').slice(0, 2000);
    if (!userText.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const upstream = await fetch(`${BASE_URL.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content:
              '你是2026世界杯观赛偏好解析器。只输出一个JSON对象，不要Markdown。所有时间、熬夜、周末、工作日判断都以北京时间Asia/Shanghai为准。不要编造赛程，只解析用户偏好。'
          },
          {
            role: 'user',
            content: `把用户输入解析成JSON。字段必须是：
{
  "preferredTeams": string[],
  "preferredPlayers": string[],
  "avoidNight": boolean,
  "acceptNight": boolean,
  "preferWeekend": boolean,
  "preferWeekday": boolean,
  "styles": ("attacking"|"control"|"speed"|"defensive"|"underdog")[],
  "matchTypes": ("focus"|"knockout"|"rivalry"|"host"|"replay")[],
  "explanation": string
}

preferredTeams只能从这个英文名单中选择：${KNOWN_TEAMS.join(', ')}
用户输入：${userText}`
          }
        ]
      })
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return res.status(upstream.status).json({
        error: 'DeepSeek request failed',
        detail: errorText.slice(0, 500),
        model: MODEL
      });
    }

    const payload = await upstream.json();
    const content = payload.choices?.[0]?.message?.content ?? '';
    const preference = normalizePreference(extractJsonObject(content));
    res.json({
      source: 'deepseek',
      model: MODEL,
      preference
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      model: MODEL
    });
  }
});

// ---------- 健康检查（无敏感信息）----------

app.get('/api/health', (req, res) => {
  res.json({ ok: true, port: PORT, aiEnabled: Boolean(API_KEY) });
});

// ---------- 启动 ----------

app.listen(PORT, () => {
  console.log(`[worldcup2026-server] listening on :${PORT}`);
  console.log(`[worldcup2026-server] ai enabled=${Boolean(API_KEY)} model=${MODEL} baseUrl=${BASE_URL}`);
  if (!API_KEY) {
    console.warn('[worldcup2026-server] DEEPSEEK_API_KEY is empty, /api/parse-preference will return 501');
  }
});
