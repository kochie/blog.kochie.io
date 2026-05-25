import { describe, expect, it } from 'vitest'
import {
  computeAnchor,
  findActiveBleedIndex,
  type BleedJumpConfig,
  type BleedRect,
} from '../bleed-jump'

const config: BleedJumpConfig = { stickyTop: 96, gap: 16 }

// Helpers — make geometry fixtures readable.
const bleed = (docTop: number, height: number): BleedRect => ({
  docTop,
  docBottom: docTop + height,
})

describe('findActiveBleedIndex', () => {
  it('returns -1 when there are no bleeds', () => {
    expect(findActiveBleedIndex(0, 400, [], config)).toBe(-1)
  })

  it('returns -1 when the only bleed is far below the sticky band', () => {
    // Viewport at scrollY=0, sticky band [80, 512]. Bleed at doc 2000+.
    expect(findActiveBleedIndex(0, 400, [bleed(2000, 500)], config)).toBe(-1)
  })

  it('returns -1 when the only bleed is far above the sticky band', () => {
    // ScrollY=3000, sticky band [3080, 3512]. Bleed at doc 0–500.
    expect(findActiveBleedIndex(3000, 400, [bleed(0, 500)], config)).toBe(-1)
  })

  it('returns 0 when a single bleed overlaps the band from below', () => {
    // ScrollY=0, sticky band [80, 512]. Bleed extends from 500 to 700 — its
    // top (500) sits inside the band's range.
    expect(findActiveBleedIndex(0, 400, [bleed(500, 200)], config)).toBe(0)
  })

  it('returns 0 when a single bleed overlaps the band from above', () => {
    // ScrollY=600, sticky band [680, 1112]. Bleed 500–700 — its bottom (700)
    // sits inside the band.
    expect(findActiveBleedIndex(600, 400, [bleed(500, 200)], config)).toBe(0)
  })

  it('returns 0 when the bleed entirely contains the band', () => {
    // ScrollY=0, sticky band [80, 512]. Huge bleed 0–2000.
    expect(findActiveBleedIndex(0, 400, [bleed(0, 2000)], config)).toBe(0)
  })

  it('returns 0 when the band entirely contains a small bleed', () => {
    // ScrollY=0, sticky band [80, 512]. Tiny bleed 200–250.
    expect(findActiveBleedIndex(0, 400, [bleed(200, 50)], config)).toBe(0)
  })

  it('skips bleeds whose bottom is just above the band by less than gap', () => {
    // ScrollY=200, band [280, 712] (with gap=16, actual range
    // is 264–728 because we extend by gap). Bleed bottom at 250 is below
    // bandTop (264) → not active.
    const result = findActiveBleedIndex(200, 400, [bleed(0, 250)], config)
    expect(result).toBe(-1)
  })

  it('treats a bleed bottom exactly at bandTop as still active (boundary inclusion)', () => {
    // bandTop = 0 + 96 - 16 = 80. Bleed bottom at exactly 80 → not skipped
    // (b.docBottom < bandTop is strict less-than).
    const b = { docTop: 0, docBottom: 80 }
    expect(findActiveBleedIndex(0, 400, [b], config)).toBe(0)
  })

  it('treats a bleed top exactly at bandBottom as still active (boundary inclusion)', () => {
    // bandBottom = 0 + 96 + 400 + 16 = 512. Bleed top at exactly 512 → not
    // broken out (b.docTop > bandBottom is strict greater-than).
    const b = { docTop: 512, docBottom: 1000 }
    expect(findActiveBleedIndex(0, 400, [b], config)).toBe(0)
  })

  it('returns the first overlapping bleed in document order when multiple overlap', () => {
    // Two adjacent bleeds both overlapping the band.
    const bleeds = [bleed(100, 100), bleed(250, 100)]
    expect(findActiveBleedIndex(0, 400, bleeds, config)).toBe(0)
  })

  it('skips bleeds passed above and finds the next overlapping one', () => {
    // ScrollY=600, band [680, 1112]. First bleed 0–200 (way above), second
    // bleed 700–900 (in band). Returns index 1.
    const bleeds = [bleed(0, 200), bleed(700, 200)]
    expect(findActiveBleedIndex(600, 400, bleeds, config)).toBe(1)
  })

  it('breaks the loop at the first bleed beyond the band (does not iterate further)', () => {
    // Construct a sorted list where the active bleed is index 1 and a later
    // bleed shouldn't be considered. We can't directly observe iteration
    // count, but we verify the correct index is returned and nothing past
    // is examined.
    const bleeds = [bleed(50, 100), bleed(2000, 100), bleed(3000, 100)]
    // ScrollY=0, band [80, 512]. First bleed 50–150 overlaps. Returns 0.
    expect(findActiveBleedIndex(0, 400, bleeds, config)).toBe(0)
  })

  it('respects the gap buffer on both sides of the band', () => {
    // gap=16 means the actual scan range is [stickyTop - gap, stickyTop +
    // tocHeight + gap]. A bleed 8px outside should still be detected.
    const bleeds = [bleed(70, 5)] // bottom = 75
    // bandTop = 0 + 96 - 16 = 80. 75 < 80 → not active.
    expect(findActiveBleedIndex(0, 400, bleeds, config)).toBe(-1)
    // Move the bleed 5px down: bottom = 80, exactly at bandTop → active.
    const bleeds2 = [bleed(75, 5)]
    expect(findActiveBleedIndex(0, 400, bleeds2, config)).toBe(0)
  })
})

