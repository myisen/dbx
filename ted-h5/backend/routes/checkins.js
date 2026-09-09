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

// GET /api/checkins/missed - get dates available for make-up check-in
router.get('/missed', auth, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Collect all check-in dates (including today) in the last 30 days
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const checkins = await Checkin.find({
      userId: req.userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).select('createdAt compensatedFor isCompensation').sort({ createdAt: 1 })

    // Build set of dates that have been checked in (normal or compensated)
    const checkedInDates = new Set()
    checkins.forEach(c => {
      if (c.isCompensation && c.compensatedFor) {
        // For make-up check-ins, the effective date is the compensatedFor date
        const d = new Date(c.compensatedFor)
        checkedInDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
      } else {
        const d = new Date(c.createdAt)
        checkedInDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
      }
    })

    // Find missed dates: only check the last 7 days (excluding today)
    // and only if the user missed it but has a check-in on a later date
    // (i.e., gaps in the streak)
    const missedDates = []
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

      if (!checkedInDates.has(key)) {
        missedDates.push({
          date: date.toISOString().split('T')[0],
          label: formatMissedDate(date)
        })
      }
    }

    res.json({ missedDates })
  } catch (error) {
    res.status(500).json({ message: '获取可补卡日期失败: ' + error.message })
  }
})

// POST /api/checkins/makeup - submit a make-up check-in
router.post('/makeup', auth, async (req, res) => {
  try {
    const { content, notes, mood, studyMinutes, wordsLearned, targetDate } = req.body
    if (!content) {
      return res.status(400).json({ message: '请输入打卡内容' })
    }
    if (!targetDate) {
      return res.status(400).json({ message: '请选择补卡日期' })
    }

    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)

    // Validate target date is within last 7 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    if (target < sevenDaysAgo || target >= today) {
      return res.status(400).json({ message: '只能补卡最近7天内的日期' })
    }

    // Check if already has check-in for this date (normal or compensation)
    const targetEnd = new Date(target)
    targetEnd.setDate(targetEnd.getDate() + 1)

    const existingNormal = await Checkin.findOne({
      userId: req.userId,
      createdAt: { $gte: target, $lt: targetEnd },
      isCompensation: { $ne: true }
    })
    if (existingNormal) {
      return res.status(400).json({ message: '该日期已有打卡记录' })
    }

    const existingCompensation = await Checkin.findOne({
      userId: req.userId,
      compensatedFor: { $gte: target, $lt: targetEnd },
      isCompensation: true
    })
    if (existingCompensation) {
      return res.status(400).json({ message: '该日期已补卡过了' })
    }

    // Create the make-up check-in
    const checkin = new Checkin({
      userId: req.userId,
      content,
      notes: notes || '',
      mood: mood || 'good',
      studyMinutes: studyMinutes || 0,
      wordsLearned: wordsLearned || 0,
      isCompensation: true,
      compensatedFor: target
    })
    await checkin.save()

    // Recalculate streak from scratch
    const user = req.user
    const allCheckins = await Checkin.find({
      userId: req.userId,
      isCompensation: false
    }).select('createdAt').sort({ createdAt: -1 })

    const compensationCheckins = await Checkin.find({
      userId: req.userId,
      isCompensation: true
    }).select('compensatedFor').sort({ compensatedFor: -1 })

    // Build a set of all dates that are covered (either by normal check-in or compensation)
    const coveredDates = new Set()
    allCheckins.forEach(c => {
      const d = new Date(c.createdAt)
      coveredDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    })
    compensationCheckins.forEach(c => {
      const d = new Date(c.compensatedFor)
      coveredDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    })

    // Calculate current streak: count consecutive days backwards from today
    let currentStreak = 0
    const checkDate = new Date(today)
    // If today hasn't been checked in, start from yesterday
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    if (!coveredDates.has(todayKey)) {
      checkDate.setDate(checkDate.getDate() - 1)
    }

    while (true) {
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`
      if (coveredDates.has(key)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Log the total
    const totalCheckins = await Checkin.countDocuments({ userId: req.userId })

    user.currentStreak = currentStreak
    if (currentStreak > user.longestStreak) {
      user.longestStreak = currentStreak
    }
    user.totalCheckins = totalCheckins
    user.totalWords += (wordsLearned || 0)
    await user.save()

    res.json({ message: '补卡成功', checkin, streak: { current: currentStreak, longest: user.longestStreak, total: totalCheckins } })
  } catch (error) {
    res.status(500).json({ message: '补卡失败: ' + error.message })
  }
})

function formatMissedDate(date) {
  const now = new Date()
  const diff = Math.round((now - date) / (1000 * 60 * 60 * 24))
  if (diff === 1) return '昨天'
  if (diff === 2) return '前天'
  return `${diff}天前`
}

module.exports = router