<template>
  <div class="shell detail">
    <div v-if="loading" class="loading">加载中</div>

    <template v-else-if="blogStore.currentPost">
      <article class="doc">
        <header class="doc-head">
          <h1 class="doc-title">{{ blogStore.currentPost.title }}</h1>
          <div class="doc-meta">
            <span>{{ blogStore.currentPost.category }}</span>
            <time class="mono" :datetime="blogStore.currentPost.createdAt">
              {{ formatDate(blogStore.currentPost.createdAt) }}
            </time>
          </div>
        </header>

        <div class="prose" v-html="bodyHtml"></div>

        <footer class="doc-foot">
          <span v-for="tag in blogStore.currentPost.tags" :key="tag" class="tag">{{ tag }}</span>
        </footer>
      </article>

      <section id="comments" class="comments">
        <h2 class="rule-title">
          评论<span class="comments-n">{{ blogStore.comments.length }}</span>
        </h2>

        <div class="comment-list">
          <div v-for="comment in blogStore.comments" :key="comment.id" class="comment">
            <div class="comment-head">
              <strong class="comment-author">{{ comment.author }}</strong>
              <time class="mono">{{ formatDate(comment.createdAt) }}</time>
            </div>
            <p class="comment-body">{{ comment.content }}</p>
          </div>
          <p v-if="blogStore.comments.length === 0" class="comment-empty">还没有评论。</p>
        </div>

        <form class="comment-form" @submit.prevent="submitComment">
          <textarea
            v-model="commentForm.content"
            class="field"
            rows="4"
            placeholder="写下你的看法"
            aria-label="评论内容"
          ></textarea>
          <div class="form-foot">
            <input
              v-model="commentForm.author"
              class="field field-name"
              placeholder="昵称"
              aria-label="昵称"
            />
            <button type="submit" class="btn btn-primary" :disabled="!canSubmit">发表评论</button>
          </div>
        </form>
      </section>
    </template>

    <p v-else class="empty">
      这篇不存在，可能是链接过期了。<router-link to="/">回到文章列表</router-link>
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useBlogStore } from '@/stores/blog'

const route = useRoute()
const blogStore = useBlogStore()

const { loading } = storeToRefs(blogStore)

const commentForm = reactive({
  content: '',
  author: ''
})

const canSubmit = computed(
  () => commentForm.content.trim() !== '' && commentForm.author.trim() !== ''
)

/* 作者原文的章节标题就是「一、问题：…」，本身就是序列。
   把序号摘出来放进 data-num，由 CSS 悬挂到左侧栏位，正文文字保持原样长短。 */
function withSectionNumbers(html) {
  if (!html) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll('h2').forEach((heading) => {
    const match = heading.textContent.match(/^\s*([一二三四五六七八九十]+)\s*[、.．]\s*/)
    if (!match) return
    heading.dataset.num = match[1]
    heading.textContent = heading.textContent.slice(match[0].length)
  })

  return doc.body.innerHTML
}

const bodyHtml = computed(() => withSectionNumbers(blogStore.currentPost?.content))

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function submitComment() {
  if (!canSubmit.value) return
  await blogStore.submitComment({
    postId: route.params.id,
    content: commentForm.content,
    author: commentForm.author
  })
  commentForm.content = ''
  commentForm.author = ''
}

onMounted(() => {
  blogStore.fetchPostDetail(route.params.id)
  blogStore.fetchComments(route.params.id)
})

watch(() => route.params.id, (newId) => {
  blogStore.fetchPostDetail(newId)
  blogStore.fetchComments(newId)
})
</script>

<style scoped>
/* 正文栏本身居中，章节序号和代码块向左悬进空白里 ——
   阅读栏不被左栏推偏，越栏的代码块才是这一页的「响」点。 */
.doc {
  max-width: var(--measure);
  margin: 0 auto;
}

.doc-title {
  font-family: var(--serif);
  font-size: clamp(24px, 3.6vw, 34px);
  font-weight: 600;
  line-height: 1.42;
  letter-spacing: 0.02em;
}

/* 下面不加横线：紧跟着的第一个 h2 自带一条，两条离太近会读成一组 */
.doc-meta {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-top: 18px;
  font-size: 13px;
  color: var(--ink-mute);
}

.doc-foot {
  margin-top: 44px;
  padding-top: 20px;
  border-top: 1px solid var(--rule);
}

/* ---------- 评论 ---------- */

.comments {
  max-width: var(--measure);
  margin: 96px auto 0;
}

.comments-n {
  font-family: var(--mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--ink-faint);
  margin-left: 8px;
}

.comment-list {
  margin-top: 8px;
}

.comment {
  padding: 22px 0;
  border-bottom: 1px solid var(--rule);
}

.comment-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 15px;
  font-weight: 600;
}

.comment-body {
  font-size: 15px;
  line-height: 1.9;
  color: var(--ink-mute);
  white-space: pre-wrap;
}

.comment-empty {
  padding: 26px 0;
  font-size: 15px;
  color: var(--ink-mute);
}

.comment-form {
  margin-top: 28px;
}

.field {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--rule-strong);
  border-radius: 2px;
  transition: border-color 160ms ease;
}

.field::placeholder {
  color: var(--ink-faint);
}

/* 去掉默认 outline，但换成自己的焦点指示：边框整体由灰转青 + 一圈淡 wash。
   键盘和鼠标都有明确反馈，也不会和全局焦点环叠成两层。 */
.field:focus {
  outline: none;
  border-color: var(--signal);
  box-shadow: 0 0 0 3px var(--signal-wash);
}

textarea.field {
  resize: vertical;
}

.form-foot {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.field-name {
  flex: 1;
}

@media (max-width: 720px) {
  .form-foot {
    flex-direction: column;
  }
}
</style>
