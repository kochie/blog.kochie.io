import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import ConvertKitForm from '..'

describe('CONVERT KIT FORM COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<ConvertKitForm formId="123" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
