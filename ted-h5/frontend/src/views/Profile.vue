<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '../stores/user'
import { useCheckinStore } from '../stores/checkin'

const router = useRouter()
const userStore = useUserStore()
const checkinStore = useCheckinStore()

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchProfile()
    await checkinStore.fetchStreak()
  }
})

function handleLogout() {
  showConfirmDialog({
    title: '提示',
    message: '确定要退出登录吗？'
  }).then(() => {
    userStore.logout()
    showToast('已退出')
  }).catch(() => {})
}
</script>

<template>
  <div class="page">
    <!-- Not logged in -->
    <div v-if="!userStore.isLoggedIn" class="profile-header">
      <div class="avatar-large">
        <van-icon name="user-o" size="36" />
      </div>
      <div class="nickname">未登录</div>
      <div class="bio">登录后解锁更多功能</div>
      <van-button type="primary" round @click="router.push('/home')" style="margin-top:16px;">
        去登录
      </van-button>
    </div>

    <!-- Logged in -->
    <div v-else>
      <div class="profile-header">
        <div class="avatar-large">
          {{ userStore.nickname?.charAt(0)?.toUpperCase() || '?' }}
        </div>
        <div class="nickname">{{ userStore.nickname }}</div>
        <div class="bio">保持学习，每天进步一点点</div>
      </div>

      <!-- Stats -->
      <div class="checkin-card" style="margin-bottom:16px;">
        <div class="checkin-streak">
          <div class="streak-item">
            <div class="count">{{ checkinStore.currentStreak }}</div>
            <div class="label">连续打卡</div>
          </div>
          <div class="streak-item">
            <div class="count" style="color:#07c160;">{{ checkinStore.longestStreak }}</div>
            <div class="label">最长记录</div>
          </div>
        </div>
      </div>

      <!-- Menu items -->
      <van-cell-group>
        <van-cell title="AI 学习计划" is-link to="/ai-plan">
          <template #icon>
            <van-icon name="gemel-o" style="margin-right:8px; color:#667eea;" />
          </template>
        </van-cell>
        <van-cell title="学习记录" is-link>
          <template #icon>
            <van-icon name="notes-o" style="margin-right:8px; color:#1989fa;" />
          </template>
        </van-cell>
        <van-cell title="我的收藏" is-link>
          <template #icon>
            <van-icon name="star-o" style="margin-right:8px; color:#ff976a;" />
          </template>
        </van-cell>
        <van-cell title="设置" is-link>
          <template #icon>
            <van-icon name="setting-o" style="margin-right:8px; color:#969799;" />
          </template>
        </van-cell>
      </van-cell-group>

      <div style="margin-top:24px; padding: 0 16px;">
        <van-button block round plain type="danger" @click="handleLogout">
          退出登录
        </van-button>
      </div>
    </div>
  </div>
</template>