/**
 * Bleed-jump algorithm — moves the sticky TOC out of the way of bleed-tier
 * figures that occupy the gutter where the TOC lives.
 *
 * The TOC sticks at viewport-y `stickyTop` by default. When a bleed section
 * overlaps the TOC's sticky band — the vertical strip
 *   [scrollY + stickyTop - gap, scrollY + stickyTop + tocHeight + gap]
 * — the TOC is pushed above or below the bleed depending on whether the
 * bleed sits in the upper or lower half of the viewport.
 *
 * Bleeds entirely outside that band cannot collide with the TOC and are
 * ignored, even if they're elsewhere on screen.
 *
 * All inputs are scalars in CSS pixels. Bleed rectangles are in document
 * coordinates (i.e., page-relative, not viewport-relative).
 */

export type BleedRect = {
  docTop: number
  docBottom: number
}

export type AnchorMode = 'sticky' | 'above' | 'below'

export type AnchorState = {
  /**
   * Vertical offset to apply on top of the TOC's sticky position.
   * Positive values push the TOC down (anchored below a bleed), negative
   * push it up (anchored above). Always 0 in 'sticky' mode.
   */
  translateY: number
  mode: AnchorMode
  /** Index into the bleeds array, or -1 when no bleed is active. */
  activeIndex: number
}

export type BleedJumpConfig = {
  /** Viewport-y at which the TOC sticks by default. */
  stickyTop: number
  /** Breathing room between the TOC and an active bleed edge. */
  gap: number
}

/**
 * Find the index of the first bleed rectangle overlapping the TOC's sticky
 * band. Returns -1 when no bleed conflicts.
 *
 * Assumes `bleeds` is sorted by `docTop` ascending — the iteration relies on
 * the sort to short-circuit once a bleed is below the band. The first
 * overlap wins; if two bleeds both overlap (a tightly packed pair), they're
 * adjacent in the sort and either anchor produces an acceptable position.
 */
export const findActiveBleedIndex = (
  scrollY: number,
  tocHeight: number,
  bleeds: ReadonlyArray<BleedRect>,
  config: BleedJumpConfig
): number => {
  const bandTop = scrollY + config.stickyTop - config.gap
  const bandBottom = scrollY + config.stickyTop + tocHeight + config.gap
  for (let i = 0; i < bleeds.length; i++) {
    const b = bleeds[i]
    if (b.docBottom < bandTop) continue
    if (b.docTop > bandBottom) break
    return i
  }
  return -1
}

/**
 * Compute the TOC's anchor state for the current scroll position.
 *
 * Decision tree:
 *   1. Is any bleed conflicting with the sticky band?
 *      No → sticky default, translateY = 0.
 *   2. Is the active bleed's midpoint above or below the viewport center?
 *      Below → anchor TOC above the bleed (translateY clamped ≤ 0).
 *      Above → anchor TOC below the bleed (translateY clamped ≥ 0).
 *
 * The clamps mean the formulas degrade gracefully back to sticky when the
 * bleed is far enough away that anchoring would push the TOC the "wrong"
 * direction past its natural sticky position.
 */
export const computeAnchor = (
  scrollY: number,
  viewportHeight: number,
  tocHeight: number,
  bleeds: ReadonlyArray<BleedRect>,
  config: BleedJumpConfig
): AnchorState => {
  const activeIndex = findActiveBleedIndex(scrollY, tocHeight, bleeds, config)
  if (activeIndex < 0) {
    return { translateY: 0, mode: 'sticky', activeIndex: -1 }
  }

  const active = bleeds[activeIndex]
  const bleedMid = (active.docTop + active.docBottom) / 2
  const viewportMid = scrollY + viewportHeight / 2

  if (bleedMid > viewportMid) {
    // Bleed below center → anchor TOC above bleed.
    // TOC.bottom = bleed.top - gap (in viewport coords)
    const raw =
      active.docTop - scrollY - config.stickyTop - tocHeight - config.gap
    const translateY = Math.min(0, raw)
    return {
      translateY,
      mode: translateY === 0 ? 'sticky' : 'above',
      activeIndex,
    }
  }

  // Bleed above center → anchor TOC below bleed.
  // TOC.top = bleed.bottom + gap (in viewport coords)
  const raw = active.docBottom - scrollY - config.stickyTop + config.gap
  const translateY = Math.max(0, raw)
  return {
    translateY,
    mode: translateY === 0 ? 'sticky' : 'below',
    activeIndex,
  }
}
