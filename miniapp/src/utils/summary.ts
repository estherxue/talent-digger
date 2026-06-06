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
