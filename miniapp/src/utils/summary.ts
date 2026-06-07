// Dimension display names
const DIM_NAMES: Record<string, string> = {
  logic: '逻辑推理',
  creativity: '创造想象',
  memory: '记忆能力',
  observation: '观察感知',
  comm: '沟通表达',
  lead: '领导组织',
  exec: '执行实操',
  empathy: '同理共情',
  resilience: '抗压韧性',
  learn: '学习适应',
  // Holland dimensions
  realistic: '实际型',
  investigative: '研究型',
  artistic: '艺术型',
  social: '社会型',
  enterprise: '企业型',
  conventional: '常规型',
}

/**
 * Generate a one-line personality summary based on top dimensions.
 * Top is an array of dimension keys sorted by score (highest first).
 */
export function generateSummary(top: string[]): string {
  if (top.length === 0) return '持续探索中的发现者'

  const has = (...keys: string[]) => keys.some(k => top.slice(0, 3).includes(k))
  const hasBoth = (a: string, b: string) => top.slice(0, 3).includes(a) && top.slice(0, 3).includes(b)

  if (hasBoth('exec', 'logic')) return '你是一位逻辑缜密的行动派，善于分析问题并高效落地执行。'

  if (hasBoth('creativity', 'observation') || hasBoth('creativity', 'memory'))
    return '你是一位敏锐细腻的创造者，总能在细节中发现不一样的灵感。'

  if (hasBoth('empathy', 'comm'))
    return '你是一位善解人意的沟通者，能温暖地理解他人并搭建心与心的桥梁。'

  if (hasBoth('lead', 'resilience'))
    return '你是一位坚韧不拔的领导者，面对挑战从容不迫，能带领团队突破重围。'

  if (has('creativity') && has('learn'))
    return '你是一位充满好奇的探索者，热爱学习新事物并创造性地解决问题。'

  if (has('exec') && has('resilience'))
    return '你是一位脚踏实地的实干者，稳定可靠，面对压力依然高效输出。'

  if (has('empathy') && has('observation'))
    return '你是一位细腻敏锐的观察者，善于体察人心并给予恰到好处的支持。'

  if (has('logic') && has('learn'))
    return '你是一位理性探索的思考者，善于运用逻辑解析复杂问题。'

  if (has('lead') && has('comm'))
    return '你是一位富有感染力的引导者，能清晰表达并凝聚团队向目标前进。'

  // Single-dimension fallbacks
  if (has('creativity')) return '你是一位天马行空的创意者，用想象力点亮每一个瞬间。'
  if (has('logic')) return '你是一位冷静理性的思考者，用缜密的逻辑剖析世间万物。'
  if (has('empathy')) return '你是一位温暖细腻的共情者，用心感受他人的喜怒哀乐。'
  if (has('exec')) return '你是一位雷厉风行的执行者，将计划变为现实是你的超能力。'
  if (has('lead')) return '你是一位天生的组织者，能协调资源推动事情向前。'
  if (has('learn')) return '你是一位终身学习者，用好奇心驱动不断成长。'

  return '你是一位全面发展的探索者，在多个维度展现出独特的潜力。'
}

/**
 * Get display name for a dimension key.
 */
export function dimName(key: string): string {
  return DIM_NAMES[key] || key
}

// ---- Dimension → Action Mapping (design doc §7.3) ----
const DIM_ACTIONS: Record<string, string> = {
  comm: '参加演讲俱乐部或写作训练',
  lead: '主动承担项目负责人角色',
  exec: '设定每日小目标并坚持完成',
  empathy: '参与志愿服务或团队协作活动',
  logic: '学习编程或数据分析工具',
  creativity: '尝试设计、写作或艺术创作',
  learn: '建立每日阅读或在线课程习惯',
  resilience: '练习正念冥想或压力管理技巧',
  memory: '使用记忆宫殿或间隔重复法',
  observation: '练习素描、摄影或自然观察',
}

