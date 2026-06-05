# Plan Page Redesign & Stage Summary Modal

**Date**: 2026-06-05
**Status**: Design approved

---

## 1. Overview

Two UX improvements to the talent-digger mini program:

1. **Plan page redesign** — replace hardcoded mock data with a user-driven plan/goal/sub-task system that supports streak tracking and is backed by system recommendations.
2. **Stage summary modal** — after completing a test (Talent Compass or Holland), show a summary modal on the home page before the user moves to the next test, instead of jumping directly to the report page.

---

## 2. Plan Page Redesign

### 2.1 Data Model

Three-level hierarchy:

```
Plan
├── title: string
├── period: 'short' | 'medium' | 'long'
├── goals: Goal[]
│   ├── id: string
│   ├── title: string
│   ├── deadline: string (iso date)
│   ├── priority: 'high' | 'medium' | 'low'
│   ├── repeat: 'none' | 'daily' | 'weekly'
│   ├── streakLog: Record<dateString, boolean>  // 打卡记录
│   ├── currentStreak: number
│   └── subTasks: SubTask[]
│       ├── title: string
│       └── completed: boolean
```

**Storage**: `uni.setStorageSync('growthPlans', JSON.stringify(plans))` (local first, cloud sync later).

### 2.2 Creation Methods

| Method | Trigger | Behavior |
|--------|---------|----------|
| **Manual** | "+ 新建计划" or "+ 添加新目标" button | User fills in form: title, deadline, priority, repeat, sub-steps |
| **Recommended** | After test completion (stage summary → "制定计划" button) | System generates 3-5 goal suggestions based on test dimension scores. User can adopt (one-click add), modify, or skip. |

**Recommendation logic** (v1 simple rules):
- If `logic > 70` or `creativity > 70` → suggest "学习数据分析/编程技能"
- If `comm < 50` or `lead < 50` → suggest "参加沟通表达训练"
- If `exec > 80` → suggest "参与一个实际项目"
- If `empathy > 70` → suggest "参与志愿服务或团队协作活动"
- For Holland: map RIASEC codes to career-related goals

### 2.3 UI Design

**Plan card** (expandable):
- Header: plan title + period badge (短期/中期/长期)
- Progress: "🔥 连续打卡 N 天 | 已完成 2/3 目标" + progress bar
- Goal list items:
  - Priority badge (高/中/低, color-coded)
  - Title + deadline + repeat tag (每日/每周)
  - Click to expand sub-tasks (checkbox list)
  - Completed goals show strikethrough
- Footer: "+ 添加新目标" button

**Add/Edit goal form** (bottom sheet modal):
- Fields: 标题 (input), 截止日期 (date picker), 优先级 (select), 重复周期 (select), 子步骤 (dynamic list with "+" button)

**Daily streak logic**:
- When user checks off a repeating goal, record date in `streakLog`
- `currentStreak` = consecutive days from today backward with all scheduled repeats completed
- Display "🔥 连续打卡 N 天" on plan card
- Non-repeating goals: simple checkbox (no streak)

### 2.4 Files to Modify

| File | Change |
|------|--------|
| `miniapp/src/pages/plan/index.vue` | Full rewrite: three-level UI, add/edit goal form, streak display |
| `miniapp/src/data/mock/test.ts` | Add `generatePlanRecommendations()` function |
| `miniapp/src/api/index.ts` | Add `saveGrowthPlan` / `updateGoalStatus` (already stubbed) |

---

## 3. Stage Summary Modal

### 3.1 Flow

```
Answer page (submit) → store lastAnswers/lastTestId/completedTests
                     → redirectTo home page
                     → home page onShow detects: completedTests just got a new entry for this test AND stage summary not yet shown
                     → show stage summary modal
                     → user: "开始霍兰德测试" → navigate to Holland answer page
                     → user: "跳过" or close → dismiss modal, home page shows unlocked state
```

**State tracking**: `uni.setStorageSync('seenStageSummary', JSON.stringify([testId1, testId2, ...]))` — modal shows only once per test. Cleared on app relaunch or explicitly via reset.

### 3.2 Modal Content

```
┌─────────────────────────┐
│         🎉              │
│   天赋罗盘 · 已完成      │
│                         │
│  ┌───────────────────┐  │
│  │ 📊 你的优势维度     │  │
│  │ 逻辑推理 85%       │  │
│  │ 执行实操 90%       │  │
│  │ 学习适应 82%       │  │
│  └───────────────────┘  │
│                         │
│  你是一位逻辑缜密的     │
│  行动派，善于分析问题   │
│  并高效落地执行。       │
│                         │
│  ┌───────────────────┐  │
│  │ 开始霍兰德测试 →   │  │  (primary CTA)
│  └───────────────────┘  │
│  跳过，以后再说         │
└─────────────────────────┘
```

### 3.3 One-liner Summary Generation

Simple rule-based mapping based on top-3 dimensions:
- If top dim includes `exec` + `logic` → "逻辑缜密的行动派"
- If top dim includes `creativity` + `observation` → "敏锐细腻的创造者"
- If top dim includes `empathy` + `comm` → "善解人意的沟通者"
- If top dim includes `lead` + `resilience` → "坚韧不拔的领导者"
- Fallback: "全面发展的探索者"

This uses the **user's actual answers** to compute dimension scores locally (same scoring rules as the report page), so it reflects real results, not mock data.

### 3.4 Files to Modify

| File | Change |
|------|--------|
| `miniapp/src/pages/index/index.vue` | Add stage-summary modal component + `seenStageSummary` check in `onShow` |
| `miniapp/src/composables/useAnswerLogic.ts` | Export scoring helper to compute dimension percentages from raw answers |
| `miniapp/src/data/mock/test.ts` | Add scoring rules for talent compass questions (dimension mapping per option) |
| `miniapp/src/pages/test/answer.vue` | After submit, redirect to home page instead of report page (for inline flow), then report page shows detailed report |

---

## 4. Order of Implementation

1. **Stage Summary Modal** first — smaller, independent, improves the existing flow immediately.
2. **Plan Page Redesign** second — larger UX change, depends on having data structures and forms.

---

## 5. Risks & Constraints

- **WeChat mini-program storage limit**: ~10MB. Plan data with streak logs could grow over time. Cap streak history to last 90 days.
- **Scoring computation**: Talent compass questions currently lack per-option dimension scoring in the mock data. Need to add explicit `scoring` maps to each question.
- **Plan complexity**: Three-level hierarchy with streak = non-trivial UI. Keep sub-tasks limited to 10 items per goal to avoid overwhelming.
