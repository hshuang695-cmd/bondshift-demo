# BONDSHIFT · UI Design Prompt Manual v1.0

> 一套基于两张参考图（梦境 3D 复古粉景图 + 复古邀请函艺术字图）整理出的结构化 UI 设计提示词，覆盖视觉风格、配色、字体、布局、组件、动效、艺术字应用 7 大模块。可直接复用至 Figma / Midjourney / 即时设计稿工作流。

---

## 🎨 设计哲学定位

### Prompt A · 整体视觉风格定义

```
BONDSHIFT 的核心视觉语言定义为 "Dreamcore Romanticism（梦境浪漫主义）"——

将 3D 梦境渲染感与复古邀请函美学融合，营造"在另一个世界里的初次约会"的氛围。

整体氛围关键词矩阵（按权重排序）：
✦ dreamy（梦幻）
✦ romantic（浪漫）
✦ cinematic（电影感）
✦ vintage-feminine（复古女性化）
✦ playful（俏皮）
✦ soft-glow（柔光弥散）
✦ nostalgic-warmth（旧时温情）
✦ surreal-pastel（超现实粉彩色）

视觉气质具体描述：
- 背景应如柔焦镜头下的梦境，光线充满弥散的粉色辉光（pink bloom）；
- 主体物件（角色头像、卡片）仿佛漂浮于薄雾之上，下方留下柔和的双层投影；
- 所有画面边缘保留柔和的暗角/光晕过渡，而非硬边切；
- 材质语言强调"被柔光打磨过的玻璃感"：柔和的高光、低饱和度的色彩倾染。

设计目标是制造"低决策疲劳 × 高情感沉浸"的体验，
让用户每次打开 BONDSHIFT 都像翻开一封写给自己的私人邀请函。
```

---

## 🌸 Part 1 · 配色方案（Color System）

### Prompt 1.1 · 主色调（Primary Palette）

```
BONDSHIFT 主色为"樱花粉 + 云雾白 + 玫瑰酒红点缀"三色组合：

【主角色（70%）—— 樱花粉域】
✦ Rose Quartz 樱花粉 · #F5C6D6 · 角色头像背景、品牌弥散光、按钮常态
✦ Petal Pink  花瓣粉 · #FFD7E0 · 卡片底色、辅助按钮
✦ Peach Cream 奶油桃 · #FFE5D9 · 沉浸式内容区背景、暖色纹理底

【辅角色（20%）—— 梦境冷色】
✦ Mint Cloud 薄荷云 · #B8E0D2 · 仅用于 Hero 区点缀、章节装饰腰封、按钮 hover 镭射描边
✦ Sage Linen 鼠尾草亚麻 · #D4E4D4 · 次级背景、低饱和 UI 衬底

【强调角色（8%）—— 复古酒红】
✦ Rose Wine 玫瑰酒红 · #B45A78 · 品牌 Logo 主色、艺术字主色、关键 CTA、关键图标
✦ Champagne Gold 香槟金 · #E6CFA7 · 限定装饰线、节庆徽章、未读消息小红点高光

【结构角色（2%）—— 镜面与墨色】
✦ Chrome Silver 镜面铬 · #D8DCE0 · 3D 角色卡边缘高光线、加载占位骨架
✦ Ink Velvet 墨绒紫 · #2D1B2E · 重要文字（绝不超过 5% 面积）

【底色系（UI 容器）】
✦ Cloud White 云雾白 · #FBF7F4 · 主背景，整体页面底色
✦ Paper Cream 纸张奶油 · #F8F0E5 · 复古邀请函风格卡片 / 章节分隔面板
✦ Sky Blush 天空粉蓝 · 由 #FCE4EC → #E8F4F8 渐变 · 用于 Hero 顶部与情感标题区背景

所有颜色禁止同时高饱和出现——始终保持"低饱和高频次"原则，
让画面任何一处截屏都呈现"被薄雾轻覆"的效果。
```

### Prompt 1.2 · 色彩应用规则

