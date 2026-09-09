<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { useCheckinStore } from '../stores/checkin'
import { useUserStore } from '../stores/user'
import { checkins } from '../api'
import SharePoster from '../components/SharePoster.vue'

const router = useRouter()
const route = useRoute()
const checkinStore = useCheckinStore()
const userStore = useUserStore()

const content = ref('')
const notes = ref('')
const mood = ref('good')
const studyMinutes = ref(30)
const wordsLearned = ref('')
const articleId = ref(route.query.articleId || '')
const submitting = ref(false)
const showShare = ref(false)
const showCalendar = ref(false)
const calendarDays = ref([])
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth() + 1)
const checkinHistory = ref([])
const historyLoading = ref(false)

const today = new Date()
const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const moods = [
  { value: 'great', label: '超棒', icon: 'smile-o' },
  { value: 'good', label: '不错', icon: 'smile' },
  { value: 'normal', label: '一般', icon: 'music-o' },
  { value: 'bad', label: '困难', icon: 'warning-o' }
]

// Make-up check-in state
const showMakeup = ref(false)
const makeupContent = ref('')
const makeupNotes = ref('')
const makeupMood = ref('good')
const makeupWords = ref('')
const makeupMinutes = ref(30)
const selectedDate = ref('')
const selectedDateLabel = ref('')

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/home')
    return
  }
  await checkinStore.fetchToday()
  await checkinStore.fetchStreak()
  await checkinStore.fetchMissed()
  await fetchHistory()
  await fetchCalendar(calendarYear.value, calendarMonth.value)
})

const hasCheckedIn = computed(() => checkinStore.hasCheckedInToday)

const shareData = computed(() => ({
  type: 'checkin',
  data: {
    streak: checkinStore.currentStreak,
    longestStreak: checkinStore.longestStreak,
    totalCheckins: checkinStore.streak.total,
    totalWords: parseInt(wordsLearned.value) || 0,
    content: content.value || '今天完成了TED精读打卡！'
  }
}))

async function fetchHistory() {
  historyLoading.value = true
  try {
    const res = await checkins.list({ page: 1, limit: 10 })
    checkinHistory.value = res.checkins || []
  } catch {
    checkinHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

async function fetchCalendar(year, month) {
  try {
    const res = await checkins.calendar({ year, month })
    calendarDays.value = res.days || []
  } catch {
    calendarDays.value = []
  }
}

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
      mood: mood.value,
      studyMinutes: studyMinutes.value,
      wordsLearned: parseInt(wordsLearned.value) || 0,
      articleId: articleId.value || undefined
    })
    showSuccessToast('打卡成功')
    content.value = ''
    notes.value = ''
    wordsLearned.value = ''
    await fetchHistory()
    await fetchCalendar(calendarYear.value, calendarMonth.value)
  } catch (e) {
    // error already handled by interceptor
  } finally {
    submitting.value = false
  }
}

function goReading() {
  router.push('/home')
}

function openMakeup(date, label) {
  selectedDate.value = date
  selectedDateLabel.value = label
  makeupContent.value = ''
  makeupNotes.value = ''
  makeupMood.value = 'good'
  makeupWords.value = ''
  makeupMinutes.value = 30
  showMakeup.value = true
}

async function submitMakeup() {
  if (!makeupContent.value.trim()) {
    showToast('请输入补卡内容')
    return
  }
  try {
    const res = await checkinStore.submitMakeup({
      content: makeupContent.value,
      notes: makeupNotes.value,
      mood: makeupMood.value,
      studyMinutes: makeupMinutes.value,
      wordsLearned: parseInt(makeupWords.value) || 0,
      targetDate: selectedDate.value
    })
    showSuccessToast(`补卡成功！连续打卡 ${res.streak.current} 天`)
    showMakeup.value = false
    await fetchCalendar(calendarYear.value, calendarMonth.value)
    await fetchHistory()
  } catch {
    // handled by interceptor
  }
}

function prevMonth() {
  if (calendarMonth.value === 1) {
    calendarYear.value--
    calendarMonth.value = 12
  } else {
    calendarMonth.value--
  }
  fetchCalendar(calendarYear.value, calendarMonth.value)
}

