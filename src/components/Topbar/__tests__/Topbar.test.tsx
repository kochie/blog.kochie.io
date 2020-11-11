import React from 'react'
import Link from 'next/link'
import { create } from 'react-test-renderer'

import TopBar from '..'

it('should render TopBar', () => {
  const tree = create(<TopBar />).toJSON()
  expect(tree).toMatchSnapshot()
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
