import React, { type AnimationEventHandler, type ReactElement } from 'react'
import { PIECES } from './pieces'

export type MarkPhase = 'idle' | 'out' | 'in'

// Hover/focus on the enclosing `.group` parts the pieces slightly along their
// diagonals (viewBox units, 60 = full mark). The `out`/`in` phases reuse the
// loader's spin move: rotate away and scatter, then reassemble.
const CSS = `
.kmark { overflow: visible; }
.kmark .kg { transform-box: view-box; transform-origin: 30px 30px; }
.kmark .kp { transform-box: fill-box; transform-origin: center; transition: transform .4s cubic-bezier(.16, 1, .3, 1); }
.kmark .p1 { --x: -1; --y: -1; --r: -60deg; --d: 0s; }
.kmark .p2 { --x:  1; --y: -1; --r:  60deg; --d: .06s; }
.kmark .p3 { --x: -1; --y:  1; --r: -60deg; --d: .12s; }
.kmark .p4 { --x:  1; --y:  1; --r:  60deg; --d: .18s; }
@media (hover: hover) {
  .group:hover .kmark .kp { transform: translate(calc(var(--x) * 3px), calc(var(--y) * 3px)); }
}
.group:focus-visible .kmark .kp { transform: translate(calc(var(--x) * 3px), calc(var(--y) * 3px)); }

.kmark.is-out .kg { animation: km-gout .55s both cubic-bezier(.7, 0, .84, 0); }
.kmark.is-out .kp { animation: km-out  .45s var(--d) both cubic-bezier(.7, 0, .84, 0); }
.kmark.is-in  .kg { animation: km-gin  .9s  both cubic-bezier(.16, 1, .3, 1); }
.kmark.is-in  .kp { animation: km-in   .75s var(--d) both cubic-bezier(.16, 1, .3, 1); }
@keyframes km-gout { to { transform: rotate(90deg); } }
@keyframes km-gin  { from { transform: rotate(-90deg); } to { transform: none; } }
/* No 'from'/'to' on the transform ends: the browser fills them with the
   piece's live value, so a hovered (parted) mark spins out from parted and
   settles back into the hover offset instead of snapping. */
@keyframes km-out {
  to   { opacity: 0; transform: translate(calc(var(--x) * 18px), calc(var(--y) * 18px)) rotate(calc(var(--r) * -1)) scale(.6); }
}
@keyframes km-in {
  from { opacity: 0; transform: translate(calc(var(--x) * 18px), calc(var(--y) * 18px)) rotate(var(--r)) scale(.6); }
}

@media (prefers-reduced-motion: reduce) {
  .kmark .kp { transition: none; transform: none !important; }
  .kmark.is-out .kg, .kmark.is-in .kg { animation: none; }
  .kmark.is-out .kp { animation: km-fade-out .25s both; }
  .kmark.is-in  .kp { animation: km-fade-in  .25s both; }
  @keyframes km-fade-out { to { opacity: 0; } }
  @keyframes km-fade-in  { from { opacity: 0; } }
}
`

export interface KochieMarkProps {
  className?: string
  phase?: MarkPhase
  onAnimationEnd?: AnimationEventHandler<SVGSVGElement>
}

/** The K mark: opens on `.group` hover, and spins out/in via `phase`. */
const KochieMark = ({
  className,
  phase = 'idle',
  onAnimationEnd,
}: KochieMarkProps): ReactElement => (
  <>
    {/* Outside the <svg>: React only hoists/dedupes HTML-namespace styles. */}
    <style href="kochie-mark" precedence="default">
      {CSS}
    </style>
    <svg
      viewBox="0 0 60 60"
      aria-hidden
      className={`kmark is-${phase} ${className ?? ''}`}
      onAnimationEnd={onAnimationEnd}
    >
      <g className="kg">
        {PIECES.map(([p, fill, d]) => (
          <path key={p} className={`kp ${p}`} fill={fill} d={d} />
        ))}
      </g>
    </svg>
  </>
)

export default KochieMark
