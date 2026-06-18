import {
  ERA_LIBRARY,
  FEATURED_CITIES,
  REGION_BY_PROVINCE,
  TIME_PERIODS,
} from "./data";

const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const seasons = {
  1: "冬季",
  2: "冬季",
  3: "初春",
  4: "春季",
  5: "暮春",
  6: "初夏",
  7: "盛夏",
  8: "盛夏",
  9: "初秋",
  10: "秋季",
  11: "深秋",
  12: "冬季",
};

function normalizeCity(city) {
  return city.replace(/市|地区|自治州|盟|特别行政区/g, "");
}

function getEraKey(year) {
  const decade = Math.floor(year / 10) * 10;
  return Math.min(2020, Math.max(1950, decade));
}

function getTimePeriod(time) {
  if (!time) return { label: "那一刻", mood: "钟表照常向前走，等待的人却会觉得每一分钟都被拉长" };
  const hour = Number(time.split(":")[0]);
  return TIME_PERIODS.find((period) => hour < period.end) || TIME_PERIODS[0];
}

function getFatherStage(age) {
  if (!age) return "也许同很多第一次成为父亲的人一样，他在期待里带着一点不知所措";
  if (age < 25) return "他还很年轻，可能努力装得镇定，手脚却不知道该往哪里放";
  if (age < 35) return "他正站在人生逐渐安定的阶段，期待里仍有第一次的手足无措";
  if (age < 45) return "他或许比年轻时更沉稳，把紧张收进很少的话和反复的踱步里";
  return "他走过了更多人生路，可能显得克制稳重，心里却仍在迎接一个全新的身份";
}

export function deriveBirthData(input) {
  const date = new Date(`${input.birthDate}T12:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const era = ERA_LIBRARY[getEraKey(year)];
  const cityKey = normalizeCity(input.city);
  const region = REGION_BY_PROVINCE[input.province] || ["中国", "地域辽阔，每座城都有自己的生活声响"];
  const featured = FEATURED_CITIES[cityKey];
  const timePeriod = getTimePeriod(input.birthTime);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bornAt = new Date(`${input.birthDate}T00:00:00`);
  const daysSinceBirth = Math.max(0, Math.floor((today - bornAt) / 86400000));
  const fatherBirthYear = input.fatherBirthYear
    ? Number(input.fatherBirthYear)
    : null;
  const fatherAge =
    fatherBirthYear && fatherBirthYear <= year ? year - fatherBirthYear : null;

  return {
    year,
    month,
    day: date.getDate(),
    weekday: weekdays[date.getDay()],
    season: seasons[month],
    era: era.label,
    fatherBirthYear,
    fatherAge,
    region: region[0],
    climate: region[1],
    cityTier: featured?.[0] || "熟悉的城市",
    cityAtmosphere: featured?.[1] || `${region[1]}。在更熟悉的街坊关系里，一条消息也许很快就能传到亲友耳边`,
    communication: era.communication,
    transport: era.transport,
    hospital: era.hospital,
    eraLife: era.life,
    timeLabel: timePeriod.label,
    timeMood: timePeriod.mood,
    fatherStage: getFatherStage(fatherAge),
    daysSinceBirth,
    fatherDays: daysSinceBirth,
  };
}

export function buildLocalStory(input, derived) {
  const child = input.gender === "female" ? "女孩" : "男孩";
  const fatherYear = derived.fatherBirthYear
    ? `他出生于 ${derived.fatherBirthYear} 年，那一年大约 ${derived.fatherAge} 岁。`
    : "";

  return {
    title: "回到我出生的那一天",
    slides: [
      {
        type: "date",
        eyebrow: "第一幕 · 日历",
        title: `${derived.year}年${derived.month}月${derived.day}日`,
        text: `${input.province.replace(/省|市|自治区|特别行政区/g, "")} · ${input.city.replace(/市/g, "")}，${derived.weekday}。那是${derived.season}里普通的一天，你第一次来到这个世界。`,
      },
      {
        type: "era",
        eyebrow: "第二幕 · 那一年",
        title: "世界还没有现在这么快",
        text: `${derived.era}，${derived.eraLife} 人们通常通过${derived.communication}传递一件重要的事。`,
      },
      {
        type: "city",
        eyebrow: "第三幕 · 那座城",
        title: "城市照常呼吸",
        text: `${input.city}，一座${derived.cityTier}。${derived.cityAtmosphere}。那天，街道并不知道一个家庭正在等待新的称呼。`,
      },
      {
        type: "hospital",
        eyebrow: "第四幕 · 走廊",
        title: "门的这一边",
        text: `也许他是乘着${derived.transport}赶到这里。${derived.hospital}。没有人知道他当时说了什么，只能想象他一次次望向那扇门。`,
      },
      {
        type: "waiting",
        eyebrow: `第五幕 · ${derived.timeLabel}`,
        title: "等待有自己的时钟",
        text: `${derived.timeMood}。他可能坐下，又站起来；也可能一直沉默，只把所有问题留在心里。`,
      },
      {
        type: "birth",
        eyebrow: "第六幕 · 门开了",
        title: `“恭喜，是个${child}。”`,
        text: `这句话也许很轻，却让世界从那一刻起有了不同的方向。你还不知道他的名字，他也还不知道该怎样成为爸爸。`,
      },
      {
        type: "father",
        eyebrow: "第七幕 · 新的身份",
        title: "他成为爸爸",
        text: `${fatherYear}${derived.fatherStage}。所谓成为父亲，也许并不是突然懂得一切，而是从此开始学习。`,
      },
      {
        type: "time",
        eyebrow: "第八幕 · 很多年以后",
        title: `${derived.daysSinceBirth.toLocaleString("zh-CN")} 天`,
        text: `从那一天到今天，已经过去了 ${derived.daysSinceBirth.toLocaleString("zh-CN")} 天。他也已经做了这么多天爸爸。日子很长，又像只是门开合的一瞬间。`,
      },
      {
        type: "letter",
        eyebrow: "第九幕 · 一封短笺",
        title: "如果那天的他，能给未来的你留一句话",
        text: "也许会是：我那时也不知道未来会怎样。只知道门打开时，我第一次听见你的消息，也第一次听见了一个新的自己。",
      },
    ],
    finalCard: {
      title: "爸爸第一次见我的那一天",
      quote: "那一天，你来到世界。他也第一次成为爸爸。",
    },
  };
}

export async function generateBirthStory(userInput, derivedData, eraData, cityData) {
  const localStory = buildLocalStory(userInput, derivedData);

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}api/story`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInput,
        derivedData,
        eraData,
        cityData,
      }),
    });

    if (!response.ok) throw new Error("LLM unavailable");
    const result = await response.json();
    return { story: result.story, source: result.source };
  } catch {
    return { story: localStory, source: "local" };
  }
}
