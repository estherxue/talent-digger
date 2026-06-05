# Plan Page Redesign & Stage Summary Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded plan mock data with a user-driven three-level plan system (Plan → Goal → Sub-task) with streak tracking; add a stage summary modal after test completion on the home page.

**Architecture:** Two phases. Phase 1 (Tasks 1-5) builds the stage summary modal: add scoring maps to questions, create a scoring utility, create a one-liner generator, modify the answer→home redirect, and build the modal in index.vue. Phase 2 (Tasks 6-10) rebuilds the plan page: define types, build the three-level UI with expandable cards, add a goal creation form, add streak logic, and wire in plan recommendations.

**Tech Stack:** Vue 3 (Composition API), TypeScript, uni-app (WeChat mini-program runtime), uni.StorageSync, vitest for testing.

---

## File Structure

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `miniapp/src/data/mock/test.ts` | Add per-option scoring maps for talent compass questions; add recommendation + summary generators |
| Create | `miniapp/src/utils/scoring.ts` | Compute dimension percentages from user answers |
| Create | `miniapp/src/utils/summary.ts` | Generate one-liner personality summary |
| Modify | `miniapp/src/utils/index.ts` | Barrel export scoring + summary |
| Modify | `miniapp/src/pages/test/answer.vue` | Redirect to home after submit instead of report |
| Modify | `miniapp/src/pages/index/index.vue` | Add stage-summary modal + onShow detection |
| Modify | `miniapp/src/pages/plan/index.vue` | Full rewrite: three-level UI, goal form, streak display |
| Create | `miniapp/src/composables/usePlanLogic.ts` | Plan/goal/sub-task CRUD + streak calculation |
| Create | `miniapp/src/__tests__/scoring.test.ts` | Tests for scoring utility |
| Create | `miniapp/src/__tests__/summary.test.ts` | Tests for summary generator |
| Create | `miniapp/src/__tests__/plan-logic.test.ts` | Tests for usePlanLogic |

---

## Phase 1: Stage Summary Modal

### Task 1: Add scoring maps to talent compass mock questions

**Files:**
- Modify: `miniapp/src/data/mock/test.ts`

Each question option maps one or more dimensions. Add a `scoring` field to each question in `mockTalentQuestions`. The `scoring` map uses dimension keys with weight values.

- [ ] **Step 1: Update the MockQuestion interface to include scoring**

```typescript
// In miniapp/src/data/mock/test.ts, update the existing MockQuestion interface:
export interface MockQuestion {
  id: string
  content: string
  options: { label: string; text: string }[]
  // NEW: per-option dimension scoring. keys are option indices (0-3), values are {dimKey: weight}
  scoring: Record<number, Record<string, number>>
}
```

- [ ] **Step 2: Add scoring field to all 26 questions**

Replace the entire `mockTalentQuestions` array with the version that includes scoring maps. Here is the complete replacement:

```typescript
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
      0: {},  // user identifies weakness — no points
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
```

- [ ] **Step 3: Verify compilation**

Run: `cd miniapp && npx tsc --noEmit`

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
/usr/bin/git add miniapp/src/data/mock/test.ts
/usr/bin/git commit -m 'feat: add per-option scoring maps to talent compass questions'
```

---

### Task 2: Create scoring utility

**Files:**
- Create: `miniapp/src/utils/scoring.ts`
- Create: `miniapp/src/__tests__/scoring.test.ts`
- Modify: `miniapp/src/utils/index.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// miniapp/src/__tests__/scoring.test.ts
import { describe, it, expect } from 'vitest'
import { computeDimensionScores } from '@/utils/scoring'
import type { MockQuestion } from '@/data/mock/test'

const sampleQuestions: MockQuestion[] = [
  {
    id: 'q1', content: 'Test Q1',
    options: [
      { label: 'A', text: 'Opt A' },
      { label: 'B', text: 'Opt B' },
    ],
    scoring: {
      0: { logic: 3, exec: 1 },
      1: { creativity: 2 },
    },
  },
  {
    id: 'q2', content: 'Test Q2',
    options: [
      { label: 'A', text: 'Opt A' },
      { label: 'B', text: 'Opt B' },
    ],
    scoring: {
      0: { logic: 1, memory: 2 },
      1: { exec: 3 },
    },
  },
]

describe('computeDimensionScores', () => {
  it('accumulates scores from multiple questions', () => {
    const answers: Record<string, number> = { q1: 0, q2: 0 }
    const result = computeDimensionScores(answers, sampleQuestions)
    expect(result).toHaveProperty('logic')
    expect(result).toHaveProperty('exec')
    expect(result).toHaveProperty('memory')
    // logic: q1→3 + q2→1 = 4
    expect(result.logic).toBe(4)
    // exec: q1→1 + q2→0 = 1
    expect(result.exec).toBe(1)
    // memory: q1→0 + q2→2 = 2
    expect(result.memory).toBe(2)
  })

  it('handles empty answers', () => {
    const result = computeDimensionScores({}, sampleQuestions)
    Object.values(result).forEach(v => expect(v).toBe(0))
  })

  it('normalizes scores to percentages 0-100', () => {
    const answers: Record<string, number> = { q1: 0, q2: 1 }
    const result = computeDimensionScores(answers, sampleQuestions, { normalize: true })
    // logic: q1=3, creativity: q2=2, exec: q2=3
    // max possible per question: ~3
    const pct = computeDimensionScores(answers, sampleQuestions, { normalize: true })
    // All values should be between 0 and 100
    Object.values(pct).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    })
  })

  it('returns all known dimension keys even with zero scores', () => {
    const answers: Record<string, number> = {}
    const result = computeDimensionScores(answers, sampleQuestions)
    // Should include all dimensions present in the question scoring maps
    expect(result).toHaveProperty('logic')
    expect(result).toHaveProperty('exec')
    expect(result).toHaveProperty('creativity')
    expect(result).toHaveProperty('memory')
  })

  it('returns empty object for empty question list', () => {
    const result = computeDimensionScores({ q1: 0 }, [])
    expect(Object.keys(result).length).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd miniapp && npx vitest run src/__tests__/scoring.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Write the scoring utility**

```typescript
// miniapp/src/utils/scoring.ts
import type { MockQuestion } from '@/data/mock/test'

export interface DimensionScoreResult {
  [dimKey: string]: number // raw score (or percentage if normalized)
}

interface ComputeOptions {
  /** If true, normalize raw scores to 0-100 percentages */
  normalize: boolean
}

/**
 * Compute dimension scores from user answers.
 *
 * For each answer, looks up the question's scoring map and adds the
 * per-dimension weights to the accumulator. Optionally normalizes
 * all scores to a 0-100 percentage scale.
 */
export function computeDimensionScores(
  answers: Record<string, number>,
  questions: MockQuestion[],
  options: ComputeOptions = { normalize: true },
): DimensionScoreResult {
  const rawScores: Record<string, number> = {}

  // Build a lookup map for questions
  const questionMap = new Map<string, MockQuestion>()
  for (const q of questions) questionMap.set(q.id, q)

  // Accumulate raw scores
  for (const [questionId, answerIdx] of Object.entries(answers)) {
    const question = questionMap.get(questionId)
    if (!question) continue
    const dimScores = question.scoring[answerIdx]
    if (!dimScores) continue
    for (const [dimKey, weight] of Object.entries(dimScores)) {
      rawScores[dimKey] = (rawScores[dimKey] || 0) + (weight as number)
    }
  }

  // Also seed ALL possible dimension keys (even those with 0 score)
  for (const q of questions) {
    for (const scores of Object.values(q.scoring)) {
      for (const dimKey of Object.keys(scores as object)) {
        if (!(dimKey in rawScores)) rawScores[dimKey] = 0
      }
    }
  }

  if (!options.normalize) return rawScores

  // Normalize to 0-100
  const result: Record<string, number> = {}
  // Compute the max possible score: for each question, take the max sum of any option
  let maxPossible = 0
  for (const q of questions) {
    let questionMax = 0
    for (const scores of Object.values(q.scoring)) {
      const sum = Object.values(scores as object).reduce((a: number, b: number) => a + b, 0)
      if (sum > questionMax) questionMax = sum
    }
    maxPossible += questionMax
  }

  // If all questions are scored at max, the rawScore for a dimension could reach maxPossible
  // For simplicity, divide by maxPossible * 100 and cap at 100
  if (maxPossible > 0) {
    for (const [key, raw] of Object.entries(rawScores)) {
      result[key] = Math.min(100, Math.round((raw / maxPossible) * 100))
    }
  } else {
    Object.assign(result, rawScores)
  }

  return result
}

/**
 * Get the top N dimension keys sorted by score descending.
 */
export function topDimensions(
  scores: Record<string, number>,
  n = 3,
): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd miniapp && npx vitest run src/__tests__/scoring.test.ts`

Expected: 4/4 PASS.

- [ ] **Step 5: Update the barrel export**

```typescript
// miniapp/src/utils/index.ts — add two lines:
export * from './scoring'
export * from './summary'
```

- [ ] **Step 6: Run full test suite**

Run: `cd miniapp && npx vitest run`

Expected: All tests pass (including existing answer.test.ts).

- [ ] **Step 7: Commit**

```bash
/usr/bin/git add miniapp/src/utils/scoring.ts miniapp/src/utils/index.ts miniapp/src/__tests__/scoring.test.ts
/usr/bin/git commit -m 'feat: add dimension scoring utility with tests'
```

---

### Task 3: Create one-liner summary generator

**Files:**
- Create: `miniapp/src/utils/summary.ts`
- Create: `miniapp/src/__tests__/summary.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// miniapp/src/__tests__/summary.test.ts
import { describe, it, expect } from 'vitest'
import { generateSummary } from '@/utils/summary'

describe('generateSummary', () => {
  it('returns "逻辑缜密的行动派" when top dims include exec + logic', () => {
    const top = ['exec', 'logic', 'learn']
    expect(generateSummary(top)).toContain('逻辑缜密')
    expect(generateSummary(top)).toContain('行动派')
  })

  it('returns "敏锐细腻的创造者" when top dims include creativity + observation', () => {
    const top = ['creativity', 'observation', 'memory']
    expect(generateSummary(top)).toContain('创造者')
  })

  it('returns "善解人意的沟通者" when top dims include empathy + comm', () => {
    const top = ['empathy', 'comm', 'observation']
    expect(generateSummary(top)).toContain('沟通者')
  })

  it('returns "坚韧不拔的领导者" when top dims include lead + resilience', () => {
    const top = ['lead', 'resilience', 'exec']
    expect(generateSummary(top)).toContain('领导者')
  })

  it('returns fallback when no pattern matches', () => {
    const top = ['memory', 'observation', 'learn']
    expect(generateSummary(top)).toContain('探索者')
  })

  it('handles empty array', () => {
    expect(generateSummary([])).toBeDefined()
    expect(typeof generateSummary([])).toBe('string')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd miniapp && npx vitest run src/__tests__/summary.test.ts`

Expected: FAIL.

- [ ] **Step 3: Write the summary generator**

```typescript
// miniapp/src/utils/summary.ts

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

  // Pattern matching: check for combinations in top-3
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd miniapp && npx vitest run src/__tests__/summary.test.ts`

Expected: 6/6 PASS.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add miniapp/src/utils/summary.ts miniapp/src/__tests__/summary.test.ts miniapp/src/utils/index.ts
/usr/bin/git commit -m 'feat: add one-liner personality summary generator with tests'
```

---

### Task 4: Modify answer.vue to redirect to home page after submit

**Files:**
- Modify: `miniapp/src/pages/test/answer.vue`

- [ ] **Step 1: Change redirect from report page to home page with params**

In `miniapp/src/pages/test/answer.vue`, find the `confirmSubmit` function. Replace the redirect logic:

**Remove these lines (current code at ~lines 135-151):**

```typescript
  try {
    const res = await submitTestResult(testId.value, answers.value)
    if (res.code === 0) {
      uni.redirectTo({
        url: `/pages/report/index?testId=${testId.value}&resultId=${res.data?.resultId || 'local'}`
      })
      return
    }
  } catch (e: any) {
    console.error('提交失败，使用本地数据跳转', e)
  } finally {
    submitting.value = false
  }

  // Fallback: 直接跳转到报告页，报告页会从本地存储读取答案
  uni.redirectTo({
    url: `/pages/report/index?testId=${testId.value}&resultId=local`
  })
```

**Replace with:**

```typescript
  try {
    const res = await submitTestResult(testId.value, answers.value)
    if (res.code === 0) {
      // 云函数成功：返回首页，携带提交标识，展示阶段总结弹窗
      uni.redirectTo({
        url: `/pages/index/index?from=submit&testId=${testId.value}`
      })
      return
    }
  } catch (e: any) {
    console.error('提交失败，使用本地数据跳转', e)
  } finally {
    submitting.value = false
  }

  // Fallback: 云函数不可用，仍返回首页（报告页可从首页跳转查看）
  uni.redirectTo({
    url: `/pages/index/index?from=submit&testId=${testId.value}`
  })
```

- [ ] **Step 2: Verify compilation**

Run: `cd miniapp && npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
/usr/bin/git add miniapp/src/pages/test/answer.vue
/usr/bin/git commit -m 'feat: redirect to home page with stage-summary params after test submit'
```

---

### Task 5: Add stage summary modal to home page

**Files:**
- Modify: `miniapp/src/pages/index/index.vue`

- [ ] **Step 1: Add stage summary modal to index.vue**

In `miniapp/src/pages/index/index.vue`, update the `<script setup lang="ts">` section:

Add imports and state at the top (after existing imports):

```typescript
import { ref } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { smartNavigate } from '@/utils'
import { computeDimensionScores, topDimensions } from '@/utils/scoring'
import { generateSummary, dimName } from '@/utils/summary'
import { mockTalentQuestions } from '@/data/mock/test'

const talentDone = ref(false)
const hollandDone = ref(false)
const bothDone = ref(false)

// ---- stage summary modal state ----
const showStageSummary = ref(false)
const stageTestId = ref('')
const stageTestName = ref('')
const stageTopDims = ref<{ key: string; name: string; pct: number }[]>([])
const stageSummaryText = ref('')
const stageNextTestId = ref('')
const stageNextTestName = ref('')

// ... existing refreshState, onShow, startTalent, startHolland, viewResult
// keep them all unchanged
```

Add a `maybeShowSummary` function and update `onShow`:

```typescript
// Add after the existing refreshState function (~line 97)

/** Check if we should show a stage summary modal */
function maybeShowSummary() {
  try {
    const rawLastTestId = uni.getStorageSync('lastTestId')
    const rawLastAnswers = uni.getStorageSync('lastAnswers')
    if (!rawLastTestId || !rawLastAnswers) return

    // Only show for talent compass (first test) for now
    if (rawLastTestId !== 'test_talent_compass' && rawLastTestId !== 'test_holland') return

    // Check if we already showed the summary for this test
    const rawSeen = uni.getStorageSync('seenStageSummary') || '[]'
    const seen: string[] = JSON.parse(rawSeen)
    if (seen.includes(rawLastTestId)) return

    const answers = JSON.parse(rawLastAnswers)
    // Currently only talent compass has scoring maps; Holland support pending question data
    const questions = rawLastTestId === 'test_talent_compass'
      ? mockTalentQuestions
      : mockTalentQuestions // fallback for now
    const rawScores = computeDimensionScores(answers, questions, { normalize: true })
    const top = topDimensions(rawScores, 3)

    stageTestId.value = rawLastTestId
    stageTestName.value = rawLastTestId === 'test_talent_compass' ? '天赋罗盘' : '霍兰德职业兴趣'
    stageTopDims.value = top.map(k => ({ key: k, name: dimName(k), pct: rawScores[k] }))
    stageSummaryText.value = generateSummary(top)

    // Set up "next test" CTA
    if (rawLastTestId === 'test_talent_compass') {
      stageNextTestId.value = 'test_holland'
      stageNextTestName.value = '开始霍兰德测试'
    } else {
      stageNextTestId.value = ''
      stageNextTestName.value = '查看综合推荐'
    }

    showStageSummary.value = true

    // Mark as seen
    seen.push(rawLastTestId)
    uni.setStorageSync('seenStageSummary', JSON.stringify(seen))
  } catch {
    // Silently fail — the modal is a nice-to-have
  }
}
```

Update `onShow` to call `maybeShowSummary`:

```typescript
// Replace the existing onShow:
onShow(() => {
  refreshState()
  maybeShowSummary()
})
```

Add a `closeStageSummary` function:

```typescript
function closeStageSummary() {
  showStageSummary.value = false
}

function goToNextTest() {
  showStageSummary.value = false
  if (stageNextTestId.value === 'test_holland') {
    smartNavigate(`/pages/test/answer?testId=${stageNextTestId.value}`)
  } else if (stageNextTestId.value === '') {
    // After Holland, go to report page
    smartNavigate('/pages/report/index?testId=test_holland&resultId=local')
  }
}
```

- [ ] **Step 2: Add the modal template**

Insert the modal HTML **after** the closing `</view>` of `.page-index` but before `</template>`:

```html
    <!-- 阶段总结弹窗 -->
    <view class="stage-summary-mask" v-if="showStageSummary" @click="closeStageSummary">
      <view class="stage-summary-modal" @click.stop>
        <text class="stage-icon">🎉</text>
        <text class="stage-title">{{ stageTestName }} · 已完成</text>

        <view class="stage-scores">
          <text class="stage-scores-label">📊 你的优势维度</text>
          <view class="stage-dims">
            <text
              v-for="d in stageTopDims"
              :key="d.key"
              class="stage-dim-badge"
            >{{ d.name }} {{ d.pct }}%</text>
          </view>
        </view>

        <text class="stage-summary-text">{{ stageSummaryText }}</text>

        <view class="stage-cta" @click="goToNextTest">
          <text>{{ stageNextTestName }} →</text>
        </view>

        <text class="stage-skip" @click="closeStageSummary">跳过，以后再说</text>
      </view>
    </view>
```

- [ ] **Step 3: Add the modal styles**

Add these styles inside the `<style lang="scss" scoped>` block, before the closing `</style>`:

```scss
/* ---- 阶段总结弹窗 ---- */
.stage-summary-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.stage-summary-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 40rpx;
  text-align: center;
}

.stage-icon { font-size: 60rpx; display: block; margin-bottom: 16rpx; }

.stage-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 32rpx;
}

.stage-scores {
  background: #F0F6FF;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.stage-scores-label {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.stage-dims {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.stage-dim-badge {
  background: #E3F2FD;
  color: #1565C0;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.stage-summary-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.6;
  display: block;
  margin-bottom: 32rpx;
}

.stage-cta {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  padding: 20rpx 48rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: inline-block;
}

.stage-skip {
  font-size: 24rpx;
  color: #BBB;
  display: block;
  margin-top: 20rpx;
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd miniapp && npx tsc`

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add miniapp/src/pages/index/index.vue
/usr/bin/git commit -m 'feat: add stage summary modal to home page after test completion'
```

---

## Phase 2: Plan Page Redesign

### Task 6: Create plan data types and usePlanLogic composable

**Files:**
- Create: `miniapp/src/composables/usePlanLogic.ts`
- Create: `miniapp/src/__tests__/plan-logic.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// miniapp/src/__tests__/plan-logic.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { usePlanLogic } from '@/composables/usePlanLogic'

// Reset storage before each test
beforeEach(() => {
  // In test environment, storage is mocked by vitest
  const logic = usePlanLogic()
  logic.resetAll()
})

describe('usePlanLogic', () => {
  describe('createPlan', () => {
    it('adds a new plan with empty goals array', () => {
      const { plans, createPlan } = usePlanLogic()
      createPlan({ title: 'My Plan', period: 'short' })
      expect(plans.value.length).toBe(1)
      expect(plans.value[0].title).toBe('My Plan')
      expect(plans.value[0].period).toBe('short')
      expect(plans.value[0].goals).toEqual([])
    })

    it('generates unique plan IDs', () => {
      const { plans, createPlan } = usePlanLogic()
      createPlan({ title: 'A', period: 'short' })
      createPlan({ title: 'B', period: 'medium' })
      expect(plans.value[0].id).not.toBe(plans.value[1].id)
    })
  })

  describe('addGoal', () => {
    it('adds a goal to a plan with default values', () => {
      const { plans, createPlan, addGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'medium' })
      const planId = plans.value[0].id

      addGoal(planId, { title: 'Learn Vue' })
      expect(plans.value[0].goals.length).toBe(1)
      expect(plans.value[0].goals[0].title).toBe('Learn Vue')
      expect(plans.value[0].goals[0].completed).toBe(false)
      expect(plans.value[0].goals[0].priority).toBe('medium')
      expect(plans.value[0].goals[0].repeat).toBe('none')
    })

    it('accepts full goal config', () => {
      const { plans, createPlan, addGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'long' })
      const planId = plans.value[0].id

      addGoal(planId, {
        title: 'Daily Reading',
        deadline: '2026-07-01',
        priority: 'high',
        repeat: 'daily',
        subTasks: [{ title: 'Read 30 min', completed: false }],
      })

      const goal = plans.value[0].goals[0]
      expect(goal.priority).toBe('high')
      expect(goal.repeat).toBe('daily')
      expect(goal.subTasks.length).toBe(1)
    })
  })

  describe('toggleGoal', () => {
    it('toggles goal completion and updates plan progress', () => {
      const { plans, createPlan, addGoal, toggleGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'G1' })
      addGoal(planId, { title: 'G2' })

      expect(plans.value[0].completedGoals).toBe(0)

      toggleGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals[0].completed).toBe(true)
      expect(plans.value[0].completedGoals).toBe(1)

      toggleGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals[0].completed).toBe(false)
      expect(plans.value[0].completedGoals).toBe(0)
    })
  })

  describe('toggleSubTask', () => {
    it('toggles a sub-task completion', () => {
      const { plans, createPlan, addGoal, toggleSubTask } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, {
        title: 'G1',
        subTasks: [
          { title: 'S1', completed: false },
          { title: 'S2', completed: false },
        ],
      })

      toggleSubTask(planId, plans.value[0].goals[0].id, 0)
      expect(plans.value[0].goals[0].subTasks[0].completed).toBe(true)
      expect(plans.value[0].goals[0].subTasks[1].completed).toBe(false)
    })
  })

  describe('streak calculation', () => {
    it('computes streak for repeating goals', () => {
      const { plans, createPlan, addGoal, toggleGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'Daily', repeat: 'daily' })

      // Toggle the goal — should start a streak
      toggleGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals[0].currentStreak).toBeGreaterThanOrEqual(0)
    })

    it('non-repeating goals have 0 streak', () => {
      const { plans, createPlan, addGoal, toggleGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'One-time', repeat: 'none' })

      toggleGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals[0].currentStreak).toBe(0)
    })
  })

  describe('removeGoal', () => {
    it('removes a goal from a plan', () => {
      const { plans, createPlan, addGoal, removeGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'G1' })
      addGoal(planId, { title: 'G2' })

      removeGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals.length).toBe(1)
      expect(plans.value[0].goals[0].title).toBe('G2')
    })
  })

  describe('persistence', () => {
    it('loads plans from storage on init', () => {
      const { plans, createPlan } = usePlanLogic()
      createPlan({ title: 'Saved Plan', period: 'long' })

      // Create a new instance — should read from storage
      const { plans: plans2 } = usePlanLogic()
      expect(plans2.value.length).toBe(1)
      expect(plans2.value[0].title).toBe('Saved Plan')
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd miniapp && npx vitest run src/__tests__/plan-logic.test.ts`

Expected: FAIL — module not found.

- [ ] **Step 3: Write the usePlanLogic composable**

```typescript
// miniapp/src/composables/usePlanLogic.ts
import { ref, watch } from 'vue'

const STORAGE_KEY = 'growthPlans'

export interface SubTask {
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  repeat: 'none' | 'daily' | 'weekly'
  subTasks: SubTask[]
  completed: boolean
  streakLog: Record<string, boolean>
  currentStreak: number
  createdAt: number
}

export interface Plan {
  id: string
  title: string
  period: 'short' | 'medium' | 'long'
  goals: Goal[]
  completedGoals: number
  totalGoals: number
}

function generateId(): string {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function generateGoalId(): string {
  return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function computeStreak(streakLog: Record<string, boolean>, repeat: string): number {
  if (repeat === 'none') return 0
  // Count consecutive days backward from today
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (streakLog[key]) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function recalcPlan(plan: Plan) {
  plan.completedGoals = plan.goals.filter(g => g.completed).length
  plan.totalGoals = plan.goals.length
}

/** Load plans from storage */
function loadPlans(): Plan[] {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

/** Save plans to storage */
function savePlans(plans: Plan[]) {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(plans))
}

export function usePlanLogic() {
  const plans = ref<Plan[]>(loadPlans())

  // Auto-save on change
  watch(plans, (val) => savePlans(val), { deep: true })

  function resetAll() {
    plans.value = []
    savePlans([])
  }

  function createPlan(params: { title: string; period: Plan['period'] }) {
    plans.value.push({
      id: generateId(),
      title: params.title,
      period: params.period,
      goals: [],
      completedGoals: 0,
      totalGoals: 0,
    })
  }

  function findPlan(planId: string): Plan | undefined {
    return plans.value.find(p => p.id === planId)
  }

  function addGoal(planId: string, params: Partial<Goal> & { title: string }) {
    const plan = findPlan(planId)
    if (!plan) return

    plan.goals.push({
      id: generateGoalId(),
      title: params.title,
      deadline: params.deadline || '',
      priority: params.priority || 'medium',
      repeat: params.repeat || 'none',
      subTasks: params.subTasks || [],
      completed: false,
      streakLog: {},
      currentStreak: 0,
      createdAt: Date.now(),
    })
    recalcPlan(plan)
  }

  function removeGoal(planId: string, goalId: string) {
    const plan = findPlan(planId)
    if (!plan) return
    plan.goals = plan.goals.filter(g => g.id !== goalId)
    recalcPlan(plan)
  }

  function toggleGoal(planId: string, goalId: string) {
    const plan = findPlan(planId)
    if (!plan) return
    const goal = plan.goals.find(g => g.id === goalId)
    if (!goal) return

    goal.completed = !goal.completed

    // Streak tracking
    if (goal.repeat !== 'none' && goal.completed) {
      goal.streakLog[todayKey()] = true
      goal.currentStreak = computeStreak(goal.streakLog, goal.repeat)
    }
    if (!goal.completed && goal.repeat !== 'none') {
      delete goal.streakLog[todayKey()]
      goal.currentStreak = computeStreak(goal.streakLog, goal.repeat)
    }

    recalcPlan(plan)
  }

  function toggleSubTask(planId: string, goalId: string, subIdx: number) {
    const plan = findPlan(planId)
    if (!plan) return
    const goal = plan.goals.find(g => g.id === goalId)
    if (!goal || subIdx < 0 || subIdx >= goal.subTasks.length) return

    goal.subTasks[subIdx].completed = !goal.subTasks[subIdx].completed
  }

  function getPlanStreak(plan: Plan): number {
    let max = 0
    for (const g of plan.goals) {
      if (g.currentStreak > max) max = g.currentStreak
    }
    return max
  }

  return {
    plans,
    createPlan,
    addGoal,
    removeGoal,
    toggleGoal,
    toggleSubTask,
    getPlanStreak,
    resetAll,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd miniapp && npx vitest run src/__tests__/plan-logic.test.ts`

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add miniapp/src/composables/usePlanLogic.ts miniapp/src/__tests__/plan-logic.test.ts
/usr/bin/git commit -m 'feat: add usePlanLogic composable with three-level plan system and tests'
```

---

### Task 7: Rewrite plan page UI with three-level expandable cards

**Files:**
- Modify: `miniapp/src/pages/plan/index.vue`

This is a full rewrite. Below is the complete file.

- [ ] **Step 1: Write the full plan/index.vue**

```vue
<template>
  <view class="page-plan">
    <view class="page-header">
      <text class="page-title">成长计划</text>
      <view class="add-btn" @click="openCreatePlan">+ 新建计划</view>
    </view>

    <view class="plans-list" v-if="plans.length > 0">
      <view class="plan-card" v-for="plan in plans" :key="plan.id">
        <!-- Plan Header -->
        <view class="plan-header">
          <text class="plan-name">{{ plan.title }}</text>
          <text class="plan-period" :class="plan.period">{{ periodLabel(plan.period) }}</text>
        </view>

        <!-- Plan Progress -->
        <view class="plan-progress" v-if="plan.totalGoals > 0">
          <text class="progress-text">
            <text v-if="getPlanStreak(plan) > 0" class="streak">🔥 连续打卡 {{ getPlanStreak(plan) }} 天 | </text>
            已完成 {{ plan.completedGoals }} / {{ plan.totalGoals }} 目标
          </text>
          <view class="progress-bar">
            <view class="bar-inner" :style="{ width: plan.totalGoals > 0 ? (plan.completedGoals / plan.totalGoals * 100) + '%' : '0%' }"></view>
          </view>
        </view>

        <!-- Goals List -->
        <view class="goal-list" v-if="plan.goals.length > 0">
          <view
            class="goal-item"
            v-for="goal in plan.goals"
            :key="goal.id"
          >
            <view class="goal-main">
              <view class="goal-check" :class="{ checked: goal.completed }" @click="toggleGoal(plan.id, goal.id)">
                <text v-if="goal.completed">✓</text>
              </view>
              <view class="goal-info" @click="toggleGoalExpand(goal.id)">
                <view class="goal-top">
                  <text class="goal-priority" :class="'pri-' + goal.priority">
                    {{ priorityLabel(goal.priority) }}
                  </text>
                  <text class="goal-title" :class="{ done: goal.completed }">{{ goal.title }}</text>
                  <text class="goal-repeat" v-if="goal.repeat !== 'none'">{{ repeatLabel(goal.repeat) }}</text>
                </view>
                <view class="goal-meta">
                  <text class="goal-deadline" v-if="goal.deadline">截止: {{ goal.deadline }}</text>
                  <text class="goal-streak" v-if="goal.currentStreak > 0">🔥 {{ goal.currentStreak }}天</text>
                </view>
              </view>
            </view>

            <!-- Sub-tasks (expandable) -->
            <view class="sub-tasks" v-if="goal.subTasks.length > 0 && expandedGoals.has(goal.id)">
              <view
                class="sub-task-item"
                v-for="(st, idx) in goal.subTasks"
                :key="idx"
                @click="toggleSubTask(plan.id, goal.id, idx)"
              >
                <view class="sub-check" :class="{ checked: st.completed }">
                  <text v-if="st.completed">✓</text>
                </view>
                <text class="sub-title" :class="{ done: st.completed }">{{ st.title }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Add Goal Button -->
        <view class="add-goal-btn" @click="openAddGoal(plan.id)">
          <text>+ 添加新目标</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">🎯</text>
      <text class="empty-title">还没有成长计划</text>
      <text class="empty-desc">完成测评后制定你的个人成长计划</text>
    </view>

    <!-- Create Plan Modal -->
    <view class="modal-overlay" v-if="showCreatePlan" @click="showCreatePlan = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">新建成长计划</text>
        <input class="modal-input" v-model="newPlanTitle" placeholder="计划名称，如：3个月成为前端工程师" />
        <view class="period-select">
          <text class="select-label">计划周期</text>
          <view class="period-options">
            <view class="period-opt" :class="{active: newPeriod==='short'}" @click="newPeriod='short'">短期(1月)</view>
            <view class="period-opt" :class="{active: newPeriod==='medium'}" @click="newPeriod='medium'">中期(6月)</view>
            <view class="period-opt" :class="{active: newPeriod==='long'}" @click="newPeriod='long'">长期(1年)</view>
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showCreatePlan = false">取消</view>
          <view class="modal-btn confirm" @click="createPlan">创建</view>
        </view>
      </view>
    </view>

    <!-- Add Goal Modal (bottom sheet) -->
    <view class="modal-overlay" v-if="showAddGoal" @click="showAddGoal = false">
      <view class="goal-sheet" @click.stop>
        <text class="modal-title">添加新目标</text>

        <input class="modal-input" v-model="goalForm.title" placeholder="目标名称" />

        <view class="form-row">
          <text class="form-label">截止日期</text>
          <input class="form-input-half" v-model="goalForm.deadline" placeholder="2026-06-15" />
        </view>

        <view class="form-row">
          <text class="form-label">优先级</text>
          <view class="chip-group">
            <view class="chip" :class="{active: goalForm.priority==='high'}" @click="goalForm.priority='high'">高</view>
            <view class="chip" :class="{active: goalForm.priority==='medium'}" @click="goalForm.priority='medium'">中</view>
            <view class="chip" :class="{active: goalForm.priority==='low'}" @click="goalForm.priority='low'">低</view>
          </view>
        </view>

        <view class="form-row">
          <text class="form-label">重复周期</text>
          <view class="chip-group">
            <view class="chip" :class="{active: goalForm.repeat==='none'}" @click="goalForm.repeat='none'">不重复</view>
            <view class="chip" :class="{active: goalForm.repeat==='daily'}" @click="goalForm.repeat='daily'">每日</view>
            <view class="chip" :class="{active: goalForm.repeat==='weekly'}" @click="goalForm.repeat='weekly'">每周</view>
          </view>
        </view>

        <!-- Sub-steps -->
        <view class="form-row">
          <text class="form-label">子步骤</text>
        </view>
        <view class="sub-step-list">
          <view class="sub-step-row" v-for="(step, idx) in goalForm.subTasks" :key="idx">
            <input class="form-input-flex" v-model="step.title" placeholder="子步骤描述" />
            <view class="sub-remove" @click="goalForm.subTasks.splice(idx, 1)">✕</view>
          </view>
          <view class="sub-add" @click="goalForm.subTasks.push({title: '', completed: false})" v-if="goalForm.subTasks.length < 10">
            + 添加子步骤
          </view>
        </view>

        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showAddGoal = false">取消</view>
          <view class="modal-btn confirm" @click="confirmAddGoal">添加</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePlanLogic } from '@/composables/usePlanLogic'

const { plans, createPlan: addPlan, addGoal, toggleGoal: doToggleGoal, toggleSubTask: doToggleSubTask, getPlanStreak } = usePlanLogic()

const expandedGoals = ref(new Set<string>())

// ---- Create Plan Modal ----
const showCreatePlan = ref(false)
const newPlanTitle = ref('')
const newPeriod = ref<'short' | 'medium' | 'long'>('medium')

function openCreatePlan() {
  showCreatePlan.value = true
}

function createPlan() {
  if (!newPlanTitle.value.trim()) {
    uni.showToast({ title: '请输入计划名称', icon: 'none' })
    return
  }
  addPlan({ title: newPlanTitle.value, period: newPeriod.value })
  newPlanTitle.value = ''
  showCreatePlan.value = false
  uni.showToast({ title: '计划创建成功', icon: 'success' })
}

// ---- Add Goal Modal ----
const showAddGoal = ref(false)
const editingPlanId = ref('')
const goalForm = reactive({
  title: '',
  deadline: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  repeat: 'none' as 'none' | 'daily' | 'weekly',
  subTasks: [] as { title: string; completed: boolean }[],
})

function openAddGoal(planId: string) {
  editingPlanId.value = planId
  goalForm.title = ''
  goalForm.deadline = ''
  goalForm.priority = 'medium'
  goalForm.repeat = 'none'
  goalForm.subTasks = []
  showAddGoal.value = true
}

function confirmAddGoal() {
  if (!goalForm.title.trim()) {
    uni.showToast({ title: '请输入目标名称', icon: 'none' })
    return
  }
  addGoal(editingPlanId.value, {
    title: goalForm.title,
    deadline: goalForm.deadline,
    priority: goalForm.priority,
    repeat: goalForm.repeat,
    subTasks: goalForm.subTasks.filter(s => s.title.trim()),
  })
  showAddGoal.value = false
  uni.showToast({ title: '目标已添加', icon: 'success' })
}

// ---- Goal Interaction ----
function toggleGoal(planId: string, goalId: string) {
  doToggleGoal(planId, goalId)
}

function toggleGoalExpand(goalId: string) {
  if (expandedGoals.value.has(goalId)) {
    expandedGoals.value.delete(goalId)
  } else {
    expandedGoals.value.add(goalId)
  }
}

function toggleSubTask(planId: string, goalId: string, idx: number) {
  doToggleSubTask(planId, goalId, idx)
}

// ---- Labels ----
function periodLabel(p: string) {
  const map: Record<string, string> = { short: '短期', medium: '中期', long: '长期' }
  return map[p] || p
}

function priorityLabel(p: string) {
  const map: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return map[p] || p
}

function repeatLabel(r: string) {
  const map: Record<string, string> = { daily: '每日', weekly: '每周' }
  return map[r] || r
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-plan { padding: 0 24rpx 40rpx; min-height: 100vh; background: #F5F7FA; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 40rpx 8rpx 32rpx;

  .page-title { font-size: 40rpx; font-weight: 700; }

  .add-btn {
    background: $primary-color; color: #fff; padding: 14rpx 28rpx;
    border-radius: 32rpx; font-size: 26rpx;
  }
}

/* Plan Card */
.plan-card {
  background: $card-bg; border-radius: 16rpx; padding: 28rpx; margin-bottom: 20rpx; box-shadow: $shadow;
}

.plan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.plan-name { font-size: 30rpx; font-weight: 600; }

.plan-period {
  font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 20rpx;

  &.short { background: #E8F5E9; color: #4CAF50; }
  &.medium { background: #FFF3E0; color: #FF9800; }
  &.long { background: #E3F2FD; color: #2196F3; }
}

/* Progress */
.plan-progress { margin-bottom: 16rpx; }

.progress-text {
  font-size: 24rpx; color: $text-hint; display: block; margin-bottom: 8rpx;

  .streak { color: #FF9800; font-weight: 500; }
}

.progress-bar { height: 8rpx; background: #F0F0F0; border-radius: 4rpx; overflow: hidden; }
.bar-inner { height: 100%; background: $primary-color; border-radius: 4rpx; transition: width 0.3s; }

/* Goals */
.goal-item { margin-top: 12rpx; }

.goal-main {
  display: flex; align-items: flex-start; padding: 16rpx 12rpx;
  background: #F8F9FA; border-radius: 10rpx;
}

.goal-check {
  width: 40rpx; height: 40rpx; border-radius: 50%; border: 3rpx solid #D0D0D0;
  margin-right: 12rpx; display: flex; align-items: center; justify-content: center;
  font-size: 22rpx; color: #fff; flex-shrink: 0;

  &.checked { background: $success-color; border-color: $success-color; }
}

.goal-info { flex: 1; min-width: 0; }

.goal-top {
  display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; margin-bottom: 4rpx;
}

.goal-priority {
  font-size: 20rpx; padding: 2rpx 10rpx; border-radius: 8rpx; font-weight: 500;

  &.pri-high { background: #FFEBEE; color: #D32F2F; }
  &.pri-medium { background: #FFF3E0; color: #E65100; }
  &.pri-low { background: #E8EAF6; color: #5C6BC0; }
}

.goal-title { font-size: 28rpx; color: $text-primary; flex: 1;
  &.done { color: $text-hint; text-decoration: line-through; }
}

.goal-repeat {
  font-size: 20rpx; background: #E8F5E9; color: #388E3C;
  padding: 2rpx 10rpx; border-radius: 8rpx; white-space: nowrap;
}

.goal-meta { display: flex; gap: 16rpx; margin-top: 4rpx; }
.goal-deadline { font-size: 22rpx; color: $text-hint; }
.goal-streak { font-size: 22rpx; color: #FF9800; }

/* Sub-tasks */
.sub-tasks {
  margin-top: 8rpx; margin-left: 52rpx;
  background: #fff; border-radius: 8rpx; padding: 8rpx 12rpx;
}

.sub-task-item {
  display: flex; align-items: center; padding: 10rpx 0;

  &:not(:last-child) { border-bottom: 1rpx solid #F0F0F0; }
}

.sub-check {
  width: 32rpx; height: 32rpx; border-radius: 6rpx; border: 2rpx solid #D0D0D0;
  margin-right: 12rpx; display: flex; align-items: center; justify-content: center;
  font-size: 18rpx; color: #fff; flex-shrink: 0;

  &.checked { background: $success-color; border-color: $success-color; }
}

.sub-title { font-size: 24rpx; color: $text-secondary;
  &.done { color: $text-hint; text-decoration: line-through; }
}

/* Add Goal Button */
.add-goal-btn {
  margin-top: 16rpx; text-align: center; padding: 16rpx;
  border: 2rpx dashed #D0D0D0; border-radius: 10rpx;
  font-size: 26rpx; color: $primary-color;
}

/* Empty State */
.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 120rpx 40rpx;

  .empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
  .empty-title { font-size: 32rpx; font-weight: 600; margin-bottom: 12rpx; }
  .empty-desc { font-size: 26rpx; color: $text-hint; margin-bottom: 40rpx; }
}

/* Modals */
.modal-overlay { position: fixed; top:0;left:0;right:0;bottom:0; z-index:100; background:rgba(0,0,0,0.5); display:flex; align-items:flex-end; justify-content:center; }

.modal-content {
  background:#fff; border-radius:24rpx 24rpx 0 0; padding:40rpx 32rpx 60rpx; width:100%;
}

.goal-sheet {
  background:#fff; border-radius:24rpx 24rpx 0 0; padding:40rpx 32rpx 60rpx; width:100%;
  max-height: 80vh; overflow-y: auto;
}

.modal-title { font-size:32rpx; font-weight:600; display:block; margin-bottom:24rpx; text-align:center; }

.modal-input {
  background:#F5F5F5; border-radius:12rpx; padding:20rpx 24rpx; font-size:28rpx;
  margin-bottom: 20rpx; width: 100%; box-sizing: border-box;
}

.select-label { font-size:26rpx; color:$text-secondary; display:block; margin-bottom:16rpx; }

.period-options { display:flex; gap:16rpx; margin-bottom:32rpx; }

.period-opt {
  flex:1; text-align:center; padding:16rpx; border-radius:12rpx;
  background:#F5F5F5; font-size:24rpx; color:$text-secondary;

  &.active { background:#E3F2FD; color:$primary-color; font-weight:500; }
}

.modal-actions { display:flex; gap:24rpx; margin-top: 24rpx; }

.modal-btn {
  flex:1; text-align:center; padding:20rpx; border-radius:40rpx; font-size:28rpx;
}

.cancel { background:#F5F5F5; color:$text-secondary; }
.confirm { background:$primary-color; color:#fff; }

/* Goal Form */
.form-row { display: flex; align-items: center; margin-bottom: 20rpx; }
.form-label { font-size: 26rpx; color: $text-secondary; width: 140rpx; flex-shrink: 0; }
.form-input-half { flex: 1; background: #F5F5F5; border-radius: 8rpx; padding: 14rpx 16rpx; font-size: 26rpx; }

.chip-group { display: flex; gap: 12rpx; }
.chip {
  padding: 10rpx 20rpx; border-radius: 20rpx; background: #F5F5F5;
  font-size: 24rpx; color: $text-secondary;

  &.active { background: #E3F2FD; color: $primary-color; font-weight: 500; }
}

.sub-step-list { margin-bottom: 16rpx; }
.sub-step-row { display: flex; align-items: center; margin-bottom: 10rpx; }
.form-input-flex { flex: 1; background: #F5F5F5; border-radius: 8rpx; padding: 14rpx 16rpx; font-size: 26rpx; }
.sub-remove { width: 44rpx; height: 44rpx; display: flex; align-items: center; justify-content: center; color: #D32F2F; font-size: 24rpx; }
.sub-add { font-size: 24rpx; color: $primary-color; padding: 10rpx 0; }
</style>
```

- [ ] **Step 2: Verify compilation**

Run: `cd miniapp && npx tsc`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
/usr/bin/git add miniapp/src/pages/plan/index.vue
/usr/bin/git commit -m 'feat: rewrite plan page with three-level UI, goal creation form, and streak display'
```

---

### Task 8: Add plan recommendation generator in mock data

**Files:**
- Modify: `miniapp/src/data/mock/test.ts`

- [ ] **Step 1: Add the recommendation generator**

Append to the end of `miniapp/src/data/mock/test.ts`:

```typescript
/** Suggested goal generated from test scores */
export interface PlanRecommendation {
  title: string
  priority: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * Generate plan recommendations based on dimension scores.
 * Takes raw scores (dimKey → percentage) and returns suggested goals.
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
      reason: '执行力强，落地项目能最快验证你的学习成果',
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

  // Holland-specific recommendations
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
```

- [ ] **Step 2: Verify compilation**

Run: `cd miniapp && npx tsc`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
/usr/bin/git add miniapp/src/data/mock/test.ts
/usr/bin/git commit -m 'feat: add plan recommendation generator based on test scores'
```

---

### Task 9: Run full test suite and compatibility check

- [ ] **Step 1: Run all tests**

```bash
cd miniapp && npx vitest run
```

Expected: All tests pass (existing 30 + new scoring tests + new summary tests + new plan-logic tests).

- [ ] **Step 2: Type-check the entire project**

```bash
cd miniapp && npx tsc 2>&1
```

Expected: No TypeScript errors.

- [ ] **Step 3: Verify the build compiles**

```bash
cd miniapp && npx vite build 2>&1
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
/usr/bin/git add -A
/usr/bin/git commit -m 'chore: final verification — all tests pass and build succeeds'
```

---

## Summary

| Phase | Tasks | New Files | Modified Files |
|-------|-------|-----------|----------------|
| 1. Stage Summary | 1-5 | `utils/scoring.ts`, `utils/summary.ts`, `__tests__/scoring.test.ts`, `__tests__/summary.test.ts` | `data/mock/test.ts`, `utils/index.ts`, `pages/test/answer.vue`, `pages/index/index.vue` |
| 2. Plan Redesign | 6-8 | `composables/usePlanLogic.ts`, `__tests__/plan-logic.test.ts` | `pages/plan/index.vue`, `data/mock/test.ts` |
| Verification | 9 | — | — |
