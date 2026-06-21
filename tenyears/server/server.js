import "dotenv/config";
import express from "express";

const app = express();
const port = Number(process.env.PORT || 3005);
const milestoneYears = [1, 3, 5, 10];
const requestWindows = new Map();

app.use(express.json({ limit: "16kb" }));
app.set("trust proxy", "loopback");

function limitAnalysisRequests(request, response, next) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 12;
  const key = request.ip || "unknown";
  const recent = (requestWindows.get(key) || []).filter(
    (timestamp) => now - timestamp < windowMs,
  );

  if (recent.length >= maxRequests) {
    return response.status(429).json({
      code: "RATE_LIMITED",
      message: "这段时间显影得有点多，请稍后再试。",
    });
  }

  recent.push(now);
  requestWindows.set(key, recent);
  return next();
}

function extractNumber(input, fallback) {
  const arabic = input.match(/\d+(?:\.\d+)?/);
  if (arabic) return Number(arabic[0]);

  const chineseNumbers = {
    一: 1,
    两: 2,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  const match = Object.entries(chineseNumbers).find(([character]) =>
    input.includes(character),
  );
  return match?.[1] || fallback;
}

function formatNumber(number) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 0,
  }).format(number);
}

function calculateFacts(change) {
  const completionRate = 0.8;
  const activeDays = 365 * completionRate;
  const isTimeAction =
    /书|阅读|读书|文章|学习|运动|跑步|健身|走路|散步|游泳|瑜伽|骑行|手机|短视频|刷屏|社交媒体/.test(
      change,
    );

  if (isTimeAction) {
    const defaultMinutes = /书|阅读|读书|文章|学习/.test(change) ? 10 : 30;
    let minutes = extractNumber(change, defaultMinutes);
    if (/半小时/.test(change)) {
      minutes = 30;
    } else if (/小时/.test(change) && !/分钟|分/.test(change)) {
      minutes *= 60;
    }
    const direction = /手机|短视频|刷屏|社交媒体/.test(change)
      ? "归还"
      : "投入";

    return {
      assumptions: [
        "按大约 80% 的现实完成率估算，允许旅行、生病、忙碌和偶尔中断。",
        `将输入理解为每天${direction} ${minutes} 分钟。`,
        "累计时长是确定性计算，不代表每一分钟产生相同质量。",
      ],
      annualMetric: `每年约${direction} ${formatNumber((minutes * activeDays) / 60)} 小时`,
      totalMetric: `十年约${direction} ${formatNumber((minutes * activeDays * 10) / 60)} 小时`,
      milestones: milestoneYears.map((year) => ({
        year,
        metric: `${year} 年累计约 ${formatNumber((minutes * activeDays * year) / 60)} 小时`,
      })),
    };
  }

  if (/存钱|攒钱|储蓄|存下|省下/.test(change)) {
    const amount = extractNumber(change, 20);
    return {
      assumptions: [
        "按大约 80% 的现实完成率估算，允许旅行、生病、忙碌和偶尔中断。",
        `将输入理解为每次存下 ${amount} 元。`,
        "只计算本金，不包含利息、投资收益和通胀影响。",
      ],
      annualMetric: `每年约存下 ${formatNumber(amount * activeDays)} 元`,
      totalMetric: `十年本金约 ${formatNumber(amount * activeDays * 10)} 元`,
      milestones: milestoneYears.map((year) => ({
        year,
        metric: `${year} 年本金约 ${formatNumber(amount * activeDays * year)} 元`,
      })),
    };
  }

  if (/可乐|汽水|奶茶|含糖|饮料/.test(change)) {
    const servings = extractNumber(change, 1);
    return {
      assumptions: [
        "按大约 80% 的现实完成率估算，允许旅行、生病、忙碌和偶尔中断。",
        `将输入理解为每天 ${servings} 份饮料，但不假定具体容量和配方。`,
        "不计算糖、热量或咖啡因总量，因为品牌与容量信息不足。",
      ],
      annualMetric: `每年约 ${formatNumber(servings * activeDays)} 份`,
      totalMetric: `十年约 ${formatNumber(servings * activeDays * 10)} 份`,
      milestones: milestoneYears.map((year) => ({
        year,
        metric: `${year} 年累计约 ${formatNumber(servings * activeDays * year)} 份`,
      })),
    };
  }

  const frequency = extractNumber(change, 1);
  return {
    assumptions: [
      "按大约 80% 的现实完成率估算，允许旅行、生病、忙碌和偶尔中断。",
      "将输入理解为每天重复一次；如果原意不同，累计数字需要相应调整。",
      "累计次数是确定性计算，不代表每次行动产生相同价值。",
    ],
    annualMetric: `每年约重复 ${formatNumber(frequency * activeDays)} 次`,
    totalMetric: `十年约重复 ${formatNumber(frequency * activeDays * 10)} 次`,
    milestones: milestoneYears.map((year) => ({
      year,
      metric: `${year} 年累计约 ${formatNumber(frequency * activeDays * year)} 次`,
    })),
  };
}

