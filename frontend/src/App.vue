<template>
  <div class="app">
    <ParticlesBackground />
    <AppHeader />
    <main class="page">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import ParticlesBackground from '@/components/ParticlesBackground.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
