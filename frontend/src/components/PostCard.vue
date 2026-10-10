<template>
  <article class="case">
    <router-link class="case-link" :to="`/post/${post.id}`">
      <div class="case-main">
        <h2 class="case-title">{{ post.title }}</h2>
        <p class="case-excerpt">{{ post.excerpt }}</p>
      </div>
      <div class="case-rail">
        <span class="case-cat">{{ post.category }}</span>
        <time class="mono case-date" :datetime="post.createdAt">{{ formatDate(post.createdAt) }}</time>
      </div>
    </router-link>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.case {
  border-top: 1px solid var(--rule);
  transition: border-color 200ms ease;
}

.case:hover {
  border-top-color: var(--rule-strong);
}

.case-link {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px;
  gap: 0 36px;
  padding: 28px 0 26px;
}

.case-title {
  font-family: var(--serif);
  font-size: 21px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.01em;
  transition: color 160ms ease;
}

.case-link:hover .case-title {
  color: var(--signal);
}

.case-excerpt {
  margin-top: 10px;
  font-size: 15px;
  line-height: 1.85;
  color: var(--ink-mute);
}

.case-rail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  text-align: right;
}

.case-cat {
  font-size: 13px;
  color: var(--ink-mute);
}

@media (max-width: 720px) {
  .case-link {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
  }

  .case-rail {
    flex-direction: row;
    align-items: baseline;
    justify-content: flex-start;
    gap: 16px;
    margin-top: 14px;
  }

  .case-title {
    font-size: 19px;
  }
}
</style>
