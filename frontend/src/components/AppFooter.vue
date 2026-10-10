<template>
  <footer class="footer">
    <div class="shell footer-inner">
      <p class="footer-build">
        用 Vue 3 + Node.js 构建<span class="footer-year">© {{ year }}</span>
      </p>

      <dl class="stats">
        <div class="stat">
          <dt>总访问量</dt>
          <dd class="stat-value">{{ formatNumber(stats.pv) }}</dd>
        </div>
        <div class="stat">
          <dt>今日访客</dt>
          <dd class="stat-value">{{ formatNumber(stats.uv) }}</dd>
        </div>
      </dl>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { statsApi } from '@/api'

const stats = ref({
  pv: 0,
  uv: 0
})

const year = computed(() => new Date().getFullYear())

function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

onMounted(async () => {
  try {
    const res = await statsApi.get()
    stats.value = res.data
  } catch (err) {
    console.error('获取站点统计失败:', err)
  }
})
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--rule);
  padding: 26px 0 30px;
}

.footer-inner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  font-size: 13px;
  color: var(--ink-faint);
}

.footer-year {
  margin-left: 14px;
}

.stats {
  display: flex;
  gap: 28px;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat dt {
  font-size: 13px;
  color: var(--ink-faint);
}

.stat-value {
  font-family: var(--mono);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
