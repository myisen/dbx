const express = require('express')
const AIPlan = require('../models/AIPlan')
const Checkin = require('../models/Checkin')
const auth = require('../middleware/auth')

const router = express.Router()

// POST /api/ai/plan - generate AI plan
router.post('/plan', auth, async (req, res) => {
  try {
    const { level, goal } = req.body

    // Generate plan based on user data
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const items = weekDays.map((day, i) => {
      const tasks = [
        `精读1篇TED演讲，掌握10个新单词`,
        `复习昨日单词，精读新文章并做笔记`,
        `精读+口语模仿练习，录制语音打卡`,
        `重点句型分析，尝试造句应用`,
        `本周内容复习，整理知识图谱`,
        `自由阅读TED推荐内容，拓展视野`,
        `总结本周收获，规划下周学习`
      ]
      return {
        day,
        task: `${day}${i === 0 ? '的' : '的'}学习任务: ${tasks[i % tasks.length]}`,
        done: false
      }
    })

    // Deactivate old plans
    await AIPlan.updateMany(
      { userId: req.userId, isActive: true },
      { isActive: false }
    )

    const plan = new AIPlan({
      userId: req.userId,
      title: '本周学习计划',
      phase: level === 'beginner' ? '基础入门期' : level === 'advanced' ? '强化提升期' : '基础巩固期',
      dailyGoal: level === 'beginner' ? '每日精读1篇 + 掌握5个新单词'
        : level === 'advanced' ? '每日精读1篇 + 掌握15个新单词 + 口语练习'
        : '每日精读1篇 + 掌握10个新单词',
      items,
      level: level || 'intermediate',
      goal: goal || '提升英语表达能力',
      weekStart: monday
    })
    await plan.save()

    res.json({ message: '学习计划已生成', plan })
  } catch (error) {
    res.status(500).json({ message: '生成计划失败: ' + error.message })
  }
})

// GET /api/ai/plan
router.get('/plan', auth, async (req, res) => {
  try {
    const plan = await AIPlan.findOne({ userId: req.userId, isActive: true })
      .sort({ createdAt: -1 })
    res.json({ plan })
  } catch (error) {
    res.status(500).json({ message: '获取计划失败' })
  }
})

// GET /api/ai/status
router.get('/status', auth, async (req, res) => {
  try {
    const user = req.user
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const recentCheckins = await Checkin.countDocuments({
      userId: req.userId,
      createdAt: { $gte: weekAgo }
    })

    const status = {
      streak: user.currentStreak,
      totalCheckins: user.totalCheckins,
      weeklyCheckins: recentCheckins,
      totalWords: user.totalWords,
      level: recentCheckins >= 5 ? 'active' : recentCheckins >= 3 ? 'moderate' : 'low',
      suggestion: ''
    }

    if (recentCheckins < 3) {
      status.suggestion = '最近打卡较少，建议增加学习频率，保持每日精读习惯'
    } else if (user.currentStreak < 7) {
      status.suggestion = '继续保持！再坚持几天就能达到7天连续打卡成就'
    } else if (user.currentStreak < 21) {
      status.suggestion = '你已经养成了良好的学习习惯！建议尝试增加学习深度'
    } else {
      status.suggestion = '优秀！你已经是精读达人了，建议挑战更难的TED演讲'
    }

    res.json({ status })
  } catch (error) {
    res.status(500).json({ message: '获取状态失败' })
  }
})

// GET /api/ai/suggestion
router.get('/suggestion', auth, async (req, res) => {
  try {
    const user = req.user
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const recentCheckins = await Checkin.countDocuments({
      userId: req.userId,
      createdAt: { $gte: weekAgo }
    })

    let suggestion = ''
    if (user.currentStreak === 0) {
      suggestion = '欢迎开始你的TED精读之旅！建议从简单的TED演讲开始，每天花15分钟精读一篇。'
    } else if (user.currentStreak < 7) {
      suggestion = `你已经连续打卡${user.currentStreak}天，继续保持！建议每天增加5分钟的单词复习时间，巩固学习成果。`
    } else if (user.currentStreak < 21) {
      suggestion = `连续打卡${user.currentStreak}天，进步显著！建议尝试用新学的单词造句，并模仿TED演讲者的发音。`
    } else if (user.currentStreak < 60) {
      suggestion = `连续打卡${user.currentStreak}天，你是真正的学习达人！建议尝试精读更长的TED演讲，挑战更高难度。`
    } else {
      suggestion = `连续打卡${user.currentStreak}天，令人敬佩！建议你尝试整理自己的学习笔记，分享给其他学习者。`
    }

    if (recentCheckins < 3 && user.currentStreak > 0) {
      suggestion += ' 最近一周打卡较少，建议设定固定学习时间，重拾学习节奏。'
    }

    res.json({ suggestion })
  } catch (error) {
    res.status(500).json({ message: '获取建议失败' })
  }
})

module.exports = router