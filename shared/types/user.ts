export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  createdAt: number
  isGuest: boolean
}

export interface UserProfile extends UserInfo {
  testResults: string[]      // result IDs
  activePlans: string[]      // plan IDs
}
