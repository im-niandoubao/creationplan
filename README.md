# 100 天造物计划

这是 [im-niandoubao.com/creationplan](https://im-niandoubao.com/creationplan/)
当前线上版本的源码镜像，包含造物计划页面、造物库入口和已上线的本地项目。

## 目录

```text
.
├── assets/                         造物计划公共图片
├── creationplan/
│   ├── index.html                  计划首页
│   ├── about/                      Day 0 介绍
│   ├── repositories/
│   │   ├── index.html              100 天造物库入口
│   │   ├── worldcup2026/           Day 1 · 世界杯赛程推荐
│   │   ├── wordgood/               Day 3 · 标点整理台
│   │   ├── yourmoney/              Day 4 · 小钱钱计时器
│   │   ├── duanwuguoxue/           Day 5 · 端午诗词挑战
│   │   ├── aiclean/                Day 6 · AI 回答清洗
│   │   └── myfather/               Day 7 · 那天，他第一次当爸爸
│   └── server/                     进度、访问统计和后台 API
└── moyu/                           仓库中保留的历史摸鱼扩展
```

Day 2 当前在造物库中指向飞书文档，因此没有对应的本地项目目录。

`worldcup2026` 和 `myfather` 的项目后端放在各自的 `server/` 中。

## 运行时文件

以下内容不进入 Git：

- `.env`
- `node_modules/`
- SQLite 数据库
- `creationplan/server/config.json`

仓库只保留不含真实密钥的 `.env.example`。

## 本地预览

```bash
python3 -m http.server 8000
```

打开 `http://localhost:8000/creationplan/`。需要调用 API 的项目还需启动对应的
`server/`，并配置与线上等价的反向代理。