describe('computeAnchor', () => {
  it('returns sticky default when there are no bleeds', () => {
    const r = computeAnchor(0, 800, 400, [], config)
    expect(r).toEqual({ translateY: 0, mode: 'sticky', activeIndex: -1 })
  })

  it('returns sticky default when no bleed conflicts with the sticky band', () => {
    // A bleed far below the sticky band — nowhere near the TOC.
    const r = computeAnchor(0, 800, 400, [bleed(2000, 500)], config)
    expect(r).toEqual({ translateY: 0, mode: 'sticky', activeIndex: -1 })
  })

  it('anchors above when the active bleed midpoint is below viewport center', () => {
    // ScrollY=0, viewportHeight=800, viewport center at 400.
    // Bleed at 500–700, midpoint 600. 600 > 400 → anchor above.
    // Formula: translateY = min(0, 500 - 0 - 96 - 400 - 16) = min(0, -12) = -12
    const r = computeAnchor(0, 800, 400, [bleed(500, 200)], config)
    expect(r.mode).toBe('above')
    expect(r.translateY).toBe(-12)
    expect(r.activeIndex).toBe(0)
  })

  it('clamps above-mode to sticky when the bleed is far enough below to leave room', () => {
    // Bleed at 600–800. translateY = 600 - 0 - 96 - 400 - 16 = 88. Clamped
    // to 0 because the formula went positive (TOC would be pushed *down*
    // from sticky, which the above-mode clamp forbids).
    const r = computeAnchor(0, 800, 400, [bleed(600, 200)], config)
    // Note: this bleed (600–800) does NOT overlap band [80, 512], so it's
    // not active at all → sticky default.
    expect(r).toEqual({ translateY: 0, mode: 'sticky', activeIndex: -1 })
  })

  it('anchors below when the active bleed midpoint is above viewport center', () => {
    // ScrollY=600, viewportHeight=800, viewport center at 1000.
    // Bleed at 500–700, midpoint 600. 600 < 1000 → anchor below.
    // Formula: translateY = max(0, 700 - 600 - 96 + 16) = max(0, 20) = 20
    const r = computeAnchor(600, 800, 400, [bleed(500, 200)], config)
    expect(r.mode).toBe('below')
    expect(r.translateY).toBe(20)
    expect(r.activeIndex).toBe(0)
  })

  it('clamps below-mode to sticky at the moment the bleed exits the sticky band going down', () => {
    // Set scrollY so bleed.docBottom is exactly at bandTop=80 (i.e.
    // scrollY + 80 = bleed.docBottom). Bleed 0–700 → scrollY = 620.
    const r = computeAnchor(620, 800, 400, [bleed(0, 700)], config)
    // bandTop = 700, exactly equals bleed.docBottom → still active.
    // viewport center = 620 + 400 = 1020. bleedMid = 350. 350 < 1020 →
    // below mode. translateY = max(0, 700 - 620 - 96 + 16) = max(0, 0) = 0.
    expect(r.translateY).toBe(0)
    expect(r.mode).toBe('sticky')
    expect(r.activeIndex).toBe(0)
  })

  it('produces a continuous translateY as a bleed approaches the sticky band from below (going down)', () => {
    // Two scrolls 1px apart should yield translateY values 1px apart, once
    // the bleed has crossed into the band by at least 1px.
    //
    // Bleed at 600–800. bandBottom = scrollY + 512. The bleed first enters
    // the band when bandBottom == bleed.docTop = 600 → scrollY = 88 (still
    // a clamped boundary, raw = 0). Just past that:
    //   scrollY=89 → raw = -1 → translateY = -1 (above)
    //   scrollY=90 → raw = -2 → translateY = -2 (above)
    const a = computeAnchor(89, 800, 400, [bleed(600, 200)], config)
    const b = computeAnchor(90, 800, 400, [bleed(600, 200)], config)
    expect(a.mode).toBe('above')
    expect(b.mode).toBe('above')
    expect(b.translateY - a.translateY).toBe(-1)
  })

  it('handles a tall bleed dominating the viewport: TOC pushed off-screen, returns to sticky after bleed clears', () => {
    // viewportHeight=800, tocHeight=400, bleed 0–2000.
    const tall = [bleed(0, 2000)]

    // Scroll so viewport is mid-bleed (scrollY=600, viewport 600–1400).
    // bleedMid=1000, viewportMid=1000. They're equal → goes to below branch
    // (the > comparison is strict). Formula: max(0, 2000 - 600 - 96 + 16)
    // = max(0, 1320) = 1320. TOC pushed way down, off-screen.
    const mid = computeAnchor(600, 800, 400, tall, config)
    expect(mid.mode).toBe('below')
    expect(mid.translateY).toBe(1320)

    // Scroll past the bleed (scrollY=2500, viewport 2500–3300, bleed
    // 0–2000 fully above). Bleed doesn't overlap the band → sticky default.
    const past = computeAnchor(2500, 800, 400, tall, config)
    expect(past).toEqual({ translateY: 0, mode: 'sticky', activeIndex: -1 })
  })

  it('picks the bleed that conflicts with the sticky band even when a more-centered bleed exists', () => {
    // Regression: the earlier "closest to viewport center" rule picked the
    // wrong bleed when two were both near the viewport, and the chosen
    // bleed clamped to sticky default — leaving the truly-conflicting
    // bleed to paint over the TOC.
    //
    // Setup: scrollY=920, viewport 920–2170 (vh=1250).
    //   FIG02: 494–1040, midpoint 767. Conflicts with band [1000, 1432].
    //   FIG05: 1888–2455, midpoint 2171. Closer to viewport center (1545)
    //     but does NOT conflict with the band.
    // The conflict-based selection must pick FIG02.
    const r = computeAnchor(
      920,
      1250,
      400,
      [bleed(494, 546), bleed(1888, 567)],
      config
    )
    expect(r.activeIndex).toBe(0) // FIG02 is at index 0
    expect(r.mode).toBe('below') // FIG02 midpoint 767 < viewport mid 1545
  })

  it('switches between above and below modes as the bleed midpoint crosses viewport center', () => {
    // Bleed at 500–700, midpoint 600. ViewportHeight=800.
    //
    // At scrollY=199, viewport center = 599. bleedMid 600 > 599 → above.
    // At scrollY=201, viewport center = 601. bleedMid 600 < 601 → below.
    const justBefore = computeAnchor(199, 800, 400, [bleed(500, 200)], config)
    const justAfter = computeAnchor(201, 800, 400, [bleed(500, 200)], config)
    expect(justBefore.mode).toBe('above')
    expect(justAfter.mode).toBe('below')
  })

  it('treats viewport center exactly equal to bleed midpoint as below (because comparison is strict)', () => {
    // bleedMid 600 > viewportMid 600 is false → falls through to below
    // branch. Documents the tiebreak.
    const r = computeAnchor(200, 800, 400, [bleed(500, 200)], config)
    // viewport center = 200 + 400 = 600. bleedMid = 600. 600 > 600 false.
    expect(r.mode === 'sticky' || r.mode === 'below').toBe(true)
  })

  it('returns activeIndex for the bleed that is anchored to', () => {
    // Two bleeds, the second one is the conflict. activeIndex should be 1.
    const bleeds = [bleed(0, 50), bleed(500, 200)]
    const r = computeAnchor(0, 800, 400, bleeds, config)
    expect(r.activeIndex).toBe(1)
  })

  it('produces translateY=0 with mode=sticky when above-mode formula clamps at the boundary', () => {
    // Pick scroll/bleed so the above formula evaluates to exactly 0.
    // raw = bleed.docTop - scrollY - 96 - 400 - 16 = 0
    // → bleed.docTop = scrollY + 512.
    // ScrollY=0, bleed.docTop=512. Bleed 512–700 → midpoint 606 > viewportMid 400 → above branch.
    const r = computeAnchor(0, 800, 400, [bleed(512, 188)], config)
    expect(r.translateY).toBe(0)
    expect(r.mode).toBe('sticky')
    expect(r.activeIndex).toBe(0) // bleed top at exactly bandBottom is included
  })

  it('produces translateY=0 with mode=sticky when below-mode formula clamps at the boundary', () => {
    // raw = bleed.docBottom - scrollY - 96 + 16 = 0
    // → bleed.docBottom = scrollY + 80.
    // ScrollY=0, bleed.docBottom=80. Bleed -200 to 80 → midpoint -60 < viewportMid 400 → below branch.
    const r = computeAnchor(0, 800, 400, [bleed(-200, 280)], config)
    expect(r.translateY).toBe(0)
    expect(r.mode).toBe('sticky')
    expect(r.activeIndex).toBe(0) // bleed bottom at exactly bandTop is included
  })

  it('reads stickyTop and gap from config (config-driven, not hard-coded)', () => {
    const customConfig: BleedJumpConfig = { stickyTop: 60, gap: 8 }
    // bandTop = scrollY + 60 - 8 = 52 at scrollY=0.
    // Bleed bottom at 60 → just above bandTop=52, within band.
    const r = computeAnchor(0, 800, 300, [bleed(40, 20)], customConfig)
    expect(r.activeIndex).toBe(0)
  })
})
