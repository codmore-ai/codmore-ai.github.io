import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { LOGO_PATH } from './LogoMark.jsx'

const WORD = 'codmore'
const GLYPHS = '01<>{}[]|_#$*/~+-=^'
const HARD_CAP_MS = 2200

export default function Preloader({ onDone }) {
  const rootRef = useRef(null)
  const wordRef = useRef(null)
  const numRef = useRef(null)
  const strokeRef = useRef(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const html = document.documentElement
    const word = wordRef.current
    const num = numRef.current
    const stroke = strokeRef.current
    let timeline = null
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      html.style.overflow = ''
      doneRef.current()
    }

    html.style.overflow = 'hidden'
    const cap = window.setTimeout(finish, HARD_CAP_MS)
    const onVisibility = () => {
      if (document.hidden) finish()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hash = window.location.hash
    const deepLink = hash !== '' && hash !== '#home'

    if (reduced || deepLink) {
      window.setTimeout(finish, 240)
    } else {
      const length = stroke.getTotalLength()
      stroke.style.strokeDasharray = String(length)
      stroke.style.strokeDashoffset = String(length)

      const driver = { text: 0, pct: 0 }
      const paintText = () => {
        let out = ''
        for (let i = 0; i < WORD.length; i += 1) {
          out +=
            driver.text >= (i + 1) / WORD.length
              ? WORD[i]
              : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        }
        word.textContent = out
      }
      const paintPct = () => {
        num.textContent = `${String(Math.round(driver.pct * 100)).padStart(3, '0')}%`
      }

      timeline = gsap
        .timeline({ onComplete: finish })
        .fromTo('.pl-inner', { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0)
        .to(driver, { text: 1, duration: 0.9, ease: 'power2.inOut', onUpdate: paintText }, 0.15)
        .to(driver, { pct: 1, duration: 1.4, ease: 'power1.inOut', onUpdate: paintPct }, 0.15)
        .fromTo('.pl-term', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 }, 0.45)
        .to(stroke, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 0.95)
        .to('.pl-solid', { opacity: 1, duration: 0.22, ease: 'power1.out' }, 1.4)
        .to('.pl-inner', { opacity: 0, y: -16, duration: 0.22, ease: 'power2.in' }, 1.58)
        .to('.pl-panel-l', { xPercent: -100, duration: 0.38, ease: 'power4.inOut' }, 1.62)
        .to('.pl-panel-r', { xPercent: 100, duration: 0.38, ease: 'power4.inOut' }, 1.62)
    }

    return () => {
      clearTimeout(cap)
      document.removeEventListener('visibilitychange', onVisibility)
      if (timeline) timeline.kill()
      html.style.overflow = ''
    }
  }, [])

  return (
    <div
      ref={rootRef}
      role="status"
      aria-label="codmore 加载中"
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      <div className="pl-panel pl-panel-l absolute inset-y-0 left-0 w-1/2 border-r border-ink/10 bg-cream/95" />
      <div className="pl-panel pl-panel-r absolute inset-y-0 right-0 w-1/2 bg-cream/95" />
      <div className="pl-inner absolute inset-0 flex flex-col items-center justify-center gap-4">
        <svg viewBox="0 0 1024 1024" className="h-16 w-16" aria-hidden="true">
          <path ref={strokeRef} d={LOGO_PATH} fill="none" stroke="#2d2a3e" strokeWidth="16" />
          <path className="pl-solid" d={LOGO_PATH} fill="#7c5cff" fillRule="evenodd" opacity="0" />
        </svg>
        <div ref={wordRef} className="font-tech text-4xl tracking-[0.16em] text-grape">
          {WORD}
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-ink/50">
          <span className="pl-term">$ boot --agent=pi --gui</span>
          <span ref={numRef} className="text-mint">
            000%
          </span>
        </div>
      </div>
    </div>
  )
}