```
色彩使用 4 条核心规则：

1. 【70-20-8-2 法则】
   70% 主角色铺底，20% 辅角色过渡，8% 强调角色点亮，2% 结构角色收尾。
   Hero 页、角色选择页必须严格遵守，详情页可放宽至 60-25-12-3。

2. 【禁止清单】
   × 禁止出现纯黑 #000（统一用 Ink Velvet #2D1B2E 替代）
   × 禁止出现纯白 #FFF（统一用 Cloud White #FBF7F4 替代）
   × 禁止两个高饱和色相邻——必须用奶油色 #FFE5D9 做过渡
   × 禁止在主路径按钮上使用低对比色（须达 WCAG AA 4.5:1）

3. 【沉浸渐变协议】
   允许使用的渐变（其他自定义需 review）：
   - Sky Blush：linear-gradient(135deg, #FCE4EC 0%, #E8F4F8 100%)  [情感区背景]
   - Petal Mist：linear-gradient(180deg, #FFD7E0 0%, #FFE5D9 100%)  [卡片底色]
   - Wine Glow：radial-gradient(circle, #B45A78 0%, #F5C6D6 100%)  [心动按钮]

4. 【状态色】
   成功 = Sage Linen #D4E4D4 + 玫瑰酒红文字
   警告 = Champagne Gold #E6CFA7 + Ink Velvet 文字
   错误 = 玫瑰酒红减饱和版 #C77A92 + 米白文字
   信息 = Mint Cloud #B8E0D2 + Ink Velvet 文字
```

---

## 🔤 Part 2 · 字体排版规范（Typography）

### Prompt 2.1 · 字体家族定义

```
BONDSHIFT 字体家族共 5 个角色，全部从 Google Fonts 可获取（便于迁移）：

【Display · 品牌主字体】
"Fraunces"（推荐）或 "DM Serif Display"
—— 与第二张参考图的优雅衬线 × 复古感受呼应
—— 仅用于 Logo "BONDSHIFT" 与首页主标题
—— 字符应保留古典衬线 (ball terminals) 与轻微 italic 感

【Script · 艺术花体】（取自第二张参考图的"Birthday"）
"Petit Formal Script" 或 "Dancing Script"
—— 用于情感标签、节庆徽章、对话气泡中的署名
—— 字间距 -1%，行高 1.1，绝对不用于正文

【Serif · 优雅衬线】（取自第二张参考图的主标题"SACHA'S 18TH BIRTHDAY"）
"Cormorant Garamond" Regular + Italic
—— 用于卡片标题、章节标题（如"Choose Your Companion"）
—— 优先使用 Italic 制造柔美信号

【Sans · 现代无衬线】
"Plus Jakarta Sans"（主）或 "Manrope"（备）
—— 400/500/600/700 四个字重
—— 用于所有正文、按钮、表单、UI 元素、移动端优先场景

【Mono · 数字/装饰】
"JetBrains Mono" 500
—— 仅用于"距离下次约会还有 02:14:36"类倒计时与代号显示

字体加载建议：subset=latin，仅取所需字重；display=swap 保证 FOUT 不阻塞。
```

### Prompt 2.2 · 字号与字重节律

```
字号体系（移动端基准 375pt，桌面端 1440pt 可 ×1.6 放大）：

【Display】
- Logo / 主标识:        40-56pt / Fraunces 600 / letter-spacing: -0.02em
- Hero 主标题:          32-44pt / Cormorant Garamond Italic 500

【Heading】
- H1 页面大标题:        28-32pt / Cormorant Garamond 500 / letter-spacing: -0.01em
- H2 章节标题:          22-24pt / Cormorant Garamond 500
- H3 卡片标题:          18-20pt / Plus Jakarta Sans 600

【Body】
- 正文:                 15-16pt / Plus Jakarta Sans 400 / line-height: 1.65
- 强调正文:             15-16pt / Plus Jakarta Sans 500
- 辅助说明:             13-14pt / Plus Jakarta Sans 400 / color #6B5A6B 灰紫

【Caption】
- 标签 / 时间戳:        11-12pt / Plus Jakarta Sans 500 / letter-spacing: 0.04em / uppercase
- 装饰文字:             14-18pt / Petit Formal Script / 仅用于情感装饰

【Element】
- 按钮文字:             15-16pt / Plus Jakarta Sans 600 / letter-spacing: 0.02em
- 输入框文字:           16pt / Plus Jakarta Sans 400（保证 iOS 不自动缩放）

行高规则：
- Display & Heading: 1.1-1.2
- Body: 1.65
- 列表 / 紧凑段落: 1.45
- Script 装饰: 1.05
```

### Prompt 2.3 · 中文字体回退

