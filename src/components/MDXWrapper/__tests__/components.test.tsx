import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { components } from '../components'
import { FigureProvider } from '@/components/Figure/context'

describe('MDX COMPONENTS', () => {
  test('renders headings correctly', () => {
    const { asFragment } = render(
      <>
        <components.h1>Heading 1</components.h1>
        <components.h2>Heading 2</components.h2>
        <components.h3>Heading 3</components.h3>
        <components.h4>Heading 4</components.h4>
        <components.h5>Heading 5</components.h5>
        <components.h6>Heading 6</components.h6>
      </>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders paragraphs correctly', () => {
    const { asFragment } = render(<components.p>Paragraph</components.p>)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders blockquote correctly', () => {
    const { asFragment } = render(
      <components.blockquote>Blockquote</components.blockquote>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders ul correctly', () => {
    const { asFragment } = render(<components.ul>Unordered List</components.ul>)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders ol correctly', () => {
    const { asFragment } = render(<components.ol>Ordered List</components.ol>)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders li correctly', () => {
    const { asFragment } = render(<components.li>List Item</components.li>)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders hr correctly', () => {
    const { asFragment } = render(<components.hr />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders a correctly', () => {
    const { asFragment } = render(
      <components.a href="https://example.com">Link</components.a>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders code correctly', () => {
    const { asFragment } = render(<components.code>Strong</components.code>)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders sup correctly', () => {
    const { asFragment } = render(<components.sup>2</components.sup>)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders Video wrapper correctly', () => {
    const { asFragment } = render(
      <components.Video src="/clip.mp4" controls>
        <track kind="captions" />
      </components.Video>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders img through MDX mapping', () => {
    const { asFragment } = render(
      <components.img
        src="/pic.png?width=400&height=300"
        alt="Caption"
        lqip="data:image/png;base64,x"
      />
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('routes ?tier=prose to a prose-tier Figure', () => {
    const { container } = render(
      <components.img
        src="/pic.png?tier=prose&width=400&height=300"
        alt="Narrow"
        lqip="data:image/png;base64,x"
      />
    )
    const fig = container.querySelector('figure[data-figure-kind="image"]')
    const inner = fig?.querySelector(':scope > div')
    expect(inner?.className).toMatch(/max-w-prose/)
  })

  test('routes ?tier=bleed to a bleed-tier Figure', () => {
    const { container } = render(
      <components.img
        src="/pic.png?tier=bleed&width=2400&height=1350"
        alt="Hero"
        lqip="data:image/png;base64,x"
      />
    )
    const fig = container.querySelector('figure[data-figure-kind="image"]')
    expect(fig?.className).toMatch(/xl:w-screen/)
    const inner = fig?.querySelector(':scope > div')
    expect(inner?.className).toMatch(/max-w-bleed/)
  })

  test('falls back to wide when ?tier= is unknown or missing', () => {
    const { container } = render(
      <components.img
        src="/pic.png?tier=nope&width=400&height=300"
        alt="Default"
        lqip="data:image/png;base64,x"
      />
    )
    const fig = container.querySelector('figure[data-figure-kind="image"]')
    const inner = fig?.querySelector(':scope > div')
    expect(inner?.className).toMatch(/max-w-wide/)
  })

  test('serves animated formats (gif, apng) unoptimized to preserve animation', () => {
    // next/image's optimizer flattens animated frames to a single still.
    // Routing GIFs and APNGs around the optimizer keeps their animation
    // bytes intact.
    for (const ext of ['gif', 'apng', 'GIF']) {
      const { container, unmount } = render(
        <components.img
          src={`/clip.${ext}?width=480&height=270`}
          alt="Animated"
          lqip="data:image/png;base64,x"
        />
      )
      const img = container.querySelector('img')
      expect(img?.getAttribute('data-unoptimized')).toBe('true')
      unmount()
    }
  })

  test('still optimizes ordinary raster formats by default', () => {
    // Regression guard for the animation carve-out: PNGs should keep going
    // through next/image's optimizer (unoptimized stays false).
    const { container } = render(
      <components.img
        src="/pic.png?width=400&height=300"
        alt="Static"
        lqip="data:image/png;base64,x"
      />
    )
    const img = container.querySelector('img')
    expect(img?.getAttribute('data-unoptimized')).toBeNull()
  })

  test('renders nested list structure', () => {
    const { asFragment } = render(
      <components.ul id="topics">
        <components.li>Alpha</components.li>
        <components.li>Beta</components.li>
      </components.ul>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  test('YouTube wraps the iframe in a video-tier Figure with caption and source', () => {
    // FigureProvider hands out FIG. numbers — without it, FigureCaption
    // suppresses itself rather than emitting "FIG. 00".
    const { container } = render(
      <FigureProvider>
        <components.YouTube
          id="bJ_seXo-Enc"
          caption="An artificial gravity lab"
          source="Tom Scott"
        />
      </FigureProvider>
    )
    const fig = container.querySelector('figure[data-figure-kind="video"]')
    expect(fig).not.toBeNull()
    expect(fig?.getAttribute('data-tier')).toBe('wide')
    expect(container.textContent).toMatch(/An artificial gravity lab/)
    expect(container.textContent).toMatch(/Tom Scott/)
  })

  test('YouTube builds the embed URL from the video id', () => {
    const { container } = render(
      <components.YouTube id="bJ_seXo-Enc" caption="x" />
    )
    const iframe = container.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/bJ_seXo-Enc'
    )
  })

  test('YouTube appends a start param when start is provided', () => {
    const { container } = render(
      <components.YouTube id="bJ_seXo-Enc" caption="x" start={42} />
    )
    const iframe = container.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/bJ_seXo-Enc?start=42'
    )
  })

  test('YouTube clamps negative start values to 0', () => {
    const { container } = render(
      <components.YouTube id="bJ_seXo-Enc" caption="x" start={-10} />
    )
    const iframe = container.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/bJ_seXo-Enc?start=0'
    )
  })

  test('YouTube floors fractional start values', () => {
    // YouTube's start param must be an integer; non-integers cause the
    // player to ignore the cue. Floor to be safe.
    const { container } = render(
      <components.YouTube id="bJ_seXo-Enc" caption="x" start={42.7} />
    )
    const iframe = container.querySelector('iframe')
    expect(iframe?.getAttribute('src')).toBe(
      'https://www.youtube.com/embed/bJ_seXo-Enc?start=42'
    )
  })

  test('YouTube respects the tier prop (default wide, override bleed)', () => {
    const { container, rerender } = render(
      <components.YouTube id="x" caption="c" />
    )
    expect(container.querySelector('figure')?.getAttribute('data-tier')).toBe(
      'wide'
    )

    rerender(<components.YouTube id="x" caption="c" tier="bleed" />)
    expect(container.querySelector('figure')?.getAttribute('data-tier')).toBe(
      'bleed'
    )
  })

  test('YouTube sets a sensible iframe title for accessibility', () => {
    const { container, rerender } = render(
      <components.YouTube id="x" caption="c" />
    )
    expect(container.querySelector('iframe')?.getAttribute('title')).toBe(
      'YouTube video player'
    )

    rerender(
      <components.YouTube id="x" caption="c" title="Tom Scott — gravity lab" />
    )
    expect(container.querySelector('iframe')?.getAttribute('title')).toBe(
      'Tom Scott — gravity lab'
    )
  })

  test('YouTube iframe is lazy-loaded and allows fullscreen', () => {
    const { container } = render(<components.YouTube id="x" caption="c" />)
    const iframe = container.querySelector('iframe')
    expect(iframe?.getAttribute('loading')).toBe('lazy')
    // jsdom normalises the boolean attribute to an empty string when present.
    expect(iframe?.hasAttribute('allowfullscreen')).toBe(true)
  })
})
