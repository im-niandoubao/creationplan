const YEAR_LABELS = {
  1: "第一圈年轮",
  3: "趋势开始成形",
  5: "复利越过中点",
  10: "它成为生活的一部分",
};

const CATEGORY_PRESETS = {
  reading: {
    match: /书|阅读|读书|文章|学习/,
    title: "每天留一点时间给阅读",
    summary: "真正被放大的不只是阅读量，而是你持续理解新事物、连接旧知识的能力。",
    dimensions: [
      ["认知", "gain", "零散信息可能逐渐形成自己的知识网络，理解陌生问题时更容易找到支点。"],
      ["表达", "gain", "词汇、例子和观点来源增加，表达通常会比单纯追求技巧更自然。"],
      ["注意力", "mixed", "稳定阅读有助于恢复长注意力，但碎片化内容未必产生同样效果。"],
      ["时间", "mixed", "阅读会占用一些即时娱乐时间，收益也取决于选择什么以及是否思考。"],
    ],
    stages: [
      ["动作开始变轻", "一开始最明显的变化不是懂得更多，而是不再每天重新决定“要不要读”。", "阅读开始拥有固定位置，也可能带动记录、搜索和讨论。", "本数不是最可靠的指标；难度、理解和回看同样重要。"],
      ["知识开始互相认识", "来自不同书里的概念可能彼此连接，你会更快察觉一个问题曾在哪里见过。", "阅读开始进入工作判断、写作和日常谈话，而不只停留在读完。", "如果内容长期过于单一，也可能只是加固原有看法。"],
      ["积累形成个人结构", "你可能已经有稳定偏好、判断标准和回访主题，阅读从摄入变成主动选择。", "笔记、实践和输出决定积累能否从“知道”继续走向“会用”。", "持续输入而从不行动，容易产生懂了很多的错觉。"],
      ["改变的是更新自己的能力", "十年里具体记住的内容会褪色，但持续修正认知的习惯可能留了下来。", "这项习惯可能参与塑造职业选择、表达方式，以及你如何理解世界。", "人生环境变化很大，允许阅读形式和强度改变，比维持完美记录更重要。"],
    ],
  },
  exercise: {
    match: /运动|跑步|健身|走路|散步|游泳|瑜伽|骑行/,
    title: "每天为身体留出运动时间",
    summary: "十年后的差别，可能不只在体能数字，而在身体是否一直拥有参与生活的余量。",
    dimensions: [
      ["身体", "gain", "规律活动通常会改善体能与动作能力，具体效果取决于强度、种类和恢复。"],
      ["情绪", "gain", "运动可能成为稳定情绪和切换状态的固定出口。"],
      ["时间", "mixed", "每天需要腾出一块真实时间，但也可能换来更清醒、更有精力的其他时段。"],
      ["损伤", "watch", "错误动作、单一负荷或恢复不足会累积风险，疼痛不是坚持的勋章。"],
    ],
    stages: [
      ["身体先给出小反馈", "呼吸、睡眠或精神状态可能先于外形发生变化，动作本身也会逐渐没那么费劲。", "一项运动若能固定下来，饮食、作息和周末安排也可能受到影响。", "不要用前几周的体重变化代表全部结果。"],
      ["体能成为日常底色", "运动不再只是一次任务，爬楼、远行或应付忙碌日程时可能更有余量。", "你可能开始关注动作质量、装备和恢复，而不仅是有没有完成。", "同一套训练长期不变，收益会趋缓，局部负担也可能增加。"],
      ["身体能力开始复利", "规律训练带来的基础会让你更容易尝试新的活动，也更容易在中断后重新回来。", "社交、旅行和自我评价可能因此改变，身体成为选择的支持者。", "年龄、旧伤和生活压力都会改变合适的训练量。"],
      ["留下的是可用的身体", "与完全不活动相比，长期规律运动可能让力量、耐力和活动能力保持在更好的轨道上。", "运动也许已经成为你处理压力、安排生活和认识自己的方式之一。", "这不是医疗承诺；健康变化仍受遗传、疾病、睡眠和饮食等因素影响。"],
    ],
  },
  cola: {
    match: /可乐|汽水|奶茶|含糖|饮料/,
    title: "每天喝一份含糖饮料",
    summary: "真正累积的往往不只是一种成分，而是味觉偏好、消费路径和“顺手来一份”的自动选择。",
    dimensions: [
      ["摄入", "watch", "糖、热量或咖啡因会随频率累积，具体数值取决于品牌和容量。"],
      ["习惯", "watch", "固定奖励容易与午后、工作或情绪绑定，之后改变会比最初选择更费力。"],
      ["花费", "mixed", "单次支出很小，拉到十年后会成为一笔可以看见的消费。"],
      ["愉悦", "mixed", "它确实提供即时满足；问题不在一次享受，而在是否失去选择。"],
    ],
    stages: [
      ["奖励回路变得熟悉", "最先稳定下来的可能不是身体指标，而是某个时刻自动想起这份饮料。", "它可能开始和午餐、加班或疲惫绑定，成为情境的一部分。", "容量、配方和是否同时减少其他摄入，会显著改变结果。"],
      ["选择逐渐自动化", "三年足够让一种味觉与生活节奏彼此适应，不喝时反而可能觉得少了什么。", "购买地点、零食搭配与日常花费可能一起被固定下来。", "不要把相关性说成必然结果，个体代谢和整体饮食差异很大。"],
      ["小额摄入显出总量", "单日几乎感觉不到的糖分、容器和支出，在累计数字里已经不再微小。", "替换其中一部分，往往比要求自己从此完全不碰更容易持续。", "无糖版本减少了糖，但并不自动解决咖啡因、口味依赖等所有问题。"],
      ["习惯本身成为主要变量", "十年后最值得观察的是：你是否仍然能自由选择，而不是被固定场景推着完成。", "一旦改变这个入口，饮食、花费和自我控制感可能同时发生变化。", "页面只做习惯观察，不提供个体医疗诊断。"],
    ],
  },
  phone: {
    match: /手机|短视频|刷屏|社交媒体|抖音|小红书/,
    title: "每天少刷一会儿手机",
    summary: "被归还的不只是时间，还有一天里那些本可以长成阅读、休息、关系或无聊的空隙。",
    dimensions: [
      ["时间", "gain", "节省下来的分钟会形成可观总量，但只有被重新使用，才会产生第二层变化。"],
      ["注意力", "gain", "减少高频切换可能让完整思考和长任务更容易发生。"],
      ["情绪", "mixed", "比较和信息刺激可能减少，也可能短暂暴露出原本被屏幕盖住的无聊。"],
      ["关系", "gain", "一部分无屏幕时间可能回到同桌的人、路上的环境和独处。"],
    ],
    stages: [
      ["先出现一些空白", "你会先注意到伸手拿手机的冲动，以及一天里原来有多少微小空隙。", "空白时间可能流向睡眠、走路、阅读，也可能被另一块屏幕接管。", "少刷不等于自动变高效，需要为腾出的时间安排一个去处。"],
      ["注意力重新分配", "当减少刷屏成为默认设置，完整任务和长内容可能更容易进入生活。", "通知、桌面布局和身边人的习惯会决定这件事能否继续。", "工作与社交也依赖手机，不必追求与设备彻底切割。"],
      ["时间长出新的用途", "五年里被归还的时间足以承载一项技能、更多睡眠，或大量真实世界里的小经历。", "关键差别来自你用什么替代，而不是屏幕时间数字本身。", "把控制变成自我惩罚，可能导致反弹。"],
      ["你改变了注意力的所有权", "十年后，最深的变化可能是更清楚自己把注意力交给了什么。", "这会影响学习、工作、关系，以及你如何感受一段普通的时间。", "平台和设备会持续变化，策略也需要跟着调整。"],
    ],
  },
  saving: {
    match: /存钱|攒钱|储蓄|存下|省下/,
    title: "每天存下一点钱",
    summary: "这笔钱的意义可能不只在余额，而在它逐渐变成一小块应对意外和选择生活的空间。",
    dimensions: [
      ["储备", "gain", "固定储蓄会形成可以看见的本金，是否投资会显著改变长期结果。"],
      ["安全感", "gain", "缓冲资金可能降低一些突发支出带来的压力。"],
      ["消费", "mixed", "每天留存会让小额支出更可见，但过度克制也可能损害当下生活。"],
      ["机会", "gain", "储备可能转化为学习、搬迁、休息或拒绝不合适选择的能力。"],
    ],
    stages: [
      ["余额第一次变得可见", "单日金额很小，但一年足以形成一笔有名字的储备。", "你可能开始更敏感地看见自动续费和顺手消费。", "不要为了完成数字而忽略必要开支或高息债务。"],
      ["缓冲区开始工作", "它可能已经能覆盖一些设备损坏、短期失业或临时出行。", "储蓄从克制消费，逐渐变成减少脆弱性的工具。", "通胀会削弱现金购买力，页面未计算具体投资收益。"],
      ["本金带来更多选项", "五年的本金可能让进修、换工作或暂停一段时间不再完全不可能。", "自动储蓄和收入增长的结合，通常比每天靠意志力更可靠。", "真实财务规划仍需考虑负债、保险、税务和风险承受力。"],
      ["积累变成选择空间", "十年后的数字固然重要，更重要的是它可能让一些决定不必只由眼前现金决定。", "长期储蓄也可能改变你对消费、风险和自由的定义。", "这不是投资建议，也没有承诺任何收益率。"],
    ],
  },
  generic: {
    match: /.*/,
    title: "每天重复这个小改变",
    summary: "十年里，最可能被改变的不是某个单独数字，而是这件事从行动逐渐变成环境、能力与身份。",
    dimensions: [
      ["积累", "gain", "重复会产生可见总量，但总量不等于质量。"],
      ["习惯", "gain", "固定触发场景会降低行动阻力，让它逐渐不依赖当天心情。"],
      ["机会成本", "mixed", "每项长期选择都会占用时间、金钱或注意力，也会挤掉另一种可能。"],
      ["身份", "mixed", "长期行动可能改变自我认知，但不必让一项习惯绑架全部生活。"],
    ],
    stages: [
      ["重复开始有形状", "一年足以跨过许多次不想做的日子，也足以看见这件事是否真的适合生活。", "行动可能找到固定时间、地点或触发信号。", "完成次数不代表每一次都产生相同价值。"],
      ["趋势取代新鲜感", "三年后，最初的兴奋大多已经退去，留下的是系统是否可靠。", "相关工具、人际和日程可能开始围绕它重新排列。", "环境变化时需要调整形式，不必机械维持原样。"],
      ["复利开始来自连锁反应", "五年的意义常常不是做了更多次，而是它催生了第二、第三种变化。", "能力、关系或生活选择可能开始因它产生新的路径。", "沉没成本不是继续一件无效事情的理由。"],
      ["它参与塑造了你", "十年后，这个动作也许已经很普通，但它留下的能力、关系与选择会比动作本身更长久。", "真正的复利往往发生在行动之外：你成为了更容易做出某类选择的人。", "人生不会保持恒定，允许暂停和改变方向也是长期主义的一部分。"],
    ],
  },
};

