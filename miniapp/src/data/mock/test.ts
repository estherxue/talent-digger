// 测评相关 mock 数据（完整 26 题 + 霍兰德 60 题）

export interface MockQuestion {
  id: string
  content: string
  options: { label: string; text: string }[]
  // per-option dimension scoring. keys are option indices (0-3), values are {dimKey: weight}
  scoring: Record<number, Record<string, number>>
}

export interface MockReport {
  testName: string
  completedDate: string
  dimensionScores: {
    key: string
    name: string
    percentage: number
    level: string
  }[]
  summary: string
  suggestions: string[]
  careerMatches: {
    careerId: string
    careerName: string
    matchScore: number
    reason: string
  }[]
}

/** 天赋罗盘完整题目（26 题）—— 含评分映射 */
export const mockTalentQuestions: MockQuestion[] = [
  // ---- 逻辑推理 & 执行实操 ---- (q1-q6)
  {
    id: 'q1',
    content: '当面对一个陌生的复杂任务时，你的第一反应通常是？',
    options: [
      { label: 'A', text: '仔细分析任务结构，制定详细的执行计划' },
      { label: 'B', text: '边做边摸索，在实践中找到最佳方法' },
      { label: 'C', text: '先观察别人的做法，模仿学习' },
      { label: 'D', text: '凭直觉和灵感直接上手' },
    ],
    scoring: {
      0: { logic: 3, exec: 1 },
      1: { exec: 2, creativity: 1 },
      2: { observation: 2, learn: 1 },
      3: { creativity: 3 },
    },
  },
  {
    id: 'q2',
    content: '团队开会时，你更倾向于？',
    options: [
      { label: 'A', text: '积极表达自己的观点，引导讨论方向' },
      { label: 'B', text: '认真倾听，在关键点上提出深刻的见解' },
      { label: 'C', text: '帮大家梳理思路，总结形成共识' },
      { label: 'D', text: '观察每个人的反应和团队氛围' },
    ],
    scoring: {
      0: { comm: 2, lead: 2 },
      1: { logic: 2, observation: 1 },
      2: { comm: 1, lead: 1, exec: 1 },
      3: { observation: 2, empathy: 2 },
    },
  },
  {
    id: 'q3',
    content: '学习一项新技能时，你更偏好哪种方式？',
    options: [
      { label: 'A', text: '系统地学习理论，弄清楚背后的原理' },
      { label: 'B', text: '直接动手实践，边做边学' },
      { label: 'C', text: '找个师傅或教程一步步跟着做' },
      { label: 'D', text: '自己尝试创造性的用法' },
    ],
    scoring: {
      0: { logic: 2, learn: 2 },
      1: { exec: 2, learn: 1 },
      2: { learn: 2, observation: 1 },
      3: { creativity: 3 },
    },
  },
  {
    id: 'q4',
    content: 'deadline 快到了，你的状态是？',
    options: [
      { label: 'A', text: '压力越大效率越高，能爆发出惊人的产出' },
      { label: 'B', text: '开始焦虑，但能强迫自己按时完成' },
      { label: 'C', text: '早就做好了计划，所以不慌不忙' },
      { label: 'D', text: '容易乱了阵脚，需要寻求帮助' },
    ],
    scoring: {
      0: { resilience: 3, exec: 1 },
      1: { resilience: 2, exec: 1 },
      2: { exec: 2, logic: 1 },
      3: { resilience: 0 },
    },
  },
  {
    id: 'q5',
    content: '在人群中，你的角色通常是？',
    options: [
      { label: 'A', text: '活跃气氛，带动大家的情绪' },
      { label: 'B', text: '观察每个人的特点，适时给出建议' },
      { label: 'C', text: '默默跟着大家一起参与就好' },
      { label: 'D', text: '更愿意和少数人深入交流' },
    ],
    scoring: {
      0: { comm: 3, lead: 1 },
      1: { observation: 2, empathy: 2 },
      2: { empathy: 1 },
      3: { empathy: 2, comm: 1 },
    },
  },
  {
    id: 'q6',
    content: '对于数字、图表和逻辑推理题，你感觉？',
    options: [
      { label: 'A', text: '非常喜欢，天生对这种东西敏感' },
      { label: 'B', text: '还好，用心能做对大部分' },
      { label: 'C', text: '有些吃力，需要多花时间' },
      { label: 'D', text: '头大，能躲就躲' },
    ],
    scoring: {
      0: { logic: 3, memory: 1 },
      1: { logic: 2 },
      2: { exec: 1 },
      3: {},
    },
  },
  // ---- 同理共情 & 沟通表达 ---- (q7-q11)
  {
    id: 'q7',
    content: '朋友遇到困难向你倾诉时，你通常会？',
    options: [
      { label: 'A', text: '耐心倾听，感受到对方的情绪并给予安慰' },
      { label: 'B', text: '直接分析问题，给出解决方案' },
      { label: 'C', text: '讲讲自己的类似经历，让对方感觉被理解' },
      { label: 'D', text: '带对方做些开心的事，帮忙转移注意力' },
    ],
    scoring: {
      0: { empathy: 3, comm: 1 },
      1: { logic: 2, exec: 1 },
      2: { empathy: 2, comm: 1 },
      3: { empathy: 1, creativity: 1 },
    },
  },
  {
    id: 'q8',
    content: '对于细节你是否敏感？',
    options: [
      { label: 'A', text: '非常敏感，一眼就能发现细微的不对' },
      { label: 'B', text: '比较注意细节，但不会过度纠结' },
      { label: 'C', text: '有时能注意到，但经常忽略' },
      { label: 'D', text: '更关注大局，细节交给别人处理' },
    ],
    scoring: {
      0: { observation: 3, exec: 1 },
      1: { observation: 2 },
      2: { observation: 1 },
      3: { lead: 1 },
    },
  },
  {
    id: 'q9',
    content: '领导让你组织一个集体活动，你的第一反应是？',
    options: [
      { label: 'A', text: '兴奋！正好可以发挥组织才能' },
      { label: 'B', text: '立即开始规划时间线和分工' },
      { label: 'C', text: '先征求其他人的意见和想法' },
      { label: 'D', text: '有些紧张，担心做不好' },
    ],
    scoring: {
      0: { lead: 3, comm: 1 },
      1: { exec: 2, lead: 1 },
      2: { empathy: 1, comm: 1, lead: 1 },
      3: { resilience: 0 },
    },
  },
  {
    id: 'q10',
    content: '面对变化和新情况，你通常？',
    options: [
      { label: 'A', text: '很快适应，甚至享受变化带来的新鲜感' },
      { label: 'B', text: '需要一点时间来调整，之后就没问题了' },
      { label: 'C', text: '会比较纠结，喜欢稳定的环境' },
      { label: 'D', text: '很容易焦虑，需要他人的支持' },
    ],
    scoring: {
      0: { resilience: 3, learn: 2 },
      1: { resilience: 2, learn: 1 },
      2: { exec: 1 },
      3: { resilience: 0 },
    },
  },
  {
    id: 'q11',
    content: '你更喜欢的工作方式是？',
    options: [
      { label: 'A', text: '独立完成任务，专注于自己的节奏' },
      { label: 'B', text: '团队合作，享受协作的过程' },
      { label: 'C', text: '领导团队，统筹全局' },
      { label: 'D', text: '独立负责一部分，定期和团队对齐' },
    ],
    scoring: {
      0: { exec: 2, resilience: 1 },
      1: { empathy: 2, comm: 1 },
      2: { lead: 3, exec: 1 },
      3: { comm: 1, exec: 1 },
    },
  },
  // ---- 学习适应 & 创造想象 ---- (q12-q16)
  {
    id: 'q12',
    content: '对于新鲜事物，你的态度是？',
    options: [
      { label: 'A', text: '非常好奇，会主动探索和尝试' },
      { label: 'B', text: '感兴趣，如果有人引导会更积极' },
      { label: 'C', text: '先观望，确定有用后再投入' },
      { label: 'D', text: '比较保守，倾向于使用熟悉的东西' },
    ],
    scoring: {
      0: { learn: 3, creativity: 1 },
      1: { learn: 2 },
      2: { logic: 1, learn: 1 },
      3: {},
    },
  },
  {
    id: 'q13',
    content: '你能很快记住别人的名字和相貌吗？',
    options: [
      { label: 'A', text: '很容易记住，哪怕只见过一次' },
      { label: 'B', text: '一般能记住，偶尔会搞混' },
      { label: 'C', text: '需要多见几次才能记住' },
      { label: 'D', text: '经常忘记，有点脸盲' },
    ],
    scoring: {
      0: { memory: 3, observation: 1 },
      1: { memory: 2 },
      2: { memory: 1 },
      3: {},
    },
  },
  {
    id: 'q14',
    content: '你更喜欢和什么样的人一起工作？',
    options: [
      { label: 'A', text: '能力强效率高的，可以学到东西' },
      { label: 'B', text: '有创意点子多的，能激发灵感' },
      { label: 'C', text: '好沟通有默契的，相处舒服' },
      { label: 'D', text: '有凝聚力让人有安全感的' },
    ],
    scoring: {
      0: { learn: 2, exec: 2 },
      1: { creativity: 3 },
      2: { empathy: 2, comm: 1 },
      3: { lead: 2, empathy: 1 },
    },
  },
  {
    id: 'q15',
    content: '遇到和自己看法完全相反的观点时？',
    options: [
      { label: 'A', text: '理性讨论，试着理解对方的逻辑' },
      { label: 'B', text: '保持礼貌，但坚持自己的立场' },
      { label: 'C', text: '反思自己是不是有考虑不周的地方' },
      { label: 'D', text: '尽量避免争论，和谐最重要' },
    ],
    scoring: {
      0: { logic: 2, comm: 2 },
      1: { resilience: 2 },
      2: { empathy: 2, observation: 2 },
      3: { empathy: 2 },
    },
  },
  {
    id: 'q16',
    content: '你对创造性活动的感受是？',
    options: [
      { label: 'A', text: '热爱创造，喜欢绘画/写作/设计等' },
      { label: 'B', text: '有时间愿意尝试，有创造力但不用' },
      { label: 'C', text: '欣赏创造力，但自己不擅长' },
      { label: 'D', text: '更喜欢按规则办事，创造性不重要' },
    ],
    scoring: {
      0: { creativity: 3 },
      1: { creativity: 2 },
      2: { creativity: 1 },
      3: { exec: 2 },
    },
  },
  // ---- 抗压韧性 & 情绪管理 ---- (q17-q20)
  {
    id: 'q17',
    content: '当有人当面批评你的工作时？',
    options: [
      { label: 'A', text: '冷静接受，分析批评是否有道理' },
      { label: 'B', text: '会感到不舒服，但努力保持专业' },
      { label: 'C', text: '解释自己的思路，但容易情绪化' },
      { label: 'D', text: '很受打击，影响之后的工作状态' },
    ],
    scoring: {
      0: { resilience: 3, logic: 1 },
      1: { resilience: 2 },
      2: { comm: 1 },
      3: { resilience: 0 },
    },
  },
  {
    id: 'q18',
    content: '你认为自己在哪方面比较突出？',
    options: [
      { label: 'A', text: '能理解复杂的概念并准确传达给别人' },
      { label: 'B', text: '能捕捉到别人注意不到的细节' },
      { label: 'C', text: '想出的点子和方案经常让人眼前一亮' },
      { label: 'D', text: '能感知他人的情绪并做出妥帖的回应' },
    ],
    scoring: {
      0: { logic: 2, comm: 2 },
      1: { observation: 3 },
      2: { creativity: 3 },
      3: { empathy: 3 },
    },
  },
  {
    id: 'q19',
    content: '做重要决定时，你主要依赖？',
    options: [
      { label: 'A', text: '理性的分析和数据' },
      { label: 'B', text: '直觉和内心的声音' },
      { label: 'C', text: '参考他人的经验和建议' },
      { label: 'D', text: '权衡利弊后做折中选择' },
    ],
    scoring: {
      0: { logic: 3 },
      1: { creativity: 2, resilience: 1 },
      2: { empathy: 1, learn: 1 },
      3: { logic: 1, exec: 1 },
    },
  },
  {
    id: 'q20',
    content: '你是否经常主动设定并完成目标？',
    options: [
      { label: 'A', text: '经常设定目标，并且大多数都能完成' },
      { label: 'B', text: '会设定目标，但执行力忽高忽低' },
      { label: 'C', text: '偶尔设定，看心情和状态' },
      { label: 'D', text: '不太喜欢设定目标，随遇而安' },
    ],
    scoring: {
      0: { exec: 3, lead: 1 },
      1: { exec: 2 },
      2: { exec: 1 },
      3: {},
    },
  },
  // ---- 记忆 & 综合 ---- (q21-q26)
  {
    id: 'q21',
    content: '你能轻松记住复杂的指令或路线吗？',
    options: [
      { label: 'A', text: '告诉一遍就能记住，导航不用开' },
      { label: 'B', text: '大部分能记住，复杂的地方需要查一下' },
      { label: 'C', text: '需要用笔记下来或者依赖导航' },
      { label: 'D', text: '记忆力比较差，经常需要反复确认' },
    ],
    scoring: {
      0: { memory: 3, observation: 1 },
      1: { memory: 2 },
      2: { memory: 1, observation: 1 },
      3: {},
    },
  },
  {
    id: 'q22',
    content: '别人描述你时，最常提到哪个特质？',
    options: [
      { label: 'A', text: '靠谱，做事让人放心' },
      { label: 'B', text: '聪明，点子多反应快' },
      { label: 'C', text: '好相处，让人感到舒服' },
      { label: 'D', text: '有主见，能带得动大家' },
    ],
    scoring: {
      0: { exec: 2, resilience: 1 },
      1: { creativity: 2, logic: 1 },
      2: { empathy: 3 },
      3: { lead: 3 },
    },
  },
  {
    id: 'q23',
    content: '面对一个完全陌生的领域？',
    options: [
      { label: 'A', text: '很兴奋，马上开始调研学习' },
      { label: 'B', text: '会感到挑战，但有信心搞定' },
      { label: 'C', text: '有些不安，需要搭建知识框架再开始' },
      { label: 'D', text: '感到无从下手，希望有人带' },
    ],
    scoring: {
      0: { learn: 3, resilience: 1 },
      1: { resilience: 2, learn: 1 },
      2: { logic: 1, learn: 1 },
      3: { resilience: 0 },
    },
  },
  {
    id: 'q24',
    content: '项目出现意外问题时？',
    options: [
      { label: 'A', text: '保持冷静，快速排查原因' },
      { label: 'B', text: '迅速组织人员，分头解决问题' },
      { label: 'C', text: '分析影响范围，制定应急方案' },
      { label: 'D', text: '有点慌，但知道找谁能帮忙' },
    ],
    scoring: {
      0: { resilience: 3, logic: 1 },
      1: { lead: 2, exec: 2 },
      2: { exec: 2, logic: 1 },
      3: { comm: 1 },
    },
  },
  {
    id: 'q25',
    content: '你觉得自己最需要提升的是？',
    options: [
      { label: 'A', text: '结构性思维和逻辑分析' },
      { label: 'B', text: '与人沟通和表达的能力' },
      { label: 'C', text: '设定目标并坚持完成的执行力' },
      { label: 'D', text: '情绪管理和抗压能力' },
    ],
    scoring: {
      0: {},
      1: {},
      2: {},
      3: {},
    },
  },
  {
    id: 'q26',
    content: '下面哪句话最能描述你的人生态度？',
    options: [
      { label: 'A', text: '穷尽真理的探索者' },
      { label: 'B', text: '不断创造的艺术家' },
      { label: 'C', text: '踏实前行的行动者' },
      { label: 'D', text: '温暖他人的陪伴者' },
    ],
    scoring: {
      0: { logic: 2, learn: 1 },
      1: { creativity: 3 },
      2: { exec: 2, resilience: 1 },
      3: { empathy: 3 },
    },
  },
]

