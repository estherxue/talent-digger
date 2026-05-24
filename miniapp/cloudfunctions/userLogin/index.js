'use strict';
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { code, nickName, avatarUrl } = event;

  if (!OPENID) {
    return { code: -1, message: '获取用户信息失败', data: null };
  }

  try {
    // 查找或创建用户
    const { data: existingUsers } = await db.collection('users')
      .where({ openid: OPENID }).get();

    let userId;

    if (existingUsers.length > 0) {
      userId = existingUsers[0]._id;
      // 更新用户信息
      await db.collection('users').doc(userId).update({
        data: {
          nickname: nickName || existingUsers[0].nickname,
          avatar: avatarUrl || existingUsers[0].avatar,
          updatedAt: Date.now()
        }
      });
    } else {
      // 创建新用户
      const result = await db.collection('users').add({
        data: {
          openid: OPENID,
          nickname: nickName || '微信用户',
          avatar: avatarUrl || '',
          isGuest: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      });
      userId = result._id;
    }

    return {
      code: 0,
      message: 'success',
      data: {
        userId,
        openid: OPENID,
        nickname: nickName,
        avatar: avatarUrl
      }
    };
  } catch (err) {
    return { code: -1, message: err.message, data: null };
  }
};