const state = {
  result: null,
  activeYear: 1,
};

const elements = {
  form: document.querySelector("#seedForm"),
  input: document.querySelector("#changeInput"),
  characterCount: document.querySelector("#characterCount"),
  inputSection: document.querySelector("#inputSection"),
  developing: document.querySelector("#developing"),
  developingHint: document.querySelector("#developingHint"),
  result: document.querySelector("#result"),
  resultTitle: document.querySelector("#resultTitle"),
  summary: document.querySelector("#summary"),
  totalMetric: document.querySelector("#totalMetric"),
  rings: document.querySelector("#rings"),
  yearStory: document.querySelector("#yearStory"),
  yearLabel: document.querySelector("#yearLabel"),
  yearTitle: document.querySelector("#yearTitle"),
  yearNumber: document.querySelector("#yearNumber"),
  yearNarrative: document.querySelector("#yearNarrative"),
  yearMetric: document.querySelector("#yearMetric"),
  yearTurningPoint: document.querySelector("#yearTurningPoint"),
  yearCaution: document.querySelector("#yearCaution"),
  dimensionGrid: document.querySelector("#dimensionGrid"),
  assumptionList: document.querySelector("#assumptionList"),
  closing: document.querySelector("#closing"),
  restartButton: document.querySelector("#restartButton"),
  shareButton: document.querySelector("#shareButton"),
  shareFeedback: document.querySelector("#shareFeedback"),
  aboutButton: document.querySelector("#aboutButton"),
  aboutDialog: document.querySelector("#aboutDialog"),
  dialogClose: document.querySelector("#dialogClose"),
};

