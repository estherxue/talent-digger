'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const careers = require('./careers.json');

// ---- All 10 talent dimension keys ----
const ALL_DIMS = [
  'logic', 'creativity', 'memory', 'observation', 'comm',
  'lead', 'exec', 'empathy', 'resilience', 'learn',
];

// ---- RIASEC → Talent Dimension Mapping (design doc §5) ----
const RIASEC_MAPPING = {
  R: { primary: ['exec', 1.0], secondary: [['resilience', 0.7], ['observation', 0.7]] },
  I: { primary: ['logic', 1.0], secondary: [['learn', 0.7], ['observation', 0.7]] },
  A: { primary: ['creativity', 1.0], secondary: [['observation', 0.7], ['comm', 0.7]] },
  S: { primary: ['empathy', 1.0], secondary: [['comm', 0.7]] },
  E: { primary: ['lead', 1.0], secondary: [['comm', 0.7], ['resilience', 0.7]] },
  C: { primary: ['exec', 1.0], secondary: [['observation', 0.7], ['memory', 0.7]] },
};

// Dimension display names (ZH)
const DIM_NAMES = {
  logic: '逻辑推理', creativity: '创造想象', memory: '记忆能力',
  observation: '观察感知', comm: '沟通表达', lead: '领导组织',
  exec: '执行实操', empathy: '同理共情', resilience: '抗压韧性', learn: '学习适应',
  realistic: '实际型', investigative: '研究型', artistic: '艺术型',
  social: '社会型', enterprise: '企业型', conventional: '常规型',
};

// ---- Cosine Similarity ----
function cosSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ---- RIASEC → Talent Dimension Conversion ----
function riasecToTalent(riasecScores) {
  const raw = {};
  const talentMax = {};

  for (const [riasecType, userPct] of Object.entries(riasecScores)) {
    const mapping = RIASEC_MAPPING[riasecType];
    if (!mapping) continue;

    const [primaryDim, primaryWeight] = mapping.primary;
    raw[primaryDim] = (raw[primaryDim] || 0) + Number(userPct) * primaryWeight;
    talentMax[primaryDim] = (talentMax[primaryDim] || 0) + 100 * primaryWeight;

    for (const [secDim, secWeight] of mapping.secondary) {
      raw[secDim] = (raw[secDim] || 0) + Number(userPct) * secWeight;
      talentMax[secDim] = (talentMax[secDim] || 0) + 100 * secWeight;
    }
  }

  const result = {};
  for (const dim of ALL_DIMS) {
    const maxPossible = talentMax[dim];
    if (maxPossible && maxPossible > 0) {
      result[dim] = Math.min(100, Math.round(((raw[dim] || 0) / maxPossible) * 100));
    } else {
      result[dim] = 0;
    }
  }
  return result;
}

// ---- Career Matching ----
function toVector(scores) {
  return ALL_DIMS.map(d => scores[d] || 0);
}

function careerVector(career) {
  return ALL_DIMS.map(d => (career.dimensionTags || []).includes(d) ? 100 : 0);
}

/**
 * Match careers using cosine similarity.
 * @param scores - dimension score map
 * @param isHolland - true if the test is a Holland RIASEC test
 */
