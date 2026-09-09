<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useArticleStore } from '../stores/article'
import { useUserStore } from '../stores/user'
import SharePoster from '../components/SharePoster.vue'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()

const showWord = ref(false)
const selectedWord = ref({})
const showTranslation = ref(true)
const fontSize = ref(16)
const progress = ref(0)
const isFavorited = ref(false)
const scrollContainer = ref(null)
const showFontMenu = ref(false)
const showShare = ref(false)
const showDictPanel = ref(false)
const dictQuery = ref('')
const dictResult = ref(null)

const fontSizes = [14, 16, 18, 20, 22]
const enFontSize = computed(() => `${fontSize.value}px`)
const cnFontSize = computed(() => `${fontSize.value - 2}px`)

const shareData = computed(() => {
  const a = articleStore.currentArticle
  if (!a) return { type: 'reading', data: {} }
  return {
    type: 'reading',
    data: {
      title: a.title,
      excerpt: a.paragraphs?.[0]?.en?.slice(0, 100) || '',
      difficulty: a.difficulty,
      wordCount: a.wordCount
    }
  }
})

onMounted(async () => {
  const id = route.params.id
  if (id === 'daily') {
    await articleStore.fetchDaily()
  } else {
    await articleStore.fetchDetail(id)
  }
  // Check if favorited
  const favs = JSON.parse(localStorage.getItem('ted_favorites') || '[]')
  isFavorited.value = favs.includes(route.params.id)
})

