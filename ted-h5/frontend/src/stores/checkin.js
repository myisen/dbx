import { defineStore } from 'pinia'
import { checkins } from '../api'

export const useCheckinStore = defineStore('checkin', {
  state: () => ({
    todayCheckin: null,
    streak: { current: 0, longest: 0 },
    calendar: [],
    checkinList: [],
    missedDates: [],
    makeupLoading: false
  }),
  getters: {
    hasCheckedInToday: (state) => !!state.todayCheckin,
    currentStreak: (state) => state.streak.current,
    longestStreak: (state) => state.streak.longest
  },
  actions: {
    async fetchToday() {
      const res = await checkins.today()
      this.todayCheckin = res.checkin
    },
    async fetchStreak() {
      const res = await checkins.streak()
      this.streak = res.streak
    },
    async fetchCalendar(year, month) {
      const res = await checkins.calendar({ year, month })
      this.calendar = res.days
    },
    async submitCheckin(data) {
      const res = await checkins.create(data)
      this.todayCheckin = res.checkin
      await this.fetchStreak()
      return res
    },
    async fetchList(params) {
      const res = await checkins.list(params)
      this.checkinList = res.checkins
    },
    async fetchMissed() {
      try {
        const res = await checkins.missed()
        this.missedDates = res.missedDates || []
        return res
      } catch {
        this.missedDates = []
      }
    },
    async submitMakeup(data) {
      this.makeupLoading = true
      try {
        const res = await checkins.makeup(data)
        await this.fetchStreak()
        await this.fetchMissed()
        return res
      } finally {
        this.makeupLoading = false
      }
    }
  }
})