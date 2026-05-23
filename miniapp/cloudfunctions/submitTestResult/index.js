'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { testId, answers } = event;
  // answers: { questionId: selectedOptionIndex }
  
  if (!testId || !answers) return { code: -1, message: '参数不完整', data: null };

  try {
    // 获取题目和评分规则
    const { data: questions } = await db.collection('questions')
      .where({ testId }).field({ scoring: true }).get();
    
    // 计算各维度得分
    const dimensionScores = {};
    questions.forEach(q => {
      const userAnswer = answers[q._id];
      if (userAnswer === undefined) return;
      const scoring = q.scoring;
      Object.keys(scoring).forEach(dim => {
        dimensionScores[dim] = (dimensionScores[dim] || 0) + scoring[dim];
      });
    });

    // 保存结果
    const result = {
      userId: OPENID,
      testId,
      scores: dimensionScores,
      answers,
      completedAt: Date.now()
    };
    
    const { _id } = await db.collection('results').add({ data: result });
    
    return { code: 0, message: '提交成功', data: { resultId: _id, scores: dimensionScores } };
  } catch (err) {
    return { code: -1, message: err.message, data: null };
  }
};
