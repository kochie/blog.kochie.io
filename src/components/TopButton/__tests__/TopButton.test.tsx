import { ReactTestRenderer, act, create } from 'react-test-renderer'

import TopButton from '..'

describe('Social Media Button Component', () => {
  test('renders correctly', () => {
    let tree: ReactTestRenderer

    act(() => {
      tree = create(<TopButton />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
