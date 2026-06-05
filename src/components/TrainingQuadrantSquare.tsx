'use client'

import { useEffect, useRef, useState } from 'react'

type Activity = {
  name: string
  date: string
  sport: string
  mt: number
  effort: number
}

type Category = 'running' | 'cycling' | 'strength' | 'other'

type TooltipData = {
  x: number
  y: number
  name: string
  date: string
  duration: string
  effort: number
  category: Category
}

type ThemePalette = {
  text: string
  textSoft: string
  panelFillAlpha: number
  panelLabelAlpha: number
  grid: string
  border: string
  axis: string
  crosshair: string
  tooltipBg: string
  tooltipBorder: string
}

const RAW: Activity[] = [
  {
    name: 'Morning Ride',
    date: '2026-06-02',
    sport: 'Ride',
    mt: 1963,
    effort: 35,
  },
  {
    name: 'Shirtless',
    date: '2026-06-01',
    sport: 'WeightTraining',
    mt: 1452,
    effort: 3,
  },
  {
    name: 'Afternoon Ride',
    date: '2026-06-01',
    sport: 'Ride',
    mt: 2331,
    effort: 14,
  },
  {
    name: 'Morning Ride',
    date: '2026-06-01',
    sport: 'Ride',
    mt: 2046,
    effort: 21,
  },
  {
    name: 'Shirtless',
    date: '2026-05-31',
    sport: 'WeightTraining',
    mt: 1856,
    effort: 4,
  },
  {
    name: 'Lunch Run',
    date: '2026-05-30',
    sport: 'Run',
    mt: 7720,
    effort: 168,
  },
  {
    name: 'Morning Run',
    date: '2026-05-30',
    sport: 'Run',
    mt: 7182,
    effort: 136,
  },
  {
    name: 'Evening Ride',
    date: '2026-05-29',
    sport: 'Ride',
    mt: 2233,
    effort: 24,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-29',
    sport: 'Ride',
    mt: 2147,
    effort: 20,
  },
  {
    name: 'Afternoon Ride',
    date: '2026-05-28',
    sport: 'Ride',
    mt: 2343,
    effort: 22,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-28',
    sport: 'Ride',
    mt: 1988,
    effort: 19,
  },
  {
    name: 'Shirtless',
    date: '2026-05-27',
    sport: 'WeightTraining',
    mt: 2160,
    effort: 6,
  },
  {
    name: 'Evening Run',
    date: '2026-05-27',
    sport: 'Run',
    mt: 301,
    effort: 19,
  },
  {
    name: 'Evening Ride',
    date: '2026-05-27',
    sport: 'Ride',
    mt: 2188,
    effort: 31,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-27',
    sport: 'Ride',
    mt: 2213,
    effort: 9,
  },
  {
    name: 'Evening Ride',
    date: '2026-05-26',
    sport: 'Ride',
    mt: 2673,
    effort: 18,
  },
  {
    name: 'Evening Run',
    date: '2026-05-26',
    sport: 'Run',
    mt: 1564,
    effort: 47,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-26',
    sport: 'Ride',
    mt: 2095,
    effort: 32,
  },
  {
    name: 'Evening Physical Therapy',
    date: '2026-05-25',
    sport: 'PhysicalTherapy',
    mt: 2702,
    effort: 12,
  },
  {
    name: 'Afternoon Run',
    date: '2026-05-25',
    sport: 'Run',
    mt: 1259,
    effort: 59,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-25',
    sport: 'Ride',
    mt: 2078,
    effort: 15,
  },
  {
    name: 'Shirtless',
    date: '2026-05-24',
    sport: 'WeightTraining',
    mt: 2905,
    effort: 7,
  },
  {
    name: 'Morning Run',
    date: '2026-05-23',
    sport: 'Run',
    mt: 13863,
    effort: 272,
  },
  {
    name: 'Shirtless',
    date: '2026-05-22',
    sport: 'WeightTraining',
    mt: 1793,
    effort: 5,
  },
  {
    name: 'Evening Ride',
    date: '2026-05-22',
    sport: 'Ride',
    mt: 2295,
    effort: 26,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-22',
    sport: 'Ride',
    mt: 2016,
    effort: 22,
  },
  {
    name: 'Evening Ride',
    date: '2026-05-21',
    sport: 'Ride',
    mt: 2481,
    effort: 16,
  },
  { name: '4:3x4', date: '2026-05-21', sport: 'Run', mt: 2246, effort: 66 },
  {
    name: 'Morning Ride',
    date: '2026-05-21',
    sport: 'Ride',
    mt: 2032,
    effort: 14,
  },
  {
    name: 'Evening HIIT',
    date: '2026-05-20',
    sport: 'HighIntensityIntervalTraining',
    mt: 2967,
    effort: 16,
  },
  {
    name: 'Afternoon Physical Therapy',
    date: '2026-05-20',
    sport: 'PhysicalTherapy',
    mt: 2445,
    effort: 9,
  },
  {
    name: 'Afternoon Ride',
    date: '2026-05-20',
    sport: 'Ride',
    mt: 2349,
    effort: 31,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-20',
    sport: 'Ride',
    mt: 1880,
    effort: 35,
  },
  {
    name: 'Evening Ride',
    date: '2026-05-19',
    sport: 'Ride',
    mt: 2282,
    effort: 22,
  },
  {
    name: 'Evening Run',
    date: '2026-05-19',
    sport: 'Run',
    mt: 1810,
    effort: 90,
  },
  {
    name: 'Morning Ride',
    date: '2026-05-19',
    sport: 'Ride',
    mt: 2029,
    effort: 16,
  },
  {
    name: 'Body Pump',
    date: '2026-05-18',
    sport: 'WeightTraining',
    mt: 2752,
    effort: 8,
  },
  {
    name: 'Afternoon HIIT',
    date: '2026-05-18',
    sport: 'HighIntensityIntervalTraining',
    mt: 2479,
    effort: 22,
  },
  {
    name: 'Morning Run',
    date: '2026-05-16',
    sport: 'Run',
    mt: 13024,
    effort: 306,
  },
  {
    name: 'Shirtless',
    date: '2026-05-15',
    sport: 'WeightTraining',
    mt: 2323,
    effort: 8,
  },
  {
    name: 'Afternoon Run',
    date: '2026-05-14',
    sport: 'Run',
    mt: 3508,
    effort: 153,
  },
  {
    name: 'Evening Physical Therapy',
    date: '2026-05-13',
    sport: 'PhysicalTherapy',
    mt: 2673,
    effort: 17,
  },
  {
    name: 'Evening Run',
    date: '2026-05-12',
    sport: 'Run',
    mt: 1781,
    effort: 63,
  },
  {
    name: 'Evening Physical Therapy',
    date: '2026-05-11',
    sport: 'PhysicalTherapy',
    mt: 2510,
    effort: 17,
  },
  {
    name: 'Afternoon HIIT',
    date: '2026-05-11',
    sport: 'HighIntensityIntervalTraining',
    mt: 2727,
    effort: 59,
  },
  { name: 'Lunch Run', date: '2026-05-09', sport: 'Run', mt: 1524, effort: 80 },
  {
    name: 'Shirtless',
    date: '2026-05-08',
    sport: 'WeightTraining',
    mt: 1723,
    effort: 6,
  },
  {
    name: 'Evening Run',
    date: '2026-05-08',
    sport: 'Run',
    mt: 547,
    effort: 32,
  },
  {
    name: 'Evening Run',
    date: '2026-05-05',
    sport: 'Run',
    mt: 2150,
    effort: 92,
  },
  {
    name: 'Evening Run',
    date: '2026-05-05',
    sport: 'Run',
    mt: 763,
    effort: 51,
  },
  {
    name: 'Shirtless',
    date: '2026-05-04',
    sport: 'WeightTraining',
    mt: 1677,
    effort: 5,
  },
  {
    name: 'Evening Run',
    date: '2026-05-04',
    sport: 'Run',
    mt: 608,
    effort: 22,
  },
  {
    name: 'Afternoon Run',
    date: '2026-05-03',
    sport: 'Run',
    mt: 6863,
    effort: 92,
  },
  {
    name: 'Lunch Run',
    date: '2026-05-03',
    sport: 'Run',
    mt: 4795,
    effort: 158,
  },
  {
    name: 'Evening Run',
    date: '2026-04-30',
    sport: 'Run',
    mt: 3748,
    effort: 115,
  },
  {
    name: 'Evening Run',
    date: '2026-04-28',
    sport: 'Run',
    mt: 1864,
    effort: 49,
  },
  {
    name: 'Morning Row',
    date: '2026-04-26',
    sport: 'Rowing',
    mt: 6461,
    effort: 13,
  },
  {
    name: 'Evening Run',
    date: '2026-04-21',
    sport: 'Run',
    mt: 1939,
    effort: 90,
  },
  {
    name: 'Zone 2 Shenanigans',
    date: '2026-04-19',
    sport: 'Run',
    mt: 10138,
    effort: 232,
  },
  {
    name: 'Evening Run',
    date: '2026-04-16',
    sport: 'Run',
    mt: 2069,
    effort: 61,
  },
  { name: '15:15x47', date: '2026-04-15', sport: 'Run', mt: 1922, effort: 71 },
  {
    name: 'Evening Run',
    date: '2026-04-14',
    sport: 'Run',
    mt: 1109,
    effort: 38,
  },
  {
    name: 'Afternoon Ride',
    date: '2026-04-13',
    sport: 'Ride',
    mt: 2320,
    effort: 17,
  },
  {
    name: 'Morning Ride',
    date: '2026-04-13',
    sport: 'Ride',
    mt: 2208,
    effort: 22,
  },
  {
    name: 'Morning Ride',
    date: '2026-04-08',
    sport: 'Ride',
    mt: 2021,
    effort: 19,
  },
  {
    name: 'Morning Run',
    date: '2026-04-07',
    sport: 'Run',
    mt: 2939,
    effort: 144,
  },
  {
    name: 'Evening Ride',
    date: '2026-04-05',
    sport: 'Ride',
    mt: 1928,
    effort: 12,
  },
  {
    name: 'Afternoon Ride',
    date: '2026-04-05',
    sport: 'Ride',
    mt: 2343,
    effort: 19,
  },
  {
    name: 'Morning Run',
    date: '2026-04-04',
    sport: 'Run',
    mt: 10814,
    effort: 127,
  },
  {
    name: 'Morning Ride',
    date: '2026-04-03',
    sport: 'Ride',
    mt: 7659,
    effort: 57,
  },
  { name: '4:3x4', date: '2026-04-02', sport: 'Run', mt: 1733, effort: 70 },
  {
    name: 'Afternoon Kayaking',
    date: '2026-04-02',
    sport: 'Kayaking',
    mt: 10800,
    effort: 5,
  },
  {
    name: 'Lunch Ride',
    date: '2026-04-02',
    sport: 'Ride',
    mt: 2369,
    effort: 22,
  },
  {
    name: 'Morning Ride',
    date: '2026-04-02',
    sport: 'Ride',
    mt: 2113,
    effort: 23,
  },
  { name: '15:15x47', date: '2026-04-01', sport: 'Run', mt: 1562, effort: 73 },
  {
    name: 'Evening Run',
    date: '2026-03-31',
    sport: 'Run',
    mt: 3150,
    effort: 115,
  },
  {
    name: 'Afternoon Ride',
    date: '2026-03-30',
    sport: 'Ride',
    mt: 6790,
    effort: 40,
  },
  {
    name: 'Afternoon Ride',
    date: '2026-03-28',
    sport: 'Ride',
    mt: 2992,
    effort: 15,
  },
  {
    name: 'Morning Run',
    date: '2026-03-28',
    sport: 'Run',
    mt: 8137,
    effort: 115,
  },
  { name: '4:3x4', date: '2026-03-26', sport: 'Run', mt: 2251, effort: 78 },
  { name: '15:15x47', date: '2026-03-25', sport: 'Run', mt: 3329, effort: 89 },
  {
    name: 'Evening Run',
    date: '2026-03-24',
    sport: 'Run',
    mt: 1959,
    effort: 93,
  },
  {
    name: 'Evening Weight Training',
    date: '2026-03-23',
    sport: 'WeightTraining',
    mt: 2677,
    effort: 16,
  },
  {
    name: 'Run The Rock',
    date: '2026-03-21',
    sport: 'Run',
    mt: 7088,
    effort: 358,
  },
  { name: '4:3x4', date: '2026-03-19', sport: 'Run', mt: 1889, effort: 66 },
  { name: '15:15x47', date: '2026-03-18', sport: 'Run', mt: 1526, effort: 44 },
  {
    name: 'Evening Run',
    date: '2026-03-17',
    sport: 'Run',
    mt: 2062,
    effort: 53,
  },
  {
    name: 'Morning Run',
    date: '2026-03-13',
    sport: 'Run',
    mt: 1889,
    effort: 75,
  },
  {
    name: 'Afternoon Run',
    date: '2026-03-12',
    sport: 'Run',
    mt: 631,
    effort: 26,
  },
  {
    name: 'Evening Run',
    date: '2026-03-10',
    sport: 'Run',
    mt: 3022,
    effort: 146,
  },
]

