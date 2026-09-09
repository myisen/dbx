<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '../stores/user'
import { useArticleStore } from '../stores/article'
import { useCheckinStore } from '../stores/checkin'
import { articles } from '../api'
import { getDailyQuote, hotTopics } from '../utils/quotes'

const router = useRouter()
const userStore = useUserStore()
const articleStore = useArticleStore()
const checkinStore = useCheckinStore()

const showLogin = ref(false)
const loginForm = ref({ nickname: '', password: '' })
const isRegister = ref(false)
const activeTab = ref(0)
const refreshing = ref(false)
const dailyArticle = ref(null)
const dailyQuote = computed(() => getDailyQuote())

const tabs = [
  { name: 'recommend', title: '推荐' },
  { name: 'popular', title: '热门' },
  { name: 'latest', title: '最新' }
]

const difficultyColor = (d) => {
  if (d === '简单') return '#07c160'
  if (d === '困难') return '#ee0a24'
  return '#1989fa'
}

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchProfile()
    await checkinStore.fetchToday()
    await checkinStore.fetchStreak()
  }
  await Promise.all([articleStore.fetchList(), fetchDaily()])
})

async function fetchDaily() {
  try {
    const res = await articles.getDaily()
    dailyArticle.value = res.article
  } catch {
    dailyArticle.value = null
  }
}

async function onRefresh() {
  refreshing.value = true
  await Promise.all([
    articleStore.fetchList({ type: tabs[activeTab.value]?.name }),
    fetchDaily()
  ])
  if (userStore.isLoggedIn) {
    await checkinStore.fetchToday()
    await checkinStore.fetchStreak()
  }
  refreshing.value = false
}

function goReading(id) {
  if (!userStore.isLoggedIn) {
    showLogin.value = true
    return
  }
  router.push(`/reading/${id}`)
}

function goCheckin() {
  if (!userStore.isLoggedIn) {
    showLogin.value = true
    return
  }
  router.push('/checkin')
}

function goAIPlan() {
  if (!userStore.isLoggedIn) {
    showLogin.value = true
    return
  }
  router.push('/ai-plan')
}

function goTopic(topic) {
  showToast(`浏览 "${topic.label}" 话题`)
}

async function handleLogin() {
  try {
    if (isRegister.value) {
      await userStore.register(loginForm.value)
    } else {
      await userStore.login(loginForm.value)
    }
    showLogin.value = false
    showToast(isRegister.value ? '注册成功' : '登录成功')
    await userStore.fetchProfile()
    await checkinStore.fetchToday()
    await checkinStore.fetchStreak()
  } catch (e) {
    showToast(e.response?.data?.message || '操作失败')
  }
}

function onTabChange(name) {
  articleStore.fetchList({ type: name })
}
</script>