function nextMonth() {
  if (calendarMonth.value === 12) {
    calendarYear.value++
    calendarMonth.value = 1
  } else {
    calendarMonth.value++
  }
  fetchCalendar(calendarYear.value, calendarMonth.value)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay()
}
</script>

<template>
  <div class="page" style="padding-bottom: 80px;">
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
          <div class="count" style="color:#ff976a;">{{ checkinStore.streak.total || 0 }}</div>
          <div class="label">总打卡</div>
        </div>
      </div>
    </div>

    <!-- Calendar mini view -->
    <div class="checkin-card" style="margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <van-button size="small" plain @click="prevMonth">&lt;</van-button>
        <span style="font-weight:600; font-size:15px;">{{ calendarYear }}年{{ calendarMonth }}月</span>
        <van-button size="small" plain @click="nextMonth">&gt;</van-button>
      </div>
      <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center;">
        <div v-for="d in ['日','一','二','三','四','五','六']" :key="d" style="font-size:12px; color:#969799; padding:4px 0;">{{ d }}</div>
        <template v-for="day in getDaysInMonth(calendarYear, calendarMonth)" :key="day">
          <div
            v-if="day === 1"
            :style="{ gridColumnStart: getFirstDayOfMonth(calendarYear, calendarMonth) + 1 }"
            class="calendar-day"
            :class="{ checked: calendarDays.includes(day), today: day === new Date().getDate() && calendarYear === new Date().getFullYear() && calendarMonth === new Date().getMonth() + 1 }"
          >
            {{ day }}
          </div>
          <div
            v-else
            class="calendar-day"
            :class="{ checked: calendarDays.includes(day), today: day === new Date().getDate() && calendarYear === new Date().getFullYear() && calendarMonth === new Date().getMonth() + 1 }"
          >
            {{ day }}
          </div>
        </template>
      </div>
    </div>

    <!-- Already checked in -->
    <div v-if="hasCheckedIn" style="text-align:center; padding:40px 0;">
      <van-icon name="success" size="64" color="#07c160" />
      <h2 style="margin:16px 0 8px; font-size:20px;">今日已打卡</h2>
      <p style="color:#969799; font-size:14px;">你已经完成了今天的打卡，明天继续加油！</p>
      <div style="display:flex; gap:12px; justify-content:center; margin-top:16px;">
        <van-button type="primary" plain @click="goReading">继续阅读</van-button>
        <van-button type="warning" plain @click="showShare = true">分享打卡</van-button>
      </div>

      <!-- Recent history -->
      <div style="text-align:left; margin-top:24px;">
        <div class="section-title" style="text-align:left;">最近打卡</div>
        <van-skeleton :row="3" :loading="historyLoading" />
        <div v-for="item in checkinHistory" :key="item._id" class="checkin-card" style="padding:12px; margin-bottom:8px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:#969799; margin-bottom:6px;">
            <span>{{ formatDate(item.createdAt) }}</span>
            <span>{{ formatTime(item.createdAt) }}</span>
          </div>
          <div style="font-size:14px; line-height:1.5; text-align:left;">{{ item.content }}</div>
          <div v-if="item.notes" style="font-size:12px; color:#969799; margin-top:6px; text-align:left;">备注: {{ item.notes }}</div>
        </div>
        <van-empty v-if="!historyLoading && checkinHistory.length === 0" description="暂无打卡记录" />
      </div>

      <!-- Make-up check-in section -->
      <div v-if="checkinStore.missedDates.length > 0" style="text-align:left; margin-top:24px;">
        <div class="section-title" style="text-align:left;">
          补卡
          <span style="font-size:12px; color:#969799; font-weight:400;">（可补最近7天）</span>
        </div>
        <div class="missed-list">
          <div
            v-for="item in checkinStore.missedDates"
            :key="item.date"
            class="missed-item"
            @click="openMakeup(item.date, item.label)"
          >
            <div class="missed-left">
              <van-icon name="underway-o" size="20" color="#ee0a24" />
              <span class="missed-label">{{ item.label }}</span>
              <span class="missed-date">{{ item.date }}</span>
            </div>
            <div class="missed-action">
              <span style="color:#1989fa; font-size:13px;">去补卡</span>
              <van-icon name="arrow" size="14" color="#1989fa" />
            </div>
          </div>
        </div>
      </div>
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
        <div style="font-weight:600; font-size:16px; margin-bottom:12px;">学习数据</div>
        <van-field v-model="wordsLearned" type="digit" label="今日新词" placeholder="如: 10" />
        <van-field v-model="studyMinutes" type="digit" label="学习时长(分钟)" placeholder="如: 30" />
        <div style="margin-top:8px;">
          <div style="font-size:13px; color:#666; margin-bottom:8px;">今日心情</div>
          <div style="display:flex; gap:12px;">
            <div v-for="m in moods" :key="m.value" class="mood-item" :class="{ active: mood === m.value }" @click="mood = m.value">
              <van-icon :name="m.icon" :size="22" :color="mood === m.value ? '#1989fa' : '#969799'" />
              <span style="font-size:12px; margin-top:2px;">{{ m.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="checkin-card">
        <div style="font-weight:600; font-size:16px; margin-bottom:12px;">学习备注</div>
        <van-field
          v-model="notes"
          type="textarea"
          rows="2"
          maxlength="200"
          show-word-limit
          placeholder="可选：记录学习难点、感悟等..."
        />
      </div>

      <van-button
        type="primary"
        block
        round
        :loading="submitting"
        @click="submitCheckin"
        style="margin-top:16px; height: 44px;"
      >
        <span style="font-size:16px;">提交打卡</span>
      </van-button>
    </div>

    <!-- Make-up check-in dialog -->
    <van-action-sheet v-model:show="showMakeup" :title="`补卡 - ${selectedDateLabel}`" closeable>
      <div style="padding: 16px;">
        <div class="checkin-card" style="margin-bottom:12px;">
          <van-field
            v-model="makeupContent"
            type="textarea"
            rows="4"
            maxlength="500"
            show-word-limit
            placeholder="为这一天写下你的学习心得..."
            :rules="[{ required: true, message: '请输入内容' }]"
          />
        </div>
        <div class="checkin-card" style="margin-bottom:12px;">
          <van-field v-model="makeupWords" type="digit" label="新词数" placeholder="如: 10" />
          <van-field v-model="makeupMinutes" type="digit" label="学习时长(分钟)" placeholder="如: 30" />
          <div style="margin-top:8px;">
            <div style="font-size:13px; color:#666; margin-bottom:8px;">心情</div>
            <div style="display:flex; gap:12px;">
              <div v-for="m in moods" :key="m.value" class="mood-item" :class="{ active: makeupMood === m.value }" @click="makeupMood = m.value">
                <van-icon :name="m.icon" :size="20" :color="makeupMood === m.value ? '#1989fa' : '#969799'" />
                <span style="font-size:11px; margin-top:2px;">{{ m.label }}</span>
              </div>
            </div>
          </div>
        </div>
        <van-field v-model="makeupNotes" type="textarea" rows="2" maxlength="200" show-word-limit placeholder="备注（可选）..." />
        <van-button
          type="primary"
          block
          round
          :loading="checkinStore.makeupLoading"
          @click="submitMakeup"
          style="margin-top: 12px; height: 44px;"
        >
          提交补卡
        </van-button>
      </div>
    </van-action-sheet>

    <!-- Share poster -->
    <SharePoster
      :visible="showShare"
      :type="shareData.type"
      :data="shareData.data"
      @close="showShare = false"
    />
  </div>
</template>

<style scoped>
.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ebedf0;
  cursor: pointer;
  transition: all 0.2s;
}
.mood-item.active {
  border-color: #1989fa;
  background: #ecf5ff;
}
.calendar-day {
  padding: 6px 0;
  font-size: 13px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.calendar-day.checked {
  background: #1989fa;
  color: white;
}
.calendar-day.today {
  border: 2px solid #1989fa;
  font-weight: 600;
}
.calendar-day.checked.today {
  background: #1989fa;
  color: white;
  border: 2px solid #07c160;
}
.calendar-day.makeup {
  background: #07c160;
  color: white;
  opacity: 0.8;
}

/* Missed dates list */
.missed-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.missed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #ebedf0;
  cursor: pointer;
  transition: all 0.15s;
}
.missed-item:active {
  background: #f5f5f5;
  transform: scale(0.98);
}
.missed-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.missed-label {
  font-size: 14px;
  font-weight: 500;
}
.missed-date {
  font-size: 12px;
  color: #969799;
}
.missed-action {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>