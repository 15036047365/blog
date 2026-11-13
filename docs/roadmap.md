# 博客改造:服务器体检 + 分阶段方案

体检时间:2026-10-10。全部结论来自在 `lmfnode.top` 上的实测,不是推断。

---

## 一、先说最要紧的:线上正在给访客看假文章

`https://lmfnode.top` 现在返回的是 **张三写的 6 篇占位文**:

```
Vue 3 Composition API 实战指南 / Node.js 入门 / CSS Grid 布局完全指南
Git 工作流最佳实践 / JavaScript 异步编程进化史 / Linux 服务器部署入门
```

而服务器磁盘上的 `mock.js` 里躺的是你自己的 **5 篇真文章**:

```
首屏 5s → 2s:坐席 AI 副驾客户画像接口的快慢分离改造
把大模型流式对话接进保险客服 H5:分段渲染、结束态与附件流
APP 内嵌 WebView 打开 PDF 一直变成下载?OSS 签名链接 + ...
从 0 到 1:给个人博客接上 DeepSeek SSE 流式 AI 助手
qiankun 微前端基座落地:登录态、token 传递与按需加载
```

**原因:** 后端代码今天 14:41 传上去了,但 PM2 **没有重启**。`watching: disabled`,所以磁盘换了文件、进程还在跑 8 月 19 日加载进内存的那份旧代码。

**证据链:**
- 磁盘 `index.js` 有 `/api/stats`(grep 命中 2 次),线上 `GET /api/stats` 和 `POST /api/track` 都是 **404**
- 磁盘 `mock.js` 里 `张三` 出现 0 次、`李孟飞` 5 次;线上返回的却是 6 篇张三
- 磁盘 `index.js`/`mock.js`/`package.json` 与本地仓库 **md5 逐字节一致**(没有源码漂移,纯粹是进程陈旧)
- `pm2 describe` 显示进程 `created at 2026-08-19T01:59:07Z`,已运行 52 天

**连带后果:** `/api/track` 404 意味着首页每次加载都有一个失败请求;页脚的 PV/UV 是坏的。

**前端反而是对的。** 线上 `assets/index-D082DjQI.js` 和 `index.html` 与你本地 `dist/` 的 md5 完全一致 —— 说明 nginx 直接读磁盘,新设计**已经生效**。所以现在站点是「新皮肤 + 旧数据」的混合态。

> 一句话修复:`pm2 restart my-app`。但建议连 `ecosystem.config.js` 一起做,免得下次又忘(见第三节 Phase 0)。

---

## 二、体检结果:缺什么

### 阻塞级

| # | 问题 | 现状证据 | 影响 |
|---|---|---|---|
| 1 | 部署后不重启进程 | `watching: disabled`,52 天未重启 | 线上内容错,已经发生 |
| 2 | 完全没有持久化 | `comments = []`(`mock.js:447`)、PV/UV 在内存(`index.js:29`) | 评论和 52 天的统计数据,一重启全没 |
| 3 | 证书续期没在跑 | `certbot-renew.timer` 是 `enabled` 但 **`inactive`** | 证书 **2026-11-17 到期**,约 5 周。不修就等到期掉站 |

关于第 3 条有个好消息:实测 `certbot renew --dry-run` **全部通过**(`all simulated renewals succeeded`)。ACME 挑战、nginx 插件、证书路径都没问题,**唯一的缺口就是那个定时器没在跑**。所以启动它就完事,不需要改任何其他配置。

### 安全级

| # | 问题 | 现状证据 |
|---|---|---|
| 4 | 写接口全开 | `POST /api/comments` 无限流、无长度上限;对比 `/api/chat` 在 `index.js:91` 有 `chatLimiter` |
| 5 | CORS 全开 | 线上实测 `Access-Control-Allow-Origin: *`,预检放行 `GET,HEAD,PUT,PATCH,POST,DELETE` + `content-type`。任何网站都能让访客的浏览器替你发评论 |
| 6 | 主机没有防火墙 | `firewalld` inactive;iptables INPUT `policy ACCEPT`、**零规则** |
| 7 | Postgres 配置成对全网开放 | `listen_addresses = *` + `pg_hba.conf` 里 `host all all 0.0.0.0/0 md5`。**目前只有阿里云安全组在挡**(实测 5432 从外网不可达) |
| 8 | UV 可伪造 | `index.js:64` 取 `x-forwarded-for.split(',')[0]`,那是**第一个**(客户端可伪造)的;nginx 是把真实 IP 追加在**末尾**。且没有 `app.set('trust proxy')` |
| 9 | 认证接口是空的 | 前端 `api/index.js:11` 已经在读 `localStorage.token` 并带 `Bearer`,但**后端没有任何地方签发或校验它** —— 接缝留好了,线没接 |

