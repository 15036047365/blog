# 前端面试题整理（全面版）

> **怎么用**：每题给出「考点 + 参考答案要点」，答案是**面试能直接口述的要点版**，不是长篇教程。
> 建议先自己答一遍，再看要点对照补漏。标 ⭐ 的是高频必会题。
> 覆盖范围：HTML/CSS、JavaScript、ES6+、浏览器与网络、性能优化、工程化、Vue 3、React、手写代码、场景题、项目与 HR。

## 目录

1. [HTML & CSS](#一html--css)
2. [JavaScript 核心](#二javascript-核心)
3. [ES6+ 与现代语法](#三es6-与现代语法)
4. [浏览器原理与网络](#四浏览器原理与网络)
5. [性能优化](#五性能优化)
6. [前端工程化](#六前端工程化)
7. [Vue 3 专项](#七vue-3-专项)
8. [React 专项](#八react-专项)
9. [手写代码题](#九手写代码题)
10. [场景与开放设计题](#十场景与开放设计题)
11. [项目与 HR 面](#十一项目与-hr-面)
12. [面试前速查清单](#十二面试前速查清单)

---

## 一、HTML & CSS

### 1.1 ⭐ 语义化标签的意义？

- **对机器**：利于 SEO 抓取、屏幕阅读器等无障碍设备理解结构。
- **对人**：代码可读性、可维护性更好。
- **实践**：`header/nav/main/article/section/aside/footer` 布局，标题按 `h1~h6` 层级递进，按钮用 `button` 而非 `div`。
- 追问：`div` 与 `section` 区别？`section` 应有独立主题（通常含标题），纯样式容器用 `div`。

### 1.2 ⭐ 盒模型与 `box-sizing`

- 标准盒模型：`width` 只含 content；IE 盒模型（`border-box`）：`width` = content + padding + border。
- `box-sizing: border-box` 让尺寸计算更符合直觉，也是现代项目的常见全局设置。
- 获取宽高：`offsetWidth/offsetHeight`（含 border、取整）、`clientWidth/clientHeight`（含 padding 不含 border）、`getBoundingClientRect()`（含小数、含 transform 结果）。

### 1.3 ⭐ 水平垂直居中的几种方案

```css
/* 1. flex（最常用） */
.parent { display: flex; justify-content: center; align-items: center; }
/* 2. grid */
.parent { display: grid; place-items: center; }
/* 3. 绝对定位 + transform */
.child  { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
/* 4. 绝对定位 + margin:auto */
.child  { position: absolute; inset: 0; margin: auto; width: 100px; height: 100px; }
/* 5. 单行文字 */
.parent { line-height: 100px; text-align: center; }
```
- 注意：`transform` 方案不需要知道子元素尺寸；`margin:auto` 方案需要定宽高。

### 1.4 ⭐ BFC 是什么？怎么触发？有什么用？

- **BFC（块级格式化上下文）**：一块独立渲染区域，内部布局不影响外部。
- **触发**：`overflow` 非 `visible`、`display: flow-root`（最推荐，无副作用）、`float` 非 `none`、`position: absolute/fixed`、`display: inline-block/table-cell/flex/grid` 等。
- **作用**：① 清除浮动（父元素高度塌陷）；② 阻止 margin 重叠（垂直外边距合并）；③ 阻止元素被浮动元素覆盖（两栏自适应布局）。

### 1.5 ⭐ `margin` 塌陷（外边距合并）的规则

- 相邻兄弟：取两者较大值。
- 父子：父无 border/padding 且未触发 BFC 时，子元素上 margin 会"带给"父元素。
- 空元素自身上下 margin 合并。
- 解决：触发 BFC（`flow-root`）、加 padding/border、用 flex/grid 布局。

### 1.6 ⭐ CSS 选择器优先级

- 计算顺序：`!important` > 内联样式 > ID > class/属性/伪类 > 标签/伪元素 > 通配符/继承。
- 权重记法 `(a,b,c)`：ID 个数、class/属性/伪类个数、标签/伪元素个数。
- 同级后写的覆盖先写的；`!important` 是最后手段，别滥用。

### 1.7 哪些属性会触发重排（reflow）与重绘（repaint）？

- **重排**：几何属性变化 —— `width/height/margin/padding/border/font-size/display/position/top/left`、增删 DOM、读取 `offsetTop/clientWidth` 等会强制刷新。
- **重绘**：只改外观 —— `color/background/visibility/border-color`。
- **只合成**（性能最好）：`transform`、`opacity`、`filter`，走 GPU 合成层，不重排不重绘。

### 1.8 ⭐ `display: none` / `visibility: hidden` / `opacity: 0`

| 属性 | 占位 | 可点击 | 事件绑定 | 触发重排 |
|---|---|---|---|---|
| `display:none` | 否 | 否 | 否 | 是 |
| `visibility:hidden` | 是 | 否 | 否 | 否（重绘） |
| `opacity:0` | 是 | **是** | 是 | 否（合成） |

### 1.9 伪类与伪元素的区别

- 伪类 `:` 描述**状态**：`:hover/:focus/:nth-child/:not()`。
- 伪元素 `::` 创造**不存在于 DOM 的元素**：`::before/::after/::placeholder/::selection`。
- `::before/::after` 必须配合 `content` 才生效。

### 1.10 ⭐ Flex 布局的常用属性

- **容器**：`flex-direction`、`justify-content`（主轴）、`align-items`（交叉轴）、`flex-wrap`、`align-content`（多行交叉轴）、`gap`。
- **项目**：`flex: grow shrink basis`（默认 `0 1 auto`）、`align-self`、`order`。
- `flex: 1` = `1 1 0%`：可放大可缩小、基准为 0，是等分布局的常用写法。
- 追问：`flex:1` 与 `flex:auto` 区别？后者基准是 `auto`（内容宽度），会先按内容占位再分配剩余空间。

### 1.11 ⭐ Grid 与 Flex 的适用场景

- **Flex**：一维（一行或一列）排布，适合导航、卡片列表、居中。
- **Grid**：二维（行列同时控制），适合整体页面骨架、仪表盘、复杂卡片矩阵。
- 经典组合：外层 Grid 搭页面骨架，内部 Flex 排列组件。

### 1.12 ⭐ 移动端适配方案

1. **viewport + rem**：`<meta name="viewport" content="width=device-width,initial-scale=1">`，按设计稿比例设置 `html` 的 `font-size`（可用 `lib-flexible` 或手写）。
2. **vw/vh**：直接按视口百分比，配合 `postcss-px-to-viewport` 自动换算。
3. **媒体查询**：断点式响应，适合 PC 与移动差异大的站点。
4. **现代方案**：`clamp()` + `min()/max()` + 容器查询 `@container`。
- 补充：1px 边框问题用 `transform: scaleY(0.5)` 或 `box-shadow` 模拟；点击延迟用 `touch-action` / `fastclick`（现代浏览器已基本消除 300ms 延迟）。

### 1.13 `z-index` 失效的常见原因

- 元素未脱离文档流（`position` 为 `static`）时 `z-index` 无效（flex/grid 子项除外）。
- 父级形成了**层叠上下文**（`opacity < 1`、`transform`、`filter`、`will-change` 等），子元素再大的 `z-index` 也超不出父级层叠上下文。
- 排查思路：逐层向上找形成层叠上下文的祖先。

### 1.14 CSS 预处理器与原子化 CSS 的取舍

- **Sass/Less**：嵌套、变量、mixin、函数，适合有设计体系的中大型项目；缺点是产物可能冗余。
- **Tailwind 等原子化**：无命名负担、样式不会无限膨胀、天然避免样式冲突；缺点是模板类名长、有学习成本。
- 实际项目常混用：Tailwind 做布局与原子样式，少量自定义 CSS 处理复杂动画。

### 1.15 ⭐ 你了解哪些 CSS 新特性？

- 布局：`flex`、`grid`、`subgrid`、容器查询 `@container`、`gap`。
- 响应式与单位：`clamp()`、`min()/max()`、`dvh/svh`、`cqw`。
- 选择器：`:is()`、`:where()`（权重为 0）、`:has()`（父选择器）、`:nth-child(An+B of S)`。
- 变量与作用域：CSS 变量 + `@layer` 管理层叠优先级。
- 颜色与效果：`color-mix()`、`oklch()`、`backdrop-filter`、`aspect-ratio`、`scroll-snap`、`accent-color`。
- 动画：`@scroll-timeline`、`view-transition`（跨页面过渡）。

---

## 二、JavaScript 核心

### 2.1 ⭐ 数据类型有哪些？如何准确判断类型？

- **原始类型（7 种）**：`string`、`number`、`boolean`、`undefined`、`null`、`symbol`、`bigint`。
- **引用类型**：`object`（含 `Array`、`Function`、`Date`、`RegExp`、`Map`、`Set` 等）。
- **判断方式**：

```js
typeof 1            // 'number'（typeof null === 'object' 是历史遗留 bug）
Array.isArray([])   // true —— 判断数组首选
Object.prototype.toString.call(v)  // '[object Array]' —— 最通用的类型判断
v instanceof Foo    // 基于原型链，跨 iframe 会失效
```

### 2.2 ⭐ `==` 与 `===` 的区别？隐式转换规则？

- `===` 严格相等：类型不同直接 `false`（`NaN !== NaN`，用 `Object.is` 可区分 `NaN` 与 `-0`）。
- `==` 会做类型转换，核心规则：
  - `null == undefined` 为 `true`，且二者与其他值比较均为 `false`。
  - 数字与字符串：字符串转数字。
  - 布尔值先转数字。
  - 对象与原始值：对象走 `ToPrimitive`（先 `valueOf` 再 `toString`）。
- 面试常考：`[] == false` → `true`；`{} == true` → `false`。

### 2.3 ⭐ `null` 与 `undefined` 的区别

- `undefined`：已声明未赋值、函数无返回值、访问不存在属性；是原始类型，`typeof` 为 `'undefined'`。
- `null`：**人为**表示"空对象指针"，`typeof` 为 `'object'`；`JSON.stringify(null)` 保留，`undefined` 会被忽略。
- 默认参数只在 `undefined` 时生效，传 `null` 不会。

### 2.4 ⭐ 变量提升与暂时性死区（TDZ）

- `var`：声明提升到作用域顶部，初始化为 `undefined`。
- `let/const`：**也提升**，但处于 TDZ，声明前访问抛 `ReferenceError`。
- 函数声明整体提升（可在定义前调用）；函数表达式不提升。
- 面试陷阱：`for` 循环中 `var` 与 `let` 的输出差异。

### 2.5 ⭐ 作用域链与词法作用域

- JS 采用**词法作用域**：作用域在**定义时**确定，而非调用时。
- 查找变量时沿作用域链逐级向上，直到全局；找不到则 `ReferenceError`（赋值未声明变量在非严格模式会创建全局变量）。

### 2.6 ⭐⭐ 闭包是什么？有什么用？会有什么问题？

- **定义**：函数能访问其定义时所在词法作用域中的变量，即使该函数在作用域外执行。
- **用途**：① 封装私有变量；② 保存状态（计数器、防抖节流、缓存）；③ 柯里化 / 偏函数；④ 模块化（IIFE）。
- **风险**：被引用的变量无法回收，滥用会内存泄漏；解决是及时置 `null`、避免在循环里无意义创建。
- 经典题：

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2
```

### 2.7 ⭐⭐ `this` 的指向规则

优先级从高到低：

1. `new` 调用：指向新创建的对象。
2. 显式绑定：`call/apply/bind` 指定的对象。
3. 隐式绑定：`obj.fn()` 指向 `obj`（注意赋值后再调用会丢失）。
4. 默认绑定：非严格模式指向 `globalThis`，严格模式为 `undefined`。
- **箭头函数没有自己的 `this`**，取定义时外层作用域，且不能被 `call/apply/bind` 改变。
- 面试陷阱：`setTimeout(obj.fn)` 会丢失 `this`。

### 2.8 `call`、`apply`、`bind` 的区别

- `call(thisArg, a, b)`：立即执行，参数逐个传。
- `apply(thisArg, [a, b])`：立即执行，参数用数组传。
- `bind(thisArg, a)`：**返回新函数**，不立即执行，支持柯里化；`bind` 过的函数再 `bind` 无效。
- 手写实现见 [9.1](#91--手写-callapplybind)。

### 2.9 ⭐ 原型、原型链、`__proto__` 与 `prototype`

- 每个对象有内部属性 `[[Prototype]]`（浏览器暴露为 `__proto__`）；**函数**才有 `prototype`，其 `constructor` 指回函数本身。
- `new Foo()` 创建的对象 `__proto__` 指向 `Foo.prototype`。
- 属性查找沿原型链直到 `Object.prototype`，再到 `null`。
- 原型链顶端是 `Object.prototype.__proto__ === null`。
- 判断：`Foo.prototype.isPrototypeOf(obj)`、`Object.getPrototypeOf(obj)`。

### 2.10 ⭐ `new` 操作符做了什么？

```js
function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype);   // 1. 创建对象，原型指向 Fn.prototype
  const ret = Fn.apply(obj, args);           // 2. 绑定 this 执行构造函数
  return ret instanceof Object ? ret : obj;  // 3. 构造函数返回引用类型则用它，否则返回新对象
}
```

### 2.11 ⭐ 继承的几种实现方式

1. **原型链继承**：`Child.prototype = new Parent()` —— 引用属性被共享。
2. **构造函数继承**：在子类中 `Parent.call(this)` —— 无法继承原型方法。
3. **组合继承**：上面两者结合 —— 父类构造函数被调用两次。
4. **寄生组合继承（最优，ES5 常用）**：

```js
function Child() { Parent.call(this); }
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

5. **`class extends`（ES6）**：语法糖，基于寄生组合 + `super`；注意 `class` 不会提升、必须 `new` 调用、内部默认严格模式。

### 2.12 ⭐ 深拷贝与浅拷贝

- **浅拷贝**：`Object.assign({}, obj)`、`{...obj}`、`arr.slice()`、`arr.concat()` —— 只复制第一层，嵌套对象仍共享引用。
- **深拷贝**：
  - `structuredClone(obj)`（现代浏览器原生，支持 `Map/Set/Date`，不支持函数）。
  - `JSON.parse(JSON.stringify(obj))` —— 简单但有坑：丢失 `undefined`、函数、`Symbol`，`Date` 变字符串，`RegExp` 变空对象，循环引用报错。
  - 手写递归（见 [9.3](#93--手写深拷贝)）：处理循环引用用 `WeakMap`，区分数组与对象，保留 `Date/RegExp/Map/Set`。
- `Object.freeze` 是**浅冻结**，嵌套对象仍可改。

### 2.13 ⭐ 判断数组的方法有哪些？各自局限？

- `Array.isArray()` —— **首选**，能识别跨 iframe 的数组。
- `instanceof Array` —— 跨 realm（iframe）失效。
- `Object.prototype.toString.call(arr) === '[object Array]'` —— 通用可靠。
- `arr.constructor === Array` —— 原型可被改写，不可靠。

### 2.14 数组常用方法分类

- **改变原数组**：`push/pop/shift/unshift/splice/sort/reverse/fill/copyWithin`。
- **不改变原数组**：`slice/concat/map/filter/reduce/flat/flatMap/join/indexOf/find/findIndex/some/every/includes/at`。
- `sort` 默认按字符串比较，数字排序要传 `(a, b) => a - b`。
- `splice` 是"万能增删改"，注意它会改原数组。
- `forEach` 无法 `break`，中途跳出用 `for...of` 或 `some/every`。

### 2.15 ⭐ 类数组与数组的转换

- 类数组：有 `length` 和索引，但没有数组方法（如 `arguments`、`NodeList`、`HTMLCollection`）。
- 转换：`Array.from(list)`（可带 mapFn）、`[...list]`（需要可迭代，`arguments` 可，`HTMLCollection` 视实现而定）。

### 2.16 ⭐ `Map`/`Set` 与 `Object`/`Array` 的区别

- `Map`：键可为任意类型、有序、`size` 属性、迭代友好，频繁增删性能更好。
- `Object`：键只能是字符串/Symbol，有原型链干扰，需 `Object.keys` 取长度。
- `Set`：值唯一，天然去重 `[...new Set(arr)]`；`WeakSet/WeakMap` 键必须是对象且是弱引用，不阻止 GC，适合做私有数据或 DOM 关联缓存。

### 2.17 事件流：捕获、目标、冒泡

- 三个阶段：捕获（从 `window` 向下）→ 目标 → 冒泡（向上）。
- `addEventListener(type, fn, options)`：`capture`、`once`、`passive`（提升滚动性能）。
- `stopPropagation()` 阻止继续传播；`stopImmediatePropagation()` 还会阻止同元素其他监听器；`preventDefault()` 阻止默认行为（两者无关）。
- **事件委托**：把监听器挂在父元素，利用冒泡统一处理，减少监听器数量，支持动态元素。判断目标用 `e.target.closest('li')`。

### 2.18 事件循环（Event Loop）⭐⭐

- **组成**：调用栈、任务队列（宏任务）、微任务队列。
- **宏任务**：`script` 整体、`setTimeout/setInterval`、`setImmediate`(Node)、I/O、UI 渲染。
- **微任务**：`Promise.then/catch/finally`、`queueMicrotask`、`MutationObserver`、`process.nextTick`(Node，优先级最高)。
- **执行顺序**：执行同步代码 → 清空**所有**微任务 → （浏览器可能渲染）→ 取**一个**宏任务 → 再清空微任务 → 循环。
- 因此每个宏任务之间，微任务队列一定被清空。

```js
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1 4 3 2
```

### 2.19 ⭐ Promise 是什么？有哪些状态和实例方法？

- 三种状态：`pending` → `fulfilled` / `rejected`，**状态一旦改变不可逆**。
- 实例方法：`then`、`catch`、`finally`；`then` 返回新 Promise，支持链式调用与值穿透。
- 静态方法：
  - `Promise.all`：全部成功才成功，一个失败立即失败（**快速失败**）。
  - `Promise.allSettled`：等全部结束，返回每个结果的状态，**不会失败**。
  - `Promise.race`：第一个 settled 的结果决定。
  - `Promise.any`：第一个成功即成功，全失败抛 `AggregateError`。
  - `Promise.resolve/reject`。
- 手写 Promise 见 [9.4](#94--手写-promise简版)。

### 2.20 ⭐ `async/await` 与 Promise 的关系

- `async` 函数返回 Promise；`await` 等待 Promise settle，本质是 `then` 的语法糖（generator + 自动执行器的实现）。
- 错误处理用 `try/catch`；`await` 后面的 `reject` 会作为异常抛出。
- **性能陷阱**：多个无依赖的异步请求串行 `await` 会变慢，应改 `Promise.all` 并发。
- 想在循环里串行执行用 `for...of` + `await`；`forEach` 里 `await` **不会等待**。

### 2.21 ⭐ 宏任务与微任务的实际影响（渲染时机）

- 微任务里改 DOM，浏览器会在本轮渲染前一次性应用，不会闪烁。
- `setTimeout(fn, 0)` 实际最小延迟约 4ms，且受前面任务阻塞影响，不适合做精确调度；需要下一帧执行用 `requestAnimationFrame`。

### 2.22 ⭐ 垃圾回收与内存泄漏

- **策略**：标记-清除为主，引用计数（会因循环引用失效，现代引擎已不用）。
- **常见泄漏**：未清除的定时器、未解绑的事件监听、闭包持有大对象、全局变量挂载、脱离 DOM 但仍被 JS 引用的节点、`Map` 强引用缓存。
- **排查**：Chrome DevTools Memory 面板对比快照（Heap Snapshot）、Performance 录制看内存曲线是否持续上升。

### 2.23 ⭐ 严格模式的作用

- 开启：`'use strict'` 或 ES Module / class 内默认严格。
- 变化：未声明变量赋值报错、`this` 默认 `undefined`、禁止删除变量、禁止重复参数名、`arguments` 不与参数自动同步、`eval` 有独立作用域。

### 2.24 ⭐ 错误处理与 `try/catch` 的注意点

- `try/catch` 只能捕获**同步**错误；异步错误要在回调/Promise 内处理，或用 `window.onerror`、`unhandledrejection` 兜底。
- `finally` 一定会执行，且其中 `return` 会覆盖 `try` 的返回值。
- 生产环境用 `window.addEventListener('error')` + `unhandledrejection` + Sentry 之类的监控上报。

---

## 三、ES6+ 与现代语法

### 3.1 ⭐ `var` / `let` / `const` 的区别

| 维度 | `var` | `let` | `const` |
|---|---|---|---|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 提升 | 提升并初始化 `undefined` | 提升但有 TDZ | 提升但有 TDZ |
| 重复声明 | 允许 | 报错 | 报错 |
| 挂载全局对象 | 是（浏览器中） | 否 | 否 |
| 重新赋值 | 可 | 可 | 不可（对象属性仍可改） |

- `const` 保证的是**绑定不可变**，不是值不可变；要真正冻结用 `Object.freeze`（浅冻结）。

### 3.2 ⭐ 箭头函数与普通函数的区别

1. 没有自己的 `this`，取定义时外层（且无法被 `call/apply/bind` 改变）。
2. 没有 `arguments`（用剩余参数 `...args`），也没有 `super`、`new.target`。
3. 不能作为构造函数，不能用 `new` 调用（无 `prototype`）。
4. 不能用作 generator（不能 `yield`）。
- 适用：回调、需要保持外层 `this` 的场景。不适用：对象方法、需要动态 `this` 的场景。

### 3.3 ⭐ 解构赋值与默认值

```js
const { a = 1, b: { c } = {}, ...rest } = obj;   // 嵌套 + 重命名 + 默认值 + 剩余
const [x, , y = 2, ...others] = arr;             // 数组按位置，可跳过
```
- 默认值只在值为 `undefined` 时生效（`null` 不生效）。
- 交换变量：`[a, b] = [b, a]`。

### 3.4 展开运算符与剩余参数的用途

- **展开**：浅拷贝、合并、把数组转成参数、替代 `apply`。
- **剩余参数**：收集不定参数为真数组（区别于 `arguments` 是类数组）。
- 对象展开是浅拷贝，且后面的键覆盖前面的。

### 3.5 ⭐ `Symbol` 的作用

- 创建独一无二的值，用作对象属性名可避免命名冲突：`Symbol('desc')`。
- `Symbol.for('key')` 走全局注册表，可跨模块取得同一个 Symbol。
- 常用于定义"内部属性"、知名符号（`Symbol.iterator`、`Symbol.toPrimitive`）。
- 特点：`for...in`、`Object.keys` 不会遍历到 Symbol 键，需用 `Object.getOwnPropertySymbols`。

### 3.6 ⭐ 迭代器与 `for...of`

- **可迭代协议**：对象有 `[Symbol.iterator]()` 返回带 `next()` 的迭代器，`next()` 返回 `{ value, done }`。
- 内置可迭代：`Array`、`String`、`Map`、`Set`、`arguments`、`NodeList`、generator 对象。
- `for...of` 遍历**值**，支持 `break/continue/return`；`for...in` 遍历**可枚举键**（含原型链上的，通常需 `hasOwnProperty` 过滤）。
- 普通对象不可迭代，要遍历用 `Object.keys/values/entries`。

### 3.7 ⭐ Generator 与 `yield`

- `function*` 定义，调用返回迭代器，`yield` 暂停并产出值，`next(v)` 传入的值成为上一个 `yield` 的返回值。
- 用途：惰性求值、无限序列、异步流程控制（`async/await` 的前身）、`redux-saga`。
- `yield*` 委托给另一个可迭代对象。

### 3.8 ⭐ `Proxy` 与 `Reflect`

- `Proxy` 拦截对象操作（`get/set/has/deleteProperty/apply/construct` 等 13 种），是实现响应式的核心（Vue 3 用它替代 `Object.defineProperty`）。
- 优势：可拦截新增/删除属性、数组索引、`in`、函数调用；`Object.defineProperty` 只能劫持已有属性。
- `Reflect` 提供对应的默认行为，配合使用可保持语义正确：`Reflect.set(target, key, value, receiver)`。

### 3.9 ⭐ 可选链与空值合并

```js
obj?.a?.b          // 中途 null/undefined 就短路返回 undefined，不报错
fn?.()             // 函数存在才调用
obj?.[key]         // 动态键
a ?? b             // 仅当 a 为 null/undefined 才取 b（与 || 不同，0 和 '' 会被保留）
a ??= b            // 空值赋值
```
- 注意：`??` 不能与 `&&`/`||` 混用而不加括号（语法错误）。

### 3.10 ⭐ ES Module 与 CommonJS 的区别

| 维度 | ESM | CJS |
|---|---|---|
| 语法 | `import/export` | `require/module.exports` |
| 加载时机 | 编译时静态分析、可 tree-shaking | 运行时加载 |
| 值传递 | **值引用（live binding）**，导出变化会同步 | 值拷贝（导出后修改不影响已引入的值） |
| `this` | `undefined` | `module.exports` |
| 加载方式 | 异步（浏览器） | 同步 |
| 循环依赖 | 靠提升与 live binding 部分可用 | 可能拿到未完成的 `exports` |

- ESM 中 `import` 会提升到顶部执行；CJS 的 `require` 结果会被缓存。
- `export default` 导出的是值，`export const` 导出的是绑定。

### 3.11 其他常用新特性

- `Array.prototype.at()`、`flat/flatMap`、`Object.fromEntries`、`structuredClone`。
- 顶层 `await`（ESM）、`String.replaceAll`、`Array.prototype.findLast`。
- `?.` + `??` + `Object.hasOwn`（替代 `hasOwnProperty`）。
- `Intl` 系列 API 做本地化格式化（日期、货币、相对时间）。

---

## 四、浏览器原理与网络

### 4.1 ⭐⭐ 从输入 URL 到页面展示发生了什么？

1. **URL 解析**：判断是搜索词还是地址，补全协议。
2. **缓存检查**：浏览器缓存 → Service Worker → 内存/磁盘缓存。
3. **DNS 解析**：浏览器 DNS 缓存 → 系统 hosts → 本地 DNS 服务器 → 根/顶级/权威域名服务器，得到 IP。
4. **建立连接**：TCP 三次握手；HTTPS 还要 TLS 握手；HTTP/3 走 QUIC(UDP)。
5. **发送请求**：构造请求行/头/体，可能带 `Cookie`。
6. **服务器处理**：负载均衡 → 应用服务 → 返回响应。
7. **浏览器渲染**：解析 HTML 构建 DOM → 解析 CSS 构建 CSSOM → 合成渲染树 → 布局（Layout）→ 绘制（Paint）→ 合成（Composite）。
8. **加载子资源**：图片、字体、JS 等继续请求，触发 `DOMContentLoaded` 与 `load`。

### 4.2 ⭐ 浏览器的渲染流程（重点）

- **DOM 树**：HTML 解析时遇到 `<script>` 会阻塞解析（除非 `defer/async`）。
- **CSSOM**：CSS 阻塞渲染（不阻塞 DOM 解析），因为渲染树需要样式。
- **渲染树**：只包含可见节点（`display:none` 不进），`::before` 等伪元素会进。
- **布局/回流**：计算每个节点的几何位置。
- **绘制**：生成绘制指令，分图层。
- **合成**：GPU 把图层合成最终画面；`transform/opacity` 只走这一步。

### 4.3 ⭐⭐ `defer` 与 `async` 的区别

| 属性 | 下载 | 执行时机 | 顺序 |
|---|---|---|---|
| 无 | 阻塞解析 | 下载完立即执行 | 顺序 |
| `async` | 并行、不阻塞 | 下载完立即执行（可能打断解析） | 不保证 |
| `defer` | 并行、不阻塞 | HTML 解析完、`DOMContentLoaded` 前 | 保证顺序 |

- 有依赖关系的脚本用 `defer`；独立统计脚本用 `async`。
- 现代实践：用 `type="module"`（默认 defer 行为）。

### 4.4 ⭐⭐ HTTP 缓存机制

- **强缓存**：不发请求，直接读缓存。
  - `Expires`（HTTP/1.0，绝对时间，受本地时间影响）。
  - `Cache-Control`（HTTP/1.1，优先级更高）：`max-age`、`s-maxage`、`no-cache`（可缓存但每次校验）、`no-store`（完全不缓存）、`public/private`、`immutable`。
- **协商缓存**：发请求带校验字段，命中返回 **304**（无响应体）。
  - `Last-Modified` ↔ `If-Modified-Since`（秒级精度，文件内容没变但时间变了会误判）。
  - `ETag` ↔ `If-None-Match`（内容哈希，更精确，优先级更高）。
- **实践**：HTML 用 `no-cache` + ETag；带 hash 的静态资源用 `max-age=31536000, immutable`。
- **刷新行为**：地址栏回车走强缓存；F5 会让强缓存失效走协商；Ctrl+F5 全部跳过。

### 4.5 ⭐ HTTP/1.1、HTTP/2、HTTP/3 的演进

- **1.1**：持久连接（keep-alive）、管线化（实际未普及）；存在**队头阻塞**（同一连接上一个请求未返回会阻塞后续）；浏览器对同域并发约 6 个连接。
- **2.0**：二进制分帧、多路复用（一个连接并行多个流，解决应用层队头阻塞）、头部压缩（HPACK）、服务端推送；仍有 **TCP 层队头阻塞**（丢包影响所有流）。
- **3.0**：基于 QUIC（UDP），0-RTT/1-RTT 建连、连接迁移（切网不断线），彻底解决 TCP 队头阻塞。

### 4.6 ⭐ HTTPS 握手过程（简化）

1. 客户端发 `Client Hello`（支持的 TLS 版本、密码套件、随机数）。
2. 服务端回 `Server Hello` + 证书（含公钥）+ 随机数。
3. 客户端验证证书链（是否可信 CA 签发、是否过期、域名是否匹配），生成 pre-master secret 用公钥加密发送。
4. 双方用三个随机数派生出会话密钥（对称加密）。
5. 后续通信用对称加密传输。
- 要点：**非对称加密用于协商密钥，对称加密用于传输数据**。TLS 1.3 把握手压缩到 1-RTT（甚至 0-RTT）。

### 4.7 ⭐⭐ 跨域是什么？怎么解决？

- **同源策略**：协议 + 域名 + 端口三者完全相同才是同源；限制的是**读取**响应，不是发送请求。
- **解决方式**：
  1. **CORS**（推荐）：服务端设置 `Access-Control-Allow-Origin` 等响应头。
  2. **反向代理**（开发用 Vite/webpack proxy，生产用 Nginx）：同源转发，浏览器无感知。
  3. **JSONP**：只支持 GET，靠 `<script>` 无跨域限制，已淘汰。
  4. `postMessage`（跨窗口/iframe）、`document.domain`（同主域，已废弃）。
- 补充：`<img>`、`<script>`、`<link>`、表单提交不受同源策略限制（但拿不到响应内容）。

### 4.8 ⭐ 简单请求与预检请求（OPTIONS）

- **简单请求**需同时满足：方法是 `GET/POST/HEAD`；头仅限 `Accept/Content-Type/...` 等安全头；`Content-Type` 仅为 `text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`。
- 不满足则先发 **OPTIONS 预检**，询问服务端是否允许，通过后才发真实请求。
- 预检结果可用 `Access-Control-Max-Age` 缓存，减少 OPTIONS 次数。
- 携带 Cookie 时：前端 `withCredentials = true`，服务端 `Access-Control-Allow-Credentials: true`，且 `Allow-Origin` **不能为 `*`**。

### 4.9 ⭐ 常见 HTTP 状态码

- **1xx**：`101` 协议切换（WebSocket）。
- **2xx**：`200` 成功、`201` 已创建、`204` 无内容、`206` 范围请求（断点续传/视频拖动）。
- **3xx**：`301` 永久重定向（会被缓存）、`302/307` 临时重定向、`304` 协商缓存命中。
- **4xx**：`400` 参数错误、`401` 未认证、`403` 无权限、`404` 不存在、`405` 方法不允许、`429` 请求过多。
- **5xx**：`500` 服务端错误、`502` 网关错误、`504` 网关超时。

### 4.10 ⭐ 常见请求头与响应头

- 请求：`Host`、`User-Agent`、`Accept`、`Accept-Encoding`、`Cookie`、`Authorization`、`Referer`、`Origin`、`If-None-Match`。
- 响应：`Content-Type`、`Content-Length`、`Content-Encoding`、`Cache-Control`、`ETag`、`Set-Cookie`、`Access-Control-*`、`Content-Security-Policy`。
- `Content-Type` 常见值：`application/json`、`application/x-www-form-urlencoded`、`multipart/form-data`（文件上传）。

### 4.11 ⭐ Cookie / LocalStorage / SessionStorage / IndexedDB

| 维度 | Cookie | LocalStorage | SessionStorage | IndexedDB |
|---|---|---|---|---|
| 容量 | ~4KB | ~5MB | ~5MB | 几十 MB ~ GB |
| 生命周期 | 可设置过期 | 永久（除非清除） | 关闭标签页即失效 | 永久 |
| 随请求发送 | **是** | 否 | 否 | 否 |
| 作用域 | 同源 + path/domain | 同源 | 同源 + 标签页 | 同源 |
| 线程 | 同步 | 同步 | 同步 | 异步 |
| 适合 | 会话标识 | 长期偏好 | 临时表单数据 | 大量结构化数据/离线 |

- Cookie 安全属性：`HttpOnly`（JS 不可读，防 XSS 窃取）、`Secure`（仅 HTTPS）、`SameSite=Lax/Strict/None`（防 CSRF）。

### 4.12 ⭐⭐ XSS 与 CSRF 的区别与防御

**XSS（跨站脚本）** —— 注入脚本在**用户浏览器执行**：
- 类型：存储型（存进数据库，危害最大）、反射型（URL 参数回显）、DOM 型（前端 JS 直接操作 `innerHTML`）。
- 防御：输出转义、富文本用 DOMPurify 白名单过滤、CSP 头限制脚本来源、`HttpOnly` 保护 Cookie。

**CSRF（跨站请求伪造）** —— 借用**用户已登录的凭证**发请求：
- 防御：`SameSite=Lax` Cookie、CSRF Token 校验、校验 `Origin/Referer`、敏感操作二次验证。
- 区别核心：XSS 是"偷数据/执行代码"，CSRF 是"冒用身份发请求"；XSS 能绕过 CSRF 防御。

### 4.13 ⭐ 前端路由的原理（hash 与 history）

- **hash**：`location.hash` 变化触发 `hashchange`，`#` 后内容不发往服务器，兼容性好。
- **history**：`pushState/replaceState` 改 URL 不发请求，配合 `popstate` 监听回退；**刷新会 404**，需服务端把所有路径 fallback 到 `index.html`。
- 单页应用首屏慢、SEO 弱，可用 SSR/SSG 缓解。

### 4.14 WebSocket 与轮询

- `WebSocket`：基于 TCP 的全双工长连接，握手用 HTTP `Upgrade: websocket`，服务端返回 `101`。适合实时聊天、协同编辑。
- 轮询：定时发请求，简单但浪费；长轮询（服务端 hold 住请求）减少空请求。
- `SSE`（Server-Sent Events）：单向服务端推送，基于 HTTP，自动重连，适合消息通知、进度推送。

### 4.15 ⭐ 输入 URL 后为什么要三次握手？两次行不行？

- 三次：`SYN` → `SYN+ACK` → `ACK`，双方都确认了"自己的发送能力和对方的接收能力"。
- 两次不行：服务端无法确认客户端收到了自己的 `SYN+ACK`，且历史延迟的 `SYN` 可能造成无效连接。
- 四次挥手：因为 TCP 全双工，双方需各自 `FIN/ACK`，`TIME_WAIT` 等待 2MSL 确保对端收到最后的 `ACK`。

---

## 五、性能优化

### 5.1 ⭐⭐ 前端性能优化有哪些手段？（按加载与运行时分类）

**加载阶段**
- 体积：代码分割（路由级懒加载）、tree-shaking、按需引入组件库、压缩（terser/esbuild）、图片压缩与 WebP/AVIF、字体子集化。
- 传输：Gzip/Brotli 压缩、HTTP/2 多路复用、CDN 分发、强缓存 + 文件名 hash。
- 请求：减少请求数（雪碧图/字体图标/内联关键 CSS）、`preconnect/dns-prefetch/preload/prefetch`、`<link rel="modulepreload">`。
- 渲染：关键 CSS 内联、非关键资源 `defer/async`、SSR/SSG 改善首屏。

**运行时阶段**
- 长列表虚拟滚动、`requestAnimationFrame` 代替定时器做动画、防抖节流。
- 避免频繁重排重绘（批量 DOM 操作、`DocumentFragment`、`transform` 动画）。
- 大数据计算用 `Web Worker`，避免阻塞主线程。
- 组件级优化：`memo`/`shouldComponentUpdate`/`computed` 缓存、避免不必要的响应式依赖。
- 内存：清理定时器与监听器，防止泄漏。

### 5.2 ⭐ 核心性能指标（Web Vitals）

- **LCP**（最大内容绘制）：≤ 2.5s，衡量加载性能；优化首屏大图、T TF、服务端响应。
- **INP**（交互到下次绘制，已取代 FID）：≤ 200ms，衡量响应性。
- **CLS**（累积布局偏移）：≤ 0.1，衡量视觉稳定性；给图片/广告预留尺寸，避免内容插入。
- 其他：`FP/FCP`（首次绘制/首次内容绘制）、`TTFB`（首字节时间）、`TBT`（总阻塞时间）、`Speed Index`。
- 采集：`PerformanceObserver`、`performance.timing`、`web-vitals` 库、Lighthouse / PageSpeed Insights。

### 5.3 ⭐ 首屏加载优化怎么做？

1. 路由懒加载 + 组件异步加载。
2. 骨架屏 / 首屏占位，避免白屏。
3. 关键资源预加载，非关键资源延迟（图片懒加载 + `loading="lazy"`）。
4. 开启 Gzip/Brotli 与 CDN，配置强缓存。
5. 服务端渲染（SSR）或静态生成（SSG）改善首屏内容到达时间。
6. 减少首屏依赖（按需引入、去掉大体积库，如用 `dayjs` 替代 `moment`）。

### 5.4 ⭐ 图片优化

- 格式：`WebP`/`AVIF` 优于 `JPEG/PNG`；图标用 SVG；动图考虑视频或 `Lottie`。
- 响应式：`<img srcset sizes>` 或 `<picture>` 按 DPR/宽度选源。
- 懒加载：`loading="lazy"`、`IntersectionObserver` 自定义。
- 占位：主色占位 / LQIP（低质量图占位）避免 CLS。
- 尺寸：按展示尺寸出图，别用 3000px 原图渲染 300px。

### 5.5 ⭐ 防抖与节流的区别与场景

- **防抖（debounce）**：事件停止触发后延迟执行；场景：搜索联想、表单校验、窗口 resize 结束后计算。
- **节流（throttle）**：固定频率执行；场景：滚动加载、拖拽、鼠标移动、按钮防连点。
- 实现见 [9.5](#95--手写防抖与节流)。

### 5.6 ⭐ 长列表（虚拟滚动）的实现思路

- 只渲染可视区域 + 缓冲区的节点，用占位撑起总高度。
- 计算：`startIndex = floor(scrollTop / itemHeight)`，`endIndex = startIndex + visibleCount`，用 `transform: translateY` 偏移列表。
- 不定高需要测量或估算 + 动态校正（如 `vue-virtual-scroller`、`react-window`）。
- 替代方案：分页、`content-visibility: auto`（让浏览器跳过屏外渲染）。

### 5.7 ⭐ Web Worker 的使用场景与限制

- 场景：大数组计算、加解密、图片处理、复杂数据解析（如解析大 JSON/Excel）。
- 限制：不能直接操作 DOM；与主线程通过 `postMessage` + `onmessage` 通信（结构化克隆，或用 `Transferable` 零拷贝）；有独立作用域，不能访问 `window`。
- 注意：通信本身有开销，小任务不值得；SharedArrayBuffer 需特定安全头。

### 5.8 重排重绘如何优化？

- 批量读写：先集中改样式，再集中读几何属性，避免"读-写-读"强制同步布局。
- 用 `class` 切换代替逐条改样式。
- 动画只用 `transform/opacity`（走合成层），必要时 `will-change` 提升图层（别滥用，耗显存）。
- 脱机操作：`DocumentFragment`、先 `display:none` 再操作再显示、克隆节点在外修改后替换。
- 定位脱离文档流（`position: absolute/fixed`）减少影响范围。

### 5.9 打包体积优化

- 分析：`webpack-bundle-analyzer` / `rollup-plugin-visualizer` 找大包。
- 手段：按需引入、`splitChunks` 抽公共包、`external` 掉 CDN 资源、替换大库、动态 `import()`、开启 tree-shaking（保证 ESM + `sideEffects: false`）。
- 注意：`lodash` 用 `lodash-es` 或按方法引入；`moment` 换 `dayjs`。

### 5.10 网络层面的优化清单

- 开启 HTTP/2 或 HTTP/3；域名分片在 HTTP/2 下反而有害。
- CDN 就近分发，静态资源独立域名（避免带无谓 Cookie）。
- `preconnect`（提前建连）、`dns-prefetch`、`preload` 关键资源、`prefetch` 未来可能用到的资源。
- 服务端开启 Brotli，接口做聚合/缓存，避免瀑布式请求。

### 5.11 如何定位性能问题？

1. **Lighthouse** 拿整体评分与建议。
2. **Performance 面板**录制，看长任务（Long Task > 50ms）、帧率、主线程火焰图。
3. **Network 面板**看瀑布图、TTFB、资源大小、是否有阻塞。
4. **Coverage** 面板找未使用的 JS/CSS。
5. **Memory 面板**查内存泄漏。
6. 线上用 RUM（真实用户监控）+ `PerformanceObserver` 采集 Web Vitals。

### 5.12 ⭐ 你做过哪些具体的性能优化？效果如何？（必背的项目题）

回答模板（**量化**最重要）：
- 背景：首屏加载 4.2s，LCP 3.8s，包体积 3.1MB。
- 手段：① 路由懒加载 + 组件按需引入；② 大图换 WebP + 懒加载；③ `splitChunks` 拆包 + CDN + Brotli；④ 首屏接口并行化。
- 结果：首屏降到 1.6s，LCP 1.9s，包体积降到 900KB，Lighthouse 从 52 提到 91。
- 反思：下一步计划做 SSR / 骨架屏进一步改善感知性能。

---

## 六、前端工程化

### 6.1 ⭐⭐ Webpack 的核心概念与构建流程

- **核心概念**：`entry`（入口）、`output`（输出）、`loader`（转换非 JS 资源/语法）、`plugin`（扩展构建流程）、`mode`、`resolve`、`optimization`。
- **流程**：初始化参数 → 从 entry 开始递归解析依赖（`enhanced-resolve`）→ 用对应 loader 转换模块 → 生成 chunk → 用 plugin 在生命周期钩子介入 → 输出到 `output`。
- **打包产物**：`runtime`（模块加载逻辑）+ `manifest`（模块映射）+ 业务 chunk。

### 6.2 ⭐ Loader 与 Plugin 的区别

- **Loader**：文件级转换器，`module.rules` 配置，链式从右到左执行（如 `style-loader` → `css-loader` → `sass-loader`）。本质是 `source => source` 的函数。
- **Plugin**：基于**钩子**介入整个构建生命周期，能做更广的事（生成 HTML、压缩、抽离 CSS、定义全局变量）。本质是带 `apply(compiler)` 的类。
- 常见：`babel-loader`、`ts-loader`、`vue-loader`；`HtmlWebpackPlugin`、`MiniCssExtractPlugin`、`DefinePlugin`、`CopyWebpackPlugin`。

### 6.3 ⭐ Vite 为什么快？

- **开发环境**：基于原生 ESM，**不打包**，浏览器按需请求模块，启动秒级；依赖用 `esbuild` 预构建（Go 编写，比 JS 快 10~100 倍）。
- **HMR**：基于 ESM 的精确更新，只让失活的模块边界重新请求，不刷新整页。
- **生产环境**：用 `Rollup` 打包（生态成熟、tree-shaking 好），后续版本提供 `rolldown`。
- 对比 Webpack：Webpack Dev Server 需要先打包整个依赖图，项目越大启动越慢。

### 6.4 ⭐ Tree-shaking 的原理与前提

- 原理：基于 **ESM 静态结构**做死代码消除，Rollup/Webpack 标记未使用的导出并删除。
- 前提：① 使用 ESM（`import/export`），CJS 的 `require` 静态分析困难；② 包声明 `sideEffects: false` 或列出副作用文件；③ 生产模式 + 压缩阶段（terser）才能真正删除。
- 注意：模块顶层有副作用（改全局、立即执行的样式注入）会阻止删除。

### 6.5 ⭐ Babel 的作用与原理

- 作用：语法转换（ES6+ → ES5）、polyfill（`core-js`）、JSX/TS 转换、按目标浏览器降级。
- 原理：解析成 AST（`@babel/parser`）→ 插件遍历 AST 做转换 → 生成代码（`@babel/generator`）。
- 配置：`presets`（`@babel/preset-env` 按 `browserslist` 决定转换范围）、`plugins`、`useBuiltIns: 'usage'` 按需注入 polyfill。
- 新趋势：`SWC`（Rust）、`esbuild`（Go）替代 Babel，速度快很多；但 Babel 插件生态仍不可替代。

### 6.6 ⭐ `package.json` 中 `^` 与 `~` 的区别

- `^1.2.3`：允许升级到 `<2.0.0`（不改变主版本）。
- `~1.2.3`：允许升级到 `<1.3.0`（不改变次版本）。
- `1.2.3`：精确锁定。
- 实际项目用 `package-lock.json` / `pnpm-lock.yaml` 锁定完整依赖树保证一致性；`npm ci` 严格按 lock 安装。

### 6.7 ⭐ Monorepo 与 pnpm workspace

- **Monorepo**：多个包放同一仓库，便于共享代码、统一构建与发版。
- **pnpm** 优势：内容寻址存储 + 硬链接，节省磁盘；严格的 `node_modules` 结构避免"幽灵依赖"。
- `workspace:*` 协议引用内部包；`pnpm -r` 递归执行脚本；工具链可选 `Turborepo`/`Nx` 做增量构建与缓存。
- 缺点：仓库变大、CI 需要更细的过滤，权限与协作流程要额外约定。

### 6.8 ⭐ Git 常用操作与工作流

- 常用：`status/diff/log --oneline --graph/add -p/commit/checkout -b/switch/merge/rebase/pull --rebase/stash/cherry-pick/reset/revert`。
- `reset` vs `revert`：`reset` 改写历史（本地未推送时用），`revert` 生成反向提交（已推送的安全做法）。
- `merge` vs `rebase`：`merge` 保留分叉历史；`rebase` 变基成线性历史但会改写 commit id，**别对已推送的公共分支 rebase**。
- 解决冲突：`git status` 找冲突文件 → 手工解决 → `git add` → `git rebase --continue` / `git commit`。
- 工作流：Git Flow（重）、GitHub Flow（轻量，feature 分支 + PR）、Trunk Based（主干开发 + 特性开关）。

### 6.9 ⭐ 代码规范与提交规范

- 规范：ESLint（代码质量）+ Prettier（格式化），配合 `eslint-config-prettier` 关掉冲突规则。
- 提交：Conventional Commits（`feat/fix/docs/refactor/perf/test/chore`），用 `commitlint` + `husky` 校验。
- 提交前钩子：`husky` + `lint-staged` 只检查改动文件，避免全量检查太慢。
- 类型：TypeScript 开启 `strict`，CI 里跑 `tsc --noEmit`。

### 6.10 ⭐ TypeScript 常见面试点

- `interface` vs `type`：`interface` 可声明合并、适合对象与继承；`type` 可定义联合/交叉/条件/映射类型，更灵活。
- 常用类型工具：`Partial`、`Required`、`Pick`、`Omit`、`Record`、`ReturnType`、`Parameters`、`Awaited`。
- `any` vs `unknown`：`unknown` 更安全，使用前必须收窄；`never` 表示不可能的值。
- 泛型约束 `extends`、`keyof`、`typeof`、类型收窄（`in`、`instanceof`、类型谓词 `is`）。
- 断言 `as` 与 `!` 非空断言要慎用，优先用类型守卫。

### 6.11 前端部署与 CI/CD

- 静态站：构建产物上传 CDN/OSS，Nginx 托管并配置 history fallback。
- 容器化：Dockerfile 多阶段构建（build 阶段 + nginx 运行阶段），镜像更小。
- CI/CD：GitHub Actions / GitLab CI 做安装、lint、test、build、发布；灰度与回滚策略。
- 环境区分：`.env.development` / `.env.production`，注意**前端环境变量会被打进产物**，不能放密钥。

### 6.12 ⭐ 前端安全与工程化结合点

- 依赖安全：`npm audit`、`pnpm audit`、Dependabot 自动升级。
- CSP 头限制脚本与资源来源，减少 XSS 影响面。
- 敏感信息只留在服务端；接口做鉴权与限流，前端校验只是体验优化。
- 上传文件做类型与大小校验，服务端必须再校验一次。

### 6.13 单元测试与端到端测试

- 单元/组件：`Vitest`（Vite 生态首选）、`Jest`；组件测试用 `@vue/test-utils` 或 `@testing-library/vue`。
- E2E：`Playwright`（推荐）、`Cypress`。
- 关键原则：测行为而非实现细节，覆盖率不是目标，核心逻辑与边界优先。
- Mock：`msw` 拦截网络请求，比手写 mock 更接近真实。

### 6.14 ⭐ 微前端了解吗？

- 目标：多个团队/技术栈的应用组合成一个整体。
- 方案：`qiankun`（基于 single-spa，HTML Entry + JS 沙箱 + 样式隔离）、`Module Federation`（Webpack 5 模块共享，运行时远程加载）、`Web Components`/`iframe`（隔离最彻底但通信成本高）。
- 难点：样式隔离、JS 沙箱、公共依赖共享与版本冲突、路由与应用间通信、部署与版本管理。
- 取舍：不是所有项目都需要，团队规模和应用复杂度足够大才值得付出成本。

### 6.15 SSR 与 SSG 的区别

- **CSR**：首屏白屏、SEO 差，但服务端压力小。
- **SSR**：服务端渲染 HTML，首屏快、SEO 好；需要 Node 服务、注意 hydration 不一致与内存泄漏（不能用 `window`）。
- **SSG**：构建时生成静态 HTML，最省服务器；适合内容型站点（博客/文档），用 `Nuxt`/`VitePress`/`Astro`。
- **ISR/增量静态再生**：静态为主 + 定时/按需重新生成，兼顾新鲜度与性能。

---

## 七、Vue 3 专项

### 7.1 ⭐⭐ Vue 2 与 Vue 3 的主要差异

| 维度 | Vue 2 | Vue 3 |
|---|---|---|
| 响应式 | `Object.defineProperty` | `Proxy` + `Reflect` |
| API 风格 | Options API | Options + **Composition API** |
| 源码 | Flow，单文件 | **TypeScript**，monorepo |
| 虚拟 DOM | 全量 diff | 编译时优化（静态提升、Patch Flag、最长递增子序列） |
| 性能 | 较好 | 打包体积更小、渲染更快、内存更省 |
| 新特性 | — | `Fragment` 多根、`Teleport`、`Suspense`、`v-memo` |
| 全局 API | `Vue.xxx` | `createApp()` 应用实例隔离 |
| 响应式丢失 | 数组索引/对象新增属性不响应 | 无此问题 |
| 生态 | Vuex、Vue Router 3 | Pinia、Vue Router 4 |

### 7.2 ⭐⭐ Vue 3 响应式原理

- 用 `Proxy` 代理对象，`Reflect` 执行默认行为，可拦截 `get/set/has/deleteProperty/ownKeys`。
- **依赖收集**：`get` 时把当前副作用（`effect`）加入该属性的依赖集合（`track`）。
- **派发更新**：`set` 时触发依赖（`trigger`），把副作用推入调度队列，去重后异步批量更新。
- 结构：`targetMap`（WeakMap）→ `depsMap`（Map）→ `dep`（Set of effects）。
- 优势对比 Vue 2：能监听新增/删除属性、数组索引与 `length`、`Map/Set`，惰性代理无需递归遍历初始化。
- 局限：`Proxy` 无法代理原始类型，所以有 `ref`（用 `.value` 的对象包装）；解构响应式对象会丢失响应性。

### 7.3 ⭐⭐ `ref` 与 `reactive` 的区别与选择

- `ref`：包装任意类型（含原始值），通过 `.value` 访问，模板中自动解包；底层对对象类型仍用 `reactive`。
- `reactive`：只能接收对象/数组/`Map`/`Set`，直接访问属性，**不能整体替换**（会丢失响应性）。
- 选择建议：**优先 `ref`**。因为它类型友好、可整体替换、可传参；`reactive` 适合逻辑内聚的一组状态。
- 相关：`shallowRef/shallowReactive`（只做浅层响应）、`toRefs`（解构保持响应）、`toRaw`（拿原始对象）、`markRaw`（跳过代理）。

### 7.4 ⭐⭐ `computed`、`watch`、`watchEffect` 的区别

- `computed`：**有缓存**，依赖不变不重新计算，必须返回值，用于派生状态。
- `watch`：显式指定侦听源，可拿到**新旧值**，可配置 `immediate/deep/flush`，用于副作用（请求、操作 DOM、存本地）。
- `watchEffect`：立即执行一次，**自动收集依赖**，拿不到旧值，适合依赖不固定的副作用。
- `flush` 时机：`pre`（默认，组件更新前）/ `post`（DOM 更新后，等价 `watchPostEffect`）/ `sync`（同步）。

### 7.5 ⭐ 生命周期钩子（Vue 3）

- Options API：`beforeCreate`、`created`、`beforeMount`、`mounted`、`beforeUpdate`、`updated`、`beforeUnmount`、`unmounted`、`activated/deactivated`、`errorCaptured`。
- Composition API：`onMounted`、`onUpdated`、`onUnmounted`、`onBeforeMount` 等；`setup` 本身替代了 `beforeCreate/created`。
- 父子顺序：父 `beforeMount` → 子 `beforeMount` → 子 `mounted` → 父 `mounted`（子先挂载完）。
- 注意：`onUnmounted` 里清理定时器、事件监听、WebSocket，避免内存泄漏。

### 7.6 ⭐ 组件通信的八种方式

1. `props` / `emit`（父子，最常用）。
2. `v-model`（`props` + `emit` 的语法糖，Vue 3 支持多个 `v-model:xxx`）。
3. `provide` / `inject`（跨层级，注入 `ref` 保持响应）。
4. `defineExpose` + 模板 `ref`（父调子方法）。
5. 事件总线 `mitt`（任意组件，Vue 3 移除了 `$on/$emit`）。
6. **Pinia/Vuex**（全局状态，推荐）。
7. `attrs` / `$attrs`（透传属性与事件，用于二次封装组件）。
8. 插槽 `slot`（插槽内容反向传递数据用作用域插槽）。

### 7.7 ⭐ `v-model` 的实现原理

```vue
<!-- 父子等价写法 -->
<Child v-model="msg" />
<!-- 展开为 -->
<Child :modelValue="msg" @update:modelValue="msg = $event" />
```
- 在原生表单元素上是 `:value` + `@input`（`checkbox` 用 `checked`，`select` 用 `change`）。
- Vue 3 支持参数与修饰符：`v-model:title.trim` → `:title` + `@update:title`，修饰符从 `props.modelModifiers` 取。

### 7.8 ⭐ `v-if` 与 `v-show` 的区别

- `v-if`：真正的条件渲染，惰性创建/销毁组件与 DOM，切换开销高，初始为假时零渲染成本。
- `v-show`：始终渲染，只切 `display`，初始渲染成本高，切换开销低。
- 选择：频繁切换用 `v-show`，运行时条件很少变或需要销毁重建用 `v-if`。
- 注意：`v-if` 与 `v-for` **不要同级使用**（Vue 3 中 `v-if` 优先级更高，取不到循环变量）。

### 7.9 ⭐⭐ `key` 的作用与 diff 算法

- `key` 是节点的唯一标识，帮助 diff 判断节点是否可复用，避免就地复用导致的**状态错乱**（输入框内容串位）。
- Vue 3 的 diff：同层比较；`patchFlag` 标记动态内容；静态节点提升复用。
- 子节点更新：区分"有 key"和"无 key"两种策略；有 key 时先做**前后端双端对比**，再用**最长递增子序列**求出最小移动集合，减少 DOM 移动。
- 结论：用稳定的唯一 id 做 `key`，**不要用数组下标**（列表顺序变化时会出错）。

### 7.10 ⭐ `nextTick` 的原理与用途

- Vue 的更新是**异步批量**的：数据变化后不会立刻更新 DOM，而是把更新任务推到微任务队列（Vue 3 用 `Promise.then`）。
- `nextTick(cb)` 在 DOM 更新完成后执行，可拿到最新的 DOM。
- 用途：修改数据后立即读取 DOM 尺寸、操作滚动位置、集成需要真实 DOM 的第三方库。

### 7.11 ⭐ 虚拟 DOM 的优缺点

- **优点**：跨平台（可渲染到小程序/原生）、把多次 DOM 操作合并批量执行、让"声明式 UI"成为可能、配合 diff 减少真实 DOM 操作。
- **缺点**：有 diff 与内存开销，极端场景**手写 DOM 操作更快**；静态内容多的页面收益有限（Vue 3 用编译时优化缓解）。
- 面试要点：虚拟 DOM 不是"一定比原生快"，而是"在保证开发效率的前提下性能足够好且可预测"。

### 7.12 ⭐ 模板编译过程

1. **解析（parse）**：模板 → AST。
2. **转换（transform）**：AST → 转换后的 AST，做静态提升、`patchFlag` 标记、`v-if/v-for` 结构转换、指令处理。
3. **生成（generate）**：AST → 渲染函数代码字符串（`h()` 调用）。
- 编译时优化：静态节点提升到渲染函数外、`Patch Flags` 只 diff 动态部分、`Block Tree` 跳过静态子树、事件缓存。
- 运行时 + 编译时：Vue 是"运行时 + 编译器"，可用 `vue/dist/vue.runtime.esm-bundler.js` 减体积（配合 `vue-loader` 预编译模板）。

### 7.13 ⭐ Composition API 相比 Mixin 的优势

- **来源清晰**：逻辑写在 `setup` 里，变量来源可追溯，不像 mixin 属性"凭空出现"。
- **无命名冲突**：mixin 的属性会静默覆盖。
- **逻辑复用按功能组织**：一个组合式函数 = 一个关注点，可组合、可测试、类型推导好。
- 缺点：需要自觉抽取，写得不好会变成"一个巨大的 setup"。

### 7.14 ⭐ Pinia 与 Vuex 的区别

- **Pinia**：无 `mutations`（直接改 state 或用 `actions`）、完整 TypeScript 推导、模块化天然（每个 store 独立）、支持 Composition API 风格、体积更小、支持 `$patch`/`$subscribe`/插件。
- **Vuex 4**：`state/getters/mutations/actions/modules` 五件套，模板代码多，TS 支持需要额外处理。
- 选择：新项目直接 Pinia（官方推荐，Vuex 已进入维护状态）。
- 面试可能问：`storeToRefs` 用于解构保持响应；store 中不要放不可序列化的复杂对象（影响 devtools 与 SSR）。

### 7.15 ⭐ Vue Router 相关

- 模式：`createWebHistory`（history，需服务端 fallback）与 `createWebHashHistory`（hash）。
- 导航守卫：全局 `beforeEach/beforeResolve/afterEach`、路由独享 `beforeEnter`、组件内 `beforeRouteEnter/beforeRouteUpdate/beforeRouteLeave`。
- 参数：`params`（`/user/:id`，history 模式下刷新丢失需注意）、`query`（`?a=1`）。
- 懒加载：`component: () => import('./View.vue')`，配合路由级代码分割。
- 权限控制经典方案：`beforeEach` 中判断 token，无权限跳登录；动态 `addRoute` 挂载权限路由。

### 7.16 `keep-alive` 的作用与原理

- 缓存组件实例，避免重复销毁重建；`include/exclude`（匹配组件 `name`）、`max` 限制数量（LRU 淘汰）。
- 被缓存组件触发 `activated`/`deactivated` 而非 `mounted`/`unmounted`。
- 常见坑：缓存后需要手动刷新数据（在 `activated` 中重新请求），或用 `:key` 强制重建。

### 7.17 `Teleport` 与 `Suspense`

- `Teleport to="body"`：把内容渲染到 DOM 其他位置，解决弹窗/通知被父级 `overflow: hidden` 或 `z-index` 层叠上下文裁剪的问题（逻辑上仍在组件树内，事件与状态正常）。
- `Suspense`：等待异步组件/`async setup` 完成，用 `#fallback` 展示 loading。生产使用需注意错误处理与嵌套问题。

### 7.18 自定义指令与使用场景

- 钩子：`created/beforeMount/mounted/beforeUpdate/updated/beforeUnmount/unmounted`。
- 场景：`v-focus` 自动聚焦、`v-permission` 按钮级权限、`v-lazy` 图片懒加载、`v-debounce` 防抖、`v-copy` 复制。
- 注意：指令适合纯 DOM 操作；依赖响应式数据的逻辑用组合式函数更合适。

### 7.19 ⭐ Vue 性能优化手段

- 合理拆分组件，避免超大组件导致的整体重渲染。
- `v-once`（只渲染一次）、`v-memo`（条件跳过更新）、`shallowRef/shallowReactive` 处理大对象。
- 长列表虚拟滚动；频繁切换用 `v-show`；`key` 用稳定 id。
- `computed` 替代模板中的复杂表达式；`watch` 少用 `deep`。
- 路由懒加载 + 组件异步加载；第三方大库按需引入或异步引入。
- 生产环境关闭 devtools 与警告；用 `vite-plugin-inspect`/DevTools 的组件渲染分析定位重渲染。
- 注意：`v-if` 频繁切换导致组件反复销毁重建时，考虑 `keep-alive`。

### 7.20 ⭐ 你在 Vue 项目中踩过哪些坑？（项目题）

高频真实坑：
1. **解构丢响应**：`const { count } = state` 失去响应，要 `toRefs` 或直接 `state.count`。
2. **`reactive` 整体替换**：`state = newObj` 断掉引用，改用 `ref` 或 `Object.assign`。
3. **`v-if` 与 `v-for` 同级**取不到循环变量。
4. **数组下标做 `key`** 导致列表状态错乱。
5. **`watch` 监听对象**需要 `deep: true` 或直接监听具体字段（`() => obj.a`）以提升性能。
6. **异步组件 + `Suspense`** 的错误处理不完善。
7. **`nextTick` 前读 DOM** 拿到旧值。
8. **定时器/监听未在 `onUnmounted` 清理**导致内存泄漏。

---

## 八、React 专项

### 8.1 ⭐ React 与 Vue 的设计差异

- **数据流**：都是单向数据流；React 强调函数式与不可变数据，Vue 用可变响应式代理。
- **更新粒度**：React 默认**组件级**重渲染（靠 `memo`/`useMemo` 手动优化）；Vue 依赖收集到**组件级 + 编译时优化**，粒度更细。
- **模板 vs JSX**：Vue 模板编译时可做静态分析优化；JSX 是完整的 JS 表达力。
- **心智模型**：React 需要理解"状态快照 + 闭包"，Vue 更接近直接修改变量。
- 相同点：组件化、虚拟 DOM、单向数据流、路由与状态管理生态。

### 8.2 ⭐ JSX 的本质

- JSX 是 `React.createElement(type, props, ...children)` 的语法糖（新版用 `jsx` runtime，自动引入 `jsx()`）。
- 特点：`className`/`htmlFor` 替代 `class`/`for`；`{}` 里写表达式；必须**单一根节点**（或用 Fragment `<>...</>`）；`style` 传对象。
- 注意：JSX 中 `false/null/undefined/true` 不渲染，`0` 会渲染；防 XSS 靠自动转义，`dangerouslySetInnerHTML` 有风险。

### 8.3 ⭐ 函数组件与类组件的区别

- 函数组件：更简洁、无 `this`、逻辑复用用 Hooks、便于类型推导；每次渲染创建新闭包。
- 类组件：有生命周期与实例、`this.setState`，逻辑复用靠 HOC/render props（易形成嵌套地狱）。
- 现在推荐函数组件 + Hooks；类组件主要是维护老代码。

### 8.4 ⭐⭐ Hooks 的使用规则与原理

- **规则**：只在函数组件或自定义 Hook 顶层调用；不能在条件、循环、嵌套函数里调用。
- **原因**：React 用**链表**按调用顺序存储 Hook 状态（`memoizedState`），顺序错乱会导致状态错位。
- 原理简述：Fiber 节点上挂 `memoizedState` 链表，每个 Hook 是一个节点；`useState` 返回 `[state, dispatch]`，`dispatch` 触发调度重渲染。

### 8.5 ⭐⭐ `useState` 与 `useEffect`

- `useState`：`setState` 是**异步批量**的，新值基于快照；函数式更新 `setCount(c => c + 1)` 能拿到最新值，连续多次更新必须用它。
- `useEffect`：渲染提交后异步执行；返回清理函数（下次执行前与卸载时调用）。
- 依赖数组：`[]` 只执行一次；不传则每次渲染后都执行；传 `[a]` 则 `a` 变化时执行。
- **闭包陷阱**：effect 内引用的 state 是那一次渲染的快照，定时器里读到的永远是旧值，需用 `useRef` 或把依赖补全。

### 8.6 ⭐ `useEffect` 与 `useLayoutEffect` 的区别

- `useEffect`：渲染提交后**异步**执行（不阻塞绘制），适合数据请求、订阅、日志。
- `useLayoutEffect`：DOM 更新后、浏览器绘制**前同步**执行，适合读取布局并同步修改 DOM（避免闪烁，如测量位置、tooltip 定位）。
- 注意：`useLayoutEffect` 会阻塞绘制，别做耗时操作；SSR 中会警告（无 DOM）。

### 8.7 ⭐ `useMemo`、`useCallback`、`memo` 的区别

- `React.memo`：包裹组件，`props` 浅比较不变则跳过重渲染。
- `useMemo`：缓存**计算结果**，避免昂贵计算重复执行。
- `useCallback`：缓存**函数引用**，避免因函数每次新建导致子组件 `memo` 失效或 effect 反复执行。
- 原则：**不要无脑加**，缓存本身有成本；确认是性能瓶颈再加。

### 8.8 ⭐ `useRef` 的用途

- 保存可变值且**不触发重渲染**（定时器 id、上一次的值、标记位）。
- 获取 DOM/组件引用（`ref.current`）。
- 解决闭包陷阱：把最新值写进 `ref.current`，回调里读 `ref.current`。

### 8.9 ⭐ 受控组件与非受控组件

- **受控**：值由 React state 驱动（`value` + `onChange`），数据唯一来源清晰，便于校验与联动；缺点是每次输入都重渲染。
- **非受控**：DOM 自己管理值，用 `defaultValue` + `ref` 读取；适合简单表单、文件输入（`<input type="file">` 只能是受控的 `ref` 方式）。
- 实践：`react-hook-form` 等库用非受控 + 少量订阅提升大表单性能。

### 8.10 React 组件通信

- 父子：`props` + 回调函数。
- 跨层级：`Context`（+ `useContext`），注意 Provider 值变化会重渲染所有消费者（配合 `useMemo`）。
- 全局：Redux Toolkit / Zustand / Jotai。
- 其他：`forwardRef` + `useImperativeHandle` 暴露命令式方法、状态提升、render props、HOC。

### 8.11 ⭐ React 性能优化手段

- `memo` / `useMemo` / `useCallback` 减少不必要渲染与计算。
- 列表 `key` 用稳定唯一 id（不要用下标）。
- 状态下沉（把 state 放到真正需要它的子组件）与组件拆分。
- 长列表虚拟化（`react-window`、`react-virtualized`）。
- `lazy` + `Suspense` 做路由与组件级代码分割。
- 避免在渲染中创建新对象/数组/内联函数（传给 `memo` 子组件时）。
- 大计算与频繁更新用 `useTransition`/`useDeferredValue` 降优先级。

### 8.12 ⭐ React 事件机制（合成事件）

- React 17 之前事件委托到 `document`，17 之后委托到**根容器**（支持多版本共存、便于微前端）。
- 合成事件（`SyntheticEvent`）抹平浏览器差异，是原生事件的跨浏览器包装。
- `e.stopPropagation()` 阻止的是 React 合成事件传播；`e.nativeEvent` 可拿原生事件。
- 注意：React 18 起事件处理中的 `setState` 也会批量处理（自动批处理）。

### 8.13 Fiber 与调度

- **Fiber** 是 React 的虚拟 DOM 实现形态，把渲染工作拆成可中断的小单元，实现**可中断的异步渲染**。
- 调度：`requestIdleCallback` 思路（实际用 `MessageChannel`）在空闲时执行，高优先级（用户输入）先处理。
- 阶段：`render` 阶段可中断（构建 Fiber 树、diff），`commit` 阶段同步不可中断（真正改 DOM、执行 `useLayoutEffect`）。
- React 18 的并发特性：`useTransition`、`useDeferredValue`、`Suspense`、自动批处理。

### 8.14 `key` 在 React 中的作用

- 帮助 diff 识别节点身份，决定复用还是重建。
- 用下标做 key：列表插入/删除/排序时会导致状态错乱与不必要的重建。
- 用随机数做 key：每次渲染都重建，性能极差。
- 经典技巧：给组件加 `key` 可强制重建（重置内部状态）。

### 8.15 错误边界（Error Boundary）

- 捕获**子组件树**渲染、生命周期、构造函数中的错误，展示降级 UI，防止整个应用白屏。
- 只能用**类组件**实现（`static getDerivedStateFromError` + `componentDidCatch`）；函数组件暂不支持对应 Hook。
- 捕获不到的：事件处理函数（用 `try/catch`）、异步代码（`setTimeout`、Promise）、SSR、错误边界自身。

### 8.16 Redux 与 Zustand 的取舍

- **Redux Toolkit**：规范化、可预测、devtools 与中间件生态强，适合大型复杂应用；模板代码相对多。
- **Zustand**：极简、无 Provider、基于订阅（只重渲染用到该状态的组件），中小项目体验好。
- 选择标准：团队规模、状态复杂度、是否需要时间旅行调试与严格规范。

---

## 九、手写代码题

> 这部分的通用套路：先讲思路，再写代码，最后提边界情况。面试官最看重**边界处理**和**能否讲清原理**。

### 9.1 ⭐ 手写 `call` / `apply` / `bind`

```js
Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis;                    // null/undefined 指向全局
  const key = Symbol('fn');                   // 用 Symbol 避免覆盖原有属性
  ctx[key] = this;
  const res = ctx[key](...args);
  delete ctx[key];                            // 用完删除，避免污染
  return res;
};

Function.prototype.myApply = function (ctx, args = []) {
  return this.myCall(ctx, ...args);
};

Function.prototype.myBind = function (ctx, ...args) {
  const fn = this;
  // 返回函数要支持 new 调用：new 时 this 指向新对象，忽略绑定
  return function bound(...rest) {
    return fn.apply(this instanceof bound ? this : ctx, [...args, ...rest]);
  };
};
```

### 9.2 ⭐ `instanceof` 的实现原理

```js
function myInstanceof(left, right) {
  if (left === null || (typeof left !== 'object' && typeof left !== 'function')) return false;
  const proto = right.prototype;
  let cur = Object.getPrototypeOf(left);
  while (cur) {
    if (cur === proto) return true;
    cur = Object.getPrototypeOf(cur);         // 沿原型链向上
  }
  return false;
}
```

### 9.3 ⭐⭐ 手写深拷贝

```js
function deepClone(target, map = new WeakMap()) {
  if (target === null || typeof target !== 'object') return target;  // 原始类型/函数直接返回
  if (map.has(target)) return map.get(target);                       // 解决循环引用
  if (target instanceof Date) return new Date(target);
  if (target instanceof RegExp) return new RegExp(target.source, target.flags);

  const clone = Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target));
  map.set(target, clone);

  // Map / Set 单独处理
  if (target instanceof Map) { target.forEach((v, k) => clone.set(deepClone(k, map), deepClone(v, map))); return clone; }
  if (target instanceof Set) { target.forEach(v => clone.add(deepClone(v, map))); return clone; }

  // 只拷贝自有可枚举属性（含 Symbol）
  Reflect.ownKeys(target).forEach(key => { clone[key] = deepClone(target[key], map); });
  return clone;
}
```
- 面试加分点：提到 `structuredClone` 是原生方案但不支持函数；`JSON` 方案的各个坑。

### 9.4 ⭐ 手写 Promise（简版）

```js
class MyPromise {
  static PENDING = 'pending'; static FULFILLED = 'fulfilled'; static REJECTED = 'rejected';
  constructor(executor) {
    this.state = MyPromise.PENDING;
    this.value = undefined;
    this.callbacks = [];
    const resolve = (val) => this.#settle(MyPromise.FULFILLED, val);
    const reject  = (val) => this.#settle(MyPromise.REJECTED, val);
    try { executor(resolve, reject); } catch (e) { reject(e); }
  }
  #settle(state, value) {
    if (this.state !== MyPromise.PENDING) return;   // 状态不可逆
    // 若 value 是 thenable，递归等待（简化处理）
    if (state === MyPromise.FULFILLED && value && typeof value.then === 'function') {
      return value.then(v => this.#settle(MyPromise.FULFILLED, v), r => this.#settle(MyPromise.REJECTED, r));
    }
    this.state = state;
    this.value = value;
    this.callbacks.forEach(cb => queueMicrotask(cb)); // 异步执行，保证 then 先注册
    this.callbacks = [];
  }
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const handle = () => {
        try {
          const cb = this.state === MyPromise.FULFILLED ? onFulfilled : onRejected;
          if (typeof cb !== 'function') {
            // 值穿透
            return this.state === MyPromise.FULFILLED ? resolve(this.value) : reject(this.value);
          }
          const res = cb(this.value);
          res instanceof MyPromise ? res.then(resolve, reject) : resolve(res);
        } catch (e) { reject(e); }
      };
      this.state === MyPromise.PENDING ? this.callbacks.push(handle) : queueMicrotask(handle);
    });
  }
  catch(onRejected) { return this.then(null, onRejected); }
  finally(cb) { return this.then(v => { cb(); return v; }, e => { cb(); throw e; }); }
}
```

### 9.5 ⭐⭐ 手写防抖与节流

```js
// 防抖：停止触发 wait 毫秒后执行；immediate 控制首次是否立即执行
function debounce(fn, wait = 300, immediate = false) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    if (immediate && !timer) { fn.apply(this, args); }
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, wait);
  };
}

// 节流：每 wait 毫秒最多执行一次（时间戳 + 定时器双保险，保证最后一次也执行）
function throttle(fn, wait = 300) {
  let last = 0, timer = null;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

### 9.6 ⭐ 手写 `Promise.all` / `allSettled`

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const list = Array.from(promises);
    const result = new Array(list.length);
    let count = 0;
    if (list.length === 0) return resolve(result);
    list.forEach((p, i) => {
      Promise.resolve(p).then(v => {          // 包一层，兼容非 Promise 值
        result[i] = v;
        if (++count === list.length) resolve(result);
      }, reject);                              // 任一失败立即 reject
    });
  });
}

function allSettled(promises) {
  return Promise.all(Array.from(promises).map(p =>
    Promise.resolve(p).then(
      value => ({ status: 'fulfilled', value }),
      reason => ({ status: 'rejected', reason })
    )
  ));
}
```

### 9.7 ⭐ 数组扁平化

```js
// 递归
function flatten(arr, depth = Infinity) {
  return depth < 1 ? arr.slice() : arr.reduce((acc, cur) =>
    acc.concat(Array.isArray(cur) ? flatten(cur, depth - 1) : cur), []);
}
// 原生
arr.flat(Infinity);
// 栈实现（避免递归爆栈）
function flattenStack(arr) {
  const stack = [...arr], res = [];
  while (stack.length) {
    const cur = stack.pop();
    Array.isArray(cur) ? stack.push(...cur) : res.push(cur);
  }
  return res.reverse();
}
```

### 9.8 数组去重

```js
[...new Set(arr)];                                    // 最简单
arr.filter((v, i) => arr.indexOf(v) === i);           // 兼容写法
// 对象数组按字段去重
[...new Map(list.map(o => [o.id, o])).values()];
```

### 9.9 ⭐ 手写柯里化（curry）

```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...rest) => curried.apply(this, [...args, ...rest]);
  };
}
// 支持占位符的进阶版可作为追问
```

### 9.10 手写 `new`

见 [2.10](#210--new-操作符做了什么)。

### 9.11 ⭐ 发布订阅（EventEmitter）

```js
class EventEmitter {
  #events = new Map();                      // 用 Map 存 事件名 -> Set(回调)
  on(type, fn) {
    if (!this.#events.has(type)) this.#events.set(type, new Set());
    this.#events.get(type).add(fn);
    return () => this.off(type, fn);        // 返回取消订阅函数，方便清理
  }
  off(type, fn) { this.#events.get(type)?.delete(fn); }
  once(type, fn) {
    const wrap = (...args) => { fn(...args); this.off(type, wrap); };
    this.on(type, wrap);
  }
  emit(type, ...args) { this.#events.get(type)?.forEach(fn => fn(...args)); }
}
```

### 9.12 ⭐⭐ 并发请求控制（限制最大并发数）

```js
async function asyncPool(limit, items, iteratorFn) {
  const ret = [];                              // 所有请求的 Promise
  const executing = new Set();                 // 正在执行的请求
  for (const item of items) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) await Promise.race(executing);  // 等一个完成再继续
  }
  return Promise.all(ret);
}
// 用法：asyncPool(3, urls, url => fetch(url).then(r => r.json()))
```

### 9.13 异步任务串行与重试

```js
// 串行执行（forEach 里 await 无效，要用 for...of）
async function serial(tasks) {
  const res = [];
  for (const task of tasks) res.push(await task());
  return res;
}

// 失败重试（指数退避）
async function retry(fn, times = 3, delay = 300) {
  try { return await fn(); }
  catch (e) {
    if (times <= 0) throw e;
    await new Promise(r => setTimeout(r, delay));
    return retry(fn, times - 1, delay * 2);
  }
}
```

### 9.14 数组转树 / 树转数组

```js
// 数组转树（一次遍历 + Map，O(n)）
function listToTree(list, rootId = null) {
  const map = new Map(list.map(n => [n.id, { ...n, children: [] }]));
  const roots = [];
  map.forEach(node => {
    node.parentId === rootId || !map.has(node.parentId)
      ? roots.push(node)
      : map.get(node.parentId).children.push(node);
  });
  return roots;
}

// 树转数组（DFS）
function treeToList(tree, res = []) {
  tree.forEach(({ children, ...node }) => { res.push(node); children && treeToList(children, res); });
  return res;
}
```

### 9.15 LRU 缓存

```js
class LRUCache {
  constructor(capacity) { this.cap = capacity; this.map = new Map(); }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key); this.map.set(key, val);   // 删除再插入 = 移到最新
    return val;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.cap) this.map.delete(this.map.keys().next().value); // 淘汰最旧
    this.map.set(key, value);
  }
}
// 利用 Map 保持插入顺序的特性，get/put 都是 O(1)
```

### 9.16 数字千分位与金额格式化

```js
// 正则前瞻
String(1234567.891).replace(/\B(?=(\d{3})+(?!\d))/g, ',');   // '1,234,567.891'
// 原生方案（推荐）
new Intl.NumberFormat('zh-CN').format(1234567.891);
// 金额按分转元 + 固定两位
(price / 100).toFixed(2);
```

### 9.17 大数相加（超出 Number 精度）

```js
function bigAdd(a, b) {
  let i = a.length - 1, j = b.length - 1, carry = 0, res = '';
  while (i >= 0 || j >= 0 || carry) {
    const sum = (+a[i--] || 0) + (+b[j--] || 0) + carry;
    res = (sum % 10) + res;
    carry = Math.floor(sum / 10);
  }
  return res;
}
// 或直接用 BigInt：String(BigInt(a) + BigInt(b))
```

### 9.18 快速排序与二分查找

```js
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const [pivot, ...rest] = arr;
  return [...quickSort(rest.filter(x => x < pivot)), pivot, ...quickSort(rest.filter(x => x >= pivot))];
}
// 原地版面试更受青睐（避免额外空间，注意随机选 pivot 防退化到 O(n²)）

function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] === target) return mid;
    arr[mid] < target ? (lo = mid + 1) : (hi = mid - 1);
  }
  return -1;
}
```

### 9.19 手写图片懒加载 / `IntersectionObserver`

```js
const io = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    img.src = img.dataset.src;               // 进入视口才真正加载
    observer.unobserve(img);                 // 加载后停止观察
  });
}, { rootMargin: '100px' });                 // 提前 100px 预加载
document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
```

### 9.20 手写简易模板字符串解析 / URL 参数解析

```js
// URL query 转对象
function parseQuery(url) {
  const qs = url.split('?')[1] ?? '';
  return Object.fromEntries(new URLSearchParams(qs));
}
// 模板替换：'hi {{name}}' + { name: 'x' } -> 'hi x'
const render = (tpl, data) => tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => data[k] ?? '');
```

### 9.21 其他高频手写清单（建议都过一遍）

- 对象/数组的 `map`、`filter`、`reduce`、`flat` 手写实现。
- `Object.create`、寄生组合继承、`Object.assign` 浅拷贝实现。
- 判断回文、字符串去重、最长无重复子串（滑动窗口）。
- 两数之和、三数之和、最大子数组和、合并有序数组。
- 二叉树的遍历（前中后序递归 + 迭代）、层序遍历、最大深度。
- 深比较 `isEqual`、`get`/`set` 按路径取值。
- 异步版 `map`（并发控制 + 保持顺序）。
- `sleep`、`timeout` 包装（`Promise.race` 实现超时中断）。

---

## 十、场景与开放设计题

> 这类题**没有标准答案**，考察的是拆解问题的思路。答题框架：**明确需求 → 拆解要点 → 给出方案 → 说明取舍与边界**。

### 10.1 ⭐ 设计一个无限滚动列表

- **要点**：滚动到底部附近触发加载、防止重复请求、加载中/无更多/错误状态、内存与性能。
- **实现**：`IntersectionObserver` 观察底部哨兵元素（优于监听 `scroll` + 节流）。
- **边界**：`loading` 标记防止并发重复请求；请求失败可重试；长列表必须配虚拟滚动，否则 DOM 数量爆炸。
- **扩展**：下拉刷新、滚动位置恢复（记录 `scrollTop`）、首屏骨架屏。

### 10.2 ⭐⭐ 大文件上传怎么做？

1. **分片**：`File.slice()` 切成固定大小（如 5MB）的 chunk。
2. **秒传**：上传前用文件内容算 hash（`spark-md5`，用 Worker 计算避免卡顿），请求服务端检查是否已存在。
3. **断点续传**：服务端返回已上传分片列表，前端只传缺失的；本地用 `localStorage` 记录进度。
4. **并发控制**：限制同时上传的分片数（用 [9.12](#912--并发请求控制限制最大并发数) 的方案）。
5. **合并**：全部分片完成后调接口通知服务端合并。
6. **进度**：`axios` 的 `onUploadProgress` 或 `XMLHttpRequest.upload.onprogress`。
- 追问：分片大小怎么定？太小请求多，太大失败重传成本高，一般 1~5MB。

### 10.3 ⭐ 前端权限控制设计

- **接口权限**：后端校验为准，前端只是体验。
- **页面权限**：路由守卫 + 动态路由。登录后取用户角色 → 前端维护"角色-路由映射" → `router.addRoute` 动态挂载 → 未匹配到路由跳 404。
- **按钮/元素权限**：自定义指令 `v-permission="['admin']"` 或权限判断函数 `hasAuth('user:delete')`，无权限时移除节点或禁用。
- **菜单权限**：由后端返回菜单树，前端渲染，避免前后端菜单不一致。
- **注意**：前端权限**只是隐藏**，真正的拦截必须在后端做。

### 10.4 扫码登录流程

1. PC 端请求生成二维码（带唯一 `uuid`/`ticket`），同时建立轮询或 WebSocket 通道。
2. 手机扫码解析出 ticket，跳转确认页，用户点"确认登录"。
3. 手机端携带用户凭证 + ticket 请求服务端，服务端把 ticket 标记为"已确认"并绑定用户。
4. PC 端轮询/推送拿到确认结果，换取正式 token 完成登录。
- 要点：二维码有**有效期**、`uuid` 不可猜测、状态机（待扫描 → 已扫描 → 已确认 → 已过期）。

### 10.5 前端监控系统怎么设计？

- **错误监控**：`window.onerror`（同步）、`unhandledrejection`（Promise）、`addEventListener('error', ..., true)`（资源加载失败）、框架层 `Vue.config.errorHandler` / React 错误边界。
- **性能监控**：`PerformanceObserver` 采集 Web Vitals、资源加载耗时、接口耗时、长任务。
- **行为埋点**：PV/UV、页面停留、点击埋点（声明式 `data-track` 或手动上报）、曝光埋点（`IntersectionObserver`）。
- **上报**：`navigator.sendBeacon`（不阻塞卸载）、失败重试、采样率控制、合并上报。
- **要点**：sourcemap 还原堆栈、错误聚合去重、用户标识与版本号、隐私合规。

### 10.6 WebSocket 断线重连与心跳

- **心跳**：定时（如 30s）发 `ping`，超时未收 `pong` 判定断线。
- **重连**：指数退避重试（1s、2s、4s…，设上限），避免雪崩。
- **恢复**：重连成功后拉取增量消息，避免消息丢失。
- **注意**：页面切到后台时定时器被节流，可用 `visibilitychange` 调整；组件卸载时关闭连接。

### 10.7 组件库设计要考虑什么？

- **API 设计**：命名一致（`size`/`type`/`disabled`）、受控与非受控都支持、事件命名统一。
- **样式方案**：CSS 变量做主题（最灵活）、BEM 或 CSS Modules 防冲突、支持暗色模式。
- **按需引入**：ESM + tree-shaking，或提供 `unplugin-vue-components` 自动导入。
- **可访问性**：键盘操作、`aria-*`、焦点管理（弹窗的焦点锁定与归还）。
- **工程**：文档（VitePress/Storybook）、单测、类型定义、版本与 changelog、语义化发版。
- **取舍**：不要过度封装，暴露 escape hatch（插槽、透传 `attrs`）。

### 10.8 主题切换（暗黑模式）怎么实现？

- **CSS 变量**方案：`:root` 定义变量，`html[data-theme="dark"]` 覆盖，切换只改 `data-theme`。
- 状态管理：`localStorage` 持久化 + `prefers-color-scheme` 跟随系统 + 用户手动覆盖优先级最高。
- **避免闪烁（FOUC）**：在 `<head>` 里内联一段同步脚本，渲染前就设置好 `data-theme`。
- 图片/第三方组件需单独适配（用 `filter` 或准备两套资源）。

### 10.9 国际化（i18n）方案

- 库：`vue-i18n`、`react-i18next`。
- 组织：按语言拆 JSON 文件，按页面/模块再分子文件，**按需异步加载**语言包。
- 细节：文案插值、复数规则、日期/货币用 `Intl`、RTL 语言要处理布局方向、SEO 需要 hreflang。
- 工程：文案 key 规范（`module.component.action`）、缺失文案检测、翻译平台对接。

### 10.10 前端如何实现导出 Excel / PDF？

- **Excel**：`exceljs` / `xlsx`（纯前端生成），或后端生成返回文件流（大数据量推荐后端做）。注意大数据量会卡主线程，可放 Worker。
- **PDF**：`pdfmake`、`jspdf` + `html2canvas`（截图式排版差、体积大），或后端用 Puppeteer 渲染。
- **通用**：导出用 `Blob` + `URL.createObjectURL` + `<a download>` 触发下载；记得释放 URL。

### 10.11 线上白屏怎么排查？

1. 看控制台报错与 Network（资源 404、JS 加载失败、接口报错）。
2. 判断是**资源加载失败**（CDN 挂了、hash 变了、发布中）还是**JS 运行时错误**。
3. 检查是否是新版本发布导致（回滚验证）。
4. 排查环境差异：浏览器兼容（语法不支持 → 检查 `browserslist` 与 polyfill）、iOS 特性差异。
5. 用监控平台的错误堆栈 + sourcemap 定位。
6. 兜底方案：`window.onerror` 上报 + 降级页面 + 资源加载失败重试。

### 10.12 其他常见场景题速览

- **水印**：`canvas` 生成平铺背景图或覆盖多层 `div`，配合 `MutationObserver` 防止被删除。
- **富文本编辑器难点**：光标与选区管理、粘贴内容清洗（XSS）、撤销重做栈、协同冲突（OT/CRDT）。
- **拖拽排序**：原生 `dragstart/dragover/drop`，或 `SortableJS`/`dnd-kit`；注意移动端需 `touch` 事件。
- **单点登录（SSO）**：CAS 重定向模式、OAuth2 授权码模式、共享 Cookie（同父域）、ticket 校验。
- **灰度/AB 测试**：按用户 id 哈希分桶、配置中心下发、埋点对比转化率。
- **前端灰度发布**：CDN 分路径、Nginx 按 Cookie/Header 分流、iframe 沙箱。
- **大表单性能**：非受控 + 局部订阅、字段懒渲染（折叠/分步）、避免整表重渲染。

---

## 十一、项目与 HR 面

### 11.1 ⭐ 自我介绍（1~2 分钟模板）

> 面试官您好，我是 XX，有 X 年前端开发经验，目前在某公司负责 XX 业务的前端开发。
> 技术上我主要使用 **Vue 3 / React + TypeScript**，熟悉 Vite 构建与工程化配置，做过 XX（性能优化 / 组件库 / 中后台系统）相关的实践。
> 最近比较有代表性的是 XX 项目，我负责 XX 部分，最终把 XX 指标从 A 优化到了 B。
> 我比较关注代码质量和用户体验，也在持续输出技术文章。希望能在贵司做更有挑战的事情。

- 要点：**控制在 2 分钟内**，突出与岗位匹配的技术栈和一个亮点成果，别背简历。

### 11.2 ⭐⭐ 项目介绍用 STAR 法则

- **S（背景）**：项目是什么、什么规模（用户量/团队/周期）、你的角色。
- **T（任务）**：你要解决什么问题、目标是什么（要量化）。
- **A（行动）**：你具体做了什么 —— **技术选型理由**、遇到的难点、怎么权衡的。
- **R（结果）**：量化结果 + 复盘（还有什么可以做得更好）。
- ⚠️ **避免**：只说"我负责了 XX 模块"，不说难点和取舍；用"我们"而不是"我"，让面试官分不清你的贡献。

### 11.3 ⭐ 你做过最有挑战的项目 / 最难的问题？

- 准备 2 个：一个**技术深度**类（如复杂性能优化、自研组件/工具），一个**综合复杂度**类（如跨团队协作、技术方案推动）。
- 结构：问题现象 → 我的分析过程（**展示排查思路**）→ 尝试过的方案及为什么不选 → 最终方案 → 量化收益 → 沉淀（文档/规范/工具）。
- 加分：说出当时的**信息不足与不确定性**，以及你如何在有限信息下做决策。

### 11.4 ⭐ 你如何做技术选型？

判断维度：**业务需求匹配度 → 社区活跃度与维护状态 → 团队熟悉度与学习成本 → 生态与文档 → 性能与体积 → 长期维护风险（是否能自己兜底）**。
- 举例：为什么选 Vite 不选 Webpack？（开发启动速度、生态成熟度、迁移成本）
- 为什么选 Pinia 不选 Vuex？（官方推荐、TS 支持、模板代码少）

### 11.5 前端如何保证代码质量？

- 规范：ESLint + Prettier + commitlint + husky + lint-staged。
- 类型：TypeScript 严格模式，CI 跑类型检查。
- 评审：Code Review 清单（边界处理、命名、可读性、性能、安全）。
- 测试：核心逻辑单测 + 关键链路 E2E。
- 监控：上线后错误监控与性能监控形成闭环。
- 文档：组件文档、README、决策记录（ADR）。

### 11.6 常见 HR 问题与回答思路

| 问题 | 回答思路 |
|---|---|
| 为什么离职？ | 谈**发展诉求**而非抱怨：想接触更有挑战的业务/更完整的技术体系。**绝不吐槽前公司、前领导、同事** |
| 职业规划？ | 短期（半年～1 年）深耕业务与技术深度；中期（3 年）成为某个方向的骨干/能带小团队。要**具体且务实** |
| 你的优缺点？ | 优点结合岗位（如对细节和性能敏感、推动力强）并配例子；缺点要真实且**带改进措施**（如"以前不重视文档，现在会主动补"） |
| 怎么看待加班？ | 项目需要时能接受，同时强调会通过流程与工具提升效率减少无效加班 |
| 和同事有分歧怎么办？ | 用**数据和技术方案对比**说服，而不是职位；实在无法达成一致就按团队决策执行并保留意见 |
| 为什么选我们公司？ | 提前做功课：业务方向、技术博客/开源、产品体验。说清**你的能力和它的需求如何匹配** |

### 11.7 ⭐ 反问环节（一定要问，能加分）

**问技术/团队**：
- 团队目前的技术栈和规模？前端有多少人，怎么分工？
- 这个岗位主要负责哪块业务？入职后第一个项目大概是什么？
- 团队的代码规范、评审流程、测试与发布流程是怎样的？
- 团队有技术分享或开源计划吗？

**问成长与流程**：
- 团队怎么看待技术债？有没有固定的重构时间？
- 新人有没有 mentor 机制？考核周期和标准是什么？

**不要问**：能百度到的公司信息、薪资细节（等技术面通过后和 HR 谈）、明显暴露没做功课的问题。

### 11.8 面试后的复盘

- 记录每道没答好的题，当天补齐（**遗忘曲线最陡的就是当天**）。
- 区分失分原因：知识盲区 / 表达不清 / 思路偏差。
- 项目题打磨成"可复述的稿子"，但别背得像念稿。

---

## 十二、面试前速查清单

### 12.1 ⭐ 最高频必会 Top 20（考前必过一遍）

1. 闭包与作用域链
2. `this` 指向与箭头函数
3. 原型链与 `new` 的过程
4. 事件循环（宏任务/微任务）
5. Promise 状态与常用静态方法
6. `async/await` 与错误处理、并发
7. 深拷贝/浅拷贝
8. 防抖与节流
9. `call/apply/bind` 手写
10. 事件流与事件委托
11. HTTP 缓存（强缓存/协商缓存）
12. 跨域与 CORS
13. XSS 与 CSRF
14. Flex/Grid 布局与居中
15. BFC 与 margin 塌陷
16. 从输入 URL 到页面渲染
17. 性能指标与优化手段
18. Vue 3 响应式原理（Proxy）
19. `ref` vs `reactive`、`computed` vs `watch`
20. Vue diff 与 `key` 的作用

### 12.2 一句话原理速记

- **闭包**：函数 + 其定义时所在的词法环境。
- **事件循环**：同步 → 清空微任务 → 渲染 → 一个宏任务 → 循环。
- **强缓存**：`Cache-Control: max-age`，不发请求。
- **协商缓存**：`ETag/If-None-Match`，发请求命中返回 304。
- **CORS**：响应头 `Access-Control-Allow-Origin` 授权浏览器放行。
- **BFC**：独立渲染区域，可清浮动、防 margin 合并、防浮动覆盖。
- **Vue 响应式**：`Proxy` 拦截 `get` 收集依赖、`set` 触发更新，微任务批量刷新。
- **虚拟 DOM**：JS 对象描述 DOM，diff 后最小化真实 DOM 操作。

### 12.3 答题通用框架

- **概念题**：定义 → 原理/机制 → 使用场景 → 优缺点 → 举例。
- **对比题**：先说**共同点**，再**逐维度列表对比**，最后给**选择建议**。
- **手写题**：说思路 → 写代码 → 讲边界（空值、循环引用、`this`、越界）→ 复杂度。
- **场景题**：确认需求边界 → 拆解要点 → 给方案 → 主动说取舍与风险。
- **不会的题**：坦诚说明"这块我了解得不深"，然后从**相关已知知识**推导，展示思考过程 —— 比硬编答案得分高。

### 12.4 面试前 24 小时做什么

- [ ] 过一遍上面的 Top 20，每道题**出声讲一遍**（讲出来和三遍默读效果完全不同）。
- [ ] 把 2 个项目整理成 STAR 稿，准备好量化数据。
- [ ] 手写题动手敲一遍（尤其防抖节流、深拷贝、并发控制），别只看。
- [ ] 准备好 3 个反问问题。
- [ ] 确认面试形式（线上要测设备、共享屏幕、白板工具）。
- [ ] 睡够，别熬夜补八股 —— 表达清晰比多背两题重要。

---

> **最后**：前端面试越来越看重**项目深度与解决问题的能力**，纯八股只能过初筛。
> 把每道题都往"我项目里是怎么用的/遇到过什么问题"上引，才是真正的加分项。

---

*文档创建于本次会话 · 共 12 个大类、约 170 道题 · 可按需增删后直接作为博客文章发布*






