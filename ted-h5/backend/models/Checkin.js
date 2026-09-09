const mongoose = require('mongoose')

const checkinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    default: null
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  notes: {
    type: String,
    maxlength: 200,
    default: ''
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'normal', 'bad'],
    default: 'good'
  },
  studyMinutes: {
    type: Number,
    default: 0
  },
  wordsLearned: {
    type: Number,
    default: 0
  },
  images: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isCompensation: {
    type: Boolean,
    default: false
  },
  compensatedFor: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

checkinSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Checkin', checkinSchema)