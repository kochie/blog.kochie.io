import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import Link from 'next/link'
import TopBar from '@/components/Topbar'

describe('TOPBAR COMPONENT', () => {
  test('should render', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<TopBar />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })

  test('should link to author', () => {
    const tree = create(<TopBar />)
    const links = tree.root.findAllByType(Link)
    expect(links[0].props['href']).toBe('/authors')
  })

  test('should link to root (articles)', () => {
    const tree = create(<TopBar />)
    const links = tree.root.findAllByType(Link)
    expect(links[1].props['href']).toBe('/')
  })

  test('should link to tags', () => {
    const tree = create(<TopBar />)
    const links = tree.root.findAllByType(Link)
    expect(links[2].props['href']).toBe('/tags')
  })
})

it('should link to author', () => {
  const tree = create(<TopBar />)
  const links = tree.root.findAllByType(Link)
  expect(links[0].props['href']).toBe('/authors')
})

it('should link to root (articles)', () => {
  const tree = create(<TopBar />)
  const links = tree.root.findAllByType(Link)
  expect(links[1].props['href']).toBe('/')
})

it('should link to tags', () => {
  const tree = create(<TopBar />)
  const links = tree.root.findAllByType(Link)
  expect(links[2].props['href']).toBe('/tags')
})
