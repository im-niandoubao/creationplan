// 造物计划进度条后端
// 独立 Node 进程，pm2 进程名 creationplan-server，监听 port 3002
// 公开 API：progress（GET）/ track-visit（POST）/ go（GET）/ visit-stats（GET）
// admin API：state（GET/PUT）/ day-tool（PUT），assum token 鉴权
// 数据存 1 个 JSON 配置文件（config.json），每次请求重读，写盘用 write-rename 原子操作

require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 3002;
const CONFIG_PATH = path.join(__dirname, 'config.json');
const CHICHI_SERVER = 'http://127.0.0.1:3001';

// ---------- 配置加载 / 保存 ----------

const DEFAULT_CONFIG = {
  start_date: new Date().toISOString().slice(0, 10), // 今天
  submitted_count: 0,
  day_tools: {},
  visits: {}, // { "1": { count: 12, last: "2026-06-14T..." } }
  live_days: [], // 已上线工具对应的 Day 编号（前端造物库 REAL_PROJECTS.status='live' 的对应天数）
};

// 校验 live_days 元素：必须是 1-100 整数；返回过滤 + 去重 + 排序后的数组
function sanitizeLiveDays(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const out = [];
  for (const d of arr) {
    if (!Number.isInteger(d) || d < 1 || d > 100) continue;
    if (seen.has(d)) continue;
    seen.add(d);
    out.push(d);
  }
  return out.sort((a, b) => a - b);
}

function loadConfig() {
  try {
    const text = fs.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(text);
    return {
      start_date: parsed.start_date || DEFAULT_CONFIG.start_date,
      submitted_count: Number.isInteger(parsed.submitted_count) ? parsed.submitted_count : 0,
      day_tools: parsed.day_tools && typeof parsed.day_tools === 'object' ? parsed.day_tools : {},
      visits: parsed.visits && typeof parsed.visits === 'object' ? parsed.visits : {},
      live_days: sanitizeLiveDays(parsed.live_days),
    };
  } catch (e) {
    if (e.code === 'ENOENT') {
      // 文件不存在 → 创建默认
      saveConfigRaw(DEFAULT_CONFIG);
      return { ...DEFAULT_CONFIG, day_tools: {}, visits: {}, live_days: [] };
    }
    throw e; // 其他错误（JSON 损坏等）→ 让上层处理
  }
}

function saveConfigRaw(config) {
  const tmp = CONFIG_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(config, null, 2), 'utf8');
  fs.renameSync(tmp, CONFIG_PATH); // 原子操作
}

// ---------- 校验 ----------

function isValidDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

function validateState(body) {
  if (!body || typeof body !== 'object') return 'body 必须是对象';
  if (!isValidDate(body.start_date)) return 'start_date 必须是 YYYY-MM-DD 格式';
  if (!Number.isInteger(body.submitted_count) || body.submitted_count < 0) {
    return 'submitted_count 必须是非负整数';
  }
  return null;
}

function validateDayTool(body) {
  if (!body || typeof body !== 'object') return 'body 必须是对象';
  if (!Number.isInteger(body.day) || body.day < 1 || body.day > 100) {
    return 'day 必须是 1-100 的整数';
  }
  if (typeof body.name !== 'string') return 'name 必须是字符串';
  return null;
}

function validateTrackVisit(body) {
  if (!body || typeof body !== 'object') return 'body 必须是对象';
  if (!Number.isInteger(body.day) || body.day < 1 || body.day > 100) {
    return 'day 必须是 1-100 的整数';
  }
  return null;
}

// /api/go?day=N&u=URL  校验：防止开放重定向（SSRF/open redirect）
function validateGoRequest(query) {
  if (!query) return 'query 缺失';
  const day = Number(query.day);
  if (!Number.isInteger(day) || day < 1 || day > 100) {
    return 'day 必须是 1-100 的整数';
  }
  const u = String(query.u || '');
  if (!/^https?:\/\//i.test(u)) {
    return 'u 必须是 http(s) URL';
  }
  if (u.length > 2048) return 'u 太长（> 2048）';
  return null;
}

// 记录一次访问（track-visit 和 go 端点共用）
// 返回更新后的 { count, last }
function recordVisit(day) {
  const config = loadConfig();
  const key = String(day);
  const prev = config.visits[key] || { count: 0, last: null };
  config.visits[key] = {
    count: (prev.count || 0) + 1,
    last: new Date().toISOString()
  };
  saveConfigRaw(config);
  return config.visits[key];
}

// ---------- 进度推导 ----------

