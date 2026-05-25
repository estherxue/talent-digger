import type { Dimension } from '../types/test'

// 天赋罗盘 - 10 个核心天赋维度
export const TALENT_DIMENSIONS: Dimension[] = [
  { key: 'logic', name: '逻辑推理', description: '运用理性思维分析问题、推导结论的能力' },
  { key: 'creativity', name: '创造想象', description: '产生新颖想法、打破常规思维的能力' },
  { key: 'memory', name: '记忆能力', description: '快速记住并准确回忆信息的能力' },
  { key: 'observation', name: '观察感知', description: '敏锐察觉细节和环境变化的能力' },
  { key: 'comm', name: '沟通表达', description: '清晰传达想法、有效与人交流的能力' },
  { key: 'lead', name: '领导组织', description: '带领团队、协调资源达成目标的能力' },
  { key: 'exec', name: '执行实操', description: '将计划转化为行动、高效完成任务的能力' },
  { key: 'empathy', name: '同理共情', description: '理解他人感受、建立深度情感连接的能力' },
  { key: 'resilience', name: '抗压韧性', description: '在压力下保持稳定、快速恢复的能力' },
  { key: 'learn', name: '学习适应', description: '快速掌握新知识、适应变化的能力' }
]

// 霍兰德职业兴趣 - 6 个维度
export const HOLLAND_DIMENSIONS: Dimension[] = [
  { key: 'realistic', name: '实际型 (R)', description: '喜欢动手操作、使用工具和机器，偏好户外或体力活动' },
  { key: 'investigative', name: '研究型 (I)', description: '喜欢观察分析、解决问题，偏好科学和数学活动' },
  { key: 'artistic', name: '艺术型 (A)', description: '喜欢创造、自我表达，偏好艺术、音乐、写作等活动' },
  { key: 'social', name: '社会型 (S)', description: '喜欢帮助他人、教学指导，偏好与人打交道的活动' },
  { key: 'enterprise', name: '企业型 (E)', description: '喜欢领导说服、经营管理，偏好商业和政治活动' },
  { key: 'conventional', name: '常规型 (C)', description: '喜欢组织规划、数据处理，偏好结构化和秩序性活动' }
]

// 三叶草规划三要素
export const CLOVER_ELEMENTS = [
  { key: 'interests', label: '兴趣', description: '做什么事情能让你感到快乐和满足？' },
  { key: 'abilities', label: '能力', description: '你擅长做什么？哪些事情你做得比别人好？' },
  { key: 'values', label: '价值观', description: '什么对你来说最重要？你追求什么样的生活方式？' }
]

// 三圈法三要素
export const THREE_CIRCLES = [
  { key: 'passion', label: '热爱的', description: '做什么事情让你感到充满热情？' },
  { key: 'talent', label: '擅长的', description: '你的核心优势是什么？' },
  { key: 'demand', label: '被需要的', description: '社会和市场需要什么？哪些技能有需求？' }
]
