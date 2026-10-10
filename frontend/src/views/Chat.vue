<template>
  <div class="container chat-page">
    <div class="chat-card">
      <!-- 头部 -->
      <div class="chat-header">
        <div class="chat-header-info">
          <h2 class="chat-title">🤖 AI 助手</h2>
          <span class="chat-subtitle">由 DeepSeek 驱动 · 随时提问</span>
        </div>
        <button v-if="messages.length" class="btn btn-clear" @click="clearChat">清空对话</button>
      </div>

      <!-- 消息列表 -->
      <div ref="msgBox" class="msg-list">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <p class="empty-title">你好，我是你的 AI 助手</p>
          <p class="empty-desc">有什么问题尽管问我，比如「帮我总结一下 Vue3 的响应式原理」</p>
        </div>

        <div v-for="(msg, i) in messages" :key="i" class="msg" :class="msg.role">
          <div class="msg-avatar">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
          <div class="msg-bubble">
            <p v-if="msg.content" class="msg-text">{{ msg.content }}</p>
            <div v-else-if="msg.role === 'assistant' && loading" class="typing">
              <span class="dot"></span><span class="dot"></span><span class="dot"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input-area">
        <textarea
          v-model="input"
          class="chat-input"
          rows="1"
          placeholder="输入你的问题，Enter 发送，Shift+Enter 换行"
          @keydown.enter.exact.prevent="sendMessage"
        ></textarea>
        <button class="btn btn-primary send-btn" :disabled="sending || !input.trim()" @click="sendMessage">
          {{ sending ? '生成中…' : '发送' }}
        </button>
      </div>
      <p v-if="error" class="chat-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([])
const input = ref('')
const sending = ref(false)
const loading = ref(false)
const error = ref('')
const msgBox = ref(null)

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (msgBox.value) {
      msgBox.value.scrollTop = msgBox.value.scrollHeight
    }
  })
}

// 清空对话
function clearChat() {
  messages.value = []
  error.value = ''
}

// 发送消息
async function sendMessage() {
  const text = input.value.trim()
  if (!text || sending.value) return

  input.value = ''
  error.value = ''
  messages.value.push({ role: 'user', content: text })
  const assistant = { role: 'assistant', content: '' }
  messages.value.push(assistant)
  sending.value = true
  loading.value = true
  scrollToBottom()

  try {
    // 构建请求体：过滤掉尚未有内容的空消息
    const payload = messages.value.filter(m => m.content.trim() !== '')
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: payload })
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      assistant.content = err.message || `请求失败（${resp.status}）`
      error.value = assistant.content
      return
    }

    if (!resp.body) {
      assistant.content = '服务器无响应'
      error.value = assistant.content
      return
    }

    // 流式读取
    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() // 最后一段可能不完整，留到下一轮

      for (const event of events) {
        for (const line of event.split('\n')) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const payload = trimmed.slice(5).trim()
          if (payload === '[DONE]') continue
          try {
            const json = JSON.parse(payload)
            if (json.error) {
              assistant.content = json.error
              error.value = json.error
            } else if (json.content) {
              assistant.content += json.content
            }
          } catch (e) { /* 忽略单条解析失败 */ }
        }
      }
      scrollToBottom()
    }
  } catch (e) {
    assistant.content = '网络错误，请稍后再试'
    error.value = assistant.content
  } finally {
    sending.value = false
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.chat-page {
  max-width: 900px;
}

.chat-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  min-height: 420px;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}

.chat-title {
  font-size: 18px;
  color: #333;
}

.chat-subtitle {
  font-size: 13px;
  color: #999;
  margin-left: 10px;
}

.btn-clear {
  background: #f5f5f5;
  color: #666;
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 6px;
}

.btn-clear:hover {
  background: #e8e8e8;
  color: #333;
}

/* 消息列表 */
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #fafafa;
}

.empty-state {
  text-align: center;
  margin-top: 18vh;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
}

.msg {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.msg.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
  flex-shrink: 0;
}

.msg.user .msg-avatar {
  background: #1a73e8;
}

.msg.assistant .msg-avatar {
  background: #34a853;
}

.msg-bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  white-space: pre-wrap;
}

.msg.user .msg-bubble {
  background: #1a73e8;
  color: #fff;
  border-top-right-radius: 2px;
}

.msg.assistant .msg-bubble {
  background: #fff;
  color: #333;
  border: 1px solid #eee;
  border-top-left-radius: 2px;
}

.msg-text {
  margin: 0;
}

/* 打字动画 */
.typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #aaa;
  animation: blink 1.2s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* 输入区 */
.chat-input-area {
  display: flex;
  gap: 10px;
  padding: 14px 24px;
  border-top: 1px solid #eee;
  background: #fff;
}

.chat-input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #1a73e8;
}

.send-btn {
  padding: 0 24px;
  border-radius: 8px;
  white-space: nowrap;
}

.send-btn:disabled {
  background: #b3cdf5;
  cursor: not-allowed;
}

.chat-error {
  padding: 0 24px 10px;
  font-size: 12px;
  color: #d93025;
}

@media (max-width: 640px) {
  .msg-bubble { max-width: 90%; }
  .chat-subtitle { display: none; }
}
</style>
