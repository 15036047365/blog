<template>
  <header class="header">
    <div class="container header-inner">
      <router-link to="/" class="logo">
        <h1>我的博客-Mr. Li</h1>
      </router-link>
      <nav class="nav">
        <router-link to="/" class="nav-link" :class="{ active: $route.name === 'Home' }">
          首页
        </router-link>
        <router-link to="/about" class="nav-link" :class="{ active: $route.name === 'About' }">
          关于
        </router-link>
        <router-link to="/chat" class="nav-link" :class="{ active: $route.name === 'Chat' }">
          AI 助手
        </router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo h1 {
  font-size: 22px;
  color: #333;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  font-size: 15px;
  color: #666;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #1a73e8;
  border-bottom-color: #1a73e8;
}
</style>