/** Get suggested action for a dimension key. */
export function dimAction(key: string): string {
  return DIM_ACTIONS[key] || '持续刻意练习'
}

// ---- Three-paragraph report summary (design doc §7.1) ----
/**
 * Generate a three-paragraph report summary from dimension scores and career matches.
 *
 * 1. Positioning sentence (reuses generateSummary rule engine)
 * 2. Strength analysis with top dimensions and linked careers
 * 3. Growth advice for the weakest dimension
 */
export function generateReportSummary(
  scores: Record<string, number>,
  careerMatches: { careerName: string; matchScore: number }[] = [],
): string {
  const top = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  const topKeys = top.map(([k]) => k)

  // Paragraph 1: Positioning
  const positioning = generateSummary(topKeys)

  // Paragraph 2: Strength analysis
  const topDimsDesc = top
    .map(([k, v]) => `${dimName(k)}(${Math.round(v)}%)`)
    .join('和')
  const topCareers = careerMatches.slice(0, 3).map(c => c.careerName).join('、') || '多个职业'
  const strength = `你的${topDimsDesc}远超平均水平，这让你的${topCareers}等方向具有天然优势。`

  // Paragraph 3: Growth advice
  const entries = Object.entries(scores).filter(([, v]) => v > 0)
  if (entries.length === 0) return `${positioning}\n\n${strength}`

  const weakest = entries.sort((a, b) => a[1] - b[1])[0]
  const [weakKey, weakVal] = weakest
  const action = dimAction(weakKey)
  const growth = `同时，${dimName(weakKey)}(${Math.round(weakVal)}%)有较大提升空间，建议通过${action}来加强。`

  return `${positioning}\n\n${strength}\n\n${growth}`
}

// ---- Dynamic Suggestions (design doc §7.2) ----
/**
 * Generate rule-driven personalized suggestions from dimension scores and career matches.
 */
export function generateSuggestions(
  scores: Record<string, number>,
  careerMatches: { careerName: string; matchScore: number }[] = [],
): string[] {
  const suggestions: string[] = []
  const entries = Object.entries(scores).filter(([, v]) => v > 0)
  if (entries.length === 0) return suggestions

  const maxDim = entries.sort((a, b) => b[1] - a[1])[0]
  const minDim = entries.sort((a, b) => a[1] - b[1])[0]
  const range = maxDim[1] - minDim[1]

  // Rule: dim ≥ 80% → highlight strength
  const strengths = entries.filter(([, v]) => v >= 80)
  for (const [key, pct] of strengths.slice(0, 2)) {
    const relatedCareer = careerMatches.find(c => c.matchScore >= 50)?.careerName || '相关领域'
    suggestions.push(`你的${dimName(key)}能力突出(${Math.round(pct)}%)，建议从事${relatedCareer}方向`)
  }

  // Rule: dim ≤ 40% → improvement suggestion
  const weaks = entries.filter(([, v]) => v <= 40)
  for (const [key, pct] of weaks.slice(0, 1)) {
    suggestions.push(`${dimName(key)}有提升空间(${Math.round(pct)}%)，建议通过${dimAction(key)}来加强`)
  }

  // Rule: max - min spread
  if (range >= 40 && strengths.length > 0 && weaks.length > 0) {
    suggestions.push('你的能力结构偏向明显，建议在发挥优势的同时补齐短板')
  } else if (range <= 20 && entries.length >= 5) {
    suggestions.push('你的能力发展均衡，适合综合型岗位或跨界方向')
  }

  // Rule: top career score ≥ 80%
  const topCareer = careerMatches[0]
  if (topCareer && topCareer.matchScore >= 80) {
    suggestions.push(`${topCareer.careerName}与你的能力高度匹配(${topCareer.matchScore}%)，值得重点关注`)
  }

  // Deduplicate and limit
  const seen = new Set<string>()
  return suggestions.filter(s => {
    if (seen.has(s)) return false
    seen.add(s)
    return true
  }).slice(0, 5)
}
