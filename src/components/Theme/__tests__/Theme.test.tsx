import { library } from '@fortawesome/fontawesome-svg-core'
import { fad } from '@fortawesome/pro-duotone-svg-icons'
import React from 'react'
import { create } from 'react-test-renderer'
import { ThemeProvider } from '../context'
import ThemeButton from '../ThemeButton'

beforeAll(() => {
  library.add(fad)
})

it('should render ThemeButton', () => {
  const tree = create(<ThemeButton />).toJSON()
  expect(tree).toMatchSnapshot()
})

it('should render ThemeProvider', () => {
  const tree = create(<ThemeProvider />).toJSON()
  expect(tree).toMatchSnapshot()
})
