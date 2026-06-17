# 小钱钱计时器 (yourmoney)

> 工资秒级可视化：填一下月薪/时薪，今天为止你「已经赚了多少」实时滚动。

![status](https://img.shields.io/badge/status-live-4ADE80) ![size](https://img.shields.io/badge/size-35KB-blue) ![deps](https://img.shields.io/badge/deps-zero-success)

## 在线预览

部署版：<https://im-niandoubao.com/creationplan/repositories/yourmoney/>

这是 **100 天造物计划 Day 4** 的产物——[im-niandoubao 造物库](https://im-niandoubao.com/creationplan/repositories/) 收录的所有小工具集合。

## 它是什么

把月薪/年薪按**实际工作时间**（扣休息日）折算成每秒收入，屏幕上滚动显示从今天上班开始你已经赚了多少。
主打「假装自己在赚钱」的氛围感，配深色金黄配色 + 黑底绿涨数字。

### 主要功能

- **工资换算台**：输入月薪或年薪，选择工作周期（月/年）
- **工作日程**：自定义每周休息日（大休/小休/固定休）
- **起始偏移**：`initialMinutes` 字段——比如你中午 12 点才打开网页，填 240 表示你已经上 4 小时班
- **实时累计**：每 100ms 刷新当前已赚金额，按秒跳
- **收益小窗**：右上角 ↗ 按钮弹出迷你窗口，可以挂在屏幕角落常驻看（自动滚动，不抢主屏注意力）

### 截图（建议截一张）

*（部署到 GitHub Pages 后补图）*

## 文件结构

```
yourmoney-v1/
├── README.md         # 本文件
├── .gitignore
└── index.html        # 全部代码（CSS + JS 内联，35KB，单文件）
```

零依赖，零构建步骤，零外部资源。

## 本地预览

直接双击 `index.html` 浏览器打开即可，或：

```bash
cd yourmoney-v1
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 部署

任何静态托管都行：

- **GitHub Pages**：推到仓库 → Settings → Pages → 选 main 分支根目录
- **Netlify / Vercel**：拖拽文件夹直接部署
- **自己的服务器**：`scp index.html user@server:/var/www/yourmoney/`

无需 Node.js / npm / 任何运行时。

## 关于头部那段跟踪脚本

`index.html` 第 7-19 行有一段：

```html
<script>
  // 累计使用人次追踪（造物库：Day 4 = 你最能赚钱啦）
  (function() {
    try {
      fetch('/creationplan/api/track-visit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ day: 4 }),
        keepalive: true
      });
    } catch (e) {}
  })();
</script>
```

这是 [im-niandoubao 造物库](https://im-niandoubao.com/creationplan/repositories/) 的访问统计，部署到 im-niandoubao.com 子路径下时正常工作。
**部署到其他服务器时会触发 404**，但被 `try/catch` 包住，**不影响功能**，浏览器控制台会有一条 `Failed to fetch` 警告，可忽略。

### 想去掉这段？

删掉 `<head>` 里第 7-19 行整段 `<script>...</script>` 即可，共 13 行。

## 自定义

### 改默认工资

`index.html` 第 648 行：

```html
<input id="salary" name="salary" type="number" inputmode="decimal" min="0" step="100" value="12000">
```

把 `value="12000"` 改成你的月薪。

### 改默认休息日

第 681-682 行（`fixedRest` 周六周日默认勾选）、第 695 行（`bigRest` 周日默认）、第 705 行（`smallRest` 周六默认）。
去掉 `checked` 即不勾选，加上 `checked` 即勾选。

### 改配色

CSS `:root` 变量在第 8-19 行：

```css
--ink: #fff7dc;       /* 主文字色（米黄） */
--paper: #140f0b;     /* 背景色（深棕近黑） */
--green: #32d083;     /* 数字上涨色 */
--gold-hot: #ffab2e;  /* 高亮金黄 */
--red: #ff4d55;       /* 警示红 */
```

## 版本

| 版本 | 日期 | 备注 |
|---|---|---|
| v1   | 2026-06-18 | 首版上线，作为 100 天造物计划 Day 4 发布 |

## License

MIT —— 随便用，标不标来源都行。