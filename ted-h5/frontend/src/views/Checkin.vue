<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { useCheckinStore } from '../stores/checkin'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const checkinStore = useCheckinStore()
const userStore = useUserStore()

const content = ref('')
const notes = ref('')
const articleId = ref(route.query.articleId || '')
const submitting = ref(false)

const today = new Date()
const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/home')
    return
  }
  await checkinStore.fetchToday()
  await checkinStore.fetchStreak()
})

const hasCheckedIn = computed(() => checkinStore.hasCheckedInToday)

async function submitCheckin() {
  if (!content.value.trim()) {
    showToast('请输入打卡内容')
    return
  }
  submitting.value = true
  try {
    await checkinStore.submitCheckin({
      content: content.value,
      notes: notes.value,
      articleId: articleId.value || undefined
    })
    showSuccessToast('打卡成功')
    content.value = ''
    notes.value = ''
  } catch (e) {
    // error already handled by interceptor
  } finally {
    submitting.value = false
  }
}

function goReading() {
  router.push('/home')
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="每日打卡" left-arrow @click-left="router.back()" />

    <!-- Streak display -->
    <div class="checkin-card" style="margin-top:12px;">
      <div class="checkin-streak">
        <div class="streak-item">
          <div class="count">{{ checkinStore.currentStreak }}</div>
          <div class="label">连续打卡</div>
        </div>
        <div class="streak-item">
          <div class="count" style="color:#07c160;">{{ checkinStore.longestStreak }}</div>
          <div class="label">最长记录</div>
        </div>
        <div class="streak-item">
          <div class="count" style="color:#ff976a;">{{ dateStr }}</div>
          <div class="label">今日日期</div>
        </div>
      </div>
    </div>

    <!-- Already checked in -->
    <div v-if="hasCheckedIn" style="text-align:center; padding:40px 0;">
      <van-icon name="success" size="64" color="#07c160" />
      <h2 style="margin:16px 0 8px; font-size:20px;">今日已打卡</h2>
      <p style="color:#969799; font-size:14px;">你已经完成了今天的打卡，明天继续加油！</p>
      <van-button type="primary" plain @click="goReading" style="margin-top:16px;">继续阅读</van-button>
    </div>

    <!-- Checkin form -->
    <div v-else>
      <div class="checkin-card">
        <div style="font-weight:600; font-size:16px; margin-bottom:12px;">今日学习记录</div>
        <van-field
          v-model="content"
          type="textarea"
          rows="4"
          maxlength="500"
          show-word-limit
          placeholder="写下你今天的学习心得、收获的单词或句子..."
          :rules="[{ required: true, message: '请输入打卡内容' }]"
        />
      </div>

      <div class="checkin-card">
        <div style="font-weight:600; font-size:16px; margin-bottom:12px;">学习备注</div>
        <van-field
          v-model="notes"
          type="textarea"
          rows="2"
          maxlength="200"
          show-word-limit
          placeholder="可选：记录学习时长、难点等..."
        />
      </div>

      <van-button
        type="primary"
        block
        round
        :loading="submitting"
        @click="submitCheckin"
        style="margin-top:16px;"
      >
        提交打卡
      </van-button>
    </div>
  </div>
</template>