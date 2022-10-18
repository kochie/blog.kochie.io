import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { jest } from '@jest/globals'

describe('GitHub Project Component', () => {
  test('renders correctly', async () => {
    let tree: ReactTestRenderer

    jest.unstable_mockModule('@octokit/core', () => ({
      Octokit: jest.fn().mockImplementation(() => ({
        request: jest
          .fn()
          .mockReturnValueOnce(
            Promise.resolve({ data: { TypeScript: 0.1, Go: 0.9 } })
          )
          .mockReturnValueOnce(
            Promise.resolve({
              data: {
                html_url: 'github.com/kochie/test',
                name: 'test',
                description: "test's description",
                owner: {
                  login: 'kochie',
                  avatar_url:
                    'https://avatars.githubusercontent.com/u/10809884',
                  html_url: 'github.com/kochie',
                },
                stargazers_count: 100,
                open_issues_count: 10,
              },
            })
          )
          .mockReturnValueOnce(Promise.resolve({ data: new Array(10) })),
      })),
    }))

    const GithubProject = await import('../index')

    await act(async () => {
      tree = create(<GithubProject.default owner="kochie" repo="test" />)
    })

    // @ts-expect-error tree will be assigned
    expect(tree.toJSON()).toMatchSnapshot()
  })
})
