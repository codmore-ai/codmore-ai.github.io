import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import AsciiBackground from './AsciiBackground.jsx'
import HeroTitle from './HeroTitle.jsx'
import LogoMark from './LogoMark.jsx'
import Preloader from './Preloader.jsx'
import ScrollProgress from './ScrollProgress.jsx'
import { startRevealGuard } from './motion/revealGuard.js'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ORG = 'https://cnb.cool/codmore.ai'

const nav = [
  { label: '首页', href: '#home' },
  { label: '产品', href: '#products' },
  { label: '开源', href: '#open' },
  { label: '关于', href: '#about' },
  { label: '日志', href: '#log' },
  { label: '联系', href: '#contact' },
]

const products = [
  {
    id: 'codbox',
    name: 'codbox',
    kicker: 'DESKTOP GUI AGENT',
    logo: 'products/codbox.png',
    status: '开发中',
    lead: 'pi 是一个极简的开源终端编码 agent。codbox 给它装上一副眼睛和一双手 —— 一个桌面 GUI。',
    points: [
      ['看得见的会话', '把终端里滚来滚去的对话、diff、工具调用，变成窗口里能点、能翻、能回滚的东西。'],
      ['不魔改内核', 'agent 本体仍是 pi：支持多家模型商、可扩展。我们只做界面层，不重造轮子。'],
      ['Electron + React', '本地起会话、看输出、开多个工程窗口，不用在三个终端标签之间跳。'],
    ],
    stack: ['Electron', 'React', 'pi'],
    repo: `${ORG}/codbox`,
    repoState: '仓库已建',
  },
  {
    id: 'd1',
    name: 'codmore-d1.0',
    kicker: 'NON-AUTOREGRESSIVE DECISION MODEL',
    logo: 'products/decide.png',
    status: '训练中',
    lead: 'codmore-decide-1.0，一个类 Jev 的决策模型：非结构化的状态进，带类型的概率决策出。',
    points: [
      ['决策不等于生成', '路由、分类、下一步该做什么 —— 这类判断不需要把 token 一个一个吐出来。'],
      ['小模型，快反应', `首版基于 Qwen3-0.6B 做 LoRA 微调，再用 RLCD 算法对齐决策偏好。`],
      ['给 agent 当反射弧', 'codbox 每一次「该点哪里、该输什么」，都可以交给它来判断。'],
    ],
    stack: ['Qwen3-0.6B', 'LoRA', 'RLCD'],
    repo: `${ORG}/decide-1.0`,
    repoState: '暂私有',
  },
  {
    id: 'ime',
    name: 'AI 输入法',
    kicker: 'IN EXPLORATION',
    emoji: '⌨️',
    status: '立项',
    lead: '把模型塞进「打字」这件事本身：候选、改写、续写，在你按下空格之前就想好。',
    points: [
      ['还没定的部分', '形态、平台、模型规模都还在试。定下来之前，这里不会假装已经定了。'],
      ['一定开源', '和 codbox、d1.0 一样，代码会放在同一个组织下。'],
    ],
    stack: ['待定'],
    repo: null,
    repoState: '未公开',
  },
]

const repos = [
  { name: 'codbox', desc: 'pi 的桌面 GUI', url: `${ORG}/codbox`, state: '已建仓库' },
  { name: 'decide-1.0', desc: 'codmore-d1.0 决策模型', url: `${ORG}/decide-1.0`, state: '暂私有' },
  { name: 'codmore.ai', desc: '开源组织主页', url: ORG, state: '组织' },
]

const principles = [
  ['能开源就开源', '包括还没发布的那个输入法。没有「先闭源跑通再考虑」。'],
  ['不重造别人的轮子', 'codbox 没有重写 agent，它站在 pi 上面，只做缺的那一层界面。'],
  ['标语就是待办清单', '「编写更多可能」不是口号，是三个还没做完的东西。'],
]

const stats = [
  { num: '3', label: '个在做的项目' },
  { num: '100%', label: '开源承诺' },
  { num: '1', label: '个人的工作室' },
]

