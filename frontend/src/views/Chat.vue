<template>
  <div class="shell chat-page">
    <div class="chat-panel">
      <header class="chat-head">
        <div class="chat-head-info">
          <h1 class="chat-title">AI 助手</h1>
          <span class="mono chat-subtitle">由 DeepSeek 驱动</span>
        </div>
        <button v-if="messages.length" class="btn btn-clear" @click="clearChat">清空对话</button>
      </header>

      <!-- 消息列表 -->
      <div ref="msgBox" class="msg-list">
        <div v-if="messages.length === 0" class="empty-state">
          <p class="empty-title">问我任何前端问题</p>
          <p class="empty-desc">比如「帮我总结一下 Vue3 的响应式原理」</p>
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
  max-width: 860px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-panel {
  flex: 1;
  min-height: 440px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--rule-strong);
  border-radius: 2px;
  overflow: hidden;
}

.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--rule);
}

.chat-head-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.chat-title {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.chat-subtitle {
  white-space: nowrap;
}

.btn-clear {
  padding: 5px 12px;
  font-size: 13px;
  border-color: var(--rule);
  color: var(--ink-mute);
}

.btn-clear:hover {
  border-color: var(--ink);
  color: var(--ink);
}

/* ---------- 消息列表 ---------- */

.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 22px;
}

.empty-state {
  margin-top: 16vh;
  text-align: center;
}

.empty-title {
  font-family: var(--serif);
  font-size: 18px;
  letter-spacing: 0.03em;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--ink-mute);
}

.msg {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.msg.user {
  flex-direction: row-reverse;
}

/* 方形角色签，和全站的「档案」语言一致，不用圆形头像 */
.msg-avatar {
  flex-shrink: 0;
  width: 30px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  border-radius: 2px;
}

.msg.user .msg-avatar {
  background: var(--ink);
  color: var(--paper);
}

.msg.assistant .msg-avatar {
  background: var(--paper-sunk);
  border: 1px solid var(--rule);
  color: var(--ink-mute);
}

.msg-bubble {
  max-width: 78%;
  padding: 11px 15px;
  border-radius: 2px;
  font-size: 15px;
  line-height: 1.85;
  word-break: break-word;
  white-space: pre-wrap;
}

.msg.user .msg-bubble {
  background: var(--ink);
  color: var(--paper);
}

.msg.assistant .msg-bubble {
  background: var(--paper-sunk);
  border: 1px solid var(--rule);
  color: var(--ink);
}

.msg-text {
  margin: 0;
}

/* 打字指示 */
.typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 5px 0;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-faint);
  animation: blink 1.2s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* ---------- 输入区 ---------- */

.chat-input-area {
  display: flex;
  gap: 10px;
  padding: 14px 22px;
  border-top: 1px solid var(--rule);
}

.chat-input {
  flex: 1;
  padding: 10px 12px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--rule-strong);
  border-radius: 2px;
  resize: none;
  transition: border-color 160ms ease;
}

.chat-input::placeholder {
  color: var(--ink-faint);
}

.chat-input:focus {
  outline: none;
  border-color: var(--signal);
  box-shadow: 0 0 0 3px var(--signal-wash);
}

.send-btn {
  white-space: nowrap;
}

.chat-error {
  padding: 0 22px 12px;
  font-size: 13px;
  color: var(--danger);
}

@media (max-width: 640px) {
  .msg-bubble {
    max-width: 90%;
  }

  .chat-subtitle {
    display: none;
  }
}
</style>
