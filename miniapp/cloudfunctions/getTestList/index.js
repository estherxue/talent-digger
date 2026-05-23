'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { data } = await db.collection('tests')
      .field({ _id: true, name: true, description: true, dimensions: true, questionCount: true, estimatedMinutes: true, category: true })
      .get();
    return { code: 0, message: 'success', data };
  } catch (err) {
    return { code: -1, message: err.message, data: null };
  }
};