function careerMatch(scores, isHolland) {
  const talentScores = isHolland ? riasecToTalent(scores) : scores;
  const userVec = toVector(talentScores);

  const matches = careers.map((career, idx) => {
    const careerVec = careerVector(career);
    const similarity = cosSim(userVec, careerVec);
    const matchScore = Math.round(similarity * 100);

    const contributingDims = (career.dimensionTags || [])
      .filter(d => (talentScores[d] || 0) > 0)
      .sort((a, b) => (talentScores[b] || 0) - (talentScores[a] || 0))
      .slice(0, 3);

    return {
      careerId: career._id || 'c' + (idx + 1),
      careerName: career.name,
      matchScore,
      reason: career.suggestions || '',
      contributingDims,
    };
  });

  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

// ---- Dimension → Action Mapping ----
const DIM_ACTIONS = {
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
};

function dimAction(key) {
  return DIM_ACTIONS[key] || '持续刻意练习';
}

function dimName(key) {
  return DIM_NAMES[key] || key;
}

// ---- Summary & Suggestions ----
function generateReportSummary(scores, careerMatches) {
  const top = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Paragraph 1: Top 3 dimensions
  const topStr = top.map(([k, v]) => `${dimName(k)}(${Math.round(v)}%)`).join('、');
  const positioning = `根据测评结果，你在「${topStr}」方面表现突出。这些天赋维度是你在职业发展中的核心竞争力。`;

  // Paragraph 2: Strength + career link
  const topCareers = careerMatches.slice(0, 3).map(c => c.careerName).join('、') || '多个职业';
  const topDimsDesc = top.map(([k, v]) => `${dimName(k)}(${Math.round(v)}%)`).join('和');
  const strength = `你的${topDimsDesc}远超平均水平，这让你的${topCareers}等方向具有天然优势。`;

  // Paragraph 3: Weakest dimension
  const entries = Object.entries(scores).filter(([, v]) => v > 0);
  let growth = '';
  if (entries.length > 0) {
    const weakest = entries.sort((a, b) => a[1] - b[1])[0];
    const [weakKey, weakVal] = weakest;
    growth = `同时，${dimName(weakKey)}(${Math.round(weakVal)}%)有较大提升空间，建议通过${dimAction(weakKey)}来加强。`;
  }

  return `${positioning}\n\n${strength}${growth ? '\n\n' + growth : ''}`;
}

function generateSuggestions(scores, careerMatches) {
  const suggestions = [];
  const entries = Object.entries(scores).filter(([, v]) => v > 0);
  if (entries.length === 0) return suggestions;

  const maxDim = entries.sort((a, b) => b[1] - a[1])[0];
  const minDim = entries.sort((a, b) => a[1] - b[1])[0];
  const range = maxDim[1] - minDim[1];

  // dim ≥ 80%
  const strengths = entries.filter(([, v]) => v >= 80);
  for (const [key, pct] of strengths.slice(0, 2)) {
    const relatedCareer = (careerMatches.find(c => c.matchScore >= 50) || {}).careerName || '相关领域';
    suggestions.push(`你的${dimName(key)}能力突出(${Math.round(pct)}%)，建议从事${relatedCareer}方向`);
  }

  // dim ≤ 40%
  const weaks = entries.filter(([, v]) => v <= 40);
  for (const [key, pct] of weaks.slice(0, 1)) {
    suggestions.push(`${dimName(key)}有提升空间(${Math.round(pct)}%)，建议通过${dimAction(key)}来加强`);
  }

  // spread
  if (range >= 40 && strengths.length > 0 && weaks.length > 0) {
    suggestions.push('你的能力结构偏向明显，建议在发挥优势的同时补齐短板');
  } else if (range <= 20 && entries.length >= 5) {
    suggestions.push('你的能力发展均衡，适合综合型岗位或跨界方向');
  }

  // top career ≥ 80%
  const topCareer = careerMatches[0];
  if (topCareer && topCareer.matchScore >= 80) {
    suggestions.push(`${topCareer.careerName}与你的能力高度匹配(${topCareer.matchScore}%)，值得重点关注`);
  }

  // Deduplicate
  const seen = new Set();
  return suggestions.filter(s => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  }).slice(0, 5);
}

// ---- Main ----
exports.main = async (event, context) => {
  const { resultId } = event;
  if (!resultId) return { code: -1, message: '缺少 resultId', data: null };

  try {
    const { data: [result] } = await db.collection('results').doc(resultId).get();
    if (!result) return { code: -1, message: '结果不存在', data: null };

    const { data: [test] } = await db.collection('tests').where({ testId: result.testId }).limit(1).get();

    // Determine if this is a Holland test
    const isHolland = result.testId === 'test_holland';

    // Normalize scores to 0-100
    const scores = result.scores || {};
    const maxScore = Math.max(...Object.values(scores), 1);
    const normalizedScores = {};
    for (const [key, val] of Object.entries(scores)) {
      normalizedScores[key] = Math.round((val / maxScore) * 100);
    }

    // Build dimension list for display
    const dimensionList = isHolland
      ? Object.entries(normalizedScores).map(([key, pct]) => {
          let level = 'low';
          if (pct >= 70) level = 'high';
          else if (pct >= 40) level = 'medium';
          return { key, name: dimName(key), percentage: Math.round(pct), level };
        })
      : (test && test.dimensions)
        ? test.dimensions.map(dim => {
            const pct = normalizedScores[dim.key] || 0;
            let level = 'low';
            if (pct >= 70) level = 'high';
            else if (pct >= 40) level = 'medium';
            return { key: dim.key, name: dim.name, percentage: Math.round(pct), level };
          })
        : [];

    // Career matching via cosine similarity
    const careerMatches = careerMatch(normalizedScores, isHolland);

    // Dynamic summary & suggestions
    const summary = generateReportSummary(normalizedScores, careerMatches);
    const suggestions = generateSuggestions(normalizedScores, careerMatches);

    // Mark report as generated
    await db.collection('results').doc(resultId).update({
      data: { reportGenerated: true }
    });

    const report = {
      resultId,
      testId: result.testId,
      testName: test ? test.name : (isHolland ? '霍兰德职业兴趣测试' : '天赋罗盘测试'),
      completedAt: Date.now(),
      scores: dimensionList,
      summary,
      suggestions,
      careerMatches,
    };

    return { code: 0, message: 'success', data: report };
  } catch (err) {
    return { code: -1, message: err.message, data: null };
  }
};
