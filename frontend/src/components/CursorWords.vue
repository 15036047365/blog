<!-- 点击掉落随机单词（animalclicks）。库是全局单例，挂载一次就行。 -->
<template>
  <span class="sr-only">点击正文以外的区域会掉落随机单词</span>
</template>

<script setup>
import { onMounted } from 'vue'
import AnimalClicks from 'animalclicks'

// 词库：积极向上 + 摆烂，想换直接改这里
const WORDS = [
  // 积极向上
  // '上线', '全绿', '一次过', '起飞', '稳了', '有救了',
  // '搞定', '发版成功', '需求砍了', '明天更好',
  // 摆烂
  '明天更好', '躺平', '开摆', '算了',
  '下班', '随缘', '二', '已读不回',
]

onMounted(() => {
  const instance = new AnimalClicks(
    WORDS,
    1200, // time：词的存活时长（ms；fade 开启时基本用不到）
    1, // quality：每次点击掉几个词（1 = 只出一个）
    15, // angle：最大随机旋转角度
    1.5, // velocityX：水平速度上限
    1.5, // velocityY：垂直速度上限
    -0.06, // gravity：重力
    0, // dx
    -15, // dy
    // hideCursor: false —— 保留系统光标，进页面时不会有一个「默认单词」跟着鼠标
    { random: true, physics: true, fade: true, hideCursor: false },
    '16px'
  )

  // 库默认在 document 上监听 click，整个页面都会掉词。
  // 摘掉它的监听，改成只响应内容栏（.shell，940px 居中列）之外的点击——
  // 点正文不打扰阅读，点两侧留白会掉词。
  if (!instance['_rawHandleClick']) {
    instance['_rawHandleClick'] = instance.handleClick
    document.removeEventListener('click', instance['_rawHandleClick'])
  }

  // 同一次点击即使被残留监听调用多次，也只掉一个词
  instance.handleClick = (event) => {
    if (event._cursorWordsDone) return
    event._cursorWordsDone = true
    instance['_rawHandleClick'](event)
  }

  // 处理器存在单例上：HMR / 重复挂载时先摘掉旧的，监听不会越积越多
  if (instance['_clickHandler']) {
    document.removeEventListener('click', instance['_clickHandler'])
  }
  instance['_clickHandler'] = (event) => {
    const target = event.target instanceof Element ? event.target : null
    if (!target || target.closest('.shell')) return
    instance.handleClick(event)
  }
  document.addEventListener('click', instance['_clickHandler'])
})
</script>

<style>
/* 库把词直接挂到 body 上，样式只能用全局选择器 */
.dropping-text {
  font-family: var(--mono);
  font-weight: 600;
  color: var(--signal);
  white-space: nowrap;
  text-shadow: 0 1px 0 var(--paper);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