const COLOURS: Record<Category, string> = {
  running: '#fc5c65',
  cycling: '#26a6ff',
  strength: '#ffb400',
  other: '#a0dc78',
}

const LABELS: Record<Category, string> = {
  running: 'RUNNING',
  cycling: 'CYCLING',
  strength: 'STRENGTH',
  other: 'OTHER CARDIO',
}

const PANELS: Record<
  Category,
  { col: 0 | 1; row: 0 | 1; flipX: boolean; flipY: boolean }
> = {
  cycling: { col: 0, row: 0, flipX: true, flipY: false },
  running: { col: 1, row: 0, flipX: false, flipY: false },
  other: { col: 0, row: 1, flipX: true, flipY: true },
  strength: { col: 1, row: 1, flipX: false, flipY: true },
}

const cat = (sport: string): Category => {
  if (sport === 'Run') return 'running'
  if (sport === 'Ride' || sport === 'VirtualRide') return 'cycling'
  if (sport === 'WeightTraining' || sport === 'Workout') return 'strength'
  return 'other'
}

const cssVar = (name: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return v || fallback
}

const withAlpha = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return hex
  const r = Number.parseInt(clean.slice(0, 2), 16)
  const g = Number.parseInt(clean.slice(2, 4), 16)
  const b = Number.parseInt(clean.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const getThemePalette = (): ThemePalette => {
  const bg = cssVar('--color-bg', '#1A1815').toLowerCase()
  const isDark =
    bg.includes('#1a1815') ||
    bg.includes('#14110e') ||
    bg.includes('26, 24, 21')
  return {
    text: cssVar('--color-text', '#F4EFE6'),
    textSoft: cssVar('--color-text-soft', '#8C8576'),
    panelFillAlpha: isDark ? 0.12 : 0.2,
    panelLabelAlpha: isDark ? 0.34 : 0.42,
    grid: isDark ? 'rgba(244,239,230,0.06)' : 'rgba(26,24,21,0.08)',
    border: cssVar(
      '--color-rule',
      isDark ? 'rgba(244,239,230,0.08)' : 'rgba(26,24,21,0.12)'
    ),
    axis: isDark ? 'rgba(244,239,230,0.38)' : 'rgba(26,24,21,0.42)',
    crosshair: isDark ? 'rgba(244,239,230,0.48)' : 'rgba(26,24,21,0.38)',
    tooltipBg: cssVar('--color-bg-deep', '#14110E'),
    tooltipBorder: cssVar(
      '--color-rule',
      isDark ? 'rgba(244,239,230,0.08)' : 'rgba(26,24,21,0.12)'
    ),
  }
}

export default function TrainingQuadrantSquare() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [palette, setPalette] = useState<ThemePalette | null>(() =>
    typeof window !== 'undefined' ? getThemePalette() : null
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const DPR = window.devicePixelRatio || 1
    const SIZE = 580
    const GAP = 8
    const OUTER = 36

    const data = RAW.map((a) => ({ ...a, category: cat(a.sport) }))
    const groups: Record<Category, Array<(typeof data)[number]>> = {
      running: [],
      cycling: [],
      strength: [],
      other: [],
    }
    data.forEach((a) => groups[a.category].push(a))

    const stats = Object.fromEntries(
      (Object.keys(groups) as Category[]).map((k) => {
        const g = groups[k]
        return [
          k,
          {
            maxMt: Math.max(...g.map((a) => a.mt)),
            maxEffort: Math.max(...g.map((a) => a.effort)),
          },
        ]
      })
    ) as Record<Category, { maxMt: number; maxEffort: number }>

    const panelW = (SIZE - OUTER * 2 - GAP) / 2
    const panelH = panelW

    canvas.width = SIZE * DPR
    canvas.height = SIZE * DPR
    canvas.style.width = `${SIZE}px`
    canvas.style.height = `${SIZE}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(DPR, DPR)

    const panelBounds = (key: Category) => {
      const p = PANELS[key]
      const x = OUTER + p.col * (panelW + GAP)
      const y = OUTER + p.row * (panelH + GAP)
      return { x, y, w: panelW, h: panelH, col: p.col, row: p.row }
    }

    const toPixel = (normDur: number, normEff: number, key: Category) => {
      const b = panelBounds(key)
      const p = PANELS[key]
      const nx = p.flipX ? b.x + b.w - normDur * b.w : b.x + normDur * b.w
      const ny = p.flipY ? b.y + normEff * b.h : b.y + b.h - normEff * b.h
      return {
        x: nx,
        y: ny,
      }
    }

    const normalisedCoords = (a: (typeof data)[number]) => {
      const s = stats[a.category]
      // True zero-origin normalization: centre = 0 for each category axis.
      const normDur = a.mt / (s.maxMt || 1)
      const normEff = a.effort / (s.maxEffort || 1)
      return { normDur, normEff }
    }

    const points = data.map((a) => {
      const { normDur, normEff } = normalisedCoords(a)
      const { x, y } = toPixel(normDur, normEff, a.category)
      return { ...a, x, y, normDur, normEff }
    })

    const drawGridLines = (
      b: ReturnType<typeof panelBounds>,
      key: Category,
      theme: ThemePalette
    ) => {
      const p = PANELS[key]
      ctx.strokeStyle = theme.grid
      ctx.lineWidth = 1
      ;[0.25, 0.5, 0.75].forEach((f) => {
        const x = p.flipX ? b.x + b.w - f * b.w : b.x + f * b.w
        ctx.beginPath()
        ctx.moveTo(x, b.y)
        ctx.lineTo(x, b.y + b.h)
        ctx.stroke()
        const y = p.flipY ? b.y + f * b.h : b.y + b.h - f * b.h
        ctx.beginPath()
        ctx.moveTo(b.x, y)
        ctx.lineTo(b.x + b.w, y)
        ctx.stroke()
      })
    }

    const drawAxisLabels = (
      b: ReturnType<typeof panelBounds>,
      key: Category,
      theme: ThemePalette
    ) => {
      const p = PANELS[key]
      const s = stats[key]
      const durationOffset = 12
      const effortOffset = 10
      ctx.font = '9px -apple-system, sans-serif'
      ctx.fillStyle = theme.axis

      const durVals = [0, s.maxMt]
      durVals.forEach((v) => {
        const normDur = v / (s.maxMt || 1)
        const px2 = p.flipX ? b.x + b.w - normDur * b.w : b.x + normDur * b.w
        const label =
          v < 3600 ? `${Math.round(v / 60)}m` : `${(v / 3600).toFixed(1)}h`
        const isInnerZero = v === 0
        const isLeftPanelInnerEdge = isInnerZero && p.col === 0 && p.flipX
        const isRightPanelInnerEdge = isInnerZero && p.col === 1 && !p.flipX
        if (isLeftPanelInnerEdge) {
          ctx.textAlign = 'right'
        } else if (isRightPanelInnerEdge) {
          ctx.textAlign = 'left'
        } else {
          ctx.textAlign = 'center'
        }
        const xPad = isLeftPanelInnerEdge ? -2 : isRightPanelInnerEdge ? 2 : 0
        if (p.row === 0) {
          ctx.textBaseline = 'bottom'
          ctx.fillText(label, px2 + xPad, b.y - durationOffset)
        } else {
          ctx.textBaseline = 'top'
          ctx.fillText(label, px2 + xPad, b.y + b.h + durationOffset)
        }
      })

      const effVals = [0, s.maxEffort]
      effVals.forEach((v) => {
        const normEff = v / (s.maxEffort || 1)
        const py2 = p.flipY ? b.y + normEff * b.h : b.y + b.h - normEff * b.h
        ctx.textBaseline = 'middle'
        if (p.col === 0) {
          ctx.textAlign = 'right'
          ctx.fillText(`${v}`, b.x - effortOffset, py2)
        } else {
          ctx.textAlign = 'left'
          ctx.fillText(`${v}`, b.x + b.w + effortOffset, py2)
        }
      })
    }

    const draw = () => {
      const theme = getThemePalette()
      setPalette(theme)
      ctx.clearRect(0, 0, SIZE, SIZE)
      ;(Object.keys(PANELS) as Category[]).forEach((key) => {
        const b = panelBounds(key)
        const col = COLOURS[key]
        ctx.fillStyle = withAlpha(col, theme.panelFillAlpha)
        ctx.fillRect(b.x, b.y, b.w, b.h)
        drawGridLines(b, key, theme)
        ctx.strokeStyle = theme.border
        ctx.lineWidth = 1
        ctx.strokeRect(b.x, b.y, b.w, b.h)
        ctx.font = '700 12px -apple-system, sans-serif'
        ctx.fillStyle = withAlpha(col, theme.panelLabelAlpha)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(LABELS[key], b.x + b.w / 2, b.y + b.h / 2)
        drawAxisLabels(b, key, theme)
      })

      const cx = OUTER + panelW + GAP / 2
      const cy = OUTER + panelH + GAP / 2
      ctx.strokeStyle = theme.crosshair
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(OUTER, cy)
      ctx.lineTo(SIZE - OUTER, cy)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, OUTER)
      ctx.lineTo(cx, SIZE - OUTER)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = theme.crosshair
      ctx.fill()

      ctx.font = '600 10px -apple-system, sans-serif'
      ctx.fillStyle = theme.axis
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('<- Duration', OUTER + panelW / 2, OUTER - 18)
      ctx.fillText('Duration ->', OUTER + panelW + GAP + panelW / 2, OUTER - 18)
      ctx.save()
      ctx.translate(OUTER - 20, OUTER + panelH / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Intensity ->', 0, 0)
      ctx.restore()
      ctx.save()
      ctx.translate(OUTER - 20, OUTER + panelH + GAP + panelH / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('<- Intensity', 0, 0)
      ctx.restore()

      points.forEach((p) => {
        const col = COLOURS[p.category]
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = withAlpha(col, 0.73)
        ctx.fill()
        ctx.strokeStyle = col
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    draw()

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (SIZE / rect.width)
      const my = (e.clientY - rect.top) * (SIZE / rect.height)
      let closest: (typeof points)[number] | null = null
      let minDist = 16
      for (const p of points) {
        const d = Math.hypot(mx - p.x, my - p.y)
        if (d < minDist) {
          minDist = d
          closest = p
        }
      }

      if (!closest) {
        setTooltip(null)
        canvas.style.cursor = 'default'
        return
      }

      const mins = Math.round(closest.mt / 60)
      const hrs = Math.floor(mins / 60)
      const rem = mins % 60
      const duration = hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`
      setTooltip({
        x: e.clientX + 14,
        y: e.clientY - 10,
        name: closest.name,
        date: closest.date,
        duration,
        effort: closest.effort,
        category: closest.category,
      })
      canvas.style.cursor = 'crosshair'
    }

    const hideTooltip = () => setTooltip(null)
    const observer = new MutationObserver(() => draw())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style', 'class'],
    })

    canvas.addEventListener('mousemove', handleMove)
    canvas.addEventListener('mouseleave', hideTooltip)
    return () => {
      observer.disconnect()
      canvas.removeEventListener('mousemove', handleMove)
      canvas.removeEventListener('mouseleave', hideTooltip)
    }
  }, [])

  return (
    <div className="mx-auto max-w-[780px] my-8 px-4 text-text">
      <h2 className="text-center font-serif font-semibold text-h3 mb-1">
        Training Sessions - Quadrant Chart
      </h2>
      <p className="text-center font-mono text-meta text-text-soft mb-4">
        10 Mar - 2 Jun 2026 · X = Duration · Y = Intensity · Normalised per
        category · Hover for details
      </p>
      <canvas ref={canvasRef} className="block mx-auto" />
      <div className="flex flex-wrap justify-center gap-4 mt-3 font-mono text-meta text-text-soft">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#fc5c65]" />
          Running
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#26a6ff]" />
          Cycling
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffb400]" />
          Strength
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#a0dc78]" />
          Other Cardio
        </div>
      </div>
      {tooltip && palette ? (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            background: palette.tooltipBg,
            border: `1px solid ${palette.tooltipBorder}`,
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            color: palette.text,
            pointerEvents: 'none',
            zIndex: 100,
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: COLOURS[tooltip.category] }}>
            {tooltip.name}
          </strong>
          <br />
          {tooltip.date}
          <br />⏱ {tooltip.duration} · ⚡ Effort {tooltip.effort}
          <br />
          <span style={{ color: palette.textSoft }}>
            within <em>{tooltip.category}</em>
          </span>
        </div>
      ) : null}
    </div>
  )
}
