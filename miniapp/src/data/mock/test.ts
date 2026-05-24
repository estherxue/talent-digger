// 测评相关 mock 数据
// 实际接入后删除此文件，改用云函数调用

export interface MockQuestion {
  id: string
  content: string
  options: { label: string; text: string }[]
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

/** 天赋罗盘模拟题目 */
export const mockTalentQuestions: MockQuestion[] = [
  {
    id: 'q1',
    content: '当面对一个陌生的复杂任务时，你的第一反应通常是？',
    options: [
      { label: 'A', text: '仔细分析任务结构，制定详细的执行计划' },
      { label: 'B', text: '边做边摸索，在实践中找到最佳方法' },
      { label: 'C', text: '先观察别人的做法，模仿学习' },
      { label: 'D', text: '凭直觉和灵感直接上手' }
    ]
  },
  {
    id: 'q2',
    content: '团队开会时，你更倾向于？',
    options: [
      { label: 'A', text: '积极表达自己的观点，引导讨论方向' },
      { label: 'B', text: '认真倾听，在关键点上提出深刻的见解' },
      { label: 'C', text: '帮大家梳理思路，总结形成共识' },
      { label: 'D', text: '观察每个人的反应和团队氛围' }
    ]
  },
  {
    id: 'q3',
    content: '学习新知识时，你最喜欢的方式是？',
    options: [
      { label: 'A', text: '阅读书籍和文档，系统学习' },
      { label: 'B', text: '动手实践，边做边学' },
      { label: 'C', text: '观看视频教程，直观理解' },
      { label: 'D', text: '与他人讨论交流，碰撞想法' }
    ]
  },
  {
    id: 'q4',
    content: '面对截止日期的压力，你通常会？',
    options: [
      { label: 'A', text: '更加专注高效，压力是动力' },
      { label: 'B', text: '感到焦虑但能按时完成' },
      { label: 'C', text: '提前规划，避免最后一刻匆忙' },
      { label: 'D', text: '需要他人督促和提醒' }
    ]
  },
  {
    id: 'q5',
    content: '在社交场合中，你通常？',
    options: [
      { label: 'A', text: '主动结识新朋友，享受社交' },
      { label: 'B', text: '与熟悉的人交流，保持舒适圈' },
      { label: 'C', text: '观察他人，选择性互动' },
      { label: 'D', text: '更喜欢独处或小范围交流' }
    ]
  }
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
    { key: 'communication', name: '沟通表达', percentage: 58, level: 'medium' },
    { key: 'leadership', name: '领导组织', percentage: 45, level: 'medium' },
    { key: 'execution', name: '执行实操', percentage: 90, level: 'high' },
    { key: 'empathy', name: '同理共情', percentage: 62, level: 'medium' },
    { key: 'resilience', name: '抗压韧性', percentage: 70, level: 'high' },
    { key: 'learning', name: '学习适应', percentage: 82, level: 'high' }
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
