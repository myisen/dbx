const mongoose = require('mongoose')

const paragraphSchema = new mongoose.Schema({
  en: { type: String, required: true },
  cn: { type: String, required: true }
}, { _id: false })

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: 'TED'
  },
  description: {
    type: String,
    default: ''
  },
  cover: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['简单', '中等', '困难'],
    default: '中等'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: '10分钟'
  },
  tags: [{
    type: String
  }],
  paragraphs: [paragraphSchema],
  isDaily: {
    type: Boolean,
    default: false
  },
  dailyDate: {
    type: Date,
    default: null
  },
  readCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, {
  timestamps: true
})

articleSchema.index({ isDaily: 1, dailyDate: -1 })
articleSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('Article', articleSchema)