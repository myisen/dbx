<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useArticleStore } from '../stores/article'
import { useCheckinStore } from '../stores/checkin'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const checkinStore = useCheckinStore()

const showWord = ref(false)
const selectedWord = ref({})
const showTranslation = ref(true)
const fontSize = ref(16)
const progress = ref(0)

const enFontSize = computed(() => `${fontSize.value}px`)
const cnFontSize = computed(() => `${fontSize.value - 2}px`)

onMounted(async () => {
  const id = route.params.id
  if (id === 'daily') {
    await articleStore.fetchDaily()
  } else {
    await articleStore.fetchDetail(id)
  }
})

function handleWordClick(word, e) {
  if (!word) return
  selectedWord.value = {
    word: word.toLowerCase(),
    phonetic: `/ˈ${word.toLowerCase()}/`,
    definition: `n. ${word}（点击查词功能已接入，可扩展调用词典API）`
  }
  showWord.value = true
}

function handleSentenceClick(sentence) {
  // Toggle highlight
  const el = e.currentTarget
  el.classList.toggle('highlighted')
}

function goCheckin() {
  router.push(`/checkin?articleId=${route.params.id}`)
}

function onScroll(e) {
  const el = e.target
  if (!el) return
  const scrollTop = el.scrollTop
  const scrollHeight = el.scrollHeight - el.clientHeight
  progress.value = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
}
</script>

<template>
  <div style="padding-bottom: 80px;">
    <!-- Nav bar -->
    <van-nav-bar
      :title="articleStore.currentArticle?.title || '精读'"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <van-icon name="font" size="18" @click="fontSize = fontSize >= 20 ? 14 : fontSize + 2" />
        <van-icon name="eye-o" size="18" style="margin-left:12px;" @click="showTranslation = !showTranslation" />
      </template>
    </van-nav-bar>

    <!-- Progress bar -->
    <div style="position:sticky; top:0; z-index:9; background:#fff; padding:0 16px 8px;">
      <van-progress :percentage="progress" :stroke-width="3" color="#1989fa" track-color="#f0f0f0" />
    </div>

    <!-- Article content -->
    <div class="page" @scroll="onScroll" style="overflow-y:auto;">
      <!-- Article header -->
      <div v-if="articleStore.currentArticle" style="margin-bottom:16px;">
        <h1 style="font-size:22px; font-weight:700; margin:0 0 8px; line-height:1.3;">
          {{ articleStore.currentArticle.title }}
        </h1>
        <div style="display:flex; gap:12px; font-size:13px; color:#969799; margin-bottom:4px;">
          <span>{{ articleStore.currentArticle.author || 'TED演讲' }}</span>
          <span>{{ articleStore.currentArticle.duration || '10分钟' }}</span>
          <span>{{ articleStore.currentArticle.wordCount || 0 }}词</span>
        </div>
        <van-tag plain type="primary" size="small">{{ articleStore.currentArticle.difficulty || '中等' }}</van-tag>
      </div>

      <!-- Loading -->
      <van-skeleton :row="8" :loading="articleStore.loading" />

      <!-- Bilingual paragraphs -->
      <div v-if="articleStore.currentArticle?.paragraphs" class="bilingual-paragraph" v-for="(p, idx) in articleStore.currentArticle.paragraphs" :key="idx">
        <div
          class="en-text"
          :style="{ fontSize: enFontSize }"
          @click="handleSentenceClick(p.en, $event)"
        >
          <span v-for="(word, wi) in p.en.split(' ')" :key="wi"
            @click.stop="handleWordClick(word.replace(/[^a-zA-Z]/g, ''), $event)"
            style="cursor:pointer;"
          >{{ word }} </span>
        </div>
        <div v-if="showTranslation" class="cn-text" :style="{ fontSize: cnFontSize }">
          {{ p.cn }}
        </div>
      </div>

      <!-- No content empty state -->
      <van-empty v-if="!articleStore.loading && !articleStore.currentArticle?.paragraphs" description="暂无内容" />
    </div>

    <!-- Bottom action bar -->
    <van-action-bar style="position:fixed; bottom:0; left:0; right:0; z-index:100;">
      <van-action-bar-icon icon="star-o" text="收藏" />
      <van-action-bar-icon icon="share-o" text="分享" />
      <van-action-bar-button type="primary" text="去打卡" @click="goCheckin" />
    </van-action-bar>

    <!-- Word popup -->
    <van-dialog v-model:show="showWord" :title="selectedWord.word" class="word-popup">
      <div style="padding:12px;">
        <div class="phonetic">{{ selectedWord.phonetic }}</div>
        <div class="definition">{{ selectedWord.definition }}</div>
      </div>
    </van-dialog>
  </div>
</template>