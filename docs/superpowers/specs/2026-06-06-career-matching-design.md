# Career Matching: Remove Mock, Implement Real Recommendations

**Date**: 2026-06-06
**Status**: Design approved

---

## 1. Overview

Replace all hardcoded mock report data (`mockTalentReport`, `mockHollandReport`) with a real pipeline: **user answers → dimension score computation → cosine-similarity career matching → personalized summary & suggestions**.

Currently, the report page shows identical career recommendations regardless of how the user answers. The cloud function `generateReport` has a tag-overlap matching algorithm but its career library only has talent compass dimension tags — Holland RIASEC tests always score 0% on career matches. This design addresses both gaps.

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Matching scope | **Dual-track**: talent compass uses existing `dimensionTags`; Holland uses new `riasecTags` + a RIASEC→talent mapping table | Each test type gets accurate matching; combined results fuse both via `max()` merge |
| Matching algorithm | **Cosine similarity** between user score vector and career tag vector | Considers all dimensions, naturally down-weights careers where user scores high on irrelevant dimensions |
| Code location | **Shared utility `utils/careerMatch.ts`** for miniapp; **duplicate JS implementation** inside `generateReport` cloud function | Cloud functions cannot import TypeScript from the miniapp source tree; both implementations are identical and verified by shared unit tests |
| RIASEC→talent mapping | 6 types → 10 dimensions, primary weight ×1.0, secondary weight ×0.7 | Evidence-based: McGill DAT aptitude correlations, HEXACO personality studies, industry guides |
| Summary generation | **Three-paragraph dynamic**: positioning sentence (rule engine) + strength analysis (Top 3 dims + scores + career links) + growth advice (weakest dim + action item) | Replaces the current single template string |
| Suggestions | **Rule-driven** from dimension thresholds and career match quality | Replaces 3 hardcoded generic suggestions |

---

## 3. Architecture & Data Flow

### 3.1 After-Submit Flow

```
user submits answers
  ├── localStorage: lastAnswers, lastTestId, completedTests (sync, always)
  │   └── NEW: also save lastHollandAnswers, lastHollandTestId when testId is 'test_holland'
  ├── cloud: submitTestResult (best-effort)
  └── switchTab → home page
```

### 3.2 Stage Summary Modal (home page `onShow`)

```
maybeShowSummary()
  ├── read lastAnswers, lastTestId from storage
  ├── computeDimensionScores(answers, questions) → real scores
  ├── topDimensions(scores, 3)
  └── generateSummary(top) → personality one-liner
```

**New for Holland**: when `lastTestId === 'test_holland'`, load `mockHollandQuestions` (with proper scoring) instead of falling back to talent questions.

### 3.3 Report Page (`loadReport`)

```
loadReport()
  ├── cloud: generateReport(resultId)
  │   └── success → applyReportData(cloud data)
  │
  └── offline fallback (no more mock):
      ├── answers = getStorageSync('lastAnswers')
      ├── questions = select by testId
      ├── scores = computeDimensionScores(answers, questions)
      ├── matches = careerMatch(scores, testType)     ← NEW
      ├── summary = generateReportSummary(scores)      ← NEW
      └── suggestions = generateSuggestions(scores, matches) ← NEW
```

### 3.4 Combined Mode Entry Point

The home page "查看综合职业推荐" button (line 57 of `index.vue`) currently navigates to `pages/report/index?testId=test_talent_compass&resultId=local`. After this change, when both tests are completed:

1. Both `lastAnswers` for talent and holland are read from storage (Holland answers stored as `lastHollandAnswers` / `lastHollandTestId` in addition to `lastAnswers` / `lastTestId`)
2. Both score sets are computed
3. `careerMatch(scores, 'combined')` fuses them via `max()` merge
4. Report page shows "综合职业推荐" with fused results

The answer page (`answer.vue`) already saves `lastAnswers` and `lastTestId`. For the combined flow, the Holland test submission additionally saves `lastHollandAnswers` and `lastHollandTestId` so both score sets are available.

### 3.5 Plan Page

`generatePlanRecommendations(scores)` already exists. Extend to include Holland dimensions (`investigative`, `social`, `enterprise`).

---

## 4. Core Module: `utils/careerMatch.ts`

### 4.1 Exports

```typescript
// Main entry: returns top N career matches
function careerMatch(
  scores: Record<string, number>,   // { logic: 85, creativity: 62, ... }
  testType: 'talent' | 'holland' | 'combined',
  topN?: number                     // default 5
): CareerMatch[]

// Convert Holland RIASEC scores to talent dimension scores
function riasecToTalent(
  riasecScores: Record<string, number>
): Record<string, number>

// Cosine similarity between two vectors
function cosSim(a: number[], b: number[]): number
```

### 4.2 Cosine Matching Algorithm

