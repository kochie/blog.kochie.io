/**
 * Returns the ISO 8601 week year and week number for a given date.
 * ISO weeks start on Monday. Week 1 is the week containing the first Thursday.
 */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  // Shift so Monday = 0, Sunday = 6
  const day = (d.getUTCDay() + 6) % 7
  // Move to nearest Thursday to determine the ISO year
  d.setUTCDate(d.getUTCDate() - day + 3)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return { year: d.getUTCFullYear(), week }
}

/**
 * Builds a Map<year, Map<week, articleCount>> for the given year range.
 * Articles outside the year range are ignored.
 * Week numbers follow ISO 8601 (1–53).
 */
export function buildHeatmapGrid(
  articles: { publishedDate: string }[],
  startYear: number,
  endYear: number
): Map<number, Map<number, number>> {
  const grid = new Map<number, Map<number, number>>()
  for (let y = startYear; y <= endYear; y++) {
    grid.set(y, new Map())
  }
  for (const article of articles) {
    const { year, week } = isoWeek(new Date(article.publishedDate))
    if (year < startYear || year > endYear) continue
    const yearMap = grid.get(year)!
    yearMap.set(week, (yearMap.get(week) ?? 0) + 1)
  }
  return grid
}
