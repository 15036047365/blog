<template>
  <div class="shell about">
    <article class="letter">
      <h1 class="about-title">关于我</h1>

      <div class="about-body">
        <p>你好！我是一个热爱技术的开发者，有6年工作经验。</p>
        <p>这个博客是我的个人技术分享平台，在这里我会记录工作中的技术心得、学习笔记和生活感悟。</p>
        <p>我目前主要使用 Vue.js 进行前端开发，同时也在学习 Node.js 后端开发。</p>
        <p>希望通过这个博客能和大家一起交流进步！</p>
      </div>

      <section class="contact">
        <h2 class="rule-title">联系</h2>
        <dl class="contact-list">
          <div class="contact-row">
            <dt class="mono">Email</dt>
            <dd><a href="mailto:1076336425@qq.com">1076336425@qq.com</a></dd>
          </div>
        </dl>
      </section>
    </article>
  </div>
</template>

<style scoped>
.letter {
  max-width: var(--measure);
  margin: 0 auto;
}

.about-title {
  font-family: var(--serif);
  font-size: clamp(23px, 3.2vw, 30px);
  font-weight: 600;
  letter-spacing: 0.04em;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--rule-strong);
}

.about-body {
  margin-top: 32px;
  font-size: 16px;
  line-height: 2;
  color: var(--ink);
}

.about-body p {
  margin-bottom: 1.2em;
}

.contact {
  margin-top: 64px;
}

.contact-list {
  margin-top: 20px;
}

.contact-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
}

.contact-row dt {
  padding-top: 3px;
}

.contact-row dd {
  font-size: 16px;
}

.contact-row a {
  color: var(--signal);
  border-bottom: 1px solid rgba(14, 110, 99, 0.35);
}

.contact-row a:hover {
  border-bottom-color: currentColor;
}
</style>
