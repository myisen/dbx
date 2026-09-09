/**
 * TED 演讲精选名言库
 * 每日根据日期轮换显示不同名言
 */
export const tedQuotes = [
  {
    text: 'Vulnerability is not weakness. And that myth is profoundly dangerous.',
    cn: '脆弱不是软弱。而这个误解是极其危险的。',
    author: 'Brené Brown',
    talk: 'The Power of Vulnerability'
  },
  {
    text: 'Connection is why we are here. It is what gives purpose and meaning to our lives.',
    cn: '连接是我们存在的原因。它赋予我们生活的目的和意义。',
    author: 'Brené Brown',
    talk: 'The Power of Vulnerability'
  },
  {
    text: 'The quality of your relationships matters. Living in the midst of conflict is bad for our health.',
    cn: '关系的质量很重要。生活在冲突中对我们的健康有害。',
    author: 'Robert Waldinger',
    talk: 'The Secret of Happiness'
  },
  {
    text: 'People don\'t buy what you do; they buy why you do it.',
    cn: '人们买的不是你做什么，而是你为什么做。',
    author: 'Simon Sinek',
    talk: 'How Great Leaders Inspire Action'
  },
  {
    text: 'Asking for help is an act of courage, not a sign of weakness.',
    cn: '请求帮助是勇气的表现，而不是软弱的表现。',
    author: 'Amanda Palmer',
    talk: 'The Art of Asking'
  },
  {
    text: 'Solitude is a catalyst for innovation. When you are alone, you can think deeply.',
    cn: '独处是创新的催化剂。当你独处时，你可以深入思考。',
    author: 'Susan Cain',
    talk: 'The Power of Introverts'
  },
  {
    text: 'The courage to be imperfect is what allows us to be truly seen, loved, and accepted.',
    cn: '拥有不完美的勇气，才能让我们被真正地看见、被爱和被接纳。',
    author: 'Brené Brown',
    talk: 'The Power of Vulnerability'
  },
  {
    text: 'There are leaders and there are those who lead. Those who lead inspire us.',
    cn: '有领导者和那些真正领导的人。那些真正领导的人激励我们。',
    author: 'Simon Sinek',
    talk: 'How Great Leaders Inspire Action'
  },
  {
    text: 'Good relationships don\'t just protect our bodies; they protect our brains.',
    cn: '良好的关系不仅保护我们的身体；它们还保护我们的大脑。',
    author: 'Robert Waldinger',
    talk: 'The Secret of Happiness'
  },
  {
    text: 'We are all connected. And when we ask for help, we acknowledge that connection.',
    cn: '我们都是相互连接的。当我们请求帮助时，我们承认了这种连接。',
    author: 'Amanda Palmer',
    talk: 'The Art of Asking'
  },
  {
    text: 'The key to life is not to become an extrovert. It\'s to find your own natural rhythm.',
    cn: '生活的关键不在于成为外向者。而在于找到自己的自然节奏。',
    author: 'Susan Cain',
    talk: 'The Power of Introverts'
  },
  {
    text: 'To feel is to be vulnerable. To believe vulnerability is weakness is to believe that feeling is weakness.',
    cn: '感受就是脆弱。认为脆弱是软弱，就等于认为感受是软弱。',
    author: 'Brené Brown',
    talk: 'The Power of Vulnerability'
  }
]

/**
 * 获取今日名言（基于日期，每天不同）
 */
export function getDailyQuote() {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 0)
  const diff = today - startOfYear
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  return tedQuotes[dayOfYear % tedQuotes.length]
}

/**
 * 获取热门 TED 话题标签
 */
export const hotTopics = [
  { id: 'psychology', label: '心理学', icon: '🧠', color: '#667eea' },
  { id: 'leadership', label: '领导力', icon: '👑', color: '#764ba2' },
  { id: 'happiness', label: '幸福', icon: '😊', color: '#f093fb' },
  { id: 'creativity', label: '创造力', icon: '💡', color: '#ff6b35' },
  { id: 'technology', label: '科技', icon: '🚀', color: '#07c160' },
  { id: 'education', label: '教育', icon: '📚', color: '#1989fa' },
  { id: 'health', label: '健康', icon: '💪', color: '#ff976a' },
  { id: 'culture', label: '文化', icon: '🌍', color: '#ee0a24' },
  { id: 'environment', label: '环境', icon: '🌱', color: '#07c160' },
  { id: 'innovation', label: '创新', icon: '⚡', color: '#ff6b35' }
]