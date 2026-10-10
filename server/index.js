const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const fetch = require('node-fetch')
const path = require('path')
const { posts, categories, tags, comments } = require('./mock')

// 加载环境变量（.env 中的 DeepSeek 配置，显式指定路径避免 PM2 的 cwd 影响）
require('dotenv').config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3001

// ========== DeepSeek AI 配置 ==========
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
const SYSTEM_PROMPT = '你是一个友好、专业的中文 AI 助手，运行在一个个人技术博客网站上。请用简洁清晰的中文回答用户的问题。'

if (!DEEPSEEK_API_KEY) {
  console.warn('⚠️ 未配置 DEEPSEEK_API_KEY，AI 对话接口将不可用')
}

// 中间件
app.use(cors())
app.use(express.json())

// ========== 站点统计（内存存储） ==========
const stats = {
  pv: 0,
  // 存储今天已计数的 UV key（IP+UA 的 hash），格式: { 'ip:uaHash': true }
  todayUV: new Map(),
  lastResetDate: new Date().toDateString()
}

// 重置每日 UV 记录
function resetDailyUV() {
  const today = new Date().toDateString()
  if (stats.lastResetDate !== today) {
    stats.todayUV = new Map()
    stats.lastResetDate = today
  }
}

// 简单的字符串哈希
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

// POST /api/track - 记录页面访问（由前端路由切换时调用）
app.post('/api/track', (req, res) => {
  resetDailyUV()

  // PV：每次访问 +1
  stats.pv++

  // UV：基于 IP + User-Agent 去重，每天只计一次
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown'
  const ua = req.headers['user-agent'] || ''
  const uvKey = `${ip}:${hashString(ua)}`

  if (!stats.todayUV.has(uvKey)) {
    stats.todayUV.set(uvKey, true)
  }

  res.json({
    code: 200,
    message: 'ok'
  })
})

// GET /api/stats - 获取站点统计信息
app.get('/api/stats', (req, res) => {
  resetDailyUV()
  res.json({
    code: 200,
    data: {
      pv: stats.pv,
      uv: stats.todayUV.size
    }
  })
})

// ========== AI 对话限流（防止接口被恶意刷爆额度） ==========
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟窗口
  max: 20,             // 每个 IP 每分钟最多 20 次请求
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
})

// ========== 博客文章接口 ==========

// GET /api/posts - 获取文章列表
app.get('/api/posts', (req, res) => {
  const { page = 1, pageSize = 10, category } = req.query
  let filteredPosts = [...posts]

  // 按分类筛选
  if (category) {
    filteredPosts = filteredPosts.filter(p => p.category === category)
  }

  // 按创建时间倒序排列
  filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = filteredPosts.length
  const start = (page - 1) * pageSize
  const data = filteredPosts.slice(start, start + Number(pageSize))

  res.json({
    code: 200,
    data,
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  })
})

// GET /api/posts/:id - 获取文章详情
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === Number(req.params.id))
  if (!post) {
    return res.status(404).json({ code: 404, message: '文章不存在' })
  }
  res.json({ code: 200, data: post })
})

// ========== 分类接口 ==========

// GET /api/categories - 获取分类列表
app.get('/api/categories', (req, res) => {
  res.json({ code: 200, data: categories })
})

// ========== 标签接口 ==========

// GET /api/tags - 获取标签列表
app.get('/api/tags', (req, res) => {
  res.json({ code: 200, data: tags })
})

// ========== 评论接口 ==========

// GET /api/comments - 获取文章评论
app.get('/api/comments', (req, res) => {
  const { postId } = req.query
  if (!postId) {
    return res.status(400).json({ code: 400, message: '缺少 postId 参数' })
  }
  const postComments = comments.filter(c => c.postId === Number(postId))
  res.json({ code: 200, data: postComments })
})

// POST /api/comments - 提交评论
app.post('/api/comments', (req, res) => {
  const { postId, content, author } = req.body
  if (!postId || !content || !author) {
    return res.status(400).json({ code: 400, message: '缺少必要参数' })
  }

  const newComment = {
    id: comments.length + 1,
    postId: Number(postId),
    author,
    content,
    createdAt: new Date().toISOString()
  }
  comments.push(newComment)

  res.json({ code: 200, message: '评论成功', data: newComment })
})

// ========== AI 对话接口 ==========

// POST /api/chat - AI 对话（DeepSeek，SSE 流式输出）
app.post('/api/chat', chatLimiter, async (req, res) => {
  const { messages } = req.body

  // 参数校验
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ code: 400, message: '缺少 messages 参数' })
  }
  if (messages.length > 50) {
    return res.status(400).json({ code: 400, message: '对话轮数过多' })
  }
  for (const msg of messages) {
    if (!msg || !['user', 'assistant', 'system'].includes(msg.role) || typeof msg.content !== 'string' || !msg.content.trim()) {
      return res.status(400).json({ code: 400, message: '消息格式不正确' })
    }
    if (msg.content.length > 4000) {
      return res.status(400).json({ code: 400, message: '单条消息不能超过 4000 字' })
    }
  }

  if (!DEEPSEEK_API_KEY) {
    return res.status(503).json({ code: 503, message: '服务端未配置 AI 密钥' })
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  try {
    // 请求 DeepSeek API（流式）
    const apiRes = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true
      })
    })

    if (!apiRes.ok) {
      const errBody = await apiRes.text()
      console.error('DeepSeek API 错误:', apiRes.status, errBody)
      res.write(`data: ${JSON.stringify({ error: `AI 服务错误（${apiRes.status}）` })}\n\n`)
      return res.end()
    }

    // 逐段读取流式内容并转发给前端
    const decoder = new TextDecoder()
    let buffer = ''
    const reader = apiRes.body
    reader.on('data', chunk => {
      buffer += decoder.decode(chunk, { stream: true })
      // DeepSeek 返回 SSE 格式：data: {...}\n\n
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (payload === '[DONE]') continue
        try {
          const json = JSON.parse(payload)
          const content = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`)
          }
        } catch (e) { /* 忽略单条解析错误 */ }
      }
    })

    reader.on('end', () => {
      res.write('data: [DONE]\n\n')
      res.end()
    })

    reader.on('error', err => {
      console.error('流式读取错误:', err)
      res.write(`data: ${JSON.stringify({ error: '流式响应中断' })}\n\n`)
      res.end()
    })

    // 客户端断开时取消上游请求
    req.on('close', () => {
      if (!res.writableEnded) {
        reader.destroy()
      }
    })
  } catch (err) {
    console.error('Chat API 错误:', err)
    res.write(`data: ${JSON.stringify({ error: '服务器内部错误，请稍后再试' })}\n\n`)
    res.end()
  }
})

// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 博客后端服务已启动: http://localhost:${PORT}`)
  console.log(`📝 API 基础路径: http://localhost:${PORT}/api`)
})
