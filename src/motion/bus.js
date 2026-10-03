import gsap from 'gsap'

const subscribers = new Set()
let running = false
let prev = 0

function tick(time, delta) {
  const dt = Math.min(64, delta || 16.7)
  prev = time
  for (const cb of subscribers) cb(time * 1000, dt * 1000)
}

/** 全站共用一条 gsap.ticker，避免多个 rAF 循环互相抢帧 */
export function onTick(cb) {
  subscribers.add(cb)
  if (!running) {
    gsap.ticker.add(tick)
    running = true
  }
  prev = prev || gsap.ticker.time

  return () => {
    subscribers.delete(cb)
    if (subscribers.size === 0 && running) {
      gsap.ticker.remove(tick)
      running = false
      prev = 0
    }
  }
}
