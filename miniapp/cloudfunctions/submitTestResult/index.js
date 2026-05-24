'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 输入校验工具
function validateInput(testId, answers) {
  if (!testId || typeof testId !== 'string' || testId.trim().length === 0) {
    return { valid: false, message: '无效的 testId' };
  }
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return { valid: false, message: 'answers 格式错误，应为对象 {questionId: optionIndex}' };
  }
  // 检查 answers 值的合法性
  for (const [qId, val] of Object.entries(answers)) {
    if (typeof qId !== 'string' || qId.trim().length === 0) {
      return { valid: false, message: `无效的问题 ID: ${qId}` };
    }
    if (!Number.isInteger(val) || val < 0) {
      return { valid: false, message: `问题 ${qId} 的答案格式无效` };
    }
  }
  if (Object.keys(answers).length === 0) {
    return { valid: false, message: '至少需要回答一道题' };
  }
  return { valid: true };
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { testId, answers } = event;
  
  // 增强校验
  const validation = validateInput(testId, answers);
  if (!validation.valid) {
    return { code: -1, message: validation.message, data: null };
  }

  try {
    // 验证测评是否存在
    const { data: test } = await db.collection('tests').doc(testId).field({ _id: true }).get();
    if (!test) {
      return { code: -1, message: '测评不存在', data: null };
    }

    // 获取题目和评分规则
    const { data: questions } = await db.collection('questions')
      .where({ testId }).field({ scoring: true, options: true }).get();
    
    if (!questions || questions.length === 0) {
      return { code: -1, message: '该测评没有题目', data: null };
    }

    // 验证每条答案的选项索引是否有效
    for (const q of questions) {
      const userAnswer = answers[q._id];
      if (userAnswer !== undefined) {
        if (!q.options || userAnswer < 0 || userAnswer >= q.options.length) {
          return { code: -1, message: `问题选项无效`, data: null };
        }
      }
    }
    
    // 计算各维度得分
    const dimensionScores = {};
    questions.forEach(q => {
      const userAnswer = answers[q._id];
      if (userAnswer === undefined) return;
      const scoring = q.scoring;
      if (!scoring) return;
      Object.keys(scoring).forEach(dim => {
        const val = scoring[dim];
        if (typeof val !== 'number') return;
        dimensionScores[dim] = (dimensionScores[dim] || 0) + val;
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
    return { code: -1, message: err.message || '服务器内部错误', data: null };
  }
};