const logEntries = [
  ['codbox', '技术栈定为 Electron + React，内核继续用 pi。仓库已在 cnb.cool 建好。'],
  ['codmore-d1.0', '首版路线定下来了：Qwen3-0.6B 起步，LoRA 微调 + RLCD 算法。'],
  ['AI 输入法', '立项。形态还在探索，唯一确定的是会开源。'],
]

function Star({ className }) {
  return <span className={`pointer-events-none absolute select-none ${className}`}>✦</span>
}

function SectionTitle({ emoji, title, sub, dark = false }) {
  return (
    <div className="section-title mb-12 text-center">
      <h2 className="text-3xl sm:text-4xl">
        <span className="mr-2 inline-block">{emoji}</span>
        {title}
      </h2>
      <div className={`title-bar mx-auto mt-3 h-2 w-24 rounded-full ${dark ? 'bg-neon-mint' : 'bg-sun'}`} />
      {sub && <p className={`mt-4 ${dark ? 'text-cream/60' : 'text-ink/60'}`}>{sub}</p>}
    </div>
  )
}

function TermWindow({ lines, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border-[3px] border-neon/40 bg-void-soft shadow-neon ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-neon/20 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-coral" />
        <span className="h-2.5 w-2.5 rounded-full bg-sun" />
        <span className="h-2.5 w-2.5 rounded-full bg-mint" />
        <span className="ml-2 font-mono text-[11px] text-cream/40">codmore@studio ~ zsh</span>
      </div>
      <div className="space-y-1.5 p-5 font-mono text-[12px] leading-relaxed sm:text-[13px]">
        {lines.map((l, i) => (
          <div key={i} className={l.kind === 'out' ? 'text-cream/50' : 'text-neon-mint'}>
            {l.kind === 'out' ? (
              <span>{l.text}</span>
            ) : (
              <>
                <span className="text-grape">$ </span>
                <span>{l.text}</span>
              </>
            )}
          </div>
        ))}
        <div className="text-neon-mint">
          <span className="text-grape">$ </span>
          <span className="animate-blink">▊</span>
        </div>
      </div>
    </div>
  )
}

function Navbar({ onJump }) {
  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="site-nav mx-auto mt-4 flex max-w-5xl items-center justify-between rounded-full border-[3px] border-ink bg-white/90 px-6 py-3 shadow-toon-sm backdrop-blur">
        <a href="#home" onClick={onJump} className="flex items-center gap-2 text-xl">
          <LogoMark className="h-7 w-7 text-grape" />
          <span className="text-grape">codmore</span>
          <span className="hidden text-xs text-ink/60 sm:inline">AI 工作室</span>
        </a>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onJump}
              className="hidden rounded-full px-2 py-1 transition hover:bg-sun hover:text-ink lg:inline-block"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={onJump}
            className="rounded-full border-2 border-ink bg-sun px-4 py-1.5 transition hover:-translate-y-0.5 hover:shadow-toon-sm"
          >
            找我们聊聊
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero({ heroReady }) {
  return (
    <section
      id="home"
      className="seg-dark relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-20"
    >
      <div className="blob-pink pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-grape/25 blur-2xl" />
      <div className="blob-mint pointer-events-none absolute -right-20 bottom-24 h-80 w-80 rounded-full bg-mint/20 blur-2xl" />
      <Star className="left-[12%] top-[22%] animate-wiggle text-3xl text-sun" />
      <Star className="right-[15%] top-[30%] animate-float text-2xl text-coral" />
      <Star className="left-[20%] bottom-[25%] animate-float-slow text-2xl text-mint" />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="hero-kicker flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-neon/40 bg-void-soft">
              <LogoMark className="h-5 w-5 text-neon" />
            </span>
            <span className="font-mono text-xs tracking-widest text-cream/50">
              codmore · personal AI studio
            </span>
          </div>

          <h1 className="hero-title mt-6 font-tech text-5xl leading-[1.15] sm:text-7xl">
            <HeroTitle text="编写更多可能" className="block text-cream" enabled={heroReady} />
          </h1>

          <p className="hero-sub mt-6 max-w-xl text-lg leading-8 text-cream/70">
            一个人的 AI 工作室。三个产品在做 —— 一个给终端 agent 装上界面的{' '}
            <span className="text-neon-mint">codbox</span>、一个做判断的{' '}
            <span className="text-neon-mint">决策模型</span>、一个还没定形的{' '}
            <span className="text-neon-mint">AI 输入法</span>。全部开源。
          </p>

          <div className="hero-cta mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#products"
              className="rounded-full border-[3px] border-cream/80 bg-neon px-7 py-3 text-ink shadow-toon-dark transition hover:-translate-y-1 hover:shadow-none active:translate-y-0.5"
            >
              看看在做什么 ✨
            </a>
            <a
              href={ORG}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-[3px] border-cream/40 px-7 py-3 font-mono text-sm text-cream/80 transition hover:border-cream hover:text-cream"
            >
              git clone codmore.ai
            </a>
          </div>
        </div>

        <TermWindow
          className="hero-term"
          lines={[
            { kind: 'cmd', text: 'codbox open --agent=pi' },
            { kind: 'out', text: 'attached · session refactor/auth-middleware' },
            { kind: 'out', text: 'diff 12 files · 3 tool calls · 1 pending' },
            { kind: 'cmd', text: 'codmore-d1 decide --state=screen' },
            { kind: 'out', text: '{ action: "click", target: "submit", p: 0.93 }' },
          ]}
        />
      </div>

      <div className="hero-arrow absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-2xl text-cream/50">
        ⬇
      </div>
    </section>
  )
}

