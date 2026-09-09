import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页', showTab: true }
  },
  {
    path: '/reading/:id',
    name: 'Reading',
    component: () => import('../views/Reading.vue'),
    meta: { title: '精读', showTab: false }
  },
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('../views/Checkin.vue'),
    meta: { title: '打卡', showTab: true }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/Leaderboard.vue'),
    meta: { title: '排行榜', showTab: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { title: '我的', showTab: true }
  },
  {
    path: '/ai-plan',
    name: 'AIPlan',
    component: () => import('../views/AIPlan.vue'),
    meta: { title: 'AI 学习计划', showTab: false }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router