### 结构级(不急,但会拖后腿)

- 文章/分类/标签全是 `mock.js` 里的 JS 字面量;`categories`(`mock.js:418`)带**硬编码的 `count`**,加了文章就会对不上
- 文章正文是原始 HTML 字符串,不是 Markdown
- 没有备份:没有任何 cron,Postgres 和数据目录都没有备份
- `certbot` 是 `1.22.0-1.el8`,2021 年 12 月的包
- `404.html`/`50x.html` 还是 nginx 自带样式(2024-11-20),出错时是 nginx 默认页

### 资源现状(决定了后面的选型)

```
内存  1870 MB 总 / 1085 MB 已用 / 785 MB 可用
Swap  0 —— 完全没有
磁盘  40 GB 总 / 11 GB 已用(28%)
Node  v18.17.0 @ /usr/local/nodejs/bin/node
PM2   v7.0.3,由 pm2-root.service 跑 /root/.pm2/dump.pm2
```

两个关键点:
1. **没有 swap。** 1870MB 的机器一点缓冲都没有,任何内存尖峰直接 OOM 杀进程。
2. **Postgres 是 `inactive` 的** —— 装了但**没启动**,0 个进程、0 KB 内存。所以它不是「已经占了内存不如用它」,而是「要用就得先付 ~200MB 内存,而可用只有 785MB」。

---

## 三、分阶段方案

设计原则:**每一阶段独立可上线、可回滚,做完就能看到效果**,不用等全部做完。

### Phase 0 —— 止血(纯运维,不写新功能,一次做完)

目标:线上内容对、站点不脆。全程约 20 分钟。

1. `pm2 restart <app>` → 5 篇真文章上线;`/api/stats`、`/api/track` 恢复 200
2. `pm2 save` → 把当前进程表写进 `dump.pm2`,避免下次重启又回到旧代码
3. 新增 `server/ecosystem.config.js`,以后部署固定成 `pm2 restart blog-api --update-env` 一条命令
4. `systemctl start certbot-renew.timer`(续期演练已实测通过,启动即可)
5. **加 2GB swapfile** —— 这台机器现在一点 swap 都没有
6. 收紧 `pg_hba.conf` 到 `127.0.0.1/32`;**或者**如果不打算用 Postgres 就直接 `systemctl disable --now postgresql`
7. 修 `index.js:64`:改用 nginx 给的 `X-Real-IP`,并加 `app.set('trust proxy', 1)`
8. 打开 `firewalld`,只放 22 / 80 / 443

验收:`curl https://lmfnode.top/api/posts | grep 首屏` 有输出;`/api/stats` 返回 200。

### Phase 1 —— 评论真起来(持久化 + 防滥用)

这是你最开始问的那件事,也是最小的一步。

1. 引入 SQLite,库文件放 `server/data/blog.db`,建 `comments` 表
2. 把评论的读写换成 DB,**接口路径和返回结构不变** → 前端一行都不用动
3. 补上 `POST /api/comments` 的限流(`windowMs`/`max` 复用 `chatLimiter` 的写法)和长度上限(昵称 ≤ 40、正文 ≤ 2000),去空白、拒空
4. PV/UV 也落库(`stats` 表 + `uv_daily` 表),重启不再归零
5. CORS 从 `*` 收紧到白名单:`https://lmfnode.top` + 本地 `http://localhost:3000`

验收:发一条评论 → `pm2 restart` → 评论还在。

### Phase 2 —— 文章落库 + 管理端 API(先不做界面)