/** 天赋罗盘模拟报告数据 */
export const mockTalentReport: MockReport = {
  testName: '天赋罗盘测试',
  completedDate: '2026年5月23日',
  dimensionScores: [
    { key: 'logic', name: '逻辑推理', percentage: 85, level: 'high' },
    { key: 'creativity', name: '创造想象', percentage: 72, level: 'high' },
    { key: 'memory', name: '记忆能力', percentage: 65, level: 'medium' },
    { key: 'observation', name: '观察感知', percentage: 78, level: 'high' },
    { key: 'comm', name: '沟通表达', percentage: 58, level: 'medium' },
    { key: 'lead', name: '领导组织', percentage: 45, level: 'medium' },
    { key: 'exec', name: '执行实操', percentage: 90, level: 'high' },
    { key: 'empathy', name: '同理共情', percentage: 62, level: 'medium' },
    { key: 'resilience', name: '抗压韧性', percentage: 70, level: 'high' },
    { key: 'learn', name: '学习适应', percentage: 82, level: 'high' }
  ],
  summary: '你的逻辑推理和执行实操能力最为突出，显示出强大的分析问题和落地执行能力。学习适应能力也处于高位，说明你能快速掌握新技能。沟通表达和领导组织有提升空间，建议通过实际项目锻炼。',
  suggestions: [
    '发挥逻辑推理优势，从事数据分析、产品管理等相关工作',
    '结合执行实操能力，尝试项目管理或运营类岗位',
    '加强沟通表达训练，可通过演讲或写作提升',
    '参与团队项目，锻炼领导组织能力'
  ],
  careerMatches: [
    { careerId: 'c1', careerName: '数据分析师', matchScore: 92, reason: '逻辑推理能力突出，善于处理复杂数据' },
    { careerId: 'c2', careerName: '产品经理', matchScore: 88, reason: '分析能力与执行力兼备，适合产品规划' },
    { careerId: 'c3', careerName: '项目经理', matchScore: 82, reason: '执行力强，善于推动项目落地' },
    { careerId: 'c4', careerName: '咨询顾问', matchScore: 78, reason: '逻辑清晰，学习能力强' }
  ]
}

