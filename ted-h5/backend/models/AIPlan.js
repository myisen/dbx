const mongoose = require('mongoose')

const planItemSchema = new mongoose.Schema({
  day: { type: String, required: true },
  task: { type: String, required: true },
  done: { type: Boolean, default: false }
}, { _id: false })

const aiPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  phase: {
    type: String,
    default: '基础巩固期'
  },
  dailyGoal: {
    type: String,
    default: ''
  },
  items: [planItemSchema],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  goal: {
    type: String,
    default: '提升英语表达能力'
  },
  weekStart: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

aiPlanSchema.index({ userId: 1, weekStart: -1 })

module.exports = mongoose.model('AIPlan', aiPlanSchema)