1. 建表:`posts`(含 `status` draft/published、`slug`、`updated_at`)、`categories`、`tags`、`post_tags`
2. 写一个一次性迁移脚本,把 `mock.js` 里那 5 篇读出来插进库(正文先原样存 HTML,Phase 4 再谈 Markdown)
3. **公开读接口保持一模一样的返回结构** → 前端继续不动
4. 管理端 API:`POST /api/admin/login` 签发 JWT,加 `authRequired` 中间件,再挂 `/api/admin/posts` 的增删改、`/api/admin/comments` 的列表/删除
5. 登录接口单独强限流(防爆破);加 `helmet`
6. 单管理员,不做用户表:密码 bcrypt 哈希 + `JWT_SECRET` 都放 `.env`

验收:`curl` 建一篇草稿 → 公开列表里看不到 → 发布 → 出现了。

### Phase 3 —— 后台界面

1. `/admin` 路由:登录页、文章列表、编辑器、评论管理。用一套独立的轻布局,不套公开站的报头
2. 编辑器先做**左侧 textarea + 右侧实时预览**,不上的重编辑器库
3. 分类/标签从接口拉,支持新增
4. 路由守卫读 token,401 回登录页 —— 前端 `api/index.js:11` 的拦截器已经在带 `Bearer`,这里只要把 token 存进去

验收:浏览器里发一篇文章,首页立刻能看到。

### Phase 4 —— 内容管线(Markdown)

1. 库表加 `format` 列(`html` / `md`),读取时渲染。**老文章标 `html` 原样输出,新文章走 `md`** —— 不做全文迁移,零风险
2. 服务端用 `markdown-it`;它和 `jsonwebtoken`、`bcryptjs` 一样是纯 JS,**在 2GB 的机器上不需要编译**,这点很重要
3. 确认正文里的 `h2`「一、问题:…」序号提取(`PostDetail.vue` 的 `withSectionNumbers`)在 Markdown 渲染后依然成立
4. 图片上传单独评估:本地存盘要防路径穿越和 content-type 伪造,**建议直接传 OSS**,别落在服务器磁盘

### Phase 5 —— 运维收尾

1. 备份:SQLite 用 `.backup` 或直接拷文件,配 cron 轮转(可同步一份到 OSS)
2. 监控:至少有个进程/端口存活检查
3. 换掉 nginx 默认的 `404.html` / `50x.html`
4. 视情况升 `certbot`(1.22.0 太老)和 Node

---

## 四、需要你拍板的三个选择

### 1. 存储用 SQLite 还是 Postgres?

**建议 SQLite。** 理由:
- **Postgres 是停着的**,启用它要先付约 200MB 内存,而可用只剩 785MB、还没有 swap
- 单人写、数据量极小,SQLite 完全够,而且是**单文件**,备份就是拷一个文件
- 唯一风险是 `better-sqlite3` 是原生模块,需要预编译二进制(走 npmmirror 镜像即可)。万一编译回落,2GB 无 swap 的机器上 `cc1plus` 有 OOM 风险

**如果编译这一步折腾:** 退路是用你已经装好的 Postgres 15 —— 纯 JS 的 `pg` 驱动、零编译风险,代价就是那 200MB 内存和启动一个常驻服务。两条路都成立,选哪条都不算错。

### 2. 到底要不要做后台管理界面?

坦白说,**Phase 2+3 占了整个工程量的 80%,而且大部分是琐碎的活**(登录态、表单、校验、上传),不是难活。

另一条路是 **Git 流程**:文章就是仓库里的 Markdown 文件,发布 = `git push`,服务器拉取后重新构建。好处是几乎不用写代码、不需要 DB、不需要认证面(认证面是要长期养的)、文章天然有版本历史。代价是不能在手机浏览器上发文。

如果你的诉求是「能随时在浏览器里写」,那就做 CMS,方案按上面走。如果「一个月发一两篇、都在电脑上写」,Git 流程能省掉一大半工作。**这个决定会影响后面所有阶段,建议先定。**

### 3. 老文章转不转 Markdown?

建议**不转**。用 `format` 列让新旧共存,新文章用 Markdown,老的 5 篇 HTML 原样留着。转 Markdown 是纯消耗、还有搞坏正文的风险,收益只有「格式统一」这一个洁癖价值。

---

## 五、可以马上做的

Phase 0 全是运维动作,**不碰业务代码**,而且是唯一一件「现在不做、线上就一直给访客看张三文章」的事。你要的话我现在就按 Phase 0 清单执行,逐条给你回结果。

其中第 1 条(`pm2 restart`)单独就能把真文章放出来。