/** 霍兰德职业兴趣模拟报告数据 */
export const mockHollandReport: MockReport = {
  testName: '霍兰德职业兴趣测试',
  completedDate: new Date().toLocaleDateString('zh-CN'),
  dimensionScores: [
    { key: 'realistic', name: '实际型', percentage: 65, level: 'medium' },
    { key: 'investigative', name: '研究型', percentage: 82, level: 'high' },
    { key: 'artistic', name: '艺术型', percentage: 45, level: 'medium' },
    { key: 'social', name: '社会型', percentage: 72, level: 'high' },
    { key: 'enterprise', name: '企业型', percentage: 58, level: 'medium' },
    { key: 'conventional', name: '常规型', percentage: 70, level: 'high' }
  ],
  summary: '你的研究型和社会型特征较为突出，说明你既善于独立思考和分析问题，也乐于与人合作和交流。建议选择需要分析能力和人际交往相结合的职业方向。',
  suggestions: [
    '发挥研究型优势，从事教育科研、数据分析等需要深度思考的工作',
    '结合社会型特质，尝试咨询、培训等需要人际互动的岗位',
    '适当发展艺术型和企业型能力，拓宽职业选择面'
  ],
  careerMatches: [
    { careerId: 'h1', careerName: '心理咨询师', matchScore: 90, reason: '研究能力与社会能力兼备，适合心理学方向' },
    { careerId: 'h2', careerName: '数据分析师', matchScore: 85, reason: '研究能力强，善于深度分析' },
    { careerId: 'h3', careerName: '教师/培训师', matchScore: 82, reason: '社会型突出，善于知识传授' },
    { careerId: 'h4', careerName: '科研人员', matchScore: 80, reason: '研究型特征明显，适合学术方向' }
  ]
}

