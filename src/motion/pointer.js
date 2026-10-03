const state = { x: -9999, y: -9999, inside: false, vx: 0, vy: 0 }
const downHandlers = new Set()

let controller = null
let refs = 0

export function readPointer() {
  return state
}

export function onPointerDown(handler) {
  downHandlers.add(handler)
  return () => downHandlers.delete(handler)
}

export function acquirePointer() {
  if (!controller) {
    controller = new AbortController()
    const { signal } = controller

    const set = (x, y) => {
      state.vx = x - state.x
      state.vy = y - state.y
      state.x = x
      state.y = y
      state.inside = true
    }

    window.addEventListener(
      'pointermove',
      (e) => set(e.clientX, e.clientY),
      { signal, passive: true },
    )
    window.addEventListener(
      'touchmove',
      (e) => {
        const p = e.touches[0]
        if (p) set(p.clientX, p.clientY)
      },
      { signal, passive: true },
    )
    window.addEventListener(
      'pointerdown',
      (e) => {
        for (const h of downHandlers) h(e.clientX, e.clientY)
      },
      { signal, passive: true },
    )
    window.addEventListener(
      'pointerout',
      (e) => {
        if (!e.relatedTarget) {
          state.inside = false
          state.x = -9999
          state.y = -9999
        }
      },
      { signal },
    )
  }
  refs += 1

  return () => {
    refs -= 1
    if (refs <= 0 && controller) {
      controller.abort()
      controller = null
      refs = 0
    }
  }
}
