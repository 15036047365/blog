<template>
  <header class="header">
    <div class="shell header-inner">
      <router-link to="/" class="masthead">
        <span class="site-name">李孟飞</span>
        <span class="site-beat">前端工程笔记</span>
      </router-link>
      <nav class="nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/about" class="nav-link">关于</router-link>
        <router-link to="/chat" class="nav-link">AI 助手</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
}

.header-inner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding-top: 20px;
  padding-bottom: 18px;
}

.masthead {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}

.site-name {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.site-beat {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--ink-faint);
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: 22px;
}

.nav-link {
  font-size: 15px;
  color: var(--ink-mute);
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
  transition: color 160ms ease, border-color 160ms ease;
}

.nav-link:hover {
  color: var(--ink);
}

.nav-link.router-link-exact-active {
  color: var(--ink);
  border-bottom-color: var(--signal);
}

@media (max-width: 640px) {
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .site-beat {
    display: none;
  }

  .nav {
    gap: 18px;
  }
}
</style>
