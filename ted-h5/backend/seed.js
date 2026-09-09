require('dotenv').config()
const mongoose = require('mongoose')
const Article = require('./models/Article')

const articles = [
  {
    title: 'The Power of Vulnerability',
    author: 'Brené Brown',
    description: 'Brené Brown 研究人类连接能力，她发现那些敢于展示脆弱的人更容易获得幸福。她通过幽默和真诚的演讲，分享了关于脆弱性的研究成果。',
    difficulty: '中等',
    wordCount: 420,
    duration: '10分钟',
    tags: ['心理学', '自我成长', '情感'],
    isDaily: true,
    dailyDate: new Date(),
    paragraphs: [
      {
        en: "Vulnerability is not weakness. I'm going to say that again: vulnerability is not weakness. And that myth is profoundly dangerous.",
        cn: "脆弱不是软弱。我要再说一遍：脆弱不是软弱。而这个误解是极其危险的。"
      },
      {
        en: "What I've learned is that vulnerability is the birthplace of innovation, creativity and change.",
        cn: "我所学到的是，脆弱是创新、创造力和变革的诞生地。"
      },
      {
        en: "To feel is to be vulnerable. To believe vulnerability is weakness is to believe that feeling is weakness.",
        cn: "感受就是脆弱。认为脆弱是软弱，就等于认为感受是软弱。"
      },
      {
        en: "The ironic thing is that we spend so much time trying to protect ourselves from vulnerability, but that very act of protection is what prevents us from being truly seen.",
        cn: "讽刺的是，我们花了太多时间试图保护自己免受脆弱之苦，但正是这种保护行为阻止了我们被真正地看见。"
      },
      {
        en: "Connection is why we're here. It's what gives purpose and meaning to our lives.",
        cn: "连接是我们存在的原因。它赋予我们生活的目的和意义。"
      },
      {
        en: "The courage to be imperfect is what allows us to be truly seen, loved, and accepted.",
        cn: "拥有不完美的勇气，才能让我们被真正地看见、被爱和被接纳。"
      },
      {
        en: "I've learned that we can't be brave without vulnerability. We can't practice courage without vulnerability.",
        cn: "我明白了，没有脆弱就没有勇敢。没有脆弱，我们就无法练习勇气。"
      },
      {
        en: "Vulnerability sounds like truth and feels like courage. Truth and courage aren't always comfortable, but they're never weakness.",
        cn: "脆弱听起来像真理，感觉像勇气。真理和勇气并不总是令人舒适的，但它们从来都不是软弱。"
      }
    ]
  },
  {
    title: 'The Secret of Happiness',
    author: 'Robert Waldinger',
    description: '哈佛大学75年追踪研究揭示：真正让人幸福的不是财富或名声，而是良好的人际关系。',
    difficulty: '中等',
    wordCount: 380,
    duration: '8分钟',
    tags: ['幸福', '心理学', '人际关系'],
    isDaily: false,
    paragraphs: [
      {
        en: "The clearest message that we get from this 75-year study is this: Good relationships keep us happier and healthier.",
        cn: "从这个75年研究中得到的最清晰的信息是：良好的关系让我们更快乐、更健康。"
      },
      {
        en: "Loneliness kills. It's as powerful as smoking or alcoholism.",
        cn: "孤独会致命。它的威力与吸烟或酗酒相当。"
      },
      {
        en: "The people who were the most satisfied in their relationships at age 50 were the healthiest at age 80.",
        cn: "在50岁时对人际关系最满意的人，在80岁时最健康。"
      },
      {
        en: "Good relationships don't just protect our bodies; they protect our brains.",
        cn: "良好的关系不仅保护我们的身体；它们还保护我们的大脑。"
      },
      {
        en: "The quality of your relationships matters. Living in the midst of conflict is bad for our health.",
        cn: "关系的质量很重要。生活在冲突中对我们的健康有害。"
      }
    ]
  },
  {
    title: 'How Great Leaders Inspire Action',
    author: 'Simon Sinek',
    description: '伟大的领导者如何激励行动？Simon Sinek 揭示了"黄金圈法则"——从"为什么"开始。',
    difficulty: '困难',
    wordCount: 450,
    duration: '12分钟',
    tags: ['领导力', '商业', '激励'],
    isDaily: false,
    paragraphs: [
      {
        en: "People don't buy what you do; they buy why you do it.",
        cn: "人们买的不是你做什么，而是你为什么做。"
      },
      {
        en: "The goal is not to do business with everybody who needs what you have. The goal is to do business with people who believe what you believe.",
        cn: "目标不是与所有需要你产品的人做生意。目标是与那些相信你所相信的人做生意。"
      },
      {
        en: "There are leaders and there are those who lead. Leaders hold a position of power or authority. But those who lead inspire us.",
        cn: "有领导者和那些真正领导的人。领导者拥有权力或权威的地位。但那些真正领导的人激励我们。"
      },
      {
        en: "If you hire people just because they can do a job, they'll work for your money. But if you hire people who believe what you believe, they'll work for you with blood and sweat and tears.",
        cn: "如果你仅仅因为某人能做某项工作而雇佣他们，他们会为钱而工作。但如果你雇佣那些相信你所相信的人，他们会为你付出心血和汗水。"
      },
      {
        en: "The ability to inspire action is not about being the biggest or the best. It's about being the clearest about what you believe.",
        cn: "激励行动的能力不在于成为最大或最好的。而在于最清楚地表达你的信念。"
      }
    ]
  },
  {
    title: 'The Art of Asking',
    author: 'Amanda Palmer',
    description: '音乐家 Amanda Palmer 分享她关于"请求"的艺术——学会请求帮助，建立真正的连接。',
    difficulty: '简单',
    wordCount: 350,
    duration: '8分钟',
    tags: ['艺术', '连接', '勇气'],
    isDaily: false,
    paragraphs: [
      {
        en: "Asking for help is an act of courage, not a sign of weakness.",
        cn: "请求帮助是勇气的表现，而不是软弱的表现。"
      },
      {
        en: "When we ask for help, we are inviting someone to connect with us. We are offering them the opportunity to be part of our story.",
        cn: "当我们请求帮助时，我们是在邀请他人与我们建立连接。我们给了他们一个成为我们故事一部分的机会。"
      },
      {
        en: "The act of asking for help is actually the act of giving someone the chance to be generous.",
        cn: "请求帮助的行为实际上是给予他人慷慨的机会。"
      },
      {
        en: "We are all connected. And when we ask for help, we acknowledge that connection.",
        cn: "我们都是相互连接的。当我们请求帮助时，我们承认了这种连接。"
      }
    ]
  },
  {
    title: 'The Power of Introverts',
    author: 'Susan Cain',
    description: '在这个崇尚外向的世界里，内向者拥有被低估的力量。Susan Cain 揭示了内向者的独特优势。',
    difficulty: '中等',
    wordCount: 400,
    duration: '10分钟',
    tags: ['性格', '心理学', '自我认知'],
    isDaily: false,
    paragraphs: [
      {
        en: "Introverts are offered a powerful antidote to the pressure to be extroverted: the ability to be alone with their own thoughts.",
        cn: "内向者拥有一种强大的解药来对抗外向的压力：能够独处并与自己的思想相伴。"
      },
      {
        en: "There is a great deal of creativity that comes from being alone. Some of the greatest thinkers in history were introverts.",
        cn: "独处能带来巨大的创造力。历史上一些最伟大的思想家都是内向者。"
      },
      {
        en: "Solitude is a catalyst for innovation. When you're alone, you can think deeply and make connections that you wouldn't make in a group setting.",
        cn: "独处是创新的催化剂。当你独处时，你可以深入思考，建立那些在群体环境中无法建立的联系。"
      },
      {
        en: "The key to life is not to become an extrovert. It's to find your own natural rhythm and work with it.",
        cn: "生活的关键不在于成为外向者。而在于找到自己的自然节奏并与之共舞。"
      }
    ]
  }
]

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ted_checkin'
    await mongoose.connect(uri)
    console.log('Connected to MongoDB')

    await Article.deleteMany({})
    console.log('Cleared existing articles')

    await Article.insertMany(articles)
    console.log(`Seeded ${articles.length} articles`)

    await mongoose.disconnect()
    console.log('Done')
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()