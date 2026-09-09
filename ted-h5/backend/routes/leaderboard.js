const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const { type = 'streak', limit = 50 } = req.query
    let sortField = {}
    switch (type) {
      case 'streak':
        sortField = { currentStreak: -1, totalCheckins: -1 }
        break
      case 'total':
        sortField = { totalCheckins: -1, currentStreak: -1 }
        break
      case 'words':
        sortField = { totalWords: -1, currentStreak: -1 }
        break
      default:
        sortField = { currentStreak: -1 }
    }

    const users = await User.find({ totalCheckins: { $gt: 0 } })
      .sort(sortField)
      .limit(Number(limit))
      .select('nickname avatar currentStreak longestStreak totalCheckins totalWords')

    const list = users.map((u, i) => ({
      rank: i + 1,
      _id: u._id,
      nickname: u.nickname,
      avatar: u.avatar || u.nickname.charAt(0).toUpperCase(),
      streak: u.currentStreak,
      longestStreak: u.longestStreak,
      total: u.totalCheckins,
      words: u.totalWords
    }))

    // Find my rank
    let myRank = null
    if (req.headers.authorization) {
      try {
        // Simple auth check for my rank
        const jwt = require('jsonwebtoken')
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ted-checkin-secret-key-2024')
        const myIdx = list.findIndex(item => item._id.toString() === decoded.userId)
        if (myIdx >= 0) {
          myRank = myIdx + 1
        }
      } catch {}
    }

    res.json({ list, myRank, total: users.length })
  } catch (error) {
    res.status(500).json({ message: '获取排行榜失败: ' + error.message })
  }
})

module.exports = router