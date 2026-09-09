<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { leaderboard } from '../api'

const router = useRouter()
const activeTab = ref('streak')
const list = ref([])
const loading = ref(false)
const myRank = ref(null)

const tabs = [
  { key: 'streak', label: '连续天数' },
  { key: 'total', label: '总打卡数' },
  { key: 'words', label: '阅读量' }
]

onMounted(async () => {
  await fetchLeaderboard()
})

async function fetchLeaderboard() {
  loading.value = true
  try {
    const res = await leaderboard.get({ type: activeTab.value })
    list.value = res.list || []
    myRank.value = res.myRank || null
  } catch {
    // use mock data
    list.value = generateMockData()
  } finally {
    loading.value = false
  }
}

function generateMockData() {
  const names = ['小明', 'Anna', 'Mike', '莉莉', 'Jack', '小芳', 'Tom', '王雨', 'Emma', '张伟', 'Lucy', '李雷']
  return names.map((name, i) => ({
    rank: i + 1,
    nickname: name,
    avatar: name.charAt(0).toUpperCase(),
    streak: Math.floor(Math.random() * 30) + 1,
    total: Math.floor(Math.random() * 100) + 10,
    words: Math.floor(Math.random() * 5000) + 500
  }))
}

function onTabChange(key) {
  activeTab.value = key
  fetchLeaderboard()
}

function getRankClass(rank) {
  if (rank === 1) return 'top1'
  if (rank === 2) return 'top2'
  if (rank === 3) return 'top3'
  return ''
}

function getScore(item) {
  switch (activeTab.value) {
    case 'streak': return `${item.streak}天`
    case 'total': return `${item.total}次`
    case 'words': return `${item.words}词`
    default: return ''
  }
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="排行榜" />

    <!-- Tabs -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" style="margin-bottom:12px;">
      <van-tab v-for="t in tabs" :key="t.key" :title="t.label" :name="t.key" />
    </van-tabs>

    <!-- My rank -->
    <div v-if="myRank" style="margin-bottom:12px; text-align:center; font-size:13px; color:#969799;">
      你的排名: <span style="color:#1989fa; font-weight:600;">#{{ myRank }}</span>
    </div>

    <!-- Loading -->
    <van-skeleton :row="5" :loading="loading" />

    <!-- Leaderboard list -->
    <div v-for="item in list" :key="item.rank" class="leaderboard-item">
      <div class="rank" :class="getRankClass(item.rank)">{{ item.rank }}</div>
      <div class="avatar">{{ item.avatar }}</div>
      <div class="info">
        <div class="name">{{ item.nickname }}</div>
        <div class="stats">连续 {{ item.streak }} 天 · 总计 {{ item.total }} 次</div>
      </div>
      <div class="score">{{ getScore(item) }}</div>
    </div>

    <!-- Empty state -->
    <van-empty v-if="!loading && list.length === 0" description="暂无数据" />
  </div>
</template>