function getCategory(input) {
  return Object.entries(CATEGORY_PRESETS).find(
    ([key, preset]) => key !== "generic" && preset.match.test(input),
  )?.[0] || "generic";
}

function extractNumber(input, fallback) {
  const chineseNumbers = {
    一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5,
    六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
  };
  const arabic = input.match(/\d+(?:\.\d+)?/);
  if (arabic) return Number(arabic[0]);
  const chinese = Object.entries(chineseNumbers).find(([character]) => input.includes(character));
  return chinese?.[1] || fallback;
}

function formatNumber(number, digits = 0) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: digits,
  }).format(number);
}

function calculateMetrics(input, category) {
  const completionRate = 0.8;
  const activeDays = 365 * completionRate;

  if (category === "reading" || category === "exercise" || category === "phone") {
    let minutes = extractNumber(input, category === "reading" ? 10 : 30);
    if (/半小时/.test(input)) {
      minutes = 30;
    } else if (/小时/.test(input) && !/分钟|分/.test(input)) {
      minutes *= 60;
    }
    const direction = category === "phone" ? "归还" : "投入";
    return {
      annual: `每年约${direction} ${formatNumber((minutes * activeDays) / 60)} 小时`,
      total: `十年约${direction} ${formatNumber((minutes * activeDays * 10) / 60)} 小时`,
      byYear: (year) => `${year} 年累计约 ${formatNumber((minutes * activeDays * year) / 60)} 小时`,
    };
  }

  if (category === "saving") {
    const amount = extractNumber(input, 20);
    return {
      annual: `每年约存下 ${formatNumber(amount * activeDays)} 元`,
      total: `十年本金约 ${formatNumber(amount * activeDays * 10)} 元`,
      byYear: (year) => `${year} 年本金约 ${formatNumber(amount * activeDays * year)} 元`,
    };
  }

  if (category === "cola") {
    const servings = extractNumber(input, 1);
    return {
      annual: `每年约 ${formatNumber(servings * activeDays)} 份`,
      total: `十年约 ${formatNumber(servings * activeDays * 10)} 份`,
      byYear: (year) => `${year} 年累计约 ${formatNumber(servings * activeDays * year)} 份`,
    };
  }

  const frequency = extractNumber(input, 1);
  return {
    annual: `每年约重复 ${formatNumber(frequency * activeDays)} 次`,
    total: `十年约重复 ${formatNumber(frequency * activeDays * 10)} 次`,
    byYear: (year) => `${year} 年累计约 ${formatNumber(frequency * activeDays * year)} 次`,
  };
}

