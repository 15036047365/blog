<!-- 首页轮播：结构参考 surmon.me 首页 carrousel，视觉沿用本站「技术档案」的规则线 + 纸面色块 -->
<template>
  <section
    class="carousel"
    role="region"
    aria-roledescription="carousel"
    aria-label="精选文章"
    :style="{ '--carousel-duration': `${AUTOPLAY_MS}ms` }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="focused = true"
    @focusout="focused = false"
  >
    <div class="viewport">
      <ul
        class="track"
        :style="{ transform: `translate3d(${-current * 100}%, 0, 0)` }"
        @pointerdown="onPointerDown"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @click.capture="onTrackClick"
      >
        <li
          v-for="(slide, i) in slides"
          :key="slide.title"
          class="slide"
          :aria-hidden="i !== current"
        >
          <!-- :href="slide.href" -->
          <a
            class="slide-link"
            
            target="_blank"
            rel="noopener noreferrer"
            :tabindex="i === current ? 0 : -1"
          >
            <img
              class="slide-img"
              :src="slide.image"
              :alt="slide.title"
              :loading="i === 0 ? 'eager' : 'lazy'"
              decoding="async"
              draggable="false"
            />
            <span class="plate">
              <span class="plate-title">{{ slide.title }}</span>
              <!-- <span class="plate-tag">精选</span> -->
            </span>
          </a>
        </li>
      </ul>
    </div>

    <div class="dots">
      <button
        v-for="(slide, i) in slides"
        :key="i"
        type="button"
        class="dot"
        :class="{ active: i === current, paused }"
        :aria-label="`第 ${i + 1} 张：${slide.title}`"
        :aria-current="i === current ? 'true' : undefined"
        @click="goTo(i)"
      >
        <span
          class="dot-progress"
          :key="`${cycle}-${i === current ? 'on' : 'off'}`"
          aria-hidden="true"
        ></span>
      </button>
    </div>

    <button type="button" class="arrow prev" aria-label="上一张" @click="go(-1)">‹</button>
    <button type="button" class="arrow next" aria-label="下一张" @click="go(1)">›</button>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import thinkFirst from '@/assets/carousel/think-first.webp'
import soloEmpire from '@/assets/carousel/solo-empire.webp'
import tooTame from '@/assets/carousel/too-tame.webp'
import aiTemperature from '@/assets/carousel/AI-Temperature.webp'
import intentOverCode from '@/assets/carousel/Intent-Over-Code.webp'
import iStillWriteMyOwn from '@/assets/carousel/I-Still-Write-My-Own.webp'
import acgSilentiGnition from '@/assets/carousel/acg-silenti-gnition.webp'
import aiAgentCloudflare from '@/assets/carousel/ai-agent-cloudflare.webp'
import ditchingDisqus from '@/assets/carousel/ditching-disqus.webp'

// 内容来自 surmon.me 首页轮播；想换成自己的文章，改这里的 title / image / href 即可
const slides = [
  { title: '想清楚再干', image: thinkFirst, href: 'https://surmon.me/article/317' },
  { title: '一人有限集团', image: soloEmpire, href: 'https://surmon.me/article/316' },
  { title: '你就是不敢', image: tooTame, href: 'https://surmon.me/article/315' },
  { title: '创造力是温柔的谎言', image: aiTemperature, href: 'https://surmon.me/article/313' },
  { title: '人类正在退出人类', image: intentOverCode, href: 'https://surmon.me/article/311' },
  { title: 'AI 代替不了这样的你', image: iStillWriteMyOwn, href: 'https://surmon.me/article/310' },
  // { title: '脉冲点火背后的架构设计', image: acgSilentiGnition, href: 'https://surmon.me/article/309' },
  // { title: '基于 Cloudflare 生态的 AI Agent 实现', image: aiAgentCloudflare, href: 'https://surmon.me/article/307' },
  // { title: 'NodePress 支持用户登录了', image: ditchingDisqus, href: 'https://surmon.me/article/306' },
]

const AUTOPLAY_MS = 5200

const current = ref(0)
const hovering = ref(false)
const focused = ref(false)
const documentHidden = ref(false)
const cycle = ref(0)

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const autoplayEnabled = ref(!reducedMotion)
const paused = computed(
  () => hovering.value || focused.value || documentHidden.value || !autoplayEnabled.value
)

let timer = null

function stopTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  if (paused.value || slides.length < 2) return
  timer = setTimeout(() => {
    current.value = (current.value + 1) % slides.length
  }, AUTOPLAY_MS)
}

