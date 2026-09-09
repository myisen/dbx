import { defineStore } from 'pinia'
import { auth } from '../api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || '',
    isLoggedIn: !!localStorage.getItem('token')
  }),
  getters: {
    userId: (state) => state.user?._id || '',
    nickname: (state) => state.user?.nickname || '未登录'
  },
  actions: {
    async login(data) {
      const res = await auth.login(data)
      this.token = res.token
      this.user = res.user
      localStorage.setItem('token', res.token)
      this.isLoggedIn = true
    },
    async register(data) {
      const res = await auth.register(data)
      this.token = res.token
      this.user = res.user
      localStorage.setItem('token', res.token)
      this.isLoggedIn = true
    },
    async fetchProfile() {
      try {
        const res = await auth.getProfile()
        this.user = res.user
      } catch {
        this.logout()
      }
    },
    logout() {
      this.token = ''
      this.user = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
    }
  }
})