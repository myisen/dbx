import { defineStore } from 'pinia'
import { articles } from '../api'

export const useArticleStore = defineStore('article', {
  state: () => ({
    articleList: [],
    currentArticle: null,
    loading: false
  }),
  actions: {
    async fetchList(params = {}) {
      this.loading = true
      try {
        const res = await articles.list(params)
        this.articleList = res.articles || []
      } finally {
        this.loading = false
      }
    },
    async fetchDetail(id) {
      this.loading = true
      try {
        const res = await articles.detail(id)
        this.currentArticle = res.article
      } finally {
        this.loading = false
      }
    },
    async fetchDaily() {
      this.loading = true
      try {
        const res = await articles.getDaily()
        this.currentArticle = res.article
      } finally {
        this.loading = false
      }
    }
  }
})