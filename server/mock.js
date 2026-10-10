// 博客文章数据
// 说明：当前文章存储在后端内存中（重启不丢失需迁移到数据库/文件，见 TODO）
// 每篇文章的 content 为 HTML 片段，由前端 v-html 渲染

const posts = [
  {
    id: 1,
    title: '首屏 5s → 2s：坐席 AI 副驾客户画像接口的快慢分离改造',
    author: '李孟飞',
    category: '性能优化',
    tags: ['Vue3', 'TypeScript', '性能优化', '状态机'],
    excerpt: '坐席接起电话时要等 5 秒才能看到客户画像。问题不在前端渲染，而在一个同步等待多个外部系统的接口。这篇记录我们怎么把它压到 2 秒。',
    content: `
      <h2>一、问题：坐席在「干等」</h2>
      <p>坐席 AI 副驾（Agent Copilot）是给客服坐席用的辅助工作台：客户来电时，坐席希望第一时间看到客户画像（保龄、是否修理厂、保单关联人、历史画像标签等），再据此选择服务方案。</p>
      <p>但上线后我们发现，画像接口 <code>/admin-api/customer/get/profile</code> 首屏平均要 <strong>5 秒</strong>左右。原因是这个接口在服务端<strong>串行</strong>调用了多个外部系统——保龄要查一个，是否修理厂要查一个，保单关联人又要查一个，任何一个慢，整页就都出不来。</p>
      <p>这 5 秒里坐席什么都做不了，而通话已经在进行。</p>

      <h2>二、定位：把「必须先看到」和「可以稍后到」拆开</h2>
      <p>我们逐个分析字段，发现两类数据性质完全不同：</p>
      <ul>
        <li><strong>基础画像</strong>：姓名、客户号、标签、是否内部员工等，读缓存即可，毫秒级；</li>
        <li><strong>慢字段</strong>：保龄、是否修理厂、保单关联人，需要外部系统实时计算，秒级。</li>
      </ul>
      <p>而真正决定坐席下一步动作的，是基础画像 + <strong>服务方案接口</strong>（<code>getRiskInfo</code>）。也就是说：<strong>慢字段完全可以晚到，但不能阻塞服务方案的触发。</strong></p>

      <h2>三、方案：快照 + 全量，两条接口</h2>
      <p>我们把原来的一个同步接口拆成两个：</p>
      <ul>
        <li><code>/customer/get/profile/fast</code>：返回 Redis + 本地缓存的<strong>快照</strong>，只含基础字段，毫秒级返回；</li>
        <li><code>/customer/get/profile/complete</code>：异步跑全量，返回包含慢字段的完整结果。</li>
      </ul>
      <p>前端拿到快照后<strong>立刻渲染画像并触发服务方案接口</strong>，同时轮询 complete；慢字段各自显示独立的 loading 占位，谁先回来谁先渲染。</p>

      <h2>四、四态状态机：为什么不用一个 loading 布尔值</h2>
      <p>只用 <code>loading = true/false</code> 会遇到麻烦：快照已经渲染了，全量还在跑，UI 到底算不算「加载中」？失败时是清空还是保留快照？所以这里用了一个显式状态机：</p>
      <ul>
        <li><code>''</code>：未开始</li>
        <li><code>PARTIAL</code>：快照已渲染（首屏可交互）</li>
        <li><code>LOADING</code>：complete 轮询中</li>
        <li><code>COMPLETE</code>：全量已覆盖</li>
        <li><code>FAILED</code>：异步失败，保留快照并提示</li>
      </ul>

      <h3>核心代码（简化版）</h3>
      <pre><code>const profileStatus = ref('') // '' | 'PARTIAL' | 'LOADING' | 'COMPLETE' | 'FAILED'
const profileFirstLoading = ref(false)

async function loadProfile(params) {
  // 灰度开关关闭时，行为与改造前完全一致（走原全量同步接口）
  if (!enableFastSplit) return fetchCustomerProfileSync(params)

  profileFirstLoading.value = true
  const [fastData, fastErr] = await getProfileFast(params)
  profileFirstLoading.value = false

  if (fastErr) {
    // fast 失败：回退原全量接口，保证画像可用，不影响业务
    return fetchCustomerProfileSync(params)
  }

  // 快照返回即渲染，applyCustomerProfile 内部会第一时间调用 getRiskInfo()
  await applyCustomerProfile(fastData)
  profileStatus.value = 'PARTIAL'

  // 异步补全，不阻塞首屏
  pollComplete(params)
}</code></pre>

      <h2>五、灰度与回退：改造必须能一键回滚</h2>
      <p>这类改动一旦出问题，影响的是所有坐席。所以我们内置了配置开关 <code>ENABLE_PROFILE_FAST_SPLIT</code>：</p>
      <ul>
        <li>开关关闭 → 走原全量同步接口，<strong>行为与改造前完全一致</strong>，可用于灰度和回滚；</li>
        <li>fast 接口异常 → 自动回退原接口；</li>
        <li>complete 超时 → 停止轮询并提示，快照内容继续可用。</li>
      </ul>

      <h2>六、结果与复盘</h2>
      <p>首屏等待从 <strong>约 5s 降到约 2s</strong>（降低约 60%），且坐席在看到基础画像后即可开始操作，服务方案也不再等慢字段。</p>
      <p>三点经验：</p>
      <ul>
        <li><strong>慢接口的解法通常不在前端</strong>：先去拆「谁真的阻塞了首屏」，而不是加骨架屏掩盖问题；</li>
        <li><strong>中间态要设计</strong>：partial 状态是整个方案的关键，它让 UI 能诚实地表达「哪些数据已经有、哪些还在路上」；</li>
        <li><strong>改造要留回滚路径</strong>：开关 + 失败回退，是把风险从「不可控」降到「可控」的最低成本手段。</li>
      </ul>
    `,
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-08T10:00:00Z'
  },
  {
    id: 2,
    title: '把大模型流式对话接进保险客服 H5：分段渲染、结束态与附件流',
    author: '李孟飞',
    category: 'AI 应用',
    tags: ['大模型', '流式渲染', 'Vue2', 'H5'],
    excerpt: '客服机器人切到大模型后改为流式返回。真正难的不是"一个字一个字显示"，而是把流式过程中的中间态、结束态和附件都设计清楚。',
    content: `
      <h2>一、流式接入后，前端多了三种「中间态」</h2>
      <p>客服系统原来的机器人回复是一次性返回整段文本，前端拿到就整段渲染。切换到 gpt 大模型后，后端改为<strong>流式分片下发</strong>，前端一次只收到一段增量。数据结构大致是：</p>
      <pre><code>{
  userRobotType: 'gpt',
  stream: true,          // 是否流式
  contentEnd: false,     // 本次是否结束
  streamContent: '...',  // 增量文本
  streamFileList: []     // 增量附件（边生成边下发的文件卡片）
}</code></pre>
      <p>这意味着前端要处理三种以前不存在的中间态：<strong>正在生成中</strong>、<strong>已生成但未结束</strong>、<strong>结束且需要触发后续业务</strong>。</p>

      <h2>二、渲染：增量追加，而不是整段替换</h2>
      <p>最容易踩的坑是「每来一片就整段替换」。那样会导致两个问题：一是 <code>v-html</code> 反复重建 DOM，代码块、链接会闪烁；二是滚动位置会跳。</p>
      <p>正确做法是<strong>累积到同一条消息上</strong>，并且只在内容真的变化时更新。Vue2 里新增字段必须用 <code>$set</code>，否则不是响应式的：</p>
      <pre><code>if (datas.userRobotType === 'gpt' &amp;&amp; datas.stream === true &amp;&amp; datas.contentEnd !== true) {
  const last = this.msgList[this.msgList.length - 1]

  if (datas.streamContent) {
    // 增量追加，累加到已存在的流式字段上
    this.$set(last, 'streamContent', (last.streamContent || '') + datas.streamContent)
  }

  if (datas.streamFileList &amp;&amp; datas.streamFileList.length) {
    // 附件流：同一条消息里持续补充文件卡片
    this.$set(last, 'streamFileList', datas.streamFileList)
  }

  // 结束态之前，不触发判题、核保等后续业务逻辑
  return
}</code></pre>

      <h2>三、结束态：contentEnd 是业务联动的开关</h2>
      <p><code>contentEnd !== true</code> 时只做渲染，不做任何业务联动。因为流式过程中内容是不完整的，此时如果触发<strong>判题</strong>（JudgeCollapse）或 <strong>AI 核保弹窗</strong>，会拿到半截文本，出现「判题结果对不上」的诡异问题。</p>
      <p>收到 <code>contentEnd === true</code> 之后才：收起打字动画 → 解析完整内容里的结构化信息 → 触发判题 / 核保 / 快捷操作。</p>

      <h2>四、附件流：要按 id 去重</h2>
      <p>大模型回答里会带文件（保单、条款、理赔单），后端是通过 <code>streamFileList</code> 分片下发的。如果直接整体覆盖，滚动中的卡片会重建；如果直接 push，又会出现重复。</p>
      <p>我们的做法是以文件名 + 类型作为 key 做一次去重合并，保持列表稳定。</p>

      <h2>五、体验细节</h2>
      <ul>
        <li><strong>自动滚动要让步</strong>：用户主动上滑查看历史时，停止自动滚到底部；</li>
        <li><strong>打字动画只在首片之前显示</strong>：已经有内容就不要一直闪；</li>
        <li><strong>长回复要防止「跳动」</strong>：给消息容器固定最小高度，避免每次追加都引起整页重排。</li>
      </ul>

      <h2>六、小结</h2>
      <p>流式不是「把 response 拆成一个字一个字发」这么简单，它要求前端把<strong>中间态当成正式状态来设计</strong>：谁可以渲染、谁不能触发业务、什么时候算结束。想清楚这三点，流式接入基本就不会出大问题。</p>
    `,
    createdAt: '2026-09-20T09:30:00Z',
    updatedAt: '2026-09-20T09:30:00Z'
  },
  {
    id: 3,
    title: 'APP 内嵌 WebView 打开 PDF 一直变成下载？OSS 签名链接 + pdf.js 代理方案',
    author: '李孟飞',
    category: 'H5 与兼容',
    tags: ['pdf.js', 'WebView', 'H5', '兼容性'],
    excerpt: '客服机器人回复里的保单 PDF，在 APP 内嵌 WebView 里点开要么直接下载、要么白屏。根因是跨域 + WebView 不支持内联预览，这里记录一套代理 + pdf.js 的落地方案。',
    content: `
      <h2>一、现象与根因</h2>
      <p>客服机器人的回复里会带保单、条款的 PDF 链接，文件托管在阿里云 OSS 上，链接形如 <code>https://g362-prod.oss-cn-szfinance.aliyuncs.com/...pdf?签名参数</code>。在 PC 浏览器里点开没问题，但在「我家阳光」APP 内嵌 WebView 和部分手机浏览器里：</p>
      <ul>
        <li>要么<strong>直接触发下载</strong>，用户得跳出去找文件；</li>
        <li>要么<strong>白屏</strong>，因为 WebView 不支持内联渲染 PDF。</li>
      </ul>
      <p>根因有两个：一是 OSS 域名与客服页面<strong>不同源</strong>；二是移动端 WebView 通常不具备内联 PDF 预览能力。</p>

      <h2>二、思路：代理转发 + pdf.js 渲染</h2>
      <p>既然 WebView 自己不会渲染 PDF，就把 PDF 交给<strong>会渲染的 pdf.js 页面</strong>，并让这个页面通过代理把 OSS 文件取回来：</p>
      <ol>
        <li><strong>识别</strong>：在消息渲染时用正则匹配 OSS 的 PDF 链接；</li>
        <li><strong>重写</strong>：把原始 OSS 链接编码后拼到 pdf.js viewer 的 <code>?file=</code> 参数上；</li>
        <li><strong>代理加载</strong>：pdf.js 去请求 OSS（依赖 OSS 的 CORS 白名单）；</li>
        <li><strong>渲染</strong>：pdf.js 把 PDF 渲染成 canvas，WebView 里就能看了。</li>
      </ol>

      <h2>三、关键代码：链接重写</h2>
      <p>为了不做开放重定向，正则必须<strong>严格限定域名和扩展名</strong>：</p>
      <pre><code>// 只匹配 g362-uat / g362-prod 的 OSS 域名下的 .pdf 链接
const pdfRe = new RegExp(
  '&lt;a[ ]+[^&gt;]*href="([^"]*g362-(uat|prod)[.]oss-cn-szfinance[.]aliyuncs[.]com[^"]*[.]pdf[^"]*)"[^&gt;]*&gt;([^&lt;]*?)&lt;/a&gt;',
  'g'
)

html = html.replace(pdfRe, function (match, url, env, text) {
  // OSS 签名 URL 里的 &amp;amp; 必须还原成 &amp;，否则签名参数错误导致 403
  const decoded = url.replace(/&amp;amp;/g, '&amp;')
  const pdfUrl = pdfHost + '?file=' + encodeURIComponent(decoded)
  // iOS WebView 对 target="_blank" 支持有限，需要区分处理
  return '&lt;a href="' + pdfUrl + '"' + (isIOS ? '' : ' target="_blank"') + '&gt;' + text + '&lt;/a&gt;'
})</code></pre>

      <h2>四、pdf.js 侧的改造</h2>
      <p>pdf.js 默认会校验 <code>?file=</code> 参数指向的地址必须与 viewer 页面<strong>同源</strong>，而 OSS 域名显然不同源，因此需要在 viewer.js 中放开这个校验（注释掉 <code>validateFileURL</code> 里的同源判断）。</p>
      <p>我们用的是 pdf.js 3.11.174 legacy 版本（兼容老 WebView），并把 viewer 部署在公司官网域名下，地址通过环境变量注入，测试与生产各一套：</p>
      <pre><code>// .env.development / .env.uat / .env.production
VUE_APP_PDF_HOST=https://www.sinosig.com/c/assert/pdfjs-3.11.174-legacy/web/viewer.html</code></pre>

      <h2>五、三种打开策略并存</h2>
      <p>实际业务里 PDF 场景不止一种，最后形成三条路径：</p>
      <ul>
        <li><strong>OSS 文件</strong>：走 pdf.js 代理（本文方案）；</li>
        <li><strong>不上 OSS 的文件</strong>：走项目内本地部署的 pdf.js；</li>
        <li><strong>原生 APP 容器内</strong>：直接调原生能力打开（iOS 走 <code>webkit.messageHandlers</code>，Android 走 <code>Native.openPdf</code>），体验最好。</li>
      </ul>

      <h2>六、安全边界</h2>
      <ul>
        <li>OSS 链接是<strong>带签名的临时链接</strong>，过期即失效，泄露风险可控；</li>
        <li>正则限定具体域名，避免被构造成任意 URL 加载；</li>
        <li>OSS Bucket 需配置 CORS 白名单，只允许官网域名访问；</li>
        <li>pdf.js viewer 中禁用 PDF 内嵌 JavaScript。</li>
      </ul>

      <h2>七、小结</h2>
      <p>移动端 PDF 预览没有银弹：<strong>跨域 + WebView 能力缺失</strong>决定了必须引入一个代理渲染层。方案本身不复杂，难的是把 iOS / Android / 原生容器三种环境的差异都覆盖到，并保住安全边界。</p>
    `,
    createdAt: '2026-09-05T14:20:00Z',
    updatedAt: '2026-09-05T14:20:00Z'
  },
  {
    id: 4,
    title: '从 0 到 1：给个人博客接上 DeepSeek SSE 流式 AI 助手',
    author: '李孟飞',
    category: 'AI 应用',
    tags: ['SSE', 'Node.js', 'Vue3', 'DeepSeek'],
    excerpt: '本站右下角那个 AI 助手就是这套实现：Express 做 SSE 转发，前端用 Fetch ReadableStream 增量渲染。顺手解决限流、轮次限制与密钥安全问题。',
    content: `
      <h2>一、为什么用 SSE，而不是 WebSocket / EventSource</h2>
      <ul>
        <li><strong>WebSocket</strong>：双向、需要额外协议与心跳，这里只需要服务端单向推，过重；</li>
        <li><strong>EventSource</strong>：原生支持 SSE，但<strong>只支持 GET</strong>，没法把多轮对话历史放进请求体；</li>
        <li><strong>fetch + 流式读取</strong>：可以用 POST 带上完整 messages，同时用 <code>resp.body.getReader()</code> 增量读取响应 —— 这也是现在最常用的做法。</li>
      </ul>

      <h2>二、整体结构</h2>
      <pre><code>浏览器 Chat.vue
   |  POST /api/chat  { messages: [...] }
   v
Express (server/index.js)  ---- stream:true ---->  DeepSeek /v1/chat/completions
   |  &lt;---- SSE: data: {"choices":[{"delta":{"content":"..."}}]} ----
   |  逐块解析，只把 delta.content 转成 data: {"content":"..."}
   v
浏览器按事件解析，增量拼接渲染</code></pre>

      <h2>三、后端要点</h2>
      <h3>1）设置 SSE 响应头并立即冲刷</h3>
      <pre><code>res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
res.setHeader('Cache-Control', 'no-cache')
res.setHeader('Connection', 'keep-alive')
res.flushHeaders() // 关键：不冲刷的话浏览器可能一直等缓冲</code></pre>

      <h3>2）逐块解析上游 SSE，只转发内容增量</h3>
      <p>上游返回的是形如 <code>data: {...}</code> 的行，且<strong>一次 chunk 可能切断一行</strong>，所以必须维护一个 buffer，把最后一段不完整的内容留到下一轮：</p>
      <pre><code>let buffer = ''
reader.on('data', chunk =&gt; {
  buffer += decoder.decode(chunk, { stream: true })
  const lines = buffer.split('\\n')
  buffer = lines.pop() // 最后一段可能不完整，留到下一轮
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue
    const payload = trimmed.slice(5).trim()
    if (payload === '[DONE]') continue
    const json = JSON.parse(payload)
    const content = json.choices[0].delta.content
    if (content) res.write('data: ' + JSON.stringify({ content }) + '\\n\\n')
  }
})</code></pre>

      <h3>3）客户端断开时取消上游请求</h3>
      <p>用户关掉页面或点「清空对话」，如果不取消上游，钱还是会继续烧：</p>
      <pre><code>req.on('close', () =&gt; {
  if (!res.writableEnded) reader.destroy()
})</code></pre>

      <h2>四、前端要点：按事件切分，保留半截数据</h2>
      <pre><code>const reader = resp.body.getReader()
const decoder = new TextDecoder()
let buffer = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })
  const events = buffer.split('\\n\\n') // 一个 SSE 事件以空行结束
  buffer = events.pop()               // 最后一段可能不完整

  for (const event of events) {
    for (const line of event.split('\\n')) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') continue
      const json = JSON.parse(payload)
      if (json.content) assistant.content += json.content
    }
  }
  scrollToBottom()
}</code></pre>

      <h2>五、必须做的三件事：密钥、限流、长度</h2>
      <ul>
        <li><strong>密钥只放服务端</strong>：<code>DEEPSEEK_API_KEY</code> 写在 <code>server/.env</code>，并把 <code>.env</code> 加进 <code>.gitignore</code>，绝不进前端包；</li>
        <li><strong>限流</strong>：用 <code>express-rate-limit</code> 限制每 IP 每分钟 20 次，防止被刷爆额度；</li>
        <li><strong>长度与轮次</strong>：messages 最多 50 条、单条最多 4000 字，服务端统一校验，顺便挡住超长上下文带来的成本失控。</li>
      </ul>
      <pre><code>const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
})</code></pre>

      <h2>六、排查经验</h2>
      <ul>
        <li>页面一直不输出内容？先确认 <code>flushHeaders()</code> 有没有调用，以及 Nginx 是否开了 <code>proxy_buffering off</code>；</li>
        <li>内容偶发丢字？几乎都是 buffer 处理不当——<strong>永远不要假设一个 chunk 就是一整行</strong>；</li>
        <li>报 429？是你自己的限流生效了，可以按业务把窗口调大。</li>
      </ul>

      <h2>七、小结</h2>
      <p>一个可用的流式 AI 助手，核心只有三块：<strong>SSE 转发（含不完整数据处理）</strong>、<strong>前端增量渲染</strong>、<strong>成本与安全检查</strong>。剩下的是体验打磨。</p>
    `,
    createdAt: '2026-08-28T20:10:00Z',
    updatedAt: '2026-08-28T20:10:00Z'
  },
  {
    id: 5,
    title: 'qiankun 微前端基座落地：登录态、token 传递与按需加载',
    author: '李孟飞',
    category: '工程化',
    tags: ['qiankun', '微前端', 'Vue2', '工程化'],
    excerpt: '把多个独立的中后台子系统统一到一个 PC 基座里，最麻烦的不是接入，而是登录态怎么传、样式怎么隔离、子应用怎么独立运行。',
    content: `
      <h2>一、场景</h2>
      <p>集团 PC 端有若干独立演进的中后台子系统（驾驶舱、数据查询、配置中心等），每个都有自己的仓库和发布节奏。为了统一入口与登录，我们用一个 Vue2 的基座工程把它们聚合成一个应用。</p>
      <p>基座负责：登录、token 获取与刷新、子应用注册与路由分发、全局错误监控（Sentry）；子应用只关心自己的业务。</p>

      <h2>二、注册子应用：用 props 传登录态</h2>
      <p>主应用在注册时把当前登录态通过 props 注入子应用，比让子应用自己读 localStorage 更可控（子应用不需要知道 token 存在哪、什么时候过期）：</p>
      <pre><code>import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'viewdata',
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/viewdata',
    props: {
      token: getToken(),
      userInfo: getUserInfo()
    }
  }
])

start()</code></pre>

      <h2>三、token 传递的三种方式与取舍</h2>
      <ul>
        <li><strong>props 注入</strong>：显式、可控，缺点是 token 刷新后要通知子应用；</li>
        <li><strong>全局状态（initGlobalState）</strong>：适合登录态这种「所有人都关心」的状态，主应用刷新 token 后广播一次即可；</li>
        <li><strong>挂 window</strong>：最省事，但污染全局、隐式依赖，只适合临时过渡。</li>
      </ul>
      <pre><code>import { initGlobalState } from 'qiankun'

const actions = initGlobalState({ token: '' })

// 主应用：token 变化时下发
actions.setGlobalState({ token: newToken })

// 子应用：订阅并同步到自己的 store
actions.onGlobalStateChange((state) =&gt; {
  store.commit('setToken', state.token)
}, true) // true 表示立即执行一次，拿到初始值</code></pre>
      <p>我们最终的做法是：<strong>登录页把 token 接口化获取</strong>（不再写死、不依赖环境变量），主应用持有，同时通过 props 和全局状态双通道下发给子应用。</p>

      <h2>四、踩过的坑</h2>
      <h3>1）子应用资源 404</h3>
      <p>子应用被打包到子路径时，必须使用 qiankun 注入的 publicPath，否则主应用里加载子应用资源会 404：</p>
      <pre><code>if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}</code></pre>

      <h3>2）子应用要能独立运行</h3>
      <p>子应用既要能被基座加载，也要能单独启动调试，所以入口要判断运行环境，并且导出 qiankun 需要的三个生命周期：</p>
      <pre><code>let instance = null

function render(props = {}) {
  const { container } = props
  instance = new Vue({ router, store, render: h =&gt; h(App) })
    .$mount(container ? container.querySelector('#app') : '#app')
}

if (!window.__POWERED_BY_QIANKUN__) render()

export async function bootstrap() {}
export async function mount(props) { render(props) }
export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}</code></pre>

      <h3>3）路由 base 与 activeRule 必须对齐</h3>
      <p>基座的 <code>activeRule</code> 是 <code>/viewdata</code>，子应用的路由 base 就必须是 <code>/viewdata</code>，否则子应用内部跳转会跳出基座。</p>

      <h3>4）按需引入，别让基座变成巨石</h3>
      <p>基座只保留登录、布局、菜单和少数公共能力；Element UI 等组件库改成按需引入（<code>unplugin-vue-components</code> + babel 插件），避免基座首屏把所有组件都打进去。</p>

      <h2>五、小结</h2>
      <p>微前端真正的成本不在技术选型，而在<strong>边界</strong>：谁负责登录态、谁负责样式、子应用能不能独立跑。把这三件事在接入前约定清楚，后面的维护成本会低一个数量级。</p>
    `,
    createdAt: '2026-07-15T11:00:00Z',
    updatedAt: '2026-07-15T11:00:00Z'
  }
]

// 分类
const categories = [
  { id: 1, name: 'AI 应用', count: 2 },
  { id: 2, name: '性能优化', count: 1 },
  { id: 3, name: 'H5 与兼容', count: 1 },
  { id: 4, name: '工程化', count: 1 }
]

// 标签
const tags = [
  { id: 1, name: 'Vue3' },
  { id: 2, name: 'Vue2' },
  { id: 3, name: 'TypeScript' },
  { id: 4, name: '性能优化' },
  { id: 5, name: '状态机' },
  { id: 6, name: '大模型' },
  { id: 7, name: '流式渲染' },
  { id: 8, name: 'SSE' },
  { id: 9, name: 'DeepSeek' },
  { id: 10, name: 'Node.js' },
  { id: 11, name: 'H5' },
  { id: 12, name: 'pdf.js' },
  { id: 13, name: 'WebView' },
  { id: 14, name: '兼容性' },
  { id: 15, name: 'qiankun' },
  { id: 16, name: '微前端' },
  { id: 17, name: '工程化' }
]

// 评论（初始为空，由访客提交）
const comments = []

module.exports = { posts, categories, tags, comments }
