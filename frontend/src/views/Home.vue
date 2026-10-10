<template>
  <div class="shell home">
    <header class="home-head">
      <h1 class="home-title">生产环境里的前端问题</h1>
      <p class="mono home-count">{{ visible.length }} 篇</p>
    </header>

    <!-- 分类是互斥的一维，所以做成单选筛选条；标签是多值的，放在页尾当标签用，不混进筛选 -->
    <nav class="filters" aria-label="按分类筛选">
      <button class="filter" :class="{ on: active === null }" @click="active = null">
        全部<span class="filter-n">{{ blogStore.posts.length }}</span>
      </button>
      <!-- 名称和计数之间不能有空白，否则和「全部5」的紧排不一致 -->
      <button
        v-for="cat in blogStore.categories"
        :key="cat.id"
        class="filter"
        :class="{ on: active === cat.name }"
        @click="active = cat.name"
      >{{ cat.name }}<span class="filter-n">{{ cat.count }}</span></button>
    </nav>

    <div v-if="loading" class="loading">加载中</div>

    <ol v-else-if="visible.length" class="case-list">
      <li v-for="post in visible" :key="post.id">
        <PostCard :post="post" />
      </li>
    </ol>

    <p v-else class="empty">
      这个分类下还没有文章。
      <button type="button" class="link-btn" @click="active = null">
        看全部 {{ blogStore.posts.length }} 篇
      </button>
    </p>

    <section v-if="blogStore.tags.length" class="tags-block">
      <h2 class="rule-title">标签</h2>
      <div class="tags-wrap">
        <span v-for="tag in blogStore.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBlogStore } from '@/stores/blog'
import PostCard from '@/components/PostCard.vue'

const blogStore = useBlogStore()
const { loading } = storeToRefs(blogStore)

const active = ref(null)

const visible = computed(() =>
  active.value === null
    ? blogStore.posts
    : blogStore.posts.filter((post) => post.category === active.value)
)

onMounted(() => {
  blogStore.fetchPosts()
  blogStore.fetchCategories()
  blogStore.fetchTags()
})
</script>

<style scoped>
.home-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--rule-strong);
}

.home-title {
  font-family: var(--serif);
  font-size: clamp(23px, 3.2vw, 32px);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.03em;
}

.home-count {
  white-space: nowrap;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0 26px;
  padding-top: 16px;
}

.filter {
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 0 0 2px;
  font-size: 15px;
  color: var(--ink-mute);
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease;
}

.filter:hover {
  color: var(--ink);
}

.filter.on {
  color: var(--ink);
  border-bottom-color: var(--signal);
}

.filter-n {
  font-family: var(--mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--ink-faint);
  margin-left: 3px;
}

.case-list {
  list-style: none;
  margin-top: 44px;
}

/* 最后一行补上底线，把台账收口 */
.case-list li:last-child :deep(.case) {
  border-bottom: 1px solid var(--rule);
}

.empty {
  margin-top: 44px;
  border-top: 1px solid var(--rule);
  padding-top: 28px;
}

.link-btn {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: var(--signal);
  border-bottom: 1px solid currentColor;
  cursor: pointer;
}

.tags-block {
  margin-top: 72px;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
}

@media (max-width: 720px) {
  .home-title {
    font-size: 22px;
  }
}
</style>
