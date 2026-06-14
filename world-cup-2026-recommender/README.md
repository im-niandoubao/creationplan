# 2026 世界杯赛程推荐 · World Cup 2026 Recommender

一个用偏好筛选帮你找到值得熬夜看的 2026 世界杯比赛的工具。

输入自然语言（"我在中国不想熬夜"、"喜欢阿根廷和梅西"），AI（DeepSeek）会解析成结构化偏好，匹配本地赛程数据，输出"高匹配"列表。

> 站点灵感来自体育场记分牌 + 编辑海报：pitch 绿 + 奖杯金 + 奶油底，Archivo Black + Sora + JetBrains Mono。

---

## 功能

- **AI 偏好解析**：用自然语言描述需求，DeepSeek 转成结构化偏好（球队、球员、风格、时段、避雷项）
- **快速偏好开关**：不熬夜 / 周末 / 焦点战 三个 toggle 叠加在 AI 解析之上
- **多维度打分**：阶段权重（小组赛 → 决赛）+ 重磅球队 + 风格 + 时段
- **TBD 淘汰赛过滤**：对阵未定的 R32/R16/QF/SF 自动从推荐池剔除，等赛果更新后再入池
- **多语言标点归一**：所有偏好字段中英兼容（"中国" "China" "阿根廷" "Argentina" 都行）
- **赛中/未开赛标签**：开赛未完赛的比赛自动显 "🟥 比赛中" 标识
- **拉取最新赛程**：内置 ESPN API 拉取脚本，一行命令刷新到 `public/data/`

### 偏好维度

| 维度 | 说明 |
|---|---|
| 球队 | 48 队英文白名单，从输入中提取 |
| 球员 | top 8，按名字匹配（轻量启发式） |
| 风格 | attacking / control / speed / defensive / underdog |
| 比赛类型 | focus（焦点战） / knockout / rivalry / host（东道主） / replay（重赛） |
| 时段 | avoidNight（北京时间 ≥ 凌晨 2 点不推）/ acceptNight（接受）/ preferWeekend / preferWeekday |
| 重磅 | 双方都是"重磅队"（阿巴英法德西葡荷比乌墨美加摩）加高分 |

---

## 技术栈

- **前端**：Vite 8 + React 19 + lucide-react
- **样式**：原生 CSS（变量 + 网格 + 动画）
- **构建**：`vite build --base=/creationplan/repositories/worldcup2026/`
- **AI 代理**：DeepSeek Chat Completions（system prompt 强制 JSON 输出）
- **数据源**：ESPN 公开 scoreboard API

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 DeepSeek（可选；不配则 AI 解析降级为纯规则）
cp .env.example .env
# 编辑 .env 填入 DEEPSEEK_API_KEY

# 3. 拉取最新赛程（可选；用仓库自带的快照也能跑）
npm run update:schedule

# 4. 起 dev server
npm run dev
# → http://localhost:5173

# 5. 打包
npm run build
# → dist/
```

### 环境变量

| 变量 | 必填 | 默认 | 说明 |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | 否 | 空 | 不填则 `/api/parse-preference` 返回 501，AI 解析不可用 |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com` | 自建代理时可改 |
| `DEEPSEEK_MODEL` | 否 | `deepseek-v4-flash` |  |

### NPM 脚本

| 脚本 | 作用 |
|---|---|
| `npm run dev` | 启动 Vite dev server（带 `/api/ai-status` + `/api/parse-preference` mock） |
| `npm run build` | 生产构建到 `dist/` |
| `npm run preview` | 预览 `dist/`（同样带 API mock） |
| `npm run update:schedule` | 从 ESPN 拉取最新 2026 世界杯赛程到 `public/data/worldcup-2026-schedule.json` |

---

## 项目结构

```
world-cup-2026-recommender/
├── index.html                # Vite 入口 HTML
├── package.json
├── vite.config.js            # 含 deepseekPreferencePlugin（注入 /api/* 到 dev/preview）
├── .env.example
├── public/
│   └── data/
│       └── worldcup-2026-schedule.json   # 2026 完整赛程（104 场）
├── scripts/
│   └── update-schedule.mjs   # ESPN API 拉取脚本
├── src/
│   ├── main.jsx              # React 入口
│   ├── App.jsx               # 主组件（推荐 + 偏好 + MatchCard）
│   └── styles.css            # 全部样式
├── README.md
├── LICENSE
└── .gitignore
```

---

## 部署到子站

本项目是作为父站的子站部署的（`/creationplan/repositories/worldcup2026/`）。要点：

- **路径前缀**：构建时务必带 `--base=/your/subpath/`，否则 assets 走根域
- **API 路由**：dev/preview 走 Vite 中间件，**生产环境需要单独跑后端**（同样的 DeepSeek 调用逻辑，建议 Express/Node 直写一遍或用 Vite 中间件导出）
- **静态服务**：Nginx `location` 用 `alias` + `try_files $uri $uri/ .../index.html`

---

## AI 偏好解析的设计

`vite.config.js` 里的 `deepseekPreferencePlugin` 在 dev/preview 注入 2 个端点：

- `GET /api/ai-status` → `{ enabled, baseUrl, model }`
- `POST /api/parse-preference` body `{ text }` → 调 DeepSeek → 校验 → 归一 → 返回

System prompt 关键约束：

- "你是 2026 世界杯观赛偏好解析器，**只输出 JSON 对象，不要 Markdown**"
- "所有时间/熬夜/周末/工作日判断都以**北京时间 Asia/Shanghai** 为准"
- "**不要编造赛程**，只解析用户偏好"

`preferredTeams` 强制从 48 队白名单选（`KNOWN_TEAMS` 在 `vite.config.js` 顶部），其他字段强制类型校验 + 数组截断到 8 个。

---

## 许可

MIT License - 详见 [LICENSE](./LICENSE)