function buildLocalResult(input) {
  const category = getCategory(input);
  const preset = CATEGORY_PRESETS[category];
  const metrics = calculateMetrics(input, category);
  const years = [1, 3, 5, 10];

  return {
    title: preset.title,
    normalizedAction: input,
    summary: preset.summary,
    annualMetric: metrics.annual,
    totalMetric: metrics.total,
    milestones: years.map((year, index) => ({
      year,
      label: YEAR_LABELS[year],
      title: preset.stages[index][0],
      narrative: preset.stages[index][1],
      metric: metrics.byYear(year),
      turningPoint: preset.stages[index][2],
      caution: preset.stages[index][3],
    })),
    dimensions: preset.dimensions.map(([name, tone, text]) => ({ name, tone, text })),
    assumptions: [
      "按大约 80% 的现实完成率估算，允许旅行、生病、忙碌和偶尔中断。",
      "累计数字只计算输入中可识别的数量，不代表质量，也不包含复利收益。",
      "长期影响是可能路径，不是个体承诺；环境、健康和人生事件都会改变结果。",
    ],
    closing: "时间不会替你决定方向，但会认真放大那些被重复的选择。",
    source: "local",
  };
}

async function requestAnalysis(input) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 18000);

  try {
    const response = await fetch("./api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ change: input }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error("analysis unavailable");
    const payload = await response.json();
    return payload.analysis;
  } catch (_error) {
    return buildLocalResult(input);
  } finally {
    window.clearTimeout(timeout);
  }
}

