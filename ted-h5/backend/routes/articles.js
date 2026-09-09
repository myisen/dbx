const express = require('express')
const Article = require('../models/Article')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/articles - list articles
router.get('/', async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query
    const query = { status: 'published' }
    if (type === 'popular') {
      query.readCount = { $gte: 0 }
    }
    const sort = type === 'latest' ? { createdAt: -1 }
      : type === 'popular' ? { readCount: -1 }
      : { createdAt: -1 }

    const articles = await Article.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('title author description difficulty wordCount duration tags readCount likeCount createdAt')

    const total = await Article.countDocuments(query)

    res.json({ articles, total, page: Number(page) })
  } catch (error) {
    res.status(500).json({ message: '获取文章列表失败: ' + error.message })
  }
})

// GET /api/articles/daily/today
router.get('/daily/today', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let article = await Article.findOne({
      isDaily: true,
      dailyDate: { $gte: today, $lt: tomorrow }
    })

    if (!article) {
      article = await Article.findOne({ status: 'published' })
        .sort({ createdAt: -1 })
    }

    res.json({ article })
  } catch (error) {
    res.status(500).json({ message: '获取每日文章失败: ' + error.message })
  }
})

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { readCount: 1 } },
      { new: true }
    )
    if (!article) {
      return res.status(404).json({ message: '文章不存在' })
    }
    res.json({ article })
  } catch (error) {
    res.status(500).json({ message: '获取文章失败: ' + error.message })
  }
})

module.exports = router