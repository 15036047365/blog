<template>
  <div class="container post-detail">
    <div v-if="loading" class="loading">加载中</div>
    <template v-else-if="blogStore.currentPost">
      <article class="post-article card">
        <h1 class="post-title">{{ blogStore.currentPost.title }}</h1>
        <div class="post-meta">
          <span>{{ blogStore.currentPost.author }}</span>
          <span>{{ formatDate(blogStore.currentPost.createdAt) }}</span>
          <span>{{ blogStore.currentPost.category }}</span>
        </div>
        <div class="post-content" v-html="blogStore.currentPost.content"></div>
        <div class="post-tags">
          <span v-for="tag in blogStore.currentPost.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </article>

      <!-- 评论区 -->
      <div class="comments-section card">
        <h3 class="section-title">评论 ({{ blogStore.comments.length }})</h3>
        <div class="comment-form">
          <textarea v-model="commentForm.content" placeholder="写下你的评论..." rows="3"></textarea>
          <div class="comment-form-footer">
            <input v-model="commentForm.author" placeholder="昵称" class="comment-input" />
            <button @click="submitComment" class="btn btn-primary">发表评论</button>
          </div>
        </div>
        <div class="comments-list">
          <div v-for="comment in blogStore.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <strong>{{ comment.author }}</strong>
              <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
          <div v-if="blogStore.comments.length === 0" class="no-comments">
            暂无评论，快来抢沙发吧~
          </div>
        </div>
      </div>
    </template>
    <div v-else class="not-found card">
      <h2>文章不存在</h2>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, watch } from 'vue'
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

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function submitComment() {
  if (!commentForm.content.trim() || !commentForm.author.trim()) return
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
.post-title {
  font-size: 26px;
  margin-bottom: 15px;
  color: #333;
}

.post-meta {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}

.post-meta span {
  margin-right: 15px;
}

.post-content {
  font-size: 15px;
  line-height: 2;
  color: #444;
  padding: 20px 0;
}

.post-content :deep(h2),
.post-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 12px;
}

.post-content :deep(p) {
  margin-bottom: 16px;
}

.post-content :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  color: #c7254e;
}

.post-content :deep(pre) {
  background-color: #f6f8fa;
  border: 1px solid #e6e8eb;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
  line-height: 1.65;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #24292f;
  font-size: 13px;
}

.post-tags {
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #1a73e8;
}

.comment-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
}

.comment-form-footer {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.comments-list {
  margin-top: 24px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-header {
  margin-bottom: 6px;
  font-size: 14px;
}

.comment-time {
  color: #999;
  margin-left: 10px;
  font-size: 12px;
}

.comment-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}
</style>