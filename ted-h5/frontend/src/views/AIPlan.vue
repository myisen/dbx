<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { ai } from '../api'

const router = useRouter()
const plan = ref(null)
const suggestion = ref('')
const loading = ref(false)
const generating = ref(false)

const mockPlan = {
  title: '本周学习计划',
  phase: '基础巩固期',
  dailyGoal: '每日精读1篇TED + 掌握10个新单词',
  items: [
    { day: '周一', task: '精读《The Power of Vulnerability》，学习情感表达词汇', done: false },
    { day: '周二', task: '精读《The Secret of Happiness》，掌握积极心理学词汇', done: false },
    { day: '周三', task: '复习前两篇，整理重点句型', done: false },
    { day: '周四', task: '精读《How Great Leaders Inspire Action》，学习领导力词汇', done: false },
    { day: '周五', task: '精读《The Art of Asking》，掌握请求表达', done: false },
    { day: '周六', task: '本周复习 + 口语模仿练习', done: false },
    { day: '周日', task: '自由阅读 + 总结本周收获', done: false }
  ]
}

const mockSuggestion = '根据你近期的打卡数据，你的阅读速度有所提升，但词汇积累仍显不足。建议每天增加5分钟的单词复习时间，并尝试用新学的单词造句。当前连续打卡7天，保持得很好！'

onMounted(async () => {
  await fetchPlan()
  await fetchSuggestion()
})

async function fetchPlan() {
  loading.value = true
  try {
    const res = await ai.getPlan()
    plan.value = res.plan
  } catch {
    plan.value = mockPlan
  } finally {
    loading.value = false
  }
}

async function fetchSuggestion() {
  try {
    const res = await ai.getSuggestion()
    suggestion.value = res.suggestion
  } catch {
    suggestion.value = mockSuggestion
  }
}

async function generatePlan() {
  generating.value = true
  try {
    const res = await ai.generatePlan({ level: 'intermediate', goal: '提升英语表达能力' })
    plan.value = res.plan
    showSuccessToast('学习计划已生成')
  } catch {
    plan.value = mockPlan
    showSuccessToast('学习计划已生成（模拟数据）')
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="AI 学习计划" left-arrow @click-left="router.back()">
      <template #right>
        <van-button size="small" plain type="primary" :loading="generating" @click="generatePlan">
          重新生成
        </van-button>
      </template>
    </van-nav-bar>

    <!-- Loading -->
    <van-skeleton :row="6" :loading="loading" />

    <!-- AI Plan card -->
    <div v-if="plan" class="ai-plan-card" style="margin-top:12px;">
      <div class="plan-title">{{ plan.title }}</div>
      <div style="font-size:13px; opacity:0.85; margin-bottom:12px;">
        阶段: {{ plan.phase }} | 每日目标: {{ plan.dailyGoal }}
      </div>
      <div class="plan-item" v-for="(item, idx) in plan.items" :key="idx">
        <van-icon :name="item.done ? 'success' : 'clock-o'" :color="item.done ? '#07c160' : '#fff'" />
        <span>{{ item.day }}: {{ item.task }}</span>
      </div>
    </div>

    <!-- AI Suggestion -->
    <div class="checkin-card" style="margin-top:16px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <van-icon name="chat-o" color="#667eea" size="20" />
        <span style="font-weight:600; font-size:16px;">AI 学习建议</span>
      </div>
      <p style="font-size:14px; line-height:1.6; color:#666;">{{ suggestion }}</p>
    </div>

    <!-- Manual settings -->
    <div class="checkin-card" style="margin-top:12px;">
      <div style="font-weight:600; font-size:16px; margin-bottom:12px;">学习偏好设置</div>
      <van-field label="学习等级" is-link readonly :model-value="'中级'" @click="showToast('功能开发中')" />
      <van-field label="学习目标" is-link readonly :model-value="'提升英语表达能力'" @click="showToast('功能开发中')" />
      <van-field label="每日学习时长" is-link readonly :model-value="'30分钟'" @click="showToast('功能开发中')" />
    </div>
  </div>
</template>