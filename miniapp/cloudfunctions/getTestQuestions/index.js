'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { testId } = event;
  console.log('[getTestQuestions] 收到参数:', { testId });
  if (!testId) return { code: -1, message: '缺少 testId', data: null };

  try {
    const { data: questions } = await db.collection('questions')
      .where({ testId })
      .orderBy('order', 'asc')
      .get();
    console.log(`[getTestQuestions] 查到 ${questions.length} 条题目`);
    
    const { data: [test] } = await db.collection('tests').where({ testId }).limit(1).get();
    console.log(`[getTestQuestions] 查到测试: ${test ? test.name : 'null'}`);
    
    // 为每个 question 添加 id 字段（映射自 _id），方便前端使用
    const mappedQuestions = questions.map(q => ({
      ...q,
      id: q._id
    }));
    
    return {
      code: 0, message: 'success',
      data: { test, questions: mappedQuestions }
    };
  } catch (err) {
    console.error('[getTestQuestions] 错误:', err.message);
    return { code: -1, message: err.message, data: null };
  }
};
