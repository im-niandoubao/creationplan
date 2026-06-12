# 100天造物计划 · 粘豆包

> "你的需求，一天实现 ✦" —— 把好点子变成能用的小工具

公开子站，挂在 [im-niandoubao.com/creationplan/](https://im-niandoubao.com/creationplan/)。

## 这是什么

一个 100 天造物计划落地页。全宽海报 + 5 个热点 + 6 节点时间线展示造物进度。两个"提交需求"按钮跳转飞书表单收需求。

## 仓库结构

```
im-niandoubao-creationplan/
├── README.md                              本文件
├── creationplan/
│   └── index.html                         落地页主文件 (17KB, 单文件, 全部样式内联)
└── assets/
    ├── creationplan-hero2.png             1.4MB 1536×1024 海报底图（v9 用）
    ├── icon.png                           124KB 338×310 Day 1 头像（3D 紫衣持星棒角色）
    └── logo.svg                           favicon（复用主站）
```

## 本地预览

```bash
# 方式 1：直接双击打开
open creationplan/index.html

# 方式 2：起个静态服务器（推荐，能正确解析 /assets/ 绝对路径）
cd /Users/assum/projects/im-niandoubao-creationplan
python3 -m http.server 8000
# 浏览器开 http://localhost:8000/creationplan/
```

> 注意：HTML 里的图片路径是 `/assets/...`（绝对路径，从站点根算起）。
> 直接双击打开能跑但图片可能 404；用 http.server 跑最稳。

## 跟 im-niandoubao 主站的关系

这个仓库是**子模块的源码视图**，实际部署在主站仓库 `/Users/assum/projects/im-niandoubao` 里：

- `creationplan/index.html` → 部署到主站的 `/creationplan/index.html`
- `assets/*` → 部署到主站的 `/assets/*`

主站是单一信任源（生产环境直接 scp 单文件），这个 GitHub 仓库是**版本控制和可分享视图**。

## 设计迭代

从 v1 纯文字占位迭代到 v9 当前视觉，迭代日志见主站仓库的 git log（搜索 `creationplan`）。关键决策点：

- v2：完整设计稿（26.6KB）
- v3-v4：改为整图作背景 + 热点叠加
- v5-v7：5 个热点加可见文字 + 进度卡
- v8-v9：CTA 微调 + Day1 头像换 icon.png

## 飞书表单

两个"提交需求"按钮（nav 蓝 + Hero 白）指向：

```
https://wcn80tpe0889.feishu.cn/share/base/form/shrcnUuxHWRV42AloeP03aulLHh
```

> 注：飞书表单统计在飞书侧，**当前 "0 人已提交需求" 数字未接后端**，是占位。
> 等后端接通后,这个 stat 才会从 0 变成真实数据。

## 后续扩展

- 造物库子页：已造工具的卡片列表
- 关于计划子页：100 天计划详细介绍
- 6 个时间线节点（Day 1/20/40/60/80/100）各跳一个故事页
- 进度时间线后端化：admin 加 Day N 已造物 → 页面动态读

## License

Private / 个人项目，未经允许请勿复用。
