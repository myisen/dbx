const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'ted-checkin-secret-key-2024'

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nickname, password } = req.body
    if (!nickname || nickname.length < 2) {
      return res.status(400).json({ message: '昵称至少2个字符' })
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: '密码至少6个字符' })
    }
    const existing = await User.findOne({ nickname })
    if (existing) {
      return res.status(400).json({ message: '昵称已被使用' })
    }
    const user = new User({ nickname, password })
    await user.save()
    const token = generateToken(user._id)
    res.json({ message: '注册成功', token, user })
  } catch (error) {
    res.status(500).json({ message: '注册失败: ' + error.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body
    if (!nickname || !password) {
      return res.status(400).json({ message: '请填写昵称和密码' })
    }
    const user = await User.findOne({ nickname })
    if (!user) {
      return res.status(400).json({ message: '用户不存在' })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' })
    }
    const token = generateToken(user._id)
    res.json({ message: '登录成功', token, user })
  } catch (error) {
    res.status(500).json({ message: '登录失败: ' + error.message })
  }
})

// GET /api/auth/profile
router.get('/profile', auth, async (req, res) => {
  res.json({ user: req.user })
})

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['nickname', 'avatar', 'nationality', 'targetLanguage', 'dailyGoal']
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field]
      }
    })
    await req.user.save()
    res.json({ message: '更新成功', user: req.user })
  } catch (error) {
    res.status(500).json({ message: '更新失败: ' + error.message })
  }
})

module.exports = router