**User vector U** = `[logic%, creativity%, exec%, observation%, empathy%, ...]` (10 dimensions, 0–100)

**Career vector C** = `[logic has tag ? 100 : 0, creativity has tag ? 100 : 0, ...]` (binary 0 or 100)

```
sim(U, C) = dot(U, C) / (|U| × |C|)
```

**Example**: U = [85, 62, 90, 71, 45], C = [100, 0, 0, 100, 0]
- dot = 85×100 + 71×100 = 15600
- |U| = √(85²+62²+90²+71²+45²) = 161.5
- |C| = √(100²+100²) = 141.4
- sim = 15600 / (161.5 × 141.4) = **0.683 → 68%**

### 4.3 Combined Mode

When both Talent Compass and Holland are completed (`testType='combined'`):
1. Talent compass scores used directly (10 dims)
2. Holland scores converted via `riasecToTalent()` → 10 dims
3. Per-dimension: **take the max** of the two values
4. Run cosine matching on the merged vector

Rationale for `max()`: both tests measure different aspects of the same person; the higher value reflects their true capability on that dimension.

---

## 5. RIASEC → Talent Dimension Mapping

Based on McGill DAT aptitude research, HEXACO personality correlations, and industry career guides.

| RIASEC Type | Primary (×1.0) | Secondary (×0.7) | Research Basis |
|-------------|----------------|-------------------|----------------|
| R 实际型 | exec 执行 | resilience, observation | Mechanical reasoning, spatial ability (DAT) |
| I 研究型 | logic 逻辑 | learn, observation | Highest IQ correlation (r=.40), Scientific observation |
| A 艺术型 | creativity 创造 | observation, comm | Verbal ability (DAT-Verbal), Openness |
| S 社会型 | empathy 共情 | comm | Interpersonal sensitivity, NOT leadership |
| E 企业型 | lead 领导 | comm, resilience | Risk-taking, persuasion; negative IQ correlation |
| C 常规型 | exec 执行 | observation, memory | Numerical accuracy (DAT-Numerical), Conscientiousness |

**Conversion formula**:

```
talentDimScore = Σ( userRIASECPercent × weight )
```

Example: user I=85%, A=70%
- observation = 85 × 0.7 + 70 × 0.7 = 108.5 → normalized to 0–100

---

## 6. Career Library Changes (`seed_careers.json`)

Add `riasecTags` field to all 15 careers. Existing `dimensionTags` remain unchanged.

| Career | dimensionTags (existing) | **riasecTags (NEW)** |
|--------|--------------------------|---------------------|
| 数据分析师 | logic, observation | I, C |
| 产品经理 | logic, comm, exec, lead | E, I, S |
| 软件工程师 | logic, exec, learn | I, R, C |
| UI/UX设计师 | creativity, observation, empathy | A, I |
| 心理咨询师 | empathy, comm, observation | S, I |
| 项目经理 | lead, exec, comm, resilience | E, C, S |
| 教师/培训师 | comm, empathy, learn | S, A |
| 市场营销经理 | creativity, comm, lead | E, A |
| 科研人员 | logic, memory, learn, observation | I, R |
| 创业/自由职业者 | lead, resilience, exec, creativity | E, A |
| 文案/内容创作者 | creativity, comm, learn | A, S |
| 人力资源经理 | comm, empathy, lead, observation | S, E, C |
| 咨询顾问 | logic, comm, learn, resilience | I, E, S |
| 运营经理 | exec, observation, learn | C, E |
| 销售经理 | comm, resilience, exec | E, S |

Tagging rationale: RIASEC hexagon adjacency compatibility principle + job description analysis. 1–3 tags per career.

---

## 7. Summary & Suggestion Generation

### 7.1 Three-Paragraph Summary (`generateReportSummary`)

1. **Positioning sentence** — reuses the existing `generateSummary()` rule engine from `summary.ts` ("你是一位逻辑缜密的行动派…")
2. **Strength analysis** — "你的{dim1}({pct1}%)和{dim2}({pct2}%)远超平均水平，这让你的{matchCareer1}、{matchCareer2}等方向具有天然优势。"
3. **Growth advice** — "同时，{weakestDim}({pct}%)有较大提升空间，建议通过{action}来加强。"

### 7.2 Dynamic Suggestions (`generateSuggestions`)

Rule-driven, filling template variables: `{dimName}`, `{pct}`, `{careerName}`, `{score}`, `{action}`

| Trigger | Generated Suggestion |
|---------|---------------------|
| dim ≥ 80% | "你的{dimName}能力突出({pct}%)，建议从事{relatedCareer}方向" |
| dim ≤ 40% | "{dimName}有提升空间({pct}%)，建议通过{action}来加强" |
| max − min ≥ 40% | "你的能力结构偏向明显，建议在发挥优势的同时补齐短板" |
| max − min ≤ 20% | "你的能力发展均衡，适合综合型岗位或跨界方向" |
| top career score ≥ 80% | "{careerName}与你的能力高度匹配({score}%)，值得重点关注" |

### 7.3 Dimension → Action Mapping (`dimAction`)

| Dimension | Suggested Action |
|-----------|-----------------|
| comm 沟通 | 参加演讲俱乐部或写作训练 |
| lead 领导 | 主动承担项目负责人角色 |
| exec 执行 | 设定每日小目标并坚持完成 |
| empathy 共情 | 参与志愿服务或团队协作活动 |
| logic 逻辑 | 学习编程或数据分析工具 |
| creativity 创造 | 尝试设计、写作或艺术创作 |
| learn 学习 | 建立每日阅读或在线课程习惯 |
| resilience 韧性 | 练习正念冥想或压力管理技巧 |
| memory 记忆 | 使用记忆宫殿或间隔重复法 |
| observation 观察 | 练习素描、摄影或自然观察 |

---

## 8. Cloud Function Changes (`generateReport/index.js`)

Replace the tag-overlap matching with cosine similarity. Implement identical logic to `careerMatch.ts` in plain JavaScript inside the cloud function.

```javascript
// Pseudocode for updated generateReport
cosSim(a, b) → dot(a,b) / (norm(a) * norm(b))
careerMatch(scores, testType) → top 5 by cosSim
generateReportSummary(scores) → three-paragraph text
generateSuggestions(scores, matches) → 3–5 personalized items
```

Careers JSON loaded from `require('./careers.json')` (bundled with cloud function).

---

## 9. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `miniapp/src/utils/careerMatch.ts` | **NEW** | Cosine matching + RIASEC mapping + career library data |
| `miniapp/src/utils/summary.ts` | MODIFY | Add `generateReportSummary()`, `generateSuggestions()`, `dimAction()` |
| `miniapp/src/pages/report/index.vue` | MODIFY | Remove mock fallback; wire `careerMatch` + real scores + `combined` mode |
| `miniapp/src/pages/index/index.vue` | MODIFY | Line 155: use `mockHollandQuestions` instead of `mockTalentQuestions` for Holland scoring. Line 213: combined report uses `testType='combined'` |
| `miniapp/src/pages/test/answer.vue` | MODIFY | Save `lastHollandAnswers` / `lastHollandTestId` when testId is 'test_holland', for combined mode |
| `miniapp/src/data/mock/test.ts` | MODIFY | Remove `mockTalentReport`, `mockHollandReport` exports |
| `miniapp/database/seed_careers.json` | MODIFY | Add `riasecTags` to all 15 careers |
| `miniapp/cloudfunctions/generateReport/index.js` | MODIFY | Cosine matching + dynamic summary/suggestions |
| `miniapp/cloudfunctions/generateReport/careers.json` | **NEW** | Career data bundled for cloud function |
| `miniapp/src/__tests__/careerMatch.test.ts` | **NEW** | Unit tests for cosine, mapping, matching |

---

## 10. Migration Plan (4 Steps)

### Step 1: Create `careerMatch.ts` + Unit Tests
Build the shared module in isolation. No existing pages modified. All tests pass before proceeding.

### Step 2: Replace Report Page Offline Fallback
Replace the mock fallback in `report/index.vue` with `computeDimensionScores` + `careerMatch`. Cloud function path unchanged. Verify reports are non-empty and show varied results for different answer sets.

### Step 3: Fix Stage Summary + Plan Recommendations
- Stage summary: handle Holland test scoring with proper questions
- Plan page: extend `generatePlanRecommendations` to cover Holland dimensions

### Step 4: Update Cloud Function + Career Library + Remove Mock
- `generateReport`: cosine matching + dynamic text
- `seed_careers.json`: add `riasecTags`
- `mock/test.ts`: delete `mockTalentReport`, `mockHollandReport`

---

## 11. Testing Strategy

| Layer | What | Tool |
|-------|------|------|
| **Unit** | `cosSim()` boundary values, `riasecToTalent()` conversion accuracy, `careerMatch()` top-N consistency, `generateSuggestions()` for edge scores | Vitest |
| **Integration** | Full offline pipeline (answers → scores → matches → non-empty result); combined mode produces ≥ single-track results | Vitest + storage mock |
| **Snapshot** | Fixed answer set → save Top 5 career results as snapshot; detect unintended matching regressions | Vitest snapshot |

---

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Cosine results feel unintuitive to users | Keep `matchScore` as percentage + show contributing dimensions |
| RIASEC tags are subjective | Stored as JSON, easy to adjust; future admin UI for management |
| Miniapp bundle size increase | Career library ~3KB (15 entries), negligible |
| Cloud function cold start | Cosine is O(n×d) = 15×10, well within execution limits |
| Duplicate code (TS + JS) | Shared unit test suite verifies both implementations produce identical results |
