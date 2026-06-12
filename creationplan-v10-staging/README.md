# 造物计划 · Creation Plan

黏豆包个人门户站下的"造物计划"一级子站及下属二级子站。

V10 · 2026-06-13 打包（线上运行版本同步）

## 这是什么

一个公开的个人项目计划展示页 + 子站集合，主题是"100 天造物计划"。

- **入口**：[`/creationplan/`](creationplan/) — 主页，全宽海报 + 5 个热点（造物库 / 关于计划 / 提交需求飞书表单 / 进入造物库 / 提交需求飞书表单）+ 进度卡（0/100 天 · 6 节点时间线 Day 1/20/40/60/80/100）
- **关于计划**：[`/creationplan/about/`](creationplan/about/) — 7 张小红书风格图文竖排，顶部 sticky nav 含"▶ 自动浏览"按钮（4s/页，滚轮/触屏即停），底部 CTA 跳飞书表单
- **造物库**：[`/creationplan/repositories/`](creationplan/repositories/) — 深蓝紫星空 + 玻璃卡片，6 张占位卡（Day 1~Day 6，draft tag "○ 待建"），大搜索框做基础 input 过滤；上线项目类卡会按"新→旧"排前面

## 文件结构

```
creationplan/
├── index.html              # 主页（约 17KB）
├── about/
│   ├── index.html          # 关于计划子页（约 14KB）
│   └── image1.png ~ image7.png  # 7 张小红书图文（每张约 1.5-1.8MB）
├── repositories/
│   └── index.html          # 造物库子页（约 20KB）
└── assets/
    ├── creationplan-hero2.png  # 主页海报（1.4MB, 1536×1024）
    ├── icon.png                # Day 1 头像（124KB, 338×310）
    └── logo.svg                # 站点 logo（375 字节）
```

总大小：约 12MB（绝大部分是 7 张 about 图）

## 本地预览

任一静态服务器即可，例如：

```bash
cd creationplan
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

## 部署

把 `creationplan/` 整个目录放到任何静态托管（Nginx / GitHub Pages / Vercel / Netlify）即可，**不需要后端**。所有路径都是相对的，可以放在子路径或根路径。

如果沿用 im-niandoubao.com 的部署方式（`/creationplan/` 子路径 + 资源在 site root `/assets/`），需要在 `index.html`、`about/index.html`、`repositories/index.html` 里把 `assets/...` 和 `../assets/...` 改回 `/assets/...`。

## 版本

| 版本 | 日期 | 备注 |
|---|---|---|
| V10 | 2026-06-13 | 当前打包版本。`creationplan/assets/` 整合，路径全部相对化，可独立部署 |
| V9  | 2026-06-12 | 上一次 GitHub 上传版本，结构和 V10 基本一致，但 assets 散落在主站 |

## 设计要点

- **配色**：宝蓝 #2952b8 + 紫粉渐变 / 浅蓝 #c5d9f4 / 玻璃质感 / ZCOOL KuaiLe 标题 + Noto Sans SC 正文
- **首页热点**：`href="javascript:void(0)"` 占位（飞书表单除外，链 `https://wcn80tpe0889.feishu.cn/share/base/form/shrcnUuxHWRV42AloeP03aulLHh`，`target="_blank"`）
- **造物库排序规则**：占位卡按 Day 1→100 升序；已上线项目按上线时间新→旧
- **已下线/历史**：V3 用的 `creationplan-hero.png`（1.5MB）已废弃但保留在主站 `/assets/`，本包未带

## 已知 placeholder（V10 状态下）

- 主页"0/100 天"和"0 人已提交需求"两个数字未接后端
- 主页 6 个时间线节点（Day 20/40/60/80/100）均 `href="#"`
- 造物库"进入造物库"主页 CTA = 跳本页，等以后做真的三级子站
- 关于计划"写在 Day 0"是占位文案，暂无后台编辑能力
