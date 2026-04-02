import { describe, test, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import ConvertKitForm from '..'

describe('CONVERT KIT FORM COMPONENT', () => {
  test('renders correctly', () => {
    const { asFragment } = render(<ConvertKitForm formId="123" />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('renders subscribe form fields', () => {
    const { container } = render(<ConvertKitForm formId="abc-xyz-999" />)
    const root = container.firstElementChild as HTMLElement
    expect(
      within(root).getByRole('heading', { name: /like what you see/i })
    ).toBeInTheDocument()
    expect(within(root).getByLabelText(/your email address/i)).toBeInTheDocument()
    expect(within(root).getByRole('button', { name: /subscribe/i })).toBeEnabled()
  })
})
