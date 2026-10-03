export default function ScrollProgress() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div className="scroll-progress h-full w-full bg-gradient-to-r from-grape via-mint to-sun" />
    </div>
  )
}
