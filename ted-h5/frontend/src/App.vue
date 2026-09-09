<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const showTab = computed(() => route.meta?.showTab !== false)

const tabRoutes = [
  { path: '/home', icon: 'home-o', label: '首页' },
  { path: '/checkin', icon: 'records-o', label: '打卡' },
  { path: '/leaderboard', icon: 'chart-trending-o', label: '排行榜' },
  { path: '/profile', icon: 'contact-o', label: '我的' }
]

const active = computed(() => {
  const idx = tabRoutes.findIndex(t => route.path.startsWith(t.path))
  return idx >= 0 ? idx : 0
})

function onTabChange(idx) {
  router.push(tabRoutes[idx].path)
}
</script>

<template>
  <div id="app-root">
    <router-view />
    <van-tabbar v-if="showTab" :model-value="active" @change="onTabChange" active-color="#1989fa" border>
      <van-tabbar-item v-for="tab in tabRoutes" :key="tab.path" :icon="tab.icon">
        {{ tab.label }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style>
#app-root {
  min-height: 100vh;
}
</style>