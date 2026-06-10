// Career matching: cosine similarity + RIASEC → talent dimension mapping

// ---- Career type ----
export interface CareerEntry {
  name: string
  category: string
  description: string
  dimensionTags: string[]
  riasecTags: string[]
  requiredSkills: string[]
  educationLevel: string
  salaryRange: string
  suggestions: string
}

export interface CareerMatch {
  careerId: string
  careerName: string
  matchScore: number
  reason: string
  contributingDims: string[]
}

// ---- All 10 talent compass dimensions ----
const ALL_DIMS = [
  'logic', 'creativity', 'memory', 'observation', 'comm',
  'lead', 'exec', 'empathy', 'resilience', 'learn',
]

// ---- Career library (same as seed_careers.json + riasecTags) ----
export const CAREER_LIBRARY: CareerEntry[] = [
  { name: '数据分析师', category: '技术/数据', description: '负责收集、处理和分析数据，为企业决策提供数据支持。', dimensionTags: ['logic', 'observation'], riasecTags: ['I', 'C'], requiredSkills: ['SQL', 'Python', '统计学', '数据可视化'], educationLevel: '本科', salaryRange: '15-35K', suggestions: '逻辑推理和观察感知能力突出，适合从事数据分析相关工作。' },
  { name: '产品经理', category: '产品/设计', description: '负责产品的规划、设计和迭代，协调技术、设计和运营团队。', dimensionTags: ['logic', 'comm', 'exec', 'lead'], riasecTags: ['E', 'I', 'S'], requiredSkills: ['需求分析', '项目管理', '用户研究', '原型设计'], educationLevel: '本科', salaryRange: '20-45K', suggestions: '分析能力和沟通能力兼备，适合产品方向。' },
  { name: '软件工程师', category: '技术/研发', description: '设计、开发和维护软件系统，解决技术问题。', dimensionTags: ['logic', 'exec', 'learn'], riasecTags: ['I', 'R', 'C'], requiredSkills: ['编程', '算法', '系统设计', '问题排查'], educationLevel: '本科', salaryRange: '18-40K', suggestions: '逻辑推理和学习适应能力突出，编程方向是天然选择。' },
  { name: 'UI/UX设计师', category: '设计/创意', description: '负责产品的用户界面和用户体验设计。', dimensionTags: ['creativity', 'observation', 'empathy'], riasecTags: ['A', 'I'], requiredSkills: ['设计软件', '用户研究', '交互设计', '视觉传达'], educationLevel: '本科', salaryRange: '15-35K', suggestions: '创造力和同理心突出，设计方向能很好发挥你的天赋。' },
  { name: '心理咨询师', category: '教育/咨询', description: '为个人提供心理评估、咨询和治疗服务。', dimensionTags: ['empathy', 'comm', 'observation'], riasecTags: ['S', 'I'], requiredSkills: ['心理学理论', '沟通技巧', '情绪管理', '案例分析'], educationLevel: '硕士', salaryRange: '10-25K', suggestions: '同理心和沟通能力突出，心理咨询方向能让你的天赋得到最好的发挥。' },
  { name: '项目经理', category: '管理/运营', description: '负责项目的规划、执行和交付，管理团队和资源。', dimensionTags: ['lead', 'exec', 'comm', 'resilience'], riasecTags: ['E', 'C', 'S'], requiredSkills: ['项目管理', '沟通协调', '风险管理', '团队领导'], educationLevel: '本科', salaryRange: '20-45K', suggestions: '领导力和执行力突出，项目管理是理想的职业方向。' },
  { name: '教师/培训师', category: '教育/培训', description: '传授知识、技能，引导他人学习和成长。', dimensionTags: ['comm', 'empathy', 'learn'], riasecTags: ['S', 'A'], requiredSkills: ['专业知识', '表达能力', '教学设计', '课堂管理'], educationLevel: '本科及以上', salaryRange: '8-25K', suggestions: '沟通和共情能力突出，教育方向是发挥天赋的好选择。' },
  { name: '市场营销经理', category: '市场/营销', description: '制定和实施市场营销策略，提升品牌知名度和销量。', dimensionTags: ['creativity', 'comm', 'lead'], riasecTags: ['E', 'A'], requiredSkills: ['市场分析', '品牌策划', '数字营销', '团队管理'], educationLevel: '本科', salaryRange: '18-40K', suggestions: '创造力和沟通能力突出，市场营销能充分发挥你的创意和表达天赋。' },
  { name: '科研人员', category: '学术/研究', description: '从事科学研究工作，探索未知领域并发表学术成果。', dimensionTags: ['logic', 'memory', 'learn', 'observation'], riasecTags: ['I', 'R'], requiredSkills: ['研究方法', '论文写作', '实验设计', '数据分析'], educationLevel: '博士', salaryRange: '15-30K', suggestions: '逻辑推理和学习能力突出，科研方向适合深入探索未知领域。' },
  { name: '创业/自由职业者', category: '创业/商业', description: '自主创业或提供独立专业服务，拥有高度自由度。', dimensionTags: ['lead', 'resilience', 'exec', 'creativity'], riasecTags: ['E', 'A'], requiredSkills: ['商业判断', '资源整合', '风控管理', '自我驱动'], educationLevel: '不限', salaryRange: '波动较大', suggestions: '领导力和抗压能力突出，创业方向能最大程度发挥你的综合天赋。' },
  { name: '文案/内容创作者', category: '传媒/内容', description: '创作文字、视频或音频内容，通过内容平台影响受众。', dimensionTags: ['creativity', 'comm', 'learn'], riasecTags: ['A', 'S'], requiredSkills: ['写作', '内容策划', '排版编辑', '运营推广'], educationLevel: '本科', salaryRange: '10-30K', suggestions: '创造力和表达能力突出，内容创作能让你的想法影响更多人。' },
  { name: '人力资源经理', category: '管理/行政', description: '负责招聘、培训、绩效管理等人力资源工作。', dimensionTags: ['comm', 'empathy', 'lead', 'observation'], riasecTags: ['S', 'E', 'C'], requiredSkills: ['招聘面试', '员工关系', '劳动法规', '组织发展'], educationLevel: '本科', salaryRange: '15-35K', suggestions: '沟通和共情能力突出，人力资源管理能很好地发挥你的人际天赋。' },
  { name: '咨询顾问', category: '咨询/服务', description: '为企业提供战略、运营或管理咨询服务。', dimensionTags: ['logic', 'comm', 'learn', 'resilience'], riasecTags: ['I', 'E', 'S'], requiredSkills: ['战略思维', '分析框架', '表达呈现', '客户管理'], educationLevel: '硕士', salaryRange: '25-60K', suggestions: '逻辑分析能力突出，咨询行业能快速积累经验和知识。' },
  { name: '运营经理', category: '运营/管理', description: '负责产品或业务的日常运营，优化流程和提升效率。', dimensionTags: ['exec', 'observation', 'learn'], riasecTags: ['C', 'E'], requiredSkills: ['数据分析', '流程优化', '用户运营', '问题解决'], educationLevel: '本科', salaryRange: '15-35K', suggestions: '执行力和观察力突出，运营方向需要持续优化细节和流程。' },
  { name: '销售经理', category: '销售/业务', description: '开发和维护客户关系，完成销售目标。', dimensionTags: ['comm', 'resilience', 'exec'], riasecTags: ['E', 'S'], requiredSkills: ['商务谈判', '客户开发', '关系维护', '市场洞察'], educationLevel: '本科', salaryRange: '15-50K', suggestions: '沟通和抗压能力突出，销售方向能让你的社交天赋得到最好回报。' },
]

