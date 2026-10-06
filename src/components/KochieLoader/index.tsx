'use client'
// KochieLoader — the K mark assembling from its four corners (same move as the reel end cards).
// Pure SVG + CSS, honours prefers-reduced-motion, the mark is never recoloured.
//
//   <KochieLoader visible={isLoading} />                     pieces assemble in, fly apart out
//   <KochieLoader visible={isLoading} animateIn={false} />   appears instantly, animates out
//   <KochieLoader visible={isLoading} animateOut={false} />  animates in, disappears instantly
//   <KochieLoader visible={isLoading} loop />                 cycles in/out while visible (exit still honours animateOut)
//   <KochieLoader visible spin />                            the rotating variant of any of the above
//   onExited                                                 fires once it's fully gone (after the out animation, or immediately)
import { useEffect, useRef, useState } from 'react'
import { PIECES } from './pieces'

const CSS = `
/* Kochie K loader — modes on the root: .klr + one of .is-in .is-out .is-loop .is-static (+ .spin) */
.klr .kp { transform-box: fill-box; transform-origin: center; }
.klr .kg { transform-box: view-box; transform-origin: 30px 30px; }
.klr .p1 { --dx: -18px; --dy: -18px; --r: -60deg; --d: 0s; }
.klr .p2 { --dx:  18px; --dy: -18px; --r:  60deg; --d: .09s; }
.klr .p3 { --dx: -18px; --dy:  18px; --r: -60deg; --d: .18s; }
.klr .p4 { --dx:  18px; --dy:  18px; --r:  60deg; --d: .27s; }
.klr.is-static .kp { opacity: 1; }
.klr.is-hidden .kp { opacity: 0; }
/* slide (default) */
.klr.is-in   .kp { animation: kl-in  .85s var(--d) both cubic-bezier(.16, 1, .3, 1); }
.klr.is-out  .kp { animation: kl-out .5s  var(--d) both cubic-bezier(.7, 0, .84, 0); }
.klr.is-loop .kp { animation: kl-loop 2.8s var(--d) infinite both; }
@keyframes kl-in  { from { opacity: 0; transform: translate(var(--dx), var(--dy)); } to { opacity: 1; transform: none; } }
@keyframes kl-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translate(var(--dx), var(--dy)); } }
@keyframes kl-loop {
  0%   { opacity: 0; transform: translate(var(--dx), var(--dy)); animation-timing-function: cubic-bezier(.16, 1, .3, 1); }
  30%  { opacity: 1; transform: none; }
  68%  { opacity: 1; transform: none; animation-timing-function: cubic-bezier(.7, 0, .84, 0); }
  84%, 100% { opacity: 0; transform: translate(var(--dx), var(--dy)); }
}
/* spin */
.klr.spin.is-in   .kg { animation: ks-gin  1.1s both cubic-bezier(.16, 1, .3, 1); }
.klr.spin.is-in   .kp { animation: ks-in   .85s var(--d) both cubic-bezier(.16, 1, .3, 1); }
.klr.spin.is-out  .kg { animation: ks-gout .6s  both cubic-bezier(.7, 0, .84, 0); }
.klr.spin.is-out  .kp { animation: ks-out  .5s  var(--d) both cubic-bezier(.7, 0, .84, 0); }
.klr.spin.is-loop .kg { animation: ks-gloop 2.8s infinite both; }
.klr.spin.is-loop .kp { animation: ks-loop  2.8s var(--d) infinite both; }
@keyframes ks-gin  { from { transform: rotate(-90deg); } to { transform: none; } }
@keyframes ks-gout { from { transform: none; } to { transform: rotate(90deg); } }
@keyframes ks-in   { from { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(.6); } to { opacity: 1; transform: none; } }
@keyframes ks-out  { from { opacity: 1; transform: none; } to { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(calc(var(--r) * -1)) scale(.6); } }
@keyframes ks-gloop {
  0%   { transform: rotate(-90deg); animation-timing-function: cubic-bezier(.16, 1, .3, 1); }
  40%, 68% { transform: none; animation-timing-function: cubic-bezier(.7, 0, .84, 0); }
  86%, 100% { transform: rotate(90deg); }
}
@keyframes ks-loop {
  0%   { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(.6); animation-timing-function: cubic-bezier(.16, 1, .3, 1); }
  30%  { opacity: 1; transform: none; }
  68%  { opacity: 1; transform: none; animation-timing-function: cubic-bezier(.7, 0, .84, 0); }
  84%, 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(calc(var(--r) * -1)) scale(.6); }
}
/* reduced motion: fades only, no travel or rotation */
@media (prefers-reduced-motion: reduce) {
  .klr .kg, .klr.spin .kg { animation: none !important; }
  .klr.is-in .kp, .klr.spin.is-in .kp   { animation: kl-fade-in .3s both; }
  .klr.is-out .kp, .klr.spin.is-out .kp { animation: kl-fade-out .3s both; }
  .klr.is-loop .kp, .klr.spin.is-loop .kp { animation: kl-pulse 2.4s ease-in-out infinite both; }
  @keyframes kl-fade-in  { from { opacity: 0; } to { opacity: 1; } }
  @keyframes kl-fade-out { from { opacity: 1; } to { opacity: 0; } }
  @keyframes kl-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
}
`

type Phase = 'in' | 'static' | 'loop' | 'out' | 'gone'
type Props = {
  visible?: boolean
  animateIn?: boolean
  animateOut?: boolean
  loop?: boolean
  spin?: boolean
  size?: number
  label?: string
  onExited?: () => void
}

export default function KochieLoader({
  visible = true,
  animateIn = true,
  animateOut = true,
  loop = false,
  spin = false,
  size = 96,
  label = 'Loading',
  onExited,
}: Props) {
  const settled = loop ? 'loop' : 'static'
  const [phase, setPhase] = useState<Phase>(
    visible ? (animateIn ? 'in' : settled) : 'gone'
  )
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (visible) setPhase(animateIn ? 'in' : settled)
    else if (animateOut) setPhase('out')
    else {
      setPhase('gone')
      onExited?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  useEffect(() => {
    if (phase === 'static' || phase === 'loop') setPhase(settled)
  }, [settled]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'gone') return null

  // the last piece (p4) finishing marks the end of a one-shot animation
  const onEnd = (e: React.AnimationEvent<SVGSVGElement>) => {
    if (!(e.target as Element).classList?.contains('p4')) return
    if (phase === 'in') setPhase(settled)
    else if (phase === 'out') {
      setPhase('gone')
      onExited?.()
    }
  }

  const cls = `klr is-${phase}${spin ? ' spin' : ''}`
  return (
    <svg
      viewBox="-14 -14 88 88"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={cls}
      onAnimationEnd={onEnd}
    >
      <style>{CSS}</style>
      <g className="kg">
        {PIECES.map(([p, fill, d]) => (
          <path key={p} className={`kp ${p}`} fill={fill} d={d} />
        ))}
      </g>
    </svg>
  )
}
