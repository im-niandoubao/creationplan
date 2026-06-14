import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const KNOWN_TEAMS = [
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Bosnia-Herzegovina",
  "Brazil",
  "Canada",
  "Cape Verde",
  "Colombia",
  "Congo DR",
  "Croatia",
  "Curaçao",
  "Czechia",
  "Ecuador",
  "Egypt",
  "England",
  "France",
  "Germany",
  "Ghana",
  "Haiti",
  "Iran",
  "Iraq",
  "Ivory Coast",
  "Japan",
  "Jordan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Panama",
  "Paraguay",
  "Portugal",
  "Qatar",
  "Saudi Arabia",
  "Scotland",
  "Senegal",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Tunisia",
  "Türkiye",
  "United States",
  "Uruguay",
  "Uzbekistan"
];

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 20000) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function extractJsonObject(content) {
  const trimmed = content.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Model response did not contain JSON");
  return JSON.parse(match[0]);
}

function normalizePreference(raw) {
  const object = raw && typeof raw === "object" ? raw : {};
  const preferredTeams = Array.isArray(object.preferredTeams)
    ? object.preferredTeams.filter((team) => KNOWN_TEAMS.includes(team))
    : [];
  const styles = Array.isArray(object.styles)
    ? object.styles.filter((style) => ["attacking", "control", "speed", "defensive", "underdog"].includes(style))
    : [];
  const matchTypes = Array.isArray(object.matchTypes)
    ? object.matchTypes.filter((type) => ["focus", "knockout", "rivalry", "host", "replay"].includes(type))
    : [];

  return {
    preferredTeams,
    preferredPlayers: Array.isArray(object.preferredPlayers) ? object.preferredPlayers.slice(0, 8).map(String) : [],
    avoidNight: object.avoidNight === true,
    acceptNight: object.acceptNight === true,
    preferWeekend: object.preferWeekend === true,
    preferWeekday: object.preferWeekday === true,
    styles,
    matchTypes,
    explanation: typeof object.explanation === "string" ? object.explanation.slice(0, 160) : ""
  };
}

async function handleParsePreference(request, response, apiConfig) {
  const apiKey = apiConfig.apiKey;
  if (!apiKey) {
    sendJson(response, 501, {
      error: "DEEPSEEK_API_KEY is not configured",
      model: apiConfig.model
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const userText = String(body.text ?? "").slice(0, 2000);
    if (!userText.trim()) {
      sendJson(response, 400, { error: "text is required" });
      return;
    }

    const upstream = await fetch(`${apiConfig.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: apiConfig.model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "你是2026世界杯观赛偏好解析器。只输出一个JSON对象，不要Markdown。所有时间、熬夜、周末、工作日判断都以北京时间Asia/Shanghai为准。不要编造赛程，只解析用户偏好。"
          },
          {
            role: "user",
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

preferredTeams只能从这个英文名单中选择：${KNOWN_TEAMS.join(", ")}
用户输入：${userText}`
          }
        ]
      })
    });

    if (!upstream.ok) {
      const errorText = await upstream.text();
      sendJson(response, upstream.status, {
        error: "DeepSeek request failed",
        detail: errorText.slice(0, 500),
        model: apiConfig.model
      });
      return;
    }

    const payload = await upstream.json();
    const content = payload.choices?.[0]?.message?.content ?? "";
    const preference = normalizePreference(extractJsonObject(content));
    sendJson(response, 200, {
      source: "deepseek",
      model: apiConfig.model,
      preference
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unknown error",
      model: apiConfig.model
    });
  }
}

function deepseekPreferencePlugin(apiConfig) {
  const installMiddlewares = (server) => {
    server.middlewares.use("/api/ai-status", (_request, response) => {
      sendJson(response, 200, {
        enabled: Boolean(apiConfig.apiKey),
        baseUrl: apiConfig.baseUrl,
        model: apiConfig.model
      });
    });
    server.middlewares.use("/api/parse-preference", (request, response, next) => {
      if (request.method !== "POST") {
        next();
        return;
      }
      handleParsePreference(request, response, apiConfig);
    });
  };

  return {
    name: "deepseek-preference-api",
    configureServer(server) {
      installMiddlewares(server);
    },
    configurePreviewServer(server) {
      installMiddlewares(server);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiConfig = {
    apiKey: process.env.DEEPSEEK_API_KEY ?? env.DEEPSEEK_API_KEY ?? "",
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    model: process.env.DEEPSEEK_MODEL ?? env.DEEPSEEK_MODEL ?? "deepseek-v4-flash"
  };

  return {
    plugins: [react(), deepseekPreferencePlugin(apiConfig)]
  };
});