// ---- RIASEC → Talent Dimension Mapping ----
// Based on McGill DAT, HEXACO, and industry career guides (design doc §5)
interface RiasecMappingEntry {
  primary: [string, number]
  secondary: [string, number][]
}

/** Map full RIASEC dimension names to single-letter codes. */
const RIASEC_NAME_TO_CODE: Record<string, string> = {
  realistic: 'R',
  investigative: 'I',
  artistic: 'A',
  social: 'S',
  enterprise: 'E',
  conventional: 'C',
}

const RIASEC_MAPPING: Record<string, RiasecMappingEntry> = {
  R: { primary: ['exec', 1.0], secondary: [['resilience', 0.7], ['observation', 0.7]] },
  I: { primary: ['logic', 1.0], secondary: [['learn', 0.7], ['observation', 0.7]] },
  A: { primary: ['creativity', 1.0], secondary: [['observation', 0.7], ['comm', 0.7]] },
  S: { primary: ['empathy', 1.0], secondary: [['comm', 0.7]] },
  E: { primary: ['lead', 1.0], secondary: [['comm', 0.7], ['resilience', 0.7]] },
  C: { primary: ['exec', 1.0], secondary: [['observation', 0.7], ['memory', 0.7]] },
}

/** Normalize full RIASEC names to single-letter codes (e.g. "realistic" → "R"). */
function normalizeRiasecKeys(scores: Record<string, number>): Record<string, number> {
  const normalized: Record<string, number> = {}
  for (const [key, value] of Object.entries(scores)) {
    const code = RIASEC_NAME_TO_CODE[key] || key
    normalized[code] = (normalized[code] || 0) + value
  }
  return normalized
}

