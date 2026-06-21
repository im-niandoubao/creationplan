import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");

app.use(express.json({ limit: "1mb" }));

const systemPrompt = `你是一位克制、温柔、纪录片风格的中文作者。请根据用户出生日期、城市、性别、年代背景和城市素材，生成一个沉浸式滚动网页故事。

必须遵守：
1. 不声称知道真实经历，多用“也许”“或许”“可能”。
2. 不要过度煽情，不使用“父爱如山”“泪流满面”“伟大无私”等套话。
3. 不编造具体新闻事件，不写真实医院名称。
4. 不写具体天气，除非输入材料明确提供。
5. 每屏 30 到 80 个汉字，语言平实，有画面感。
6. 输出恰好 9 个 slides，依次涵盖：日期、时代、城市、医院、等待、出生、成为爸爸、时间流逝、短笺。
7. 只输出合法 JSON，不要 Markdown，不要解释。

JSON 结构：
{
  "title": "回到我出生的那一天",
  "slides": [
    { "type": "date", "eyebrow": "第一幕", "title": "标题", "text": "正文" }
  ],
  "finalCard": {
    "title": "爸爸第一次见我的那一天",
    "quote": "一句克制的短句"
  }
}`;

function extractJson(content) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function isValidStory(story) {
  return (
    story &&
    typeof story.title === "string" &&
    Array.isArray(story.slides) &&
    story.slides.length >= 8 &&
    story.slides.every(
      (slide) =>
        typeof slide.title === "string" && typeof slide.text === "string",
    ) &&
    typeof story.finalCard?.title === "string" &&
    typeof story.finalCard?.quote === "string"
  );
}

app.post("/api/story", async (request, response) => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      code: "API_KEY_MISSING",
      message: "尚未配置 DEEPSEEK_API_KEY，已可使用前端本地故事。",
    });
  }

  const baseUrl = (
    process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  ).replace(/\/$/, "");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.78,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify(request.body, null, 2),
          },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      throw new Error(`DeepSeek ${upstream.status}: ${detail.slice(0, 500)}`);
    }

    const payload = await upstream.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("模型未返回故事内容");

    const story = extractJson(content);
    if (!isValidStory(story)) throw new Error("模型返回的故事结构不完整");

    return response.json({ story, source: "deepseek", model });
  } catch (error) {
    console.error(error);
    return response.status(502).json({
      code: "UPSTREAM_ERROR",
      message: "故事生成暂时没有成功，请稍后重试。",
    });
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(distPath));
  app.use((_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`My Father server listening on http://localhost:${port}`);
});