```
因项目主体用户为中文场景，全链路中文字体回退方案：

【中文 Display】
首选：方正风雅宋 / 汉仪润圆
回退："Noto Serif SC" 500，Source Han Serif SC

【中文 Sans】
首选：思源黑体（Source Han Sans CN）Light/Regular/Medium
回退："PingFang SC", "Microsoft YaHei", sans-serif

【中文 Script】
首选：方正手迹体 / 汉仪手写体
回退："Ma Shan Zheng", "Liu Jian Mao Cao", cursive

CSS 写法示例：
font-family: 'Cormorant Garamond', 'Noto Serif SC', 'Songti SC', serif;
font-family: 'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

---

## 🎀 Part 3 · 艺术字应用规范（Highlight）

### Prompt 3.1 · 艺术字使用场景

```
BONDSHIFT 艺术字仅在以下 5 个位置使用，绝不滥用：

1. 【品牌 Logo 区 · 最高频】
   - Logo "BONDSHIFT" 采用 Fraunces Italic 700 + 玫瑰酒红 #B45A78
   - 字母 B 与 T 的尾部可饰以丝带收尾（参考第二张图蝴蝶结）
   - 副标识："a new companion, every day" 使用 Petit Formal Script 14pt

2. 【Hero 主标题】
   - 单行或两行标题如"He met you in another timeline."
   - 用 Cormorant Garamond Italic 500 + 大字号 44-56pt + 玫瑰酒红渐变描边
   - 标题下方配一行 Petit Formal Script 装饰文字（如 ✦ a love letter to you ✦）

3. 【章节分隔标题】
   - "Choose Your Companion"、"Today's Vibe"、"Memory Fragments"
   - Cormorant Garamond Italic 500 + 32pt + 玫瑰酒红 + 居中
   - 标题左右配以左右对称的细线 + 闪光星 ✦

4. 【情感卡片标语】
   - 单句情感语句如"today, I brought you flowers"
   - Petit Formal Script 22pt + 玫瑰酒红
   - 永远手写感、自然流泻、避免机械对齐

5. 【角色签名 / 对话署名】
   - 角色姓名以 Petit Formal Script 20pt + 角色代表色
   - 跟随对话气泡右下角，宛如亲笔签名

❌ 禁止艺术字出现在：按钮、表单、错误提示、价格、日期
```

### Prompt 3.2 · 艺术字与整体视觉协调

```
艺术字必须遵守 4 条协调法则：

1. 【色彩一致性】
   所有艺术字仅用 3 种颜色：玫瑰酒红 #B45A78、香槟金 #E6CFA7、墨绒紫 #2D1B2E。
   不允许出现纯黑、纯白、纯蓝等"出戏色"。

2. 【装饰陪衬】
   每一处艺术字周围必须留出至少 48px 的"呼吸空间"，禁止与其它 UI 元素紧贴。
   周围可饰以：
   - 单个丝带蝴蝶结 SVG（从第二张参考图提取轮廓）
   - 3-5 颗闪光星 SVG（路径:✦·✦·✦）

3. 【节奏一致性】
   一次只出现一种艺术字风格——若主标题用了斜体衬线，章节小标题就用直衬线。
   全站保持 "Display Italic 标题 + Sans 正文 + Script 点缀" 的三段节奏。

4. 【响应式降级】
   - 移动端字号过大时（>32pt 显示不下）自动改为 Cormorant Garamond Regular 替代 Italic
   - 装饰元素在小屏自动收起，仅保留主标题文字
```

### Prompt 3.3 · 装饰符号库（SVG Sprites）

```
须设计并维护一套装饰符号库，包含：

✦ ribbon-bow-small  · 64×64 · 玫瑰酒红描边 1.5px · 用于 Logo / 标题角部
✦ ribbon-bow-large  · 128×128 · 用于邀请函风格卡片四角
✦ sparkle-cluster   · 80×80 · 4 颗闪光星组合 · 用于情感标签
✦ sparkle-single    · 16×16 · 单颗闪光星 · 用于 inline 强调
✦ hand-drawn-line   · 横向手绘分隔线 · 长度可变 · 用于章节间分隔
✦ vintage-frame     · 装饰性复古边框 · 玫瑰酒红描边 · 用于邀请函风格模块
✦ cherry-petal      · 单片樱花花瓣 · 32×32 · 用于背景粒子散落

