const express = require('express')
const Checkin = require('../models/Checkin')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// POST /api/checkins - create checkin
router.post('/', auth, async (req, res) => {
  try {
    const { content, notes, articleId, mood, studyMinutes, wordsLearned } = req.body
    if (!content) {
      return res.status(400).json({ message: '请输入打卡内容' })
    }

    // Check duplicate
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await Checkin.findOne({
      userId: req.userId,
      createdAt: { $gte: today, $lt: tomorrow }
    })
    if (existing) {
      return res.status(400).json({ message: '今日已打卡' })
    }

    const checkin = new Checkin({
      userId: req.userId,
      articleId: articleId || null,
      content,
      notes: notes || '',
      mood: mood || 'good',
      studyMinutes: studyMinutes || 0,
      wordsLearned: wordsLearned || 0
    })
    await checkin.save()

    // Update user streak
    const user = req.user
    const lastCheckin = user.lastCheckinDate
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (!lastCheckin || lastCheckin < yesterday) {
      user.currentStreak = 1
    } else if (lastCheckin >= yesterday && lastCheckin < today) {
      user.currentStreak += 1
    }
    // If already checked in today, streak stays same

    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak
    }
    user.totalCheckins += 1
    user.lastCheckinDate = new Date()
    user.totalWords += (wordsLearned || 0)
    await user.save()

    res.json({ message: '打卡成功', checkin })
  } catch (error) {
    res.status(500).json({ message: '打卡失败: ' + error.message })
  }
})

// GET /api/checkins/today
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const checkin = await Checkin.findOne({
      userId: req.userId,
      createdAt: { $gte: today, $lt: tomorrow }
    })
    res.json({ checkin })
  } catch (error) {
    res.status(500).json({ message: '获取今日打卡失败' })
  }
})

// GET /api/checkins/streak
router.get('/streak', auth, async (req, res) => {
  try {
    const user = req.user
    res.json({
      streak: {
        current: user.currentStreak || 0,
        longest: user.longestStreak || 0,
        total: user.totalCheckins || 0
      }
    })
  } catch (error) {
    res.status(500).json({ message: '获取打卡记录失败' })
  }
})

// GET /api/checkins/calendar
router.get('/calendar', auth, async (req, res) => {
  try {
    const { year, month } = req.query
    const y = parseInt(year) || new Date().getFullYear()
    const m = parseInt(month) || (new Date().getMonth() + 1)

    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0, 23, 59, 59)

    const checkins = await Checkin.find({
      userId: req.userId,
      createdAt: { $gte: start, $lt: end }
    }).select('createdAt')

    const days = checkins.map(c => {
      const d = new Date(c.createdAt)
      return d.getDate()
    })

    res.json({ days, year: y, month: m })
  } catch (error) {
    res.status(500).json({ message: '获取日历失败' })
  }
})

// GET /api/checkins - list checkins
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const checkins = await Checkin.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('articleId', 'title')
    const total = await Checkin.countDocuments({ userId: req.userId })
    res.json({ checkins, total, page: Number(page) })
  } catch (error) {
    res.status(500).json({ message: '获取打卡列表失败' })
  }
})

module.exports = router