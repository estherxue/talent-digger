// TabBar 页面路径列表
const TAB_BAR_PAGES = [
  '/pages/index/index',
  '/pages/test/index',
  '/pages/career/index',
  '/pages/plan/index',
  '/pages/mine/index',
]

// 智能导航：TabBar 页面用 switchTab，普通页面用 navigateTo
export const smartNavigate = (url: string) => {
  // 提取路径部分（去掉参数）
  const path = url.split('?')[0]

  if (TAB_BAR_PAGES.includes(path)) {
    uni.switchTab({ url })
  } else {
    uni.navigateTo({ url })
  }
}