function handleWordClick(word, e) {
  if (!word || word.length <= 1) return
  const clean = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
  if (!clean) return

  selectedWord.value = {
    word: clean,
    phonetic: '',
    definition: '正在查询...'
  }
  showWord.value = true

  // Try to fetch from free dictionary API
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`)
    .then(r => r.json())
    .then(data => {
      if (Array.isArray(data) && data[0]) {
        const entry = data[0]
        const meaning = entry.meanings?.[0]
        selectedWord.value = {
          word: clean,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text || '',
          definition: meaning
            ? `${meaning.partOfSpeech}. ${meaning.definitions?.[0]?.definition || ''}`
            : '暂无释义',
          example: meaning?.definitions?.[0]?.example || ''
        }
      }
    })
    .catch(() => {
      selectedWord.value = {
        word: clean,
        phonetic: '',
        definition: '离线查询不可用，请联网重试'
      }
    })
}

function toggleFavorite() {
  const favs = JSON.parse(localStorage.getItem('ted_favorites') || '[]')
  const id = route.params.id
  if (isFavorited.value) {
    const idx = favs.indexOf(id)
    if (idx >= 0) favs.splice(idx, 1)
    showToast('已取消收藏')
  } else {
    favs.push(id)
    showToast('已收藏')
  }
  localStorage.setItem('ted_favorites', JSON.stringify(favs))
  isFavorited.value = !isFavorited.value
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

function switchFontSize(size) {
  fontSize.value = size
  showFontMenu.value = false
}

function scrollToParagraph(idx) {
  const el = document.getElementById(`para-${idx}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
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
        <van-icon name="font" size="18" @click="showFontMenu = true" />
        <van-icon :name="showTranslation ? 'eye-o' : 'closed-eye'" size="18" style="margin-left:12px;" @click="showTranslation = !showTranslation" />
      </template>
    </van-nav-bar>

    <!-- Font size picker -->
    <van-action-sheet v-model:show="showFontMenu" title="选择字号">
      <div style="display: flex; gap: 8px; padding: 16px; justify-content: center;">
        <van-button
          v-for="s in fontSizes" :key="s"
          :type="fontSize === s ? 'primary' : 'default'"
          size="small"
          round
          @click="switchFontSize(s)"
        >{{ s }}px</van-button>
      </div>
    </van-action-sheet>

    <!-- Progress bar -->
    <div style="position:sticky; top:0; z-index:9; background:#fff; padding:0 16px 8px;">
      <van-progress :percentage="progress" :stroke-width="3" color="#1989fa" track-color="#f0f0f0" />
    </div>

    <!-- Article content -->
    <div ref="scrollContainer" class="page" @scroll="onScroll" style="overflow-y:auto; max-height: calc(100vh - 120px);">
      <!-- Article header -->
      <div v-if="articleStore.currentArticle" style="margin-bottom:16px;">
        <h1 style="font-size:22px; font-weight:700; margin:0 0 8px; line-height:1.3;">
          {{ articleStore.currentArticle.title }}
        </h1>
        <div style="display:flex; gap:12px; font-size:13px; color:#969799; margin-bottom:4px; flex-wrap:wrap;">
          <span>{{ articleStore.currentArticle.author || 'TED演讲' }}</span>
          <span>{{ articleStore.currentArticle.duration || '10分钟' }}</span>
          <span>{{ articleStore.currentArticle.wordCount || 0 }}词</span>
          <span>阅读 {{ articleStore.currentArticle.readCount || 0 }} 次</span>
        </div>
        <van-tag plain type="primary" size="small">{{ articleStore.currentArticle.difficulty || '中等' }}</van-tag>
        <!-- Tags -->
        <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
          <van-tag v-for="tag in articleStore.currentArticle.tags" :key="tag" plain size="small" style="margin-right:4px;">{{ tag }}</van-tag>
        </div>
      </div>

      <!-- Loading -->
      <van-skeleton :row="8" :loading="articleStore.loading" />

      <!-- Bilingual paragraphs -->
      <div
        v-if="articleStore.currentArticle?.paragraphs"
        v-for="(p, idx) in articleStore.currentArticle.paragraphs"
        :key="idx"
        :id="`para-${idx}`"
        class="bilingual-paragraph"
      >
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:11px; color:#ccc;">{{ idx + 1 }}</span>
          <van-icon name="share-o" size="14" color="#ccc" @click="showShare = true" />
        </div>
        <div
          class="en-text"
          :style="{ fontSize: enFontSize }"
        >
          <span
            v-for="(word, wi) in p.en.split(' ')"
            :key="wi"
            @click.stop="handleWordClick(word, $event)"
            style="cursor:pointer; display:inline;"
            :class="{ 'word-hover': true }"
          >{{ word }} </span>
        </div>
        <div v-if="showTranslation" class="cn-text" :style="{ fontSize: cnFontSize }">
          {{ p.cn }}
        </div>
      </div>

      <!-- No content -->
      <van-empty v-if="!articleStore.loading && !articleStore.currentArticle?.paragraphs" description="暂无内容" />
    </div>

    <!-- Bottom action bar -->
    <van-action-bar style="position:fixed; bottom:0; left:0; right:0; z-index:100;">
      <van-action-bar-icon
        :icon="isFavorited ? 'star' : 'star-o'"
        :color="isFavorited ? '#ff976a' : '#333'"
        :text="isFavorited ? '已收藏' : '收藏'"
        @click="toggleFavorite"
      />
      <van-action-bar-icon icon="share-o" text="分享" @click="showShare = true" />
      <van-action-bar-button type="primary" text="去打卡" @click="goCheckin" />
    </van-action-bar>

    <!-- Word popup -->
    <van-dialog v-model:show="showWord" :title="selectedWord.word" class="word-popup" closeable>
      <div style="padding:12px;">
        <div v-if="selectedWord.phonetic" class="phonetic">{{ selectedWord.phonetic }}</div>
        <div class="definition">{{ selectedWord.definition }}</div>
        <div v-if="selectedWord.example" style="margin-top:8px; padding-top:8px; border-top:1px solid #eee; font-size:13px; color:#666; font-style:italic;">
          "{{ selectedWord.example }}"
        </div>
      </div>
    </van-dialog>

    <!-- Share poster -->
    <SharePoster
      v-if="showShare"
      :visible="showShare"
      :type="shareData.type"
      :data="shareData.data"
      @close="showShare = false"
    />
  </div>
</template>

<style scoped>
.word-hover:hover {
  background: #e8f4fd;
  border-radius: 2px;
  transition: background 0.15s;
}
</style>