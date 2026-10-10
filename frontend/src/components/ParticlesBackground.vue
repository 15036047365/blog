<template>
  <div v-if="!reducedMotion" class="particles-bg">
    <VueParticles
      id="tsparticles"
      :options="particlesOptions"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { particlesOptions } from '@/config/particles'

// 全屏动效不参与「减少动态效果」偏好
const reducedMotion = ref(false)

let query = null

function sync(event) {
  reducedMotion.value = event.matches
}

onMounted(() => {
  query = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = query.matches
  query.addEventListener('change', sync)
})

onBeforeUnmount(() => {
  query?.removeEventListener('change', sync)
})
</script>

<style scoped>
.particles-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}
</style>