/** Compute cosine similarity between two equal-length numeric vectors. */
export function cosSim(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Convert Holland RIASEC scores (0-100 each) to talent compass dimension scores (0-100 each).
 * Formula: talentDimScore = cap(Σ(userRIASECPercent × weight), 0, 100)
 */
export function riasecToTalent(
  riasecScores: Record<string, number>,
): Record<string, number> {
  const raw: Record<string, number> = {}
  const normalized = normalizeRiasecKeys(riasecScores)

  for (const [riasecType, userPct] of Object.entries(normalized)) {
    const mapping = RIASEC_MAPPING[riasecType]
    if (!mapping) continue

    const [primaryDim, primaryWeight] = mapping.primary
    raw[primaryDim] = (raw[primaryDim] || 0) + userPct * primaryWeight

    for (const [secDim, secWeight] of mapping.secondary) {
      raw[secDim] = (raw[secDim] || 0) + userPct * secWeight
    }
  }

  // Normalize to 0-100: find max possible for each talent dim and scale proportionally
  const talentMax: Record<string, number> = {}
  for (const mapping of Object.values(RIASEC_MAPPING)) {
    const [pDim, pW] = mapping.primary
    talentMax[pDim] = (talentMax[pDim] || 0) + 100 * pW
    for (const [sDim, sW] of mapping.secondary) {
      talentMax[sDim] = (talentMax[sDim] || 0) + 100 * sW
    }
  }

  const result: Record<string, number> = {}
  for (const dim of ALL_DIMS) {
    const maxPossible = talentMax[dim]
    if (maxPossible && maxPossible > 0) {
      result[dim] = Math.min(100, Math.round(((raw[dim] || 0) / maxPossible) * 100))
    } else {
      result[dim] = 0
    }
  }

  return result
}

/** Get a dimension vector (length 10, same order as ALL_DIMS) from a score map. */
export function toVector(scores: Record<string, number>): number[] {
  return ALL_DIMS.map(d => scores[d] || 0)
}

/** Get a career's tag vector (100 if tagged, 0 otherwise). */
export function careerVector(career: CareerEntry): number[] {
  return ALL_DIMS.map(d => (career.dimensionTags.includes(d) ? 100 : 0))
}

/**
 * Main entry: return top N career matches for given dimension scores.
 *
 * @param scores  Dimension scores { logic: 85, creativity: 62, ... }
 * @param testType 'talent' | 'holland' | 'combined'
 * @param topN    Number of results to return (default 5)
 */
export function careerMatch(
  scores: Record<string, number>,
  testType: 'talent' | 'holland' | 'combined',
  topN = 5,
): CareerMatch[] {
  // Step 1: Resolve scores to talent dimension space
  let talentScores: Record<string, number>

  if (testType === 'holland') {
    talentScores = riasecToTalent(scores)
  } else if (testType === 'combined') {
    // For combined: take talent scores directly (they should be passed as-is)
    // If the caller passes RIASEC scores for holland part, they must call riasecToTalent first.
    // Here we assume the caller already merged both test results into talent dimension space.
    talentScores = { ...scores }
  } else {
    talentScores = { ...scores }
  }

  const userVec = toVector(talentScores)

  // Step 2: Compute cosine similarity for each career
  const matches: CareerMatch[] = CAREER_LIBRARY.map((career, idx) => {
    const careerVec = careerVector(career)
    const similarity = cosSim(userVec, careerVec)
    const matchScore = Math.round(similarity * 100)

    // Find which user dimensions contributed most to this match
    const contributingDims = career.dimensionTags
      .filter(d => (talentScores[d] || 0) > 0)
      .sort((a, b) => (talentScores[b] || 0) - (talentScores[a] || 0))
      .slice(0, 3)

    return {
      careerId: `c${idx + 1}`,
      careerName: career.name,
      matchScore,
      reason: career.suggestions,
      contributingDims,
    }
  })

  // Step 3: Sort by matchScore desc, return top N
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN)
}

/**
 * Compute combined talent scores from both talent compass and holland results.
 * Per-dimension: take the max of the two values (design doc §4.3).
 */
export function combineScores(
  talentScores: Record<string, number>,
  hollandScores: Record<string, number>,
): Record<string, number> {
  const hollandTalent = riasecToTalent(hollandScores)
  const result: Record<string, number> = {}

  for (const dim of ALL_DIMS) {
    result[dim] = Math.max(talentScores[dim] || 0, hollandTalent[dim] || 0)
  }

  return result
}
