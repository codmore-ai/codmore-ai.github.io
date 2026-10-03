/**
 * 兜底：入场动画失败时内容不能永久隐形。
 * 元素进入视口 1.4s 后仍近乎全透明，就交还给 CSS 默认态。
 */
export function startRevealGuard(root = document) {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const timers = new WeakMap()

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target
        if (entry.isIntersecting) {
          if (timers.has(el)) continue
          timers.set(
            el,
            setTimeout(() => {
              timers.delete(el)
              if (parseFloat(getComputedStyle(el).opacity) < 0.05) {
                el.style.opacity = ''
                el.style.transform = ''
                el.removeAttribute('data-revealing')
              }
            }, 1400),
          )
        } else {
          const timer = timers.get(el)
          if (timer) {
            clearTimeout(timer)
            timers.delete(el)
          }
        }
      }
    },
    { threshold: 0.15 },
  )

  root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

  return () => io.disconnect()
}
