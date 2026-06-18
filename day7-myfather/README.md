# 那一天 · My Father

输入出生日期和城市，生成一段关于“爸爸第一次见我”的克制、纪录片式滚动故事。

## 本地运行

```bash
npm install
cp .env.example .env
npm run dev
```

浏览器访问 `http://localhost:5173`。

没有配置 API Key 时，页面会使用本地年代与地域素材生成完整故事，所有交互仍可体验。

## 接入 DeepSeek

编辑 `.env`：

```env
DEEPSEEK_API_KEY=你的_API_Key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

LLM 请求只从 `server/index.js` 发出，API Key 不会暴露到浏览器。

预留的核心前端函数位于 `src/story.js`：

```js
generateBirthStory(userInput, derivedData, eraData, cityData)
```

## 生产运行

```bash
npm run build
npm start
```

默认服务地址为 `http://localhost:3001`。