const systemPrompt = `你是一位克制、诚实的长期行为观察者。你的任务不是预言，而是基于用户输入和程序已经计算好的事实，推演一个行为在第 1、3、5、10 年可能产生的影响。

必须遵守：
1. 只输出合法 JSON，不要 Markdown，不要解释。
2. 不能修改 providedFacts 中 annualMetric、totalMetric、milestones[].metric 的任何文字或数字。
3. 使用“可能”“通常”“在这些条件下”等措辞，不承诺健康、财富、职业或关系结果。
4. 同时写收益、代价、机会成本和不确定性，避免励志鸡汤。
5. 不做医疗诊断或投资建议。
6. milestones 必须恰好四项，year 顺序必须是 1、3、5、10。
7. dimensions 必须恰好四项；tone 只能是 gain、mixed、watch。
8. 中文要简洁、有画面感，每个 narrative 不超过 90 个汉字，其他说明不超过 60 个汉字。

JSON 结构：
{
  "title": "对行为的简洁重述",
  "normalizedAction": "用户原始输入",
  "summary": "十年总体判断",
  "annualMetric": "原样复制 providedFacts.annualMetric",
  "totalMetric": "原样复制 providedFacts.totalMetric",
  "milestones": [
    {
      "year": 1,
      "label": "这一阶段的短标签",
      "title": "阶段标题",
      "narrative": "主要变化",
      "metric": "原样复制对应 providedFacts metric",
      "turningPoint": "开始影响其他领域的方式",
      "caution": "代价或不确定性"
    }
  ],
  "dimensions": [
    { "name": "影响维度", "tone": "gain", "text": "影响说明" }
  ],
  "assumptions": [
    "原样复制 providedFacts.assumptions 的第一项",
    "原样复制 providedFacts.assumptions 的第二项",
    "原样复制 providedFacts.assumptions 的第三项"
  ],
  "closing": "一句克制的收束"
}`;

function extractJson(content) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

function isValidAnalysis(analysis, facts) {
  return (
    analysis &&
    typeof analysis.title === "string" &&
    typeof analysis.normalizedAction === "string" &&
    typeof analysis.summary === "string" &&
    analysis.annualMetric === facts.annualMetric &&
    analysis.totalMetric === facts.totalMetric &&
    Array.isArray(analysis.milestones) &&
    analysis.milestones.length === 4 &&
    analysis.milestones.every(
      (milestone, index) =>
        milestone.year === milestoneYears[index] &&
        milestone.metric === facts.milestones[index].metric &&
        typeof milestone.title === "string" &&
        typeof milestone.narrative === "string" &&
        typeof milestone.turningPoint === "string" &&
        typeof milestone.caution === "string",
    ) &&
    Array.isArray(analysis.dimensions) &&
    analysis.dimensions.length === 4 &&
    analysis.dimensions.every(
      (dimension) =>
        typeof dimension.name === "string" &&
        ["gain", "mixed", "watch"].includes(dimension.tone) &&
        typeof dimension.text === "string",
    ) &&
    Array.isArray(analysis.assumptions) &&
    analysis.assumptions.length === facts.assumptions.length &&
    analysis.assumptions.every(
      (assumption, index) => assumption === facts.assumptions[index],
    ) &&
    typeof analysis.closing === "string"
  );
}

app.post("/api/analyze", limitAnalysisRequests, async (request, response) => {
  const change =
    typeof request.body?.change === "string" ? request.body.change.trim() : "";

  if (!change || change.length > 120) {
    return response.status(400).json({
      code: "INVALID_CHANGE",
      message: "请输入 1 到 120 个字符的改变。",
    });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      code: "API_KEY_MISSING",
      message: "尚未配置模型服务，前端将使用本地显影结果。",
    });
  }

  const facts = calculateFacts(change);
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
        temperature: 0.55,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({ change, providedFacts: facts }, null, 2),
          },
        ],
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      throw new Error(`DeepSeek ${upstream.status}: ${detail.slice(0, 300)}`);
    }

    const payload = await upstream.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("模型未返回分析内容");

    const analysis = extractJson(content);
    if (!isValidAnalysis(analysis, facts)) {
      throw new Error("模型返回的分析结构或确定性数字不正确");
    }

    return response.json({ analysis, source: "deepseek", model });
  } catch (error) {
    console.error(error);
    return response.status(502).json({
      code: "UPSTREAM_ERROR",
      message: "显影暂时没有成功，前端将使用本地结果。",
    });
  }
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Ten Years server listening on http://127.0.0.1:${port}`);
});