function NameEgg() {
  return (
    <section id="name" className="relative mx-auto max-w-4xl px-6 py-24">
      <div className="name-card rounded-3xl border-[3px] border-ink bg-white p-8 shadow-toon sm:p-12">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-tech text-4xl text-grape">cod·more</span>
          <span className="font-mono text-sm text-ink/40">/kɒd mɔːr/ · 名词</span>
        </div>
        <ol className="mt-6 space-y-4">
          {[
            ['code + more', '编写更多。这是明面上的意思，也是标语的来处。'],
            ['cod', '鳕鱼。所以你会在这个页面里看到一条鱼游来游去。'],
            ['一间个人 AI 工作室', '标语是「编写更多可能」，目前写在三个还没做完的东西上。'],
          ].map(([term, desc], i) => (
            <li key={term} className="flex gap-4">
              <span className="mt-1 font-mono text-xs text-ink/30">0{i + 1}</span>
              <div>
                <div className="text-xl">{term}</div>
                <p className="mt-1 leading-7 text-ink/70">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function ProductBlock({ p }) {
  return (
    <article
      data-reveal
      className="product-card grid items-center gap-8 rounded-3xl border-[3px] border-neon/30 bg-void-soft/80 p-8 shadow-toon-dark sm:p-10 lg:grid-cols-2"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] tracking-widest text-neon-mint/70">{p.kicker}</span>
          <span className="rotate-[-2deg] rounded-xl border-2 border-coral bg-coral/15 px-2.5 py-0.5 text-xs text-coral">
            {p.status}
          </span>
        </div>
        <h3 className="mt-3 font-tech text-3xl text-cream sm:text-4xl">{p.name}</h3>
        <p className="mt-4 leading-8 text-cream/75">{p.lead}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {p.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border border-neon/30 px-3 py-1 font-mono text-[11px] text-neon"
            >
              {s}
            </span>
          ))}
        </div>
        {p.repo && (
          <a
            href={p.repo}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex flex-wrap items-center gap-x-2 rounded-full border-2 border-cream/30 px-5 py-2 font-mono text-xs text-cream/80 transition hover:border-neon-mint hover:text-neon-mint"
          >
            <span className="whitespace-nowrap">{p.repo.replace('https://', '')}</span>
            <span className="text-neon-mint">↗</span>
            <span className="text-cream/40 whitespace-nowrap">· {p.repoState}</span>
          </a>
        )}
      </div>

      <div>
        <div className="mb-6 flex items-center justify-center overflow-hidden rounded-2xl border-[3px] border-neon/25 bg-cream">
          {p.logo ? (
            <img
              src={import.meta.env.BASE_URL + p.logo}
              alt={`${p.name} logo`}
              className="w-full"
              loading="lazy"
            />
          ) : (
            <span className="py-16 text-7xl">{p.emoji}</span>
          )}
        </div>
        <ul className="space-y-4">
          {p.points.map(([head, body]) => (
            <li key={head} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-mint" />
              <div>
                <div className="text-neon-mint">{head}</div>
                <p className="mt-0.5 text-sm leading-7 text-cream/60">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function Products() {
  return (
    <section id="products" className="seg-dark relative px-6 py-24">
      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionTitle
          dark
          emoji="🚧"
          title="正在做的三个东西"
          sub="都还没做完。下面写的是已经确定的部分。"
        />
        <div className="product-stack space-y-10">
          {products.map((p) => (
            <ProductBlock key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

function OpenSource() {
  return (
    <section id="open" className="relative mx-auto max-w-5xl px-6 py-24">
      <SectionTitle emoji="📦" title="全部开源" sub="包括还没发布的那个" />
      <div className="grid gap-8 md:grid-cols-5">
        <div data-reveal className="repo-list open-card self-start rounded-3xl border-[3px] border-ink bg-white p-8 shadow-toon md:col-span-3">
          {repos.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="repo-row flex items-center justify-between gap-4 border-b border-dashed border-ink/15 py-4 first:pt-0 last:border-0 last:pb-0 transition hover:bg-blush/60"
            >
              <div>
                <div className="font-mono text-sm text-grape">{r.name}</div>
                <div className="text-sm text-ink/60">{r.desc}</div>
              </div>
              <span className="shrink-0 rounded-full bg-sun/60 px-3 py-1 text-xs">{r.state}</span>
            </a>
          ))}
        </div>
        <div data-reveal className="how-card rounded-3xl border-[3px] border-ink bg-mint p-8 shadow-toon md:col-span-2">
          <h3 className="text-2xl">怎么参与</h3>
          <ol className="mt-5 space-y-4 text-sm leading-7">
            <li>
              <span className="font-mono text-ink/40">01</span> 去 cnb.cool 给仓库点个 star，
              问题直接开 issue。
            </li>
            <li>
              <span className="font-mono text-ink/40">02</span> 想改哪块就说哪块，
              一个人的工作室意味着没人跟你走流程。
            </li>
            <li>
              <span className="font-mono text-ink/40">03</span> 或者只是写信骂我们做得慢：
              <a href="mailto:codmore@foxmail.com" className="ml-1 underline">
                codmore@foxmail.com
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="relative mx-auto max-w-5xl px-6 py-24">
      <SectionTitle emoji="🏠" title="关于 codmore" sub="一个人的工作室，但按队伍的标准要求自己" />
      <div className="grid gap-8 md:grid-cols-5">
        <div data-reveal className="about-card rounded-3xl border-[3px] border-ink bg-white p-8 shadow-toon md:col-span-3">
          <p className="leading-8 text-ink/80">
            codmore 是一间做 AI 应用与模型的个人工作室。起点很朴素：
            终端里的编码 agent 已经足够聪明，但只有愿意背命令的人才用得上；
            而很多「该做什么」的判断，交给大模型既慢又贵。
          </p>
          <p className="mt-4 leading-8 text-ink/80">
            所以我们一个给它做界面，一个专门做判断。
            <span className="rounded bg-sun/60 px-1">所有产品都开源</span>
            ，包括还没发布的那个输入法。
          </p>
          <div className="mt-7 space-y-3 border-t border-dashed border-ink/15 pt-6">
            {principles.map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-grape" />
                <p className="leading-7 text-ink/75">
                  <span className="text-ink">{title}</span> —— {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-stack flex flex-col gap-6 md:col-span-2">
          {stats.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              className={`stat-card flex items-center justify-between rounded-3xl border-[3px] border-ink px-6 py-5 shadow-toon-sm transition hover:-translate-y-1 ${
                ['bg-grape text-white', 'bg-mint', 'bg-sun'][i]
              }`}
            >
              <span className="font-tech text-3xl">{s.num}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DevLog() {
  return (
    <section id="log" className="relative bg-blush/50 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionTitle emoji="📝" title="开发日志" sub="按项目记，定了什么就写什么" />
        <div className="log-list space-y-5">
          {logEntries.map(([who, text]) => (
            <div
              key={who}
              data-reveal
              className="log-item flex gap-4 rounded-2xl border-[3px] border-ink bg-white p-5 shadow-toon-sm"
            >
              <span className="h-fit shrink-0 rounded-full border-2 border-ink bg-sun px-3 py-0.5 text-xs">
                {who}
              </span>
              <p className="leading-7 text-ink/75">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-mono text-xs text-ink/40">
          // 这里以后会持续更新，日期等第一条带日期的记录再补
        </p>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="seg-dark relative px-6 py-24">
      <div className="relative z-10 mx-auto max-w-3xl">
        <SectionTitle dark emoji="✉️" title="联系我们" sub="提需求、报 bug、或者只是催更" />
        <div data-reveal className="contact-card rounded-3xl border-[3px] border-neon/30 bg-void-soft/80 p-8 shadow-toon-dark sm:p-10">
          <div className="contact-grid grid gap-6 text-center sm:grid-cols-3">
            <a
              data-reveal
              href="mailto:codmore@foxmail.com"
              className="contact-item rounded-2xl border-2 border-sun/60 bg-sun p-6 text-ink transition hover:-translate-y-1"
            >
              <div className="text-4xl">📮</div>
              <div className="mt-3 text-sm">邮箱</div>
              <div className="mt-1 font-mono text-[11px] text-ink/70">codmore@foxmail.com</div>
            </a>
            <a
              data-reveal
              href={ORG}
              target="_blank"
              rel="noreferrer"
              className="contact-item rounded-2xl border-2 border-mint/60 bg-mint p-6 text-ink transition hover:-translate-y-1"
            >
              <div className="text-4xl">📦</div>
              <div className="mt-3 text-sm">开源组织</div>
              <div className="mt-1 font-mono text-[11px] text-ink/70">cnb.cool/codmore.ai</div>
            </a>
            <a
              data-reveal
              href={`${ORG}/codbox`}
              target="_blank"
              rel="noreferrer"
              className="contact-item rounded-2xl border-2 border-neon/60 bg-grape p-6 text-white transition hover:-translate-y-1"
            >
              <div className="text-4xl">🚀</div>
              <div className="mt-3 text-sm">追进度</div>
              <div className="mt-1 font-mono text-[11px] text-white/80">codbox · d1.0 · 输入法</div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink px-6 py-8 text-center text-cream">
      <div className="flex items-center justify-center gap-2 text-lg">
        <LogoMark className="h-6 w-6 text-sun" />
        <span className="text-sun">codmore</span> AI 工作室
      </div>
      <p className="mt-2 text-sm text-cream/60">© 2026 codmore · 编写更多可能</p>
      <p className="mt-1 font-mono text-[11px] text-cream/35">
        cod /kɒd/ · 鳕鱼 · 也读作 code
      </p>
    </footer>
  )
}

function AnchorSweep({ play }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-12 overflow-hidden bg-void/90 transition-all duration-300 ${
        play ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="flex h-full items-center justify-center font-mono text-xs tracking-[0.3em] text-neon-mint">
        {'$'} loading --anchor
      </div>
    </div>
  )
}

/**
 * Tailwind v4 的裸 `transition` 把 transform/translate/scale/rotate/opacity 也纳入了过渡，
 * 于是 GSAP 每帧写入的值会被一个 150ms 的 CSS 过渡追着走 —— 渲染值滞后于缓动值，
 * 动画末尾再猛地追上，观感就是"慢慢进来、卡一下、加速冲到位"。
 * 入场期间给这些元素挂 data-revealing 直接关掉 transition。
 */
function reveal(targets, from, to) {
  const els = gsap.utils.toArray(targets)
  els.forEach((el) => el.setAttribute('data-revealing', ''))
  const userOnComplete = to.onComplete
  return gsap.fromTo(els, from, {
    ...to,
    onComplete() {
      els.forEach((el) => el.removeAttribute('data-revealing'))
      if (userOnComplete) userOnComplete.call(this)
    },
  })
}

export default function App() {
  const pageRef = useRef(null)
  const [introDone, setIntroDone] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [sweep, setSweep] = useState(false)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stop = startRevealGuard()
    return stop
  }, [])

  useEffect(() => {
    if (!introDone) return undefined
    if (reducedRef.current) {
      setHeroReady(true)
      return undefined
    }
    const timer = setTimeout(() => setHeroReady(true), 2200)
    return () => clearTimeout(timer)
  }, [introDone])

  const onJump = (e) => {
    const href = e.currentTarget.getAttribute('href') || ''
    if (!href.startsWith('#') || reducedRef.current) return
    e.preventDefault()
    setSweep(true)
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.replaceState(null, '', href)
      setSweep(false)
    }, 160)
  }

  useGSAP(
    () => {
      reveal(
        '.site-nav',
        { y: -120, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
      )

      gsap.utils.toArray('.section-title').forEach((el) => {
        reveal(
          el.querySelector('h2'),
          { scale: 0.4, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.7,
            ease: 'back.out(2)',
            clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          },
        )
        reveal(
          el.querySelector('.title-bar'),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 82%' },
          },
        )
      })

      reveal(
        '.product-card',
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.18,
          clearProps: 'transform',
          scrollTrigger: { trigger: '.product-stack', start: 'top 80%' },
        },
      )

      reveal(
        '.repo-row',
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.12,
          clearProps: 'transform',
          scrollTrigger: { trigger: '.repo-list', start: 'top 80%' },
        },
      )

      reveal(
        '.about-card',
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: '#about', start: 'top 70%' },
        },
      )

      reveal(
        '.stat-card',
        { x: 80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.15,
          clearProps: 'transform',
          scrollTrigger: { trigger: '.stat-stack', start: 'top 75%' },
        },
      )

      reveal(
        '.log-item',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.12,
          clearProps: 'transform',
          scrollTrigger: { trigger: '.log-list', start: 'top 80%' },
        },
      )

      reveal(
        '.name-card',
        { y: 60, opacity: 0, rotate: -2 },
        {
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: '#name', start: 'top 75%' },
        },
      )

      reveal(
        '.contact-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: '#contact', start: 'top 75%' },
        },
      )

      reveal(
        '.contact-item',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(2)',
          stagger: 0.15,
          clearProps: 'transform',
          scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
        },
      )
    },
    { scope: pageRef },
  )

  useGSAP(
    () => {
      if (!introDone) return undefined
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setHeroReady(true)
        return undefined
      }

      requestAnimationFrame(() => ScrollTrigger.refresh())

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          gsap.set('.hero-title .vp-char', { clearProps: 'transform' })
          setHeroReady(true)
        },
      })
      tl.fromTo(
        '.hero-kicker',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0,
      )
        .fromTo(
          '.hero-title .vp-char',
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.05 },
          0.1,
        )
        .fromTo('.hero-sub', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.5)
        .fromTo(
          '.hero-cta > *',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
          0.62,
        )
        .fromTo(
          '.hero-term',
          { scale: 0.92, opacity: 0, y: 30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' },
          0.5,
        )
        .fromTo('.hero-arrow', { opacity: 0 }, { opacity: 1, duration: 0.4 }, '<')

      gsap.to('.blob-pink', {
        yPercent: 60,
        ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.blob-mint', {
        yPercent: -40,
        ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
      })

      return () => tl.kill()
    },
    { scope: pageRef, dependencies: [introDone] },
  )

  return (
    <div ref={pageRef} className="page-x min-h-screen">
      <AsciiBackground />
      <ScrollProgress />
      <AnchorSweep play={sweep} />
      <Navbar onJump={onJump} />
      <main>
        <Hero heroReady={heroReady} />
        <NameEgg />
        <Products />
        <OpenSource />
        <About />
        <DevLog />
        <Contact />
      </main>
      <Footer />
      {!introDone && <Preloader onDone={() => setIntroDone(true)} />}
    </div>
  )
}