function computeProgress(config, now) {
  const startMs = new Date(config.start_date + 'T00:00:00').getTime();
  const elapsedDays = Math.floor((now.getTime() - startMs) / 86400000) + 1;
  const current_day = Math.max(1, Math.min(100, elapsedDays));

  const FIXED_DAYS = [1, 20, 40, 60, 80, 100];

  const nodes = [];
  for (const day of FIXED_DAYS) {
    const node = { day, type: 'fixed', label: `Day ${day}` };
    if (day > current_day + 1) node.locked = true;
    if (config.day_tools[String(day)]) node.tool_name = config.day_tools[String(day)];
    nodes.push(node);
  }

  if (!FIXED_DAYS.includes(current_day)) {
    const todayNode = { day: current_day, type: 'today', label: `Day ${current_day}` };
    if (config.day_tools[String(current_day)]) todayNode.tool_name = config.day_tools[String(current_day)];
    nodes.push(todayNode);
  }

  // 按 day 排序
  nodes.sort((a, b) => a.day - b.day);

  return {
    start_date: config.start_date,
    current_day,
    total_days: 100,
    submitted_count: config.submitted_count,
    live_days: config.live_days || [],
    live_count: (config.live_days || []).length,
    nodes,
  };
}

// ---------- 鉴权（HTTP 跳 chichi-server 验证 assum token） ----------

async function requireAssumToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/, '');
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    const r = await fetch(`${CHICHI_SERVER}/assum/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.status !== 200) return res.status(401).json({ error: 'invalid token' });
    next();
  } catch (e) {
    console.error('[requireAssumToken] chichi-server unreachable:', e.message);
    res.status(500).json({ error: 'auth check failed' });
  }
}

// ---------- 路由 ----------

app.get('/creationplan/api/progress', (req, res) => {
  try {
    const config = loadConfig();
    const progress = computeProgress(config, new Date());
    res.json(progress);
  } catch (e) {
    console.error('[GET /progress] 配置读取失败:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---------- 公开：造物库访问统计 ----------
// 思路：每个子站页面加载时 sendBeacon POST 一次（子站自带 day 参数）
// 不要求鉴权、不防 bot（v1）；后续可加 User-Agent 黑名单 + IP 频率限制
// 数据存 config.json 的 visits: { "1": { count, last } }

app.post('/creationplan/api/track-visit', (req, res) => {
  const err = validateTrackVisit(req.body);
  if (err) return res.status(400).json({ error: err });
  const day = req.body.day;
  try {
    const stat = recordVisit(day);
    res.json({ ok: true, day, count: stat.count });
  } catch (e) {
    console.error('[POST /track-visit] 写入失败:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 公开：外部链接 302 跳转（用于"造物库"卡片中点外链的项目，如飞书文档）
// 用法：href = "/creationplan/api/go?day=N&u=<encodeURIComponent(原URL)>"
// 流程：先校验 day 1-100 + u 是 http(s) URL（防 SSRF/open redirect）
//      → 记录一次访问 → 302 跳到原 URL
// 注意：计数失败也照常跳转，避免子站文案/卡片展示错误
app.get('/creationplan/api/go', (req, res) => {
  const err = validateGoRequest(req.query);
  if (err) return res.status(400).send(err);
  const day = Number(req.query.day);
  const u = String(req.query.u);
  try {
    recordVisit(day);
  } catch (e) {
    console.error('[GET /go] 计数失败（仍继续跳转）:', e.message);
  }
  res.redirect(302, u);
});

app.get('/creationplan/api/visit-stats', (req, res) => {
  try {
    const config = loadConfig();
    // 返回完整 1-100 填充，缺失的为 { count: 0, last: null }
    const full = {};
    for (let i = 1; i <= 100; i++) {
      const k = String(i);
      full[k] = config.visits[k] || { count: 0, last: null };
    }
    res.json({ visits: full });
  } catch (e) {
    console.error('[GET /visit-stats] 读取失败:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get('/creationplan/api/admin/state', requireAssumToken, (req, res) => {
  try {
    const config = loadConfig();
    res.json({
      start_date: config.start_date,
      submitted_count: config.submitted_count,
      day_tools: config.day_tools,
    });
  } catch (e) {
    console.error('[GET /admin/state] 配置读取失败:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.put('/creationplan/api/admin/state', requireAssumToken, (req, res) => {
  const err = validateState(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const config = loadConfig();
    config.start_date = req.body.start_date;
    config.submitted_count = req.body.submitted_count;
    saveConfigRaw(config);
    res.json({ ok: true });
  } catch (e) {
    console.error('[PUT /admin/state] 写入失败:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.put('/creationplan/api/admin/day-tool', requireAssumToken, (req, res) => {
  const err = validateDayTool(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const config = loadConfig();
    if (req.body.name === '') {
      delete config.day_tools[String(req.body.day)];
    } else {
      config.day_tools[String(req.body.day)] = req.body.name;
    }
    saveConfigRaw(config);
    res.json({ ok: true });
  } catch (e) {
    console.error('[PUT /admin/day-tool] 写入失败:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ---------- 启动 ----------

// 启动时确保 config 存在
try {
  loadConfig();
  console.log('[startup] config 已加载');
} catch (e) {
  console.error('[startup] config 加载失败:', e.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`creationplan server listening on http://127.0.0.1:${PORT}`);
});
