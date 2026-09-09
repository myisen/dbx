<script setup>
import { ref, nextTick } from 'vue'
import { showToast, showImagePreview } from 'vant'
import { generatePoster, downloadImage, webShare } from '../utils/share'

const props = defineProps({
  visible: { type: Boolean, default: false },
  type: { type: String, default: 'checkin' }, // 'checkin' | 'reading' | 'achievement'
  data: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])
const posterRef = ref(null)
const posterDataUrl = ref('')
const showPreview = ref(false)
const generating = ref(false)

async function handleGenerate() {
  generating.value = true
  try {
    await nextTick()
    const dataUrl = await generatePoster(posterRef.value)
    posterDataUrl.value = dataUrl
    showPreview.value = true
  } catch (e) {
    showToast('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

function handleDownload() {
  if (posterDataUrl.value) {
    downloadImage(posterDataUrl.value, 'ted-checkin-poster.png')
    showToast('已保存到相册')
  }
}

async function handleShare() {
  if (posterDataUrl.value) {
    const blob = await (await fetch(posterDataUrl.value)).blob()
    const file = new File([blob], 'poster.png', { type: 'image/png' })
    const shared = await webShare({
      title: 'TED双语精读打卡',
      text: props.data.shareText || '我在TED精读打卡，一起来学习吧！',
      files: [file]
    })
    if (shared) {
      emit('close')
    }
  }
}

function handleClose() {
  showPreview.value = false
  posterDataUrl.value = ''
  emit('close')
}
</script>

<template>
  <!-- Poster generation trigger -->
  <van-action-sheet v-model:show="props.visible" :close-on-popstate="false" @closed="handleClose">
    <template #default>
      <div style="padding: 20px; text-align: center;">
        <div v-if="!showPreview">
          <!-- Poster preview area (hidden) -->
          <div ref="posterRef" style="width: 375px; min-height: 600px; padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin: 0 auto; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="font-size: 20px; font-weight: 700; letter-spacing: 2px;">TED精读打卡</div>
              <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">每日一篇，中英双语精读</div>
            </div>

            <!-- Type-specific content -->
            <template v-if="type === 'checkin'">
              <div style="text-align: center; padding: 16px 0;">
                <div style="font-size: 48px; font-weight: 800;">{{ data.streak || 0 }}</div>
                <div style="font-size: 14px; opacity: 0.85;">天连续打卡</div>
              </div>
              <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 13px; line-height: 1.6;">
                "{{ data.content || 'Keep learning, keep growing.' }}"
              </div>
              <div style="display: flex; justify-content: space-around; margin-top: 16px;">
                <div style="text-align: center;">
                  <div style="font-size: 20px; font-weight: 700;">{{ data.totalWords || 0 }}</div>
                  <div style="font-size: 11px; opacity: 0.75;">已学单词</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 20px; font-weight: 700;">{{ data.totalCheckins || 0 }}</div>
                  <div style="font-size: 11px; opacity: 0.75;">总打卡</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 20px; font-weight: 700;">{{ data.longestStreak || 0 }}</div>
                  <div style="font-size: 11px; opacity: 0.75;">最长记录</div>
                </div>
              </div>
            </template>

            <template v-else-if="type === 'reading'">
              <div style="font-size: 16px; font-weight: 600; margin: 12px 0; line-height: 1.4;">
                {{ data.title || 'TED演讲精选' }}
              </div>
              <div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 12px; margin: 12px 0; font-size: 13px; line-height: 1.6;">
                {{ data.excerpt || '好的故事，值得反复阅读。' }}
              </div>
              <div style="display: flex; justify-content: center; gap: 16px; margin-top: 12px;">
                <span style="font-size: 12px; opacity: 0.8;">{{ data.difficulty || '中等' }}</span>
                <span style="font-size: 12px; opacity: 0.8;">{{ data.wordCount || 0 }}词</span>
              </div>
            </template>

            <template v-else-if="type === 'achievement'">
              <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 48px; margin-bottom: 8px;">{{ data.emoji || '🏆' }}</div>
                <div style="font-size: 18px; font-weight: 700;">{{ data.title || '成就达成' }}</div>
                <div style="font-size: 13px; opacity: 0.8; margin-top: 4px;">{{ data.description || '' }}</div>
              </div>
            </template>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
              <div style="font-size: 11px; opacity: 0.6;">长按保存图片 · 分享给好友</div>
              <div style="font-size: 10px; opacity: 0.4; margin-top: 4px;">TED双语精读打卡 · 非商业性使用</div>
            </div>
          </div>

          <!-- Generate button -->
          <van-button
            type="primary"
            :loading="generating"
            @click="handleGenerate"
            round
            style="margin-top: 20px; width: 200px;"
          >
            生成海报
          </van-button>
        </div>

        <!-- Preview after generation -->
        <div v-else>
          <img :src="posterDataUrl" style="width: 100%; max-width: 375px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
          <div style="display: flex; gap: 12px; margin-top: 20px; justify-content: center;">
            <van-button type="primary" @click="handleDownload" round>保存图片</van-button>
            <van-button type="success" @click="handleShare" round>分享给好友</van-button>
          </div>
        </div>
      </div>
    </template>
  </van-action-sheet>
</template>