所有 SVG 符号使用 currentColor 描边，便于一键切色。
```

---

## 🧱 Part 4 · 页面布局结构（Layout）

### Prompt 4.1 · 移动优先布局原则

```
BONDSHIFT 是移动端优先的 React Web 应用，移动端基线为 iPhone 14 标准（390×844）：

【全局结构】
- 顶部安全区：44pt（避免被刘海/灵动岛遮挡）
- 底部 Home Indicator：34pt
- 左右内边距：移动 20pt / 桌面 32-48pt
- 内容最大宽度：480pt 居中显示（移动），桌面端仍保持居中堆叠不横铺

【栅格系统】
- 移动端：单列 4 列栅格，gutter 16pt
- 平板端：2 列栅格，gutter 24pt
- 桌面端：3-4 列卡片墙，gutter 32pt

【圆角阶梯】
- 大卡片（角色卡）：24pt
- 中卡片（对话块）：16pt
- 按钮：胶囊型 999pt 或 12pt 圆角二选一（推荐胶囊型，呼应邀请函丝带感）
- 头像：999pt 全圆
- 装饰元素容器：8-12pt

【阴影系统】（关键，营造 3D 浮起感）
- shadow-sm   卡片默认：0 2 4 -1 rgba(180,90,120,0.06), 0 1 2 rgba(180,90,120,0.04)
- shadow-md   卡片 hover：0 12 24 -8 rgba(180,90,120,0.12), 0 4 8 rgba(180,90,120,0.06)
- shadow-lg   主 CTA / Modal：0 24 48 -16 rgba(180,90,120,0.16), 0 8 16 rgba(180,90,120,0.08)
- shadow-glow 主 Logo / 角色卡选中：0 0 32 -4 rgba(245,198,214,0.6)

阴影一律带"玫瑰粉色调（180,90,120）"，禁止使用纯黑或纯灰阴影。
这让界面如浸润在薄雾之中，而非冰冷工业风。
```

### Prompt 4.2 · 顶部导航与底部 Tab

```
【顶部导航 (TopBar)】
- 高度：56pt 移动端 / 64pt 桌面端
- 背景：Cloud White #FBF7F4 + backdrop-blur(20px) + 底部 1px #F5C6D6 细线
- 左上角：返回按钮（圆形 40×40，玫瑰酒红描边图标）
- 居中：当前页面 Script 标题，玫瑰酒红
- 右上角：圆角胶囊按钮组（如通知 / 设置），图标 24×24

【底部 Tab Bar】
- 高度：76pt（含安全区 34pt + 主体 42pt）
- 背景：Cloud White + 顶部分隔 1px #F5C6D6
- 4 个 Tab：Discover / Companions / Heart / Profile
- 图标 24×24，激活态：玫瑰酒红 + 下方 4pt 玫瑰酒红圆点高亮
- 标签：Plus Jakarta Sans 500 11pt，激活态墨绒紫，未激活 #B5A5B5
- 整体风格参考 Instagram 故事栏与小红书底部 Tab 的视觉重量
```

### Prompt 4.3 · Hero 与主着陆页

```
Landing 页 / Hero 区：

【布局】（单列滚动）
1. 顶部状态栏区
2. Logo "BONDSHIFT" 居中（含丝带装饰）—— 56-72pt
3. 一行 Script 副标语 —— 16pt Petit Formal Script
4. 主插画区 360×240 ：3D 渲染的复古敞篷车 / 樱花场景缩略卡片
5. 主 CTA 按钮 "Begin Your Story" 全宽 64×360
6. 次级链接 "Already have an account? Sign in" 12pt 辅助色
7. 装饰：底部飘落 5-8 片樱花花瓣 SVG 粒子（缓慢下落动效）

【情感传达】
让用户第一屏停留 3 秒即可理解："这是一个温柔的、慢节奏的、被精心设计的约会模拟世界。"
背景使用 Sky Blush 渐变（#FCE4EC → #E8F4F8）+ 顶部柔光。
```

### Prompt 4.4 · 角色选择页（Companion Roster）

```
【布局】垂直滑动卡片墙
顶部：单行标题 Cormorant Garamond Italic 32pt "Tonight's Companions"
中间：3-4 张"角色卡"垂直堆叠，卡片间间距 20pt

【单张角色卡规格】360×520
- 顶部：角色肖像图 360×320，圆角 24pt 顶部
- 角色名：Cormorant Garamond 24pt 居中 + 角色代表色
- 一句 Script 简介：Petit Formal Script 16pt，3 行以内
- 标签胶囊：3 个胶囊按钮（性格关键词）+ 玫瑰酒红描边
- 底部主按钮："Meet [Name]" 全宽胶囊，Wine Glow 渐变
- 卡片默认：shadow-md，hover：上浮 8pt + shadow-lg + 1.02 缩放
```

### Prompt 4.5 · 对话与故事页

```
【对话流布局】
1. 顶部：返回 + 角色名（Script 字体） + "在线"小绿点
2. 内容区：垂直滚动的对话气泡
   - 角色消息（左侧）：Paper Cream 卡片 + 玫瑰酒红描边 + Script 文字
   - 用户消息（右侧）：玫瑰酒红渐变背景 + Cloud White 文字
   - 系统提示（居中）：灰色 12pt + 闪光星前后点缀
3. 底部：多轮选项胶囊按钮 2-3 个堆叠（让用户做剧情选择）
4. 最底部：固定输入框（仅在自由发言模式出现）

【氛围】
对话页应像"翻阅一封封手写信件"，每条角色消息进入时有"淡入 + 轻微上浮 + 打字机效果"。
```

### Prompt 4.6 · 个人中心与成就页

```
【结构】垂直分区
1. 用户头像 + 昵称区：顶部 30% 高度，Sky Blush 渐变背景
2. 当前关系卡片：当前正在推进的角色名 + 关系进度条
3. 记忆碎片网格：3 列缩略卡片墙，每张代表一次重要对话
4. 心愿单：横向滚动的卡片列表
5. 设置入口：列表式菜单，玫瑰酒红描边图标
```

---

## 🎯 Part 5 · 图标与按钮（Iconography & Buttons）

### Prompt 5.1 · 图标系统

```
【图标风格】"Soft Outline with Warmth"

具体规范：
- 描边宽度：1.5px（绝不超过 2px，保持柔美）
- 收尾：圆角 round cap + round join
- 默认色：墨绒紫 #2D1B2E
- 激活色：玫瑰酒红 #B45A78
- 禁用色：#C8B8C8 灰紫

【风格来源】
基础风格采用 Phosphor Icons 的 "Regular" 或 "Duotone" 系列，
并定制 5 个 BONDSHIFT 专属图标：
✦ heart-shine （闪光心，用于心动按钮）
✦ letter-seal （蜡封信件，用于对话入口）
✦ rose-bloom （玫瑰花，用于情感觉醒）
✦ moon-switch （弯月切换，用于换乘机制）
✦ ribbon-tag （丝带书签，用于收藏）

图标永远置于浅奶油背景或纯粉背景上，
禁止将任何图标置于纯白或纯黑背景上（破坏氛围）。
```

### Prompt 5.2 · 主 CTA 按钮

```
【主要 CTA - 心动按钮】

