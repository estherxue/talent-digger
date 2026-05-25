'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { data } = await db.collection('tests')
      .field({ testId: true, name: true, description: true, dimensions: true, questionCount: true, estimatedMin: true, category: true })
      .get();
    return { code: 0, message: 'success', data };
  } catch (err) {
    return { code: -1, message: err.message, data: null };
  }
};
