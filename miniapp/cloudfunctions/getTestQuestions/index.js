'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { testId } = event;
  if (!testId) return { code: -1, message: '缺少 testId', data: null };

  try {
    const { data: questions } = await db.collection('questions')
      .where({ testId })
      .orderBy('order', 'asc')
      .get();
    const { data: [test] } = await db.collection('tests').doc(testId).get();
    return {
      code: 0, message: 'success',
      data: { test, questions }
    };
  } catch (err) {
    return { code: -1, message: err.message, data: null };
  }
};
