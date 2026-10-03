import { useEffect, useRef } from 'react'
import { onTick } from './motion/bus.js'
import { acquirePointer, onPointerDown, readPointer } from './motion/pointer.js'

const CHARS = [' ', '·', '∘', '~', '-', '+', '0', '|', '>', '<', '^', 'o', '$', '#', '✧', '✦']
const CODE = ['0', '1', '|', '_', '[', ']', '{', '}', '#', '$']
const FISH = '><(((*)>'
const GLOW_RADIUS = 170
const CELL = 36
const RIPPLE_SPEED = 460
const RIPPLE_RADIUS = 320

const MIRROR = { '>': '<', '<': '>', '(': ')', ')': '(', '*': '*', ' ': ' ' }
const flip = (s) =>
  [...s]
    .reverse()
    .map((c) => MIRROR[c] ?? c)
    .join('')

const SIN = new Float32Array(4096)
for (let i = 0; i < SIN.length; i += 1) SIN[i] = Math.sin((i / SIN.length) * Math.PI * 2)
const TAU = Math.PI * 2
const sin = (v) => {
  const t = v % TAU
  return SIN[(((t < 0 ? t + TAU : t) / TAU) * 4096) | 0]
}

export default function AsciiBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    let cols = 0
    let rows = 0
    let prev = null
    let trail = null
    let lastScrollY = window.scrollY
    let vel = 0
    const ripples = []
    const fish = { x: -999, y: -999, dir: 1 }
    const sprite = [FISH, flip(FISH)]

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${CELL * 0.55}px ui-monospace, Consolas, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      cols = Math.ceil(w / CELL)
      rows = Math.ceil(h / CELL)
      prev = new Int16Array(cols * rows).fill(-1)
      trail = new Float32Array(cols * rows)
    }

    const stamp = (i, gi, tone, px, py) => {
      const key = gi * 16 + tone
      if (prev[i] === key) return
      prev[i] = key
      ctx.clearRect(px - CELL / 2, py - CELL / 2, CELL, CELL)
      if (tone !== 3 && gi === 0) return

      const ratio = gi / (CHARS.length - 1)
      if (tone === 3) {
        ctx.fillStyle = 'rgba(255, 107, 107, 0.95)'
        ctx.fillText('☺', px, py)
      } else if (tone === 1) {
        ctx.fillStyle = `rgba(78, 205, 196, ${0.18 + ratio * 0.5})`
        ctx.fillText('·', px, py)
      } else if (tone === 2) {
        ctx.fillStyle = `rgba(124, 92, 255, ${0.35 + ratio * 0.55})`
        ctx.fillText(CODE[gi % CODE.length], px, py)
      } else {
        ctx.fillStyle = `rgba(45, 42, 62, ${0.05 + ratio * 0.17})`
        ctx.fillText(CHARS[gi], px, py)
      }
    }

    const draw = (t, dt) => {
      const w = window.innerWidth
      const h = window.innerHeight

      const rawVel = (window.scrollY - lastScrollY) / Math.max(dt, 1)
      lastScrollY = window.scrollY
      vel += (Math.max(-3, Math.min(3, rawVel)) - vel) * 0.15

      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        ripples[i].r += RIPPLE_SPEED * (dt / 1000)
        if (ripples[i].r > RIPPLE_RADIUS) ripples.splice(i, 1)
      }

      if (!reduced) {
        fish.x = w * 0.5 + sin(t * 0.00023) * w * 0.42
        fish.y = h * 0.34 + sin(t * 0.00041) * h * 0.2 + Math.cos(t * 0.00017) * 40
        const nd = sin(t * 0.00023 + 0.01) - sin(t * 0.00023) > 0 ? 1 : -1
        if (nd !== fish.dir) fish.dir = nd
      }

      const pointer = readPointer()
      const glyphs = CHARS.length
      const art = sprite[fish.dir > 0 ? 1 : 0]
      const fcol = Math.round(fish.x / CELL) - Math.floor(art.length / 2)
      const frow = Math.round(fish.y / CELL)

      for (let y = 0; y < rows; y += 1) {
        const py = y * CELL + CELL / 2
        for (let x = 0; x < cols; x += 1) {
          const i = y * cols + x
          const px = x * CELL + CELL / 2

          if (reduced) {
            const wave = sin(x * 0.35) + sin(y * 0.28) + sin((x + y) * 0.2)
            const v = (wave + 3) / 6
            stamp(
              i,
              v < 0.62 ? 0 : Math.min(glyphs - 1, Math.floor(((v - 0.62) / 0.38) * glyphs)),
              0,
              px,
              py,
            )
            continue
          }

          const phase = vel * 0.02 * y
          const wave =
            sin(x * 0.35 + t * 0.0012 + phase) +
            sin(y * 0.28 - t * 0.0009 + phase) +
            sin((x + y) * 0.2 + t * 0.0006)
          const base = (wave + 3) / 6

          let glow = 0
          const dist = Math.hypot(px - pointer.x, py - pointer.y)
          if (pointer.inside && dist < GLOW_RADIUS) glow = 1 - dist / GLOW_RADIUS

          for (const rp of ripples) {
            const ring = Math.abs(Math.hypot(px - rp.x, py - rp.y) - rp.r)
            if (ring < CELL * 1.6)
              glow = Math.max(glow, (1 - rp.r / RIPPLE_RADIUS) * (1 - ring / (CELL * 1.6)))
          }

          const trailBoost = trail[i] > 0.01 ? trail[i] * 0.85 : 0
          if (trail[i] > 0.01) trail[i] *= 0.94
          const boost = Math.max(glow, trailBoost)

          const inFish = y === frow && x >= fcol && x < fcol + art.length
          if (inFish) {
            const g = art[x - fcol]
            ctx.clearRect(px - CELL / 2, py - CELL / 2, CELL, CELL)
            prev[i] = -2
            ctx.fillStyle = 'rgba(45, 42, 62, 0.75)'
            ctx.fillText(g, px, py)
            trail[i] = 1
            continue
          }

          const v = Math.min(1, base * 0.45 + boost * 0.95)
          let gi = v < 0.28 ? 0 : Math.min(glyphs - 1, Math.floor(((v - 0.28) / 0.72) * glyphs))
          let tone = 0
          if (boost > 0.82 && dist < CELL * 0.6) {
            tone = 3
          } else if (trailBoost >= glow && trailBoost > 0.25) {
            tone = 1
          } else if (boost > 0.3) {
            tone = 2
          }
          stamp(i, gi, tone, px, py)
        }
      }
    }

    const onResize = () => {
      resize()
      if (reduced) draw(0, 16.7)
    }

    resize()
    draw(0, 16.7)

    const spawnRipple = (x, y) => {
      if (reduced || document.hidden) return
      if (ripples.length >= 2) ripples.shift()
      ripples.push({ x, y, r: 0 })
    }

    const releasePointer = acquirePointer()
    const offDown = onPointerDown(spawnRipple)
    const offTick = reduced
      ? () => {}
      : onTick((t, dt) => {
          if (document.hidden) return
          draw(t, dt)
        })

    window.addEventListener('resize', onResize)

    return () => {
      offTick()
      offDown()
      releasePointer()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  )
}