<template>
  <div class="page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :head-height="60">
      <!-- Header -->
      <div style="padding: 16px 0 4px;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <h1 style="font-size:24px; font-weight:700; margin:0;">TED精读</h1>
          <van-icon name="fire-o" size="24" color="#ff6b35" @click="goCheckin" />
        </div>
        <p style="font-size:13px; color:#969799; margin-top:4px;">每日一篇，中英双语精读</p>
      </div>

      <!-- Daily quote -->
      <div class="daily-quote-card">
        <div class="quote-icon">"</div>
        <div class="quote-text">{{ dailyQuote.text }}</div>
        <div class="quote-cn">{{ dailyQuote.cn }}</div>
        <div class="quote-author">—— {{ dailyQuote.author }} · {{ dailyQuote.talk }}</div>
      </div>

      <!-- Hot topics -->
      <div class="hot-topics-section">
        <div class="section-title" style="margin-top:0;">热门 TED 话题</div>
        <div class="hot-topics-scroll">
          <div
            v-for="topic in hotTopics"
            :key="topic.id"
            class="topic-tag"
            :style="{ background: topic.color + '18', color: topic.color, borderColor: topic.color + '30' }"
            @click="goTopic(topic)"
          >
            <span class="topic-icon">{{ topic.icon }}</span>
            <span>{{ topic.label }}</span>
          </div>
        </div>
      </div>

      <!-- Daily article highlight -->
      <div
        v-if="dailyArticle"
        class="daily-banner"
        @click="goReading(dailyArticle._id)"
      >
        <div class="daily-badge">今日推荐</div>
        <div class="daily-title">{{ dailyArticle.title }}</div>
        <div class="daily-meta">
          <span>{{ dailyArticle.author }}</span>
          <span>·</span>
          <span>{{ dailyArticle.duration }}</span>
          <span>·</span>
          <span>{{ dailyArticle.wordCount }}词</span>
        </div>
        <div class="daily-desc">{{ dailyArticle.description }}</div>
        <div class="daily-arrow">
          <van-icon name="arrow" color="rgba(255,255,255,0.6)" />
        </div>
      </div>

      <!-- Streak card -->
      <div v-if="userStore.isLoggedIn" class="checkin-card" style="margin-bottom:16px;">
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
            <div class="count" style="color:#ff976a;">{{ checkinStore.streak.total || 0 }}</div>
            <div class="label">总打卡</div>
          </div>
        </div>
        <van-button
          :type="checkinStore.hasCheckedInToday ? 'default' : 'primary'"
          :disabled="checkinStore.hasCheckedInToday"
          block
          round
          @click="goCheckin"
        >
          {{ checkinStore.hasCheckedInToday ? '今日已打卡' : '去打卡' }}
        </van-button>
      </div>

      <!-- AI Plan Entry -->
      <van-cell
        v-if="userStore.isLoggedIn"
        is-link
        @click="goAIPlan"
        style="border-radius:8px; margin-bottom:16px;"
      >
        <template #title>
          <div style="display:flex; align-items:center; gap:8px;">
            <van-icon name="gemel-o" color="#667eea" />
            <span style="font-weight:500;">AI 学习计划</span>
          </div>
        </template>
        <template #label>
          <span style="font-size:12px; color:#969799;">根据你的打卡数据智能生成学习计划</span>
        </template>
      </van-cell>

      <!-- Login prompt -->
      <van-cell
        v-if="!userStore.isLoggedIn"
        is-link
        @click="showLogin = true"
        style="border-radius:8px; margin-bottom:16px;"
      >
        <template #title>
          <div style="display:flex; align-items:center; gap:8px;">
            <van-icon name="user-o" color="#1989fa" />
            <span style="font-weight:500;">登录 / 注册</span>
          </div>
        </template>
        <template #label>
          <span style="font-size:12px; color:#969799;">登录后即可开始打卡学习</span>
        </template>
      </van-cell>

      <!-- Tabs -->
      <van-tabs v-model:active="activeTab" @change="onTabChange" style="margin-bottom:12px;">
        <van-tab v-for="t in tabs" :key="t.name" :title="t.title" :name="t.name">
        </van-tab>
      </van-tabs>

      <!-- Article list (show max 3) -->
      <van-skeleton :row="3" :loading="articleStore.loading" v-for="n in 3" :key="n" style="margin-bottom:12px;" />

      <div v-for="item in articleStore.articleList.slice(0, 3)" :key="item._id" class="article-card" @click="goReading(item._id)">
        <div class="cover">
          <span>{{ item.title?.charAt(0) || 'T' }}</span>
        </div>
        <div class="body">
          <div class="title">{{ item.title }}</div>
          <div class="meta">
            <span>{{ item.author || 'TED演讲' }}</span>
            <van-tag :color="difficultyColor(item.difficulty)" size="small" plain>{{ item.difficulty || '中等' }}</van-tag>
            <span>{{ item.wordCount || 0 }}词</span>
          </div>
          <div class="desc">{{ item.description }}</div>
        </div>
      </div>
    </van-pull-refresh>
  </div>

  <!-- Login dialog -->
  <van-dialog
    v-model:show="showLogin"
    :title="isRegister ? '注册' : '登录'"
    show-cancel-button
    confirm-button-text="确定"
    @confirm="handleLogin"
  >
    <div style="padding: 16px;">
      <van-field
        v-model="loginForm.nickname"
        label="昵称"
        placeholder="输入昵称"
        :rules="[{ required: true }]"
      />
      <van-field
        v-model="loginForm.password"
        type="password"
        label="密码"
        placeholder="输入密码"
        :rules="[{ required: true }]"
      />
      <div style="text-align:center; margin-top:8px;">
        <van-button size="small" plain type="primary" @click="isRegister = !isRegister">
          {{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}
        </van-button>
      </div>
    </div>
  </van-dialog>
</template>