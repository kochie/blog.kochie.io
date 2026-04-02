import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { components } from '../components'

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

  test('renders nested list structure', () => {
    const { asFragment } = render(
      <components.ul id="topics">
        <components.li>Alpha</components.li>
        <components.li>Beta</components.li>
      </components.ul>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
