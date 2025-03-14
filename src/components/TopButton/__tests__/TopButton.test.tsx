import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import TopButton from '..'

describe('Social Media Button Component', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<TopButton />)

    expect(asFragment()).toMatchSnapshot()
  })
})
