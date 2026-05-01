'use client'

import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ArrowHelper,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import {
  axisBottom,
  axisLeft,
  format,
  line as d3line,
  range as d3range,
  scaleLinear,
  select,
} from 'd3'

// ─── Physics ─────────────────────────────────────────────────────────────
const EARTH_G = 9.81 // m/s²
const RADIUS_MIN_KM = 1
const RADIUS_MAX_KM = 20_000
const RADIUS_DEFAULT_KM = 5_000 // halo: 10,000 km diameter → 5,000 km radius
const ROT_MAX_PCT = 120
const ROT_DEFAULT_PCT = 100 // calibration point — 100 % means 1 g

// Centripetal acceleration as a function of slider %, calibrated so
// 100 % == 1 g regardless of radius. The chart curve is therefore
// independent of radius — only the implied velocity / spin period change.
const accelFor = (pct: number) => Math.pow(pct / 100, 2) * EARTH_G
// ω (rad/s) follows from a = ω² r → ω = √(a / r).
const omegaFor = (pct: number, radiusM: number) =>
  Math.sqrt(accelFor(pct) / radiusM)
// v (m/s) = ω r.
const velocityFor = (pct: number, radiusM: number) =>
  omegaFor(pct, radiusM) * radiusM
// Rotation period (s) = 2π / ω.
const periodFor = (pct: number, radiusM: number) => {
  const w = omegaFor(pct, radiusM)
  return w === 0 ? Infinity : (2 * Math.PI) / w
}

// Visual spin rate scales the real ω so the ring rotates visibly at
// human-comfy speeds. At the default (100 %, 5000 km) the ring sweeps
// roughly one revolution every 6 s — slow enough to read structure,
// fast enough to be obviously alive.
const VISUAL_OMEGA_SCALE = 800

// Maps the slider radius (km) to a WebGL-space ring radius. Sqrt mapping so
// halo (5000 km, halfway between min and max in slider terms) lands roughly
// halfway through the visible range — a tiny 1 km ring stays a small dot,
// a 20,000 km ring fills most of the canvas.
const RING_VISUAL_MIN = 0.6
const RING_VISUAL_MAX = 2.3
const ringVisualRadius = (radiusKm: number) =>
  RING_VISUAL_MIN +
  Math.sqrt(radiusKm / RADIUS_MAX_KM) * (RING_VISUAL_MAX - RING_VISUAL_MIN)

// ─── Field Journal token tracking ────────────────────────────────────────
interface Tokens {
  accent: string
  signal: string
  textSoft: string
  rule: string
  bgDeep: string
}

const DEFAULT_TOKENS: Tokens = {
  accent: '#DA8665',
  signal: '#F2DC4A',
  textSoft: '#8C8576',
  rule: 'rgba(244,239,230,0.08)',
  bgDeep: '#14110E',
}

const useFieldJournalTokens = (): Tokens => {
  const [tokens, setTokens] = useState<Tokens>(DEFAULT_TOKENS)
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const get = (k: string, fb: string) => cs.getPropertyValue(k).trim() || fb
      setTokens({
        accent: get('--color-accent', DEFAULT_TOKENS.accent),
        signal: get('--color-signal', DEFAULT_TOKENS.signal),
        textSoft: get('--color-text-soft', DEFAULT_TOKENS.textSoft),
        rule: get('--color-rule', DEFAULT_TOKENS.rule),
        bgDeep: get('--color-bg-deep', DEFAULT_TOKENS.bgDeep),
      })
    }
    read()
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => mo.disconnect()
  }, [])
  return tokens
}

// ─── Helpers ─────────────────────────────────────────────────────────────
const formatKm = (km: number) => {
  if (km >= 1000)
    return `${(km / 1000).toFixed(km % 1000 === 0 ? 0 : 1)},000 km`
  return `${km} km`
}
const formatRadius = (km: number) =>
  km >= 1000
    ? `${km.toLocaleString('en-US')} km`
    : `${km.toFixed(km < 10 ? 1 : 0)} km`
const formatPeriod = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '∞'
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)} m ${Math.round(seconds % 60)} s`
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return `${h} h ${m} m`
}

// ─── Chart geometry (viewBox space) ──────────────────────────────────────
const margin = { top: 16, right: 18, bottom: 36, left: 48 }
const VIEW = 400
const innerW = VIEW - margin.left - margin.right
const innerH = VIEW - margin.top - margin.bottom

type Lock = 'none' | 'velocity' | 'period'

const Simulation = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<SVGSVGElement>(null)
  const [pct, setPct] = useState(ROT_DEFAULT_PCT)
  const [radiusKm, setRadiusKm] = useState(RADIUS_DEFAULT_KM)
  const [paused, setPaused] = useState(false)
  const [lock, setLock] = useState<Lock>('none')
  const tokens = useFieldJournalTokens()

  // When a lock is active, dragging the radius re-derives pct so the locked
  // quantity (velocity or period) stays put. Each step of the slider gets
  // its own re-derivation, so the relationship is exact moment-to-moment.
  const onRadiusChange = (nextKm: number) => {
    if (lock === 'none' || nextKm === radiusKm) {
      setRadiusKm(nextKm)
      return
    }
    const oldR = radiusKm * 1000
    const newR = nextKm * 1000
    let nextPct = pct
    if (lock === 'velocity') {
      // v = (pct/100)·√(g·r) → pct_new = 100·v/√(g·r_new)
      const v0 = velocityFor(pct, oldR)
      nextPct = (100 * v0) / Math.sqrt(EARTH_G * newR)
    } else if (lock === 'period') {
      // T constant ⇒ ω_new·r_new = ω_old·r_old in scaled form;
      // working it through: pct_new = pct_old · √(r_new/r_old).
      nextPct = pct * Math.sqrt(newR / oldR)
    }
    setPct(Math.max(0, Math.min(ROT_MAX_PCT, nextPct)))
    setRadiusKm(nextKm)
  }

  const toggleLock = (next: Exclude<Lock, 'none'>) =>
    setLock((curr) => (curr === next ? 'none' : next))

  // Refs so the animation loop reads fresh values without re-subscribing.
  const pctRef = useRef(pct)
  const radiusMRef = useRef(radiusKm * 1000)
  const pausedRef = useRef(paused)
  useEffect(() => {
    pctRef.current = pct
  }, [pct])
  useEffect(() => {
    radiusMRef.current = radiusKm * 1000
  }, [radiusKm])
  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  // ─── Three.js primitives (created once) ────────────────────────────────
  const ringMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: DEFAULT_TOKENS.accent,
        side: DoubleSide,
        wireframe: true,
      }),
    []
  )
  const ring = useMemo(
    () => new Mesh(new RingGeometry(2, 2.2, 96), ringMat),
    [ringMat]
  )
  const arrow = useMemo(
    () =>
      new ArrowHelper(
        new Vector3(0, 1, 0),
        new Vector3(0, -2, 0),
        1,
        0xf2dc4a,
        0.32,
        0.18
      ),
    []
  )

  // Theme-aware materials.
  useEffect(() => {
    ringMat.color.set(tokens.accent)
    arrow.setColor(new Color(tokens.signal))
  }, [tokens, ringMat, arrow])

  // Visual ring scale and arrow placement track the radius slider. The ring
  // mesh has intrinsic radius 2, so we scale it by visualR/2. The arrow is
  // anchored at the bottom of the scaled rim so it always reads as "force
  // pulling rim-ward". Arrow length encodes g-force normalised to ring
  // radius — at 1 g the tip reaches the ring centre, >1 g overshoots, <1 g
  // undershoots. This gives the arrow a meaning that's stable across radii.
  useEffect(() => {
    const r = ringVisualRadius(radiusKm)
    ring.scale.set(r / 2, r / 2, 1)
    arrow.position.set(0, -r, 0)
    const aGs = accelFor(pct) / EARTH_G
    const length = Math.max(0.05, Math.min(r * 2.4, aGs * r))
    arrow.setLength(
      length,
      Math.max(0.05, length * 0.2),
      Math.max(0.03, length * 0.12)
    )
  }, [pct, radiusKm, ring, arrow])

  // ─── WebGL render loop with ResizeObserver for crisp scaling ──────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('webgl2')
    if (!ctx) return

    const renderer = new WebGLRenderer({
      antialias: true,
      context: ctx,
      canvas,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new Scene()
    scene.add(ring)
    scene.add(arrow)

    const camera = new PerspectiveCamera(60, 1, 0.01, 100)
    camera.position.set(0, 0.6, 4.4)
    camera.lookAt(0, 0, 0)

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let last = performance.now()
    renderer.setAnimationLoop((now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (!pausedRef.current) {
        const omega = omegaFor(pctRef.current, radiusMRef.current)
        ring.rotation.z += omega * VISUAL_OMEGA_SCALE * dt
      }
      renderer.render(scene, camera)
    })

    return () => {
      renderer.setAnimationLoop(null)
      renderer.dispose()
      ro.disconnect()
    }
  }, [ring, arrow])

  // ─── D3 chart skeleton — rebuilds when tokens or radius change ────────
  // Curve: a = v² / r. With v on the X axis the parabola itself reshapes
  // when the user changes radius — small r is a steep parabola hitting 1 g
  // early; large r is a long, shallow climb. The 1 g reference line stays
  // put while the curve crosses it at different velocities.
  useEffect(() => {
    const svg = select(chartRef.current!)
    svg.selectAll('*').remove()

    const radiusM = radiusKm * 1000
    // Domain extent: just past the velocity at the slider's max so the
    // curve has a hair of breathing room on the right edge.
    const maxV = velocityFor(ROT_MAX_PCT, radiusM) * 1.05
    const fmtVelocity = format('~s')

    const x = scaleLinear().domain([0, maxV]).range([0, innerW])
    const y = scaleLinear().domain([0, 15]).range([innerH, 0])

    // (v, a) samples for the current radius — same slider grid as before.
    const data = d3range(0, ROT_MAX_PCT + 1, 1).map((p) => ({
      x: velocityFor(p, radiusM),
      y: accelFor(p),
    }))

    const root = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Gridlines (light dashed, behind everything else).
    const dashed = (g: ReturnType<typeof root.append>) =>
      g
        .selectAll('line')
        .attr('stroke', tokens.rule)
        .attr('stroke-dasharray', '2 4')
    dashed(
      root
        .append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(
          axisBottom(x)
            .ticks(6)
            .tickSize(-innerH)
            .tickFormat(() => '')
        )
    )
    dashed(
      root.append('g').call(
        axisLeft(y)
          .ticks(5)
          .tickSize(-innerW)
          .tickFormat(() => '')
      )
    )
    root.selectAll('.domain').remove()

    // 1 g reference line + label.
    const refY = y(EARTH_G)
    root
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', refY)
      .attr('y2', refY)
      .attr('stroke', tokens.signal)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3')
      .attr('opacity', 0.55)
    root
      .append('text')
      .attr('x', innerW - 6)
      .attr('y', refY - 6)
      .attr('text-anchor', 'end')
      .attr('fill', tokens.signal)
      .attr('opacity', 0.85)
      .attr('font-size', 10)
      .attr('font-family', 'var(--font-mono, monospace)')
      .text('1 g · 9.81 m/s²')

    // Acceleration curve.
    root
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', tokens.accent)
      .attr('stroke-width', 1.5)
      .attr(
        'd',
        d3line<{ x: number; y: number }>()
          .x((d) => x(d.x))
          .y((d) => y(d.y))
      )

    // Themed axes.
    const styleAxis = (g: ReturnType<typeof root.append>) => {
      g.selectAll('line, path')
        .attr('stroke', tokens.textSoft)
        .attr('stroke-opacity', 0.4)
      g.selectAll('text')
        .attr('fill', tokens.textSoft)
        .attr('font-size', 10)
        .attr('font-family', 'var(--font-mono, monospace)')
    }
    styleAxis(
      root
        .append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(axisBottom(x).ticks(6).tickFormat(fmtVelocity))
    )
    styleAxis(root.append('g').call(axisLeft(y).ticks(5)))

    // Axis titles.
    const titleAttrs = (sel: ReturnType<typeof root.append>) =>
      sel
        .attr('fill', tokens.textSoft)
        .attr('font-size', 10)
        .attr('font-family', 'var(--font-mono, monospace)')
        .attr('letter-spacing', '0.05em')
    titleAttrs(
      root
        .append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 30)
        .attr('text-anchor', 'middle')
        .text('tangential velocity (m/s)')
    )
    titleAttrs(
      root
        .append('text')
        .attr('transform', `rotate(-90) translate(${-innerH / 2},-36)`)
        .attr('text-anchor', 'middle')
        .text('acceleration (m/s²)')
    )

    // Empty group for the live highlight dot — populated by the next effect.
    root.append('g').attr('data-fj-dot', '')
  }, [tokens, radiusKm])

  // ─── D3 highlight dot — moves with pct or radius ──────────────────────
  // Lives inside the margin-translated `root` group, so cx/cy stay in inner
  // chart space. Both pct and radius shift its position: pct moves it along
  // the curve; changing radius reshapes the curve and pulls the dot with it.
  useEffect(() => {
    const dotGroup = select(chartRef.current!).select('[data-fj-dot]')
    if (dotGroup.empty()) return
    const radiusM = radiusKm * 1000
    const maxV = velocityFor(ROT_MAX_PCT, radiusM) * 1.05
    const x = scaleLinear().domain([0, maxV]).range([0, innerW])
    const y = scaleLinear().domain([0, 15]).range([innerH, 0])
    let dot = dotGroup.select<SVGCircleElement>('circle')
    if (dot.empty()) {
      dot = dotGroup
        .append('circle')
        .attr('r', 6)
        .attr('fill', tokens.signal)
        .attr('stroke', tokens.bgDeep)
        .attr('stroke-width', 2)
    } else {
      dot.attr('fill', tokens.signal).attr('stroke', tokens.bgDeep)
    }
    dot.attr('cx', x(velocityFor(pct, radiusM))).attr('cy', y(accelFor(pct)))
  }, [pct, radiusKm, tokens])

  // ─── Derived display values ────────────────────────────────────────────
  const radiusM = radiusKm * 1000
  const a = accelFor(pct)
  const v = velocityFor(pct, radiusM)
  const period = periodFor(pct, radiusM)

  return (
    <div className="w-full">
      {/* ─── Controls ─── */}
      <div className="flex flex-col gap-3 mb-5 font-mono text-meta tracking-wide">
        <div className="flex items-center gap-3">
          <label className="text-text-soft uppercase shrink-0 w-24">
            rotation
          </label>
          <input
            type="range"
            min={0}
            max={ROT_MAX_PCT}
            step={1}
            value={pct}
            onChange={(e) => setPct(parseInt(e.target.value))}
            className="flex-1 min-w-[8rem] accent-accent cursor-pointer"
            aria-label="Rotation rate (%)"
          />
          <span className="text-text tabular-nums shrink-0 w-14 text-right">
            {pct.toFixed(1)}%
          </span>
          <button
            type="button"
            onClick={() => setPct(100)}
            aria-label="Snap rotation to 100% (1g)"
            className="text-text-soft hover:text-accent transition-colors duration-fast shrink-0"
          >
            1 g
          </button>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-text-soft uppercase shrink-0 w-24">
            radius
          </label>
          <input
            type="range"
            min={RADIUS_MIN_KM}
            max={RADIUS_MAX_KM}
            step={1}
            value={radiusKm}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="flex-1 min-w-[8rem] accent-accent cursor-pointer"
            aria-label="Ring radius (km)"
          />
          <span className="text-text tabular-nums shrink-0 w-24 text-right">
            {formatRadius(radiusKm)}
          </span>
          <button
            type="button"
            onClick={() => setRadiusKm(RADIUS_DEFAULT_KM)}
            aria-label={`Snap radius to halo (${formatKm(RADIUS_DEFAULT_KM)})`}
            className="text-text-soft hover:text-accent transition-colors duration-fast shrink-0"
          >
            halo
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="text-text-soft hover:text-accent transition-colors duration-fast"
          >
            {paused ? '▶ play' : '⏸ pause'}
          </button>
          <LockButton
            label="lock velocity"
            active={lock === 'velocity'}
            onClick={() => toggleLock('velocity')}
          />
          <LockButton
            label="lock period"
            active={lock === 'period'}
            onClick={() => toggleLock('period')}
          />
        </div>
      </div>

      {/* ─── Live derived stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mb-6 font-mono text-meta tracking-wide tabular-nums">
        <Stat label="accel" value={`${a.toFixed(2)} m/s²`} />
        <Stat label="g-force" value={`${(a / EARTH_G).toFixed(2)} g`} />
        <Stat
          label="velocity"
          value={
            v >= 1000 ? `${(v / 1000).toFixed(2)} km/s` : `${v.toFixed(0)} m/s`
          }
        />
        <Stat label="period" value={formatPeriod(period)} />
      </div>

      {/* ─── Visualisation panels ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="aspect-square rounded-md border border-rule overflow-hidden"
          style={{ backgroundColor: DEFAULT_TOKENS.bgDeep }}
        >
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
        <div
          className="aspect-square rounded-md border border-rule overflow-hidden"
          style={{ backgroundColor: DEFAULT_TOKENS.bgDeep }}
        >
          <svg
            ref={chartRef}
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            preserveAspectRatio="xMidYMid meet"
            className="block w-full h-full"
            aria-label={`Acceleration vs rotation rate; current value ${pct} %`}
          />
        </div>
      </div>
    </div>
  )
}

const Stat = ({
  label,
  value,
}: {
  label: string
  value: string
}): ReactElement => (
  <div className="flex flex-col">
    <span className="text-text-soft uppercase">{label}</span>
    <span className="text-text">{value}</span>
  </div>
)

const LockButton = ({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}): ReactElement => (
  <label
    className={`inline-flex items-center gap-2 cursor-pointer select-none transition-colors duration-fast ${
      active ? 'text-accent' : 'text-text-soft hover:text-accent'
    }`}
  >
    <input
      type="checkbox"
      checked={active}
      onChange={onClick}
      className="accent-accent"
    />
    {label}
  </label>
)

export default Simulation
