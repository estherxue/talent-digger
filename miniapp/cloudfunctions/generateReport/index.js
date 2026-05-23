'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { resultId } = event;
  if (!resultId) return { code: -1, message: '缺少 resultId', data: null };

  try {
    // 获取测评结果
    const { data: result } = await db.collection('results').doc(resultId).get();
    if (!result) return { code: -1, message: '结果不存在', data: null };

    // 获取测评维度和职业库
    const { data: [test] } = await db.collection('tests').doc(result.testId).get();
    const { data: careers } = await db.collection('career_library').get();

    // 计算各维度百分比并排序
    const scores = result.scores;
    const maxScore = Math.max(...Object.values(scores), 1);
    
    const dimensionList = test.dimensions.map(dim => {
      const score = scores[dim.key] || 0;
      const percentage = Math.round((score / maxScore) * 100);
      let level = 'low';
      if (percentage >= 70) level = 'high';
      else if (percentage >= 40) level = 'medium';
      return { key: dim.key, name: dim.name, score, percentage, level };
    });

    // 找出高分维度
    const highDimensions = dimensionList.filter(d => d.level === 'high').map(d => d.key);

    // 匹配职业建议
    const careerMatches = careers
      .map(c => {
        const matchCount = c.dimensionTags.filter(t => highDimensions.includes(t)).length;
        const matchScore = highDimensions.length > 0 
          ? Math.round((matchCount / highDimensions.length) * 100)
          : 0;
        return { careerId: c._id, careerName: c.name, matchScore, reason: c.suggestions };
      })
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    // 生成总结语
    const topDimensions = dimensionList
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(d => d.name)
      .join('、');

    const summary = `根据测评结果，你在「${topDimensions}」方面表现突出。这些天赋维度是你在职业发展中的核心竞争力，建议充分发挥这些优势。`;

    const suggestions = [
      '结合你的优势维度，选择能发挥你长处的职业方向',
      '针对较低维度，可以制定针对性的提升计划',
      '定期回顾自己的成长，关注维度得分的变化趋势'
    ];

    // 保存报告
    await db.collection('results').doc(resultId).update({
      data: { reportGenerated: true }
    });

    const report = {
      resultId,
      testId: result.testId,
      testName: test.name,
      scores: dimensionList,
      summary,
      suggestions,
      careerMatches
    };

    return { code: 0, message: 'success', data: report };
  } catch (err) {
    return { code: -1, message: err.message, data: null };
  }
};