function go(delta) {
  current.value = (current.value + delta + slides.length) % slides.length
}

function goTo(index) {
  if (index !== current.value) current.value = index
}

watch(current, startTimer)
watch(paused, (isPaused) => {
  if (isPaused) {
    stopTimer()
  } else {
    // 重新计时，同时让进度条从头开始，二者保持一致
    cycle.value += 1
    startTimer()
  }
})

// 触摸/拖拽滑动；拖拽结束后的那次 click 不要触发跳转
let startX = null
let startY = null
let dragged = false

function onPointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  startX = event.clientX
  startY = event.clientY
  dragged = false
}

function onPointerUp(event) {
  if (startX === null) return
  const dx = event.clientX - startX
  const dy = event.clientY - startY
  startX = null
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
  dragged = true
  go(dx < 0 ? 1 : -1)
}

function onTrackClick(event) {
  if (!dragged) return
  dragged = false
  event.preventDefault()
  event.stopPropagation()
}

function onVisibilityChange() {
  documentHidden.value = document.hidden
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange)
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
.carousel {
  position: relative;
  margin-top: 18px;
  border: 1px solid var(--rule-strong);
  background: var(--paper-sunk);
  overflow: hidden;
}

.viewport {
  aspect-ratio: 1190 / 420;
  overflow: hidden;
}

.track {
  display: flex;
  height: 100%;
  list-style: none;
  transition: transform 720ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}

.slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
}

.slide-link {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}

.slide-link:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: -2px;
}

.slide-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  user-select: none;
  transition: transform 720ms ease;
}

.slide-link:hover .slide-img {
  transform: scale(1.03);
}

/* 标题牌：纸面色块 + 错位的细线，呼应「档案」的印刷感 */
.plate {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100% - 48px);
  padding: 6px 12px;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
}

.plate::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border: 1px solid var(--ink);
  opacity: 0.35;
  transform: translate(3px, 3px);
}

.plate-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.plate-tag {
  flex: none;
  padding-left: 10px;
  border-left: 1px solid var(--rule-strong);
  font-family: var(--mono);
  font-size: 10px;
  line-height: 1.8;
  letter-spacing: 0.18em;
  color: var(--signal);
}

/* 分页：细条 + 进度填充 */
.dots {
  position: absolute;
  right: 0;
  bottom: 14px;
  left: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  position: relative;
  width: 14px;
  height: 4px;
  padding: 0;
  border: 0;
  background: rgba(252, 252, 251, 0.5);
  cursor: pointer;
  transition: width 260ms ease, background-color 200ms ease;
}

/* 视觉很细，但点击区域上下各扩 8px */
.dot::after {
  content: '';
  position: absolute;
  inset: -8px -3px;
}

.dot:hover {
  background: rgba(252, 252, 251, 0.8);
}

.dot.active {
  width: 40px;
  background: rgba(252, 252, 251, 0.35);
  cursor: default;
}

.dot-progress {
  position: absolute;
  inset: 0;
  background: var(--paper);
  transform: scaleX(0);
  transform-origin: left;
  opacity: 0;
  animation: carousel-progress var(--carousel-duration, 5200ms) linear forwards;
}

.dot.active .dot-progress {
  opacity: 1;
}

.dot.paused .dot-progress {
  animation-play-state: paused;
}

@keyframes carousel-progress {
  to {
    transform: scaleX(1);
  }
}

/* 左右箭头：只在悬停/聚焦时出现，触屏设备直接滑动 */
.arrow {
  position: absolute;
  top: 50%;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--rule-strong);
  background: rgba(252, 252, 251, 0.9);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-50%);
  transition: opacity 180ms ease, background-color 180ms ease;
}

.prev {
  left: 12px;
}

.next {
  right: 12px;
}

.carousel:hover .arrow,
.arrow:focus-visible {
  opacity: 1;
}

.arrow:hover {
  background: var(--paper);
}

@media (hover: none) {
  .arrow {
    display: none;
  }
}

@media (max-width: 720px) {
  .viewport {
    aspect-ratio: 16 / 9;
  }

  .plate {
    top: 12px;
    right: 12px;
    gap: 8px;
    padding: 5px 10px;
    font-size: 13px;
  }

  .plate-tag {
    font-size: 9px;
    padding-left: 8px;
  }

  .dots {
    bottom: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .track,
  .slide-img {
    transition: none;
  }

  .dot-progress {
    animation: none;
    transform: scaleX(1);
  }
}
</style>