function renderMilestone(year) {
  const milestone = state.result.milestones.find((item) => item.year === year);
  if (!milestone) return;

  state.activeYear = year;
  elements.rings.querySelectorAll(".year-ring").forEach((button) => {
    const active = Number(button.dataset.year) === year;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  elements.yearStory.classList.remove("is-changing");
  void elements.yearStory.offsetWidth;
  elements.yearStory.classList.add("is-changing");
  elements.yearLabel.textContent = milestone.label || YEAR_LABELS[year];
  elements.yearTitle.textContent = milestone.title;
  elements.yearNumber.textContent = String(year).padStart(2, "0");
  elements.yearNarrative.textContent = milestone.narrative;
  elements.yearMetric.textContent = milestone.metric;
  elements.yearTurningPoint.textContent = milestone.turningPoint;
  elements.yearCaution.textContent = milestone.caution;
}

function renderResult(result) {
  state.result = result;
  elements.resultTitle.textContent = result.title;
  elements.summary.textContent = result.summary;
  renderTotalMetric(result.totalMetric);
  elements.closing.textContent = result.closing;

  elements.dimensionGrid.replaceChildren(
    ...result.dimensions.map((dimension, index) => {
      const card = document.createElement("article");
      card.className = "dimension-card";
      card.dataset.index = String(index + 1).padStart(2, "0");
      card.dataset.tone = dimension.tone;

      const tone = document.createElement("span");
      tone.className = "dimension-tone";
      const title = document.createElement("h4");
      title.textContent = dimension.name;
      const text = document.createElement("p");
      text.textContent = dimension.text;
      card.append(tone, title, text);
      return card;
    }),
  );

  elements.assumptionList.replaceChildren(
    ...result.assumptions.map((assumption) => {
      const item = document.createElement("li");
      item.textContent = assumption;
      return item;
    }),
  );

  renderMilestone(1);
}

function renderTotalMetric(metric) {
  const match = metric.match(/^(十年(?:本金)?约(?:投入|归还|存下|重复)?)[\s]*(.+)$/);
  const lead = match?.[1] || "十年累计";
  const value = match?.[2] || metric;
  const leadLine = document.createElement("span");
  const valueLine = document.createElement("span");
  leadLine.textContent = lead;
  valueLine.textContent = value;
  elements.totalMetric.replaceChildren(leadLine, valueLine);
}

function showView(view) {
  elements.inputSection.hidden = view !== "input";
  elements.developing.hidden = view !== "developing";
  elements.result.hidden = view !== "result";
}

elements.input.addEventListener("input", () => {
  elements.characterCount.textContent = elements.input.value.length;
});

document.querySelectorAll("[data-example]").forEach((button) => {
  button.addEventListener("click", () => {
    elements.input.value = button.dataset.example;
    elements.characterCount.textContent = elements.input.value.length;
    elements.input.focus();
  });
});

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = elements.input.value.trim();
  if (!input) return;

  showView("developing");
  window.scrollTo({ top: 0, behavior: "smooth" });

  const hints = [
    "先计算积累，再观察它会触碰生活的哪些部分",
    "正在区分可以计算的数字，与只能谨慎推演的变化",
    "让第 1、3、5、10 年依次显影",
  ];
  let hintIndex = 0;
  const hintTimer = window.setInterval(() => {
    hintIndex = (hintIndex + 1) % hints.length;
    elements.developingHint.textContent = hints[hintIndex];
  }, 1700);

  const result = await requestAnalysis(input);
  window.clearInterval(hintTimer);
  renderResult(result);
  showView("result");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.rings.addEventListener("click", (event) => {
  const button = event.target.closest("[data-year]");
  if (!button) return;
  renderMilestone(Number(button.dataset.year));
});

elements.restartButton.addEventListener("click", () => {
  showView("input");
  elements.input.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.shareButton.addEventListener("click", async () => {
  if (!state.result) return;
  const milestone = state.result.milestones.find((item) => item.year === 10);
  const text = [
    `十年显影｜${state.result.normalizedAction || elements.input.value.trim()}`,
    state.result.summary,
    state.result.totalMetric,
    `第 10 年：${milestone.title}。${milestone.narrative}`,
    "时间会认真放大那些被重复的选择。",
  ].join("\n");

  try {
    await navigator.clipboard.writeText(text);
    elements.shareFeedback.textContent = "已复制，可以把它送给十年后的自己。";
  } catch (_error) {
    elements.shareFeedback.textContent = "浏览器没有允许复制，请手动选择页面文字。";
  }
});

elements.aboutButton.addEventListener("click", () => elements.aboutDialog.showModal());
elements.dialogClose.addEventListener("click", () => elements.aboutDialog.close());
elements.aboutDialog.addEventListener("click", (event) => {
  if (event.target === elements.aboutDialog) elements.aboutDialog.close();
});
