const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'ted-checkin-secret-key-2024'

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未登录' })
    }
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ message: '用户不存在' })
    }
    req.user = user
    req.userId = user._id
    next()
  } catch (error) {
    return res.status(401).json({ message: '登录已过期' })
  }
}

module.exports = auth