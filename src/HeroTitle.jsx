import { useCallback, useEffect, useMemo, useRef } from 'react'
import { onTick } from './motion/bus.js'
import { readPointer } from './motion/pointer.js'

const LATIN = /^[\x00-\u0227\u2000-\u206F\u20AC\u2122]$/
const smoothstep = (f) => f * f * (3 - 2 * f)

/**
 * 光标压力：拉丁字符走 ArchivoVF 的真实 wght/wdth 轴，
 * 中文是静态字重，只能用 transform + 描边宽度模拟。
 */
export default function HeroTitle({ text, className = '', enabled = true }) {
  const hostRef = useRef(null)
  const charsRef = useRef([])
  const metricsRef = useRef([])

  const measure = useCallback(() => {
    const host = hostRef.current
    if (!host) return
    const scaleX = window.scrollX
    const scaleY = window.scrollY
    const fontSize = parseFloat(getComputedStyle(host).fontSize)
    metricsRef.current = charsRef.current.map((el) => {
      const r = el.getBoundingClientRect()
      return {
        cx: r.left + r.width / 2 + scaleX,
        cy: r.top + r.height / 2 + scaleY,
        radius: Math.max(240, fontSize * 4),
      }
    })
  }, [])

  const chars = useMemo(() => [...text], [text])

  useEffect(() => {
    measure()
    let timer = 0
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(measure, 150)
    }
    window.addEventListener('resize', onResize)
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [measure])

  useEffect(() => {
    if (!enabled) return undefined
    const release = onTick((_time, dt) => {
      const metrics = metricsRef.current
      if (!metrics.length) return undefined
      const p = readPointer()
      const px = p.x + window.scrollX
      const py = p.y + window.scrollY
      const k = 1 - Math.exp(-dt / 60)

      for (let i = 0; i < metrics.length; i += 1) {
        const el = charsRef.current[i]
        const m = metrics[i]
        if (!el || !m) continue

        const dx = m.cx - px
        const dy = m.cy - py
        const dist = Math.sqrt(dx * dx + dy * dy)
        const target = smoothstep(Math.max(0, 1 - dist / m.radius))

        const cur = el._pressure ?? 0
        const next = cur + (target - cur) * k
        if (Math.abs(next - cur) < 0.002) continue
        el._pressure = next

        el.style.transform = `translate3d(0, ${(-7 * next).toFixed(2)}px, 0) rotate(${(
          6 *
          next *
          Math.sign(dx || 1)
        ).toFixed(2)}deg) scale(${(1 + 0.18 * next).toFixed(3)})`

        if (LATIN.test(chars[i])) {
          el.style.fontVariationSettings = `"wght" ${(400 + 500 * next).toFixed(0)}, "wdth" ${(
            75 +
            45 * next
          ).toFixed(0)}`
        } else {
          el.style.webkitTextStrokeWidth = `${(0.8 + 2.6 * next).toFixed(2)}px`
        }
      }
      return undefined
    })

    return release
  }, [enabled, chars])

  return (
    <span ref={hostRef} className={className}>
      {chars.map((c, i) => (
        <span
          key={`${c}-${i}`}
          ref={(el) => {
            charsRef.current[i] = el
          }}
          className="vp-char"
        >
          {c}
        </span>
      ))}
    </span>
  )
}
