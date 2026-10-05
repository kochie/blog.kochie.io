// @vitest-environment node

import { describe, it, expect } from 'vitest'
import { mdxToMarkdown, journalBodyToMarkdown } from '../llms'

describe('mdxToMarkdown', () => {
  it('drops frontmatter and keeps prose, code and maths', () => {
    const md = mdxToMarkdown(
      `---
title: Test
---

Some **bold** text and $E = mc^2$.

\`\`\`ts
import { x } from 'y'
export const z = <Foo />
\`\`\`
`,
      '01-test'
    )
    expect(md).not.toContain('title: Test')
    expect(md).toContain('Some **bold** text and $E = mc^2$.')
    expect(md).toContain("import { x } from 'y'")
    expect(md).toContain('export const z = <Foo />')
  })

  it('resolves article images and site-relative links to absolute URLs', () => {
    const md = mdxToMarkdown(
      `![Diagram](/diagram.svg?width=700) and [an article](/articles/02-other).`,
      '01-test'
    )
    expect(md).toContain(
      '![Diagram](https://blog.kochie.io/images/articles/01-test/diagram.svg)'
    )
    expect(md).toContain(
      '[an article](https://blog.kochie.io/articles/02-other)'
    )
  })

  it('turns embeds into plain links', () => {
    const md = mdxToMarkdown(
      `<YouTube id="abc123" source="Channel · Title" caption="A caption." />

<GithubProject owner="kochie" repo="blog.kochie.io" />

{

<div style={{ display: 'flex' }}>
  <Tweet id="42" />
</div>
}

<HaloInteractive caption="Drag the slider" />`,
      '01-test'
    )
    expect(md).toContain(
      '[Video: Channel · Title](https://www.youtube.com/watch?v=abc123) — A caption.'
    )
    expect(md).toContain(
      'GitHub repository: [kochie/blog.kochie.io](https://github.com/kochie/blog.kochie.io)'
    )
    expect(md).toContain('[Embedded tweet](https://twitter.com/i/status/42)')
    expect(md).toContain(
      '[Interactive element (HaloInteractive) — view on the blog](https://blog.kochie.io/articles/01-test)'
    )
    expect(md).not.toMatch(/<[A-Za-z]/)
  })

  it('renders quotes as attributed blockquotes and drops comments', () => {
    const md = mdxToMarkdown(
      `{/* editor note */}

<Quote author="Jane" position="Engineer">
  <div>
    Quoted words.
  </div>
</Quote>`,
      '01-test'
    )
    expect(md).not.toContain('editor note')
    expect(md).toMatch(/> Quoted words\.\n>\n> — Jane, Engineer/)
  })
})

describe('journalBodyToMarkdown', () => {
  it('converts custom tags and image paths', () => {
    const md = journalBodyToMarkdown(
      `Went to <Place link="https://example.com" instagram="x">Harp
and Hound</Place>.

<Spotify wide link="https://open.spotify.com/track/1" />

<TrainingQuadrantSquare />

![Bike](./images/bike.jpg)`,
      '2026-06-02'
    )
    expect(md).toContain('[Harp and Hound](https://example.com)')
    expect(md).toContain(
      '[Listen on Spotify](https://open.spotify.com/track/1)'
    )
    expect(md).toContain(
      '[Interactive element (TrainingQuadrantSquare) — view on the blog](https://blog.kochie.io/journal/2026-06-02)'
    )
    expect(md).toContain(
      '![Bike](https://blog.kochie.io/images/journal/bike.jpg)'
    )
  })
})