/** Suggested goal generated from test scores */
export interface PlanRecommendation {
  title: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * Generate plan recommendations based on dimension scores.
 */
export function generatePlanRecommendations(
  scores: Record<string, number>,
): PlanRecommendation[] {
  const recommendations: PlanRecommendation[] = []

  if ((scores.logic || 0) > 70 || (scores.creativity || 0) > 70) {
    recommendations.push({
      title: '学习数据分析或编程技能',
      priority: 'high',
      reason: '逻辑与创造力突出，适合技术方向深耕',
    })
  }

  if ((scores.comm || 0) < 50 || (scores.lead || 0) < 50) {
    recommendations.push({
      title: '参加沟通表达训练',
      priority: 'high',
      reason: '表达与领导力有提升空间，针对性训练可放大技术优势',
    })
  }

  if ((scores.exec || 0) > 80) {
    recommendations.push({
      title: '参与一个实际项目',
      priority: 'medium',
      reason: '执行力强，落地项目能最快验证学习成果',
    })
  }

  if ((scores.empathy || 0) > 70) {
    recommendations.push({
      title: '参与志愿服务或团队协作',
      priority: 'medium',
      reason: '共情能力强，在团队协作和人本导向的工作中更有优势',
    })
  }

  if ((scores.learn || 0) > 70) {
    recommendations.push({
      title: '保持每日阅读或学习30分钟',
      priority: 'medium',
      reason: '学习适应能力强，坚持输入会让你快速脱颖而出',
    })
  }

  if ((scores.investigative || 0) > 70) {
    recommendations.push({
      title: '深入研究一个感兴趣的技术领域',
      priority: 'high',
      reason: '研究型特质突出，深度探索会让你找到热爱的方向',
    })
  }
  if ((scores.social || 0) > 70 || (scores.enterprise || 0) > 70) {
    recommendations.push({
      title: '参加行业交流活动或社群',
      priority: 'medium',
      reason: '社会/企业型特质适合通过人际网络获取职业机会',
    })
  }

  return recommendations.slice(0, 5)
}