视觉规格：
- 形状：胶囊型 (border-radius: 999px) 或 16pt 圆角矩形
- 尺寸：垂直 56pt，水平最小 160pt 但通常 100% 容器宽度（移动端）
- 背景：Wine Glow radial-gradient(circle, #B45A78 0%, #F5C6D6 100%)
- 文字：Plus Jakarta Sans 600 / 16pt / Cloud White / letter-spacing 0.02em
- 阴影：shadow-md 默认 + shadow-glow hover
- 描边：1px #B45A78 实色内侧（增加厚重感）

交互状态：
- 默认：渐变背景 + 静态
- hover：渐变中心点上移 8%，亮度 +10%，shadow → shadow-glow
- active：scale(0.96)，shadow 收紧至 shadow-sm
- disabled：渐变降饱和至 30%，无阴影，文字降透明度至 60%

按钮前可放置 16×16 图标（如心形、玫瑰）；
按钮文字后允许放置 Script 装饰小字（如 "today ✦"）。
```

### Prompt 5.3 · 次级与幽灵按钮

```
【次级按钮】
- 形状：胶囊型
- 背景：Petal Pink #FFD7E0
- 描边：1.5px #B45A78 玫瑰酒红
- 文字：玫瑰酒红 16pt Plus Jakarta Sans 600

【幽灵按钮】
- 形状：胶囊型
- 背景：透明
- 描边：1.5px #B45A78
- 文字：玫瑰酒红

【文字按钮】
- 无背景无边框
- 仅 Plus Jakarta Sans 600 14pt 玫瑰酒红 + 下划线 2px
- 用于低优先级操作（如"跳过"、"稍后"）

【图标按钮】
- 圆形 40×40 或 48×48
- 背景：透明 / Petal Pink / 玫瑰酒红填充
- 仅放置 20×20 图标居中
```

---

## ✨ Part 6 · 交互动效（Motion & Micro-interactions）

### Prompt 6.1 · 微交互规范

```
【全局动效节律】慢节奏、感性、柔和——避免任何"砰"或"砸"的感觉。

【统一使用】Framer Motion + spring 配置

【按钮反馈】
- 点击：scale: 1 → 0.96 → 1，duration 200ms，spring {stiffness: 400, damping: 20}
- 涟漪：玫瑰酒红 30% 透明圆形从点击点扩散至按钮边缘，opacity 1 → 0，duration 500ms

【卡片反馈】
- 默认：transform: translateY(0) + shadow-md
- hover：transform: translateY(-8pt) + shadow-lg + scale 1.02，duration 300ms

【列表/气泡进入】
- 进入：opacity 0 → 1 + translateY 16pt → 0，duration 400ms，ease-out
- 多个元素 stagger 50ms 进入

【打字机效果】（对话气泡专属）
- 角色消息逐字浮现，每字 35-50ms
- 完成时光标闪烁 2 次后消失

【心动 Heartbeat】（心动按钮点击后）
- scale: 1 → 1.3 → 0.95 → 1，duration 800ms
- 周围 8 颗小爱心从中心向外飞散并淡出，duration 1200ms

【页面转场】
- 进入：opacity 0 → 1 + translateY 24pt → 0，duration 500ms
- 退出：opacity 1 → 0 + scale 1 → 0.96，duration 300ms
- 路由切换由 Framer Motion AnimatePresence 管理
```

### Prompt 6.2 · 装饰动效（背景层）

```
【樱花花瓣飘落】仅在 Landing / Hero / 角色选择页启用
- 5-10 片 SVG 樱花花瓣
- 从屏幕顶部缓慢下降，速度 8-15 pt/s
- 微风摆动：水平方向 sin 波动，amplitude 12-24pt，周期 4-8s
- 底部接触时透明度逐渐归零

【柔光呼吸】（Hero 背景动效）
- 整片 Sky Blush 渐变背景层进行 opacity 0.92 ↔ 1.0 呼吸
- 周期 6 秒，ease-in-out

【闪光星闪烁】
- 出现在艺术字附近的闪光星 SVG
- scale 0.9 ↔ 1.1 + opacity 0.7 ↔ 1 慢速循环
- 周期 2-4 秒（每颗错开）

【角色肖像轻微摆动】
- 仅在角色选择卡被聚焦时启用
- 头部图像 translateY 0 ↔ -4pt + 极轻 rotate 0 ↔ 1deg，周期 4s
- 持续传递"仿佛在呼吸/等待"的暗示

【全站禁用】
× 禁止使用急速弹跳 / 旋转 / 翻转 / 拼图等强刺激动效
× 禁止超过 600ms 的长转场
× 禁止重绘面积 > 30% 的爆炸动效
```

---

## 🩰 Part 7 · 装饰元素与材质语言

### Prompt 7.1 · 视觉装饰元素库

```
BONDSHIFT 必备的 6 类装饰元素：

1. 【丝带蝴蝶结（Ribbon Bow）】
   - 来源：第二张参考图四角装饰
   - 形态：双层对称蝴蝶结 + 流苏飘带
   - 用法：装饰邀请函风卡片四角、Logo 旁点缀、空状态插画

2. 【闪光星（Sparkle）】
   - 4 角或 6 角星形，单线或填充皆可
   - 用法：艺术字周围装饰、按钮 hover 时浮现

3. 【手绘细线】
   - 笔画粗细不均的细线，仿佛钢笔手绘
   - 用法：章节分隔、卡片内嵌分隔线

4. 【樱花花瓣】
   - 5 瓣造型，柔粉色
   - 用法：背景粒子、节庆状态（解锁成就时）

5. 【复古邀请函边框】
   - 对称四角卷曲边框
   - 用法：装饰特殊卡片（成就、邀请函、庆贺模块）

6. 【3D 角色肖像】
   - 圆润、柔光、低多边形 3D 渲染风
   - 与图 1 复古粉景图的 3D 质感一致
   - 用法：角色卡片头像、Hero 主图、Loading 占位

每个装饰元素都必须有"被柔光打过的玻璃感"——
不要锐利、要圆润；不要硬边、要朦胧；不要工业、要手作。
```

### Prompt 7.2 · 图像与插画指南

```
【3D 渲染主视觉（来源图 1 风格）】
若需新增 3D 插画，Midjourney / 即时设计 Prompt 模板：

"BondsShift visual: a dreamy 3D rendered pastel scene, soft pink cherry blossom tree,
mint green archway, chrome mirrored spheres, pink vintage convertible,
palm trees, surreal desert mountains in background, reflective wet ground,
soft pink bloom lighting, low saturation, cinematic composition,
vintage-future romanticism, no text --ar 9:16 --style raw"

【2D 平面插画】
若需 2D 装饰插画，特征：圆头 Q 版、2-3 头身、粉嫩肤色、玫瑰酒红眼瞳、柔光打光。
避免任何尖角、粗线、阴影硬边。

【照片与人物】
- 若使用真人物照片，需统一经过"梦幻奶油色滤镜"调色：
  - 加粉白色柔焦 +10%
  - 加光晕 +5%
  - 饱和度 -15%
  - 色温暖移 +10%
- 让所有人物似从同一梦境中走出。
```

---

## 📐 Part 8 · 品牌一致性检查清单（QA Sheet）

```
【使用前自检】每张设计稿必须依次通过以下 10 项检查：

□ 1. 整体色温为"暖色偏粉"，无冷蓝/纯灰大色块？
□ 2. 阴影色彩为玫瑰粉色调，无纯黑阴影？
□ 3. 字体家族齐全（Fraunces / Cormorant Garamond / Plus Jakarta Sans / Petit Formal Script）？
□ 4. 艺术字仅出现在 5 个允许位置，未出现在按钮/表单？
□ 5. 圆角阶梯统一（卡片 24pt / 中块 16pt / 按钮胶囊）？
□ 6. 动效 ≤ 600ms，无弹跳/翻转/旋转？
□ 7. 背景使用 Sky Blush / Paper Cream，未使用纯白？
□ 8. 至少 2 类装饰元素（丝带 / 闪光星 / 樱花 / 手绘线）出现？
□ 9. 文字大小覆盖 H1 (28pt) ~ Body (15pt) ~ Caption (11pt) 层级？
□ 10. 移动端 (375×812) 模拟图通过？

【禁止用语】
✗ "扁平化" "极简主义" "现代冷淡" "未来感金属" "纯黑白"
—— 这些形容词不应出现在任何 BONDSHIFT 设计语言描述里。

【始终用语】
✓ "柔光" "浪漫" "梦境" "邀请函感" "复古女性化" "低决策疲劳"
```

---

## 📦 附录 · 交付清单

```
本提示词手册可拆解为以下可执行资产：

1. [tokens.css] —— 设计令牌（颜色 / 字号 / 间距 / 阴影 / 圆角）
2. [fonts.css]  —— 字体加载与字体栈回退
3. [components/Button.figma] —— 4 类按钮组件
4. [components/Card.figma] —— 角色卡 / 对话块 / 成就卡 3 类卡片
5. [components/Input.figma] —— 文本输入 / 胶囊选项 / 滑块
6. [components/Navigation.figma] —— TopBar / TabBar / FAB
7. [decorations/sparkles.svg] —— 装饰 SVG 雪碧图
8. [decorations/ribbon-bow.svg] —— 蝴蝶结与边框 SVG
9. [screens/] —— 8 张核心页 Figma 源文件
10. [motion-spec.md] —— Framer Motion 配置文档

——「文字匠人」出品 · 让 BONDSHIFT 的每一帧都像一封私人邀请函。
```

---

## ✅ 一句话设计总原则（One-liner）

> **BONDSHIFT = 梦境中漂浮的复古邀请函 × 温柔的 3D 约会世界**
> 用樱花粉柔光描出轮廓，用玫瑰酒红点亮情感，用丝带蝴蝶结与闪光星为每一次滑动制造微小惊喜——让每一位女性用户都感觉自己正翻阅一封为她亲手写的信。
