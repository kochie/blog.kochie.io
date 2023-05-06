import React from 'react'
import { ReactTestRenderer, act, create } from 'react-test-renderer'
import { jest } from '@jest/globals'
import * as Sentry from '@sentry/nextjs'
import sentryTestkit from 'sentry-testkit'

const { sentryTransport } = sentryTestkit()

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
// initialize your Sentry instance with sentryTransport
Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://93d1763e43d24b2885baed0a99a74b02@o157203.ingest.sentry.io/5779239',
  transport: sentryTransport,
  //... other configurations
})

type Path = [string, { [key: string]: string }] | string // console.log(Sentry)
type PathFn = (path: Path) => { data: object }

describe('GitHub Project Component', () => {
  test('renders correctly', async () => {
    let tree: ReactTestRenderer

    jest.unstable_mockModule('@octokit/core', () => ({
      Octokit: jest.fn().mockImplementation(() => ({
        request: jest.fn<PathFn>().mockImplementation((path: Path) => {
          let pathString: string
          if (Array.isArray(path)) {
            pathString = path[0]
          } else {
            pathString = path
          }

          switch (pathString) {
            case 'GET /repos/{owner}/{repo}':
              return {
                data: {
                  html_url: 'github.com/kochie/test',
                  name: 'test',
                  description: "test's description",
                  owner: {
                    login: 'kochie',
                    avatar_url:
                      'https://avatars.githubusercontent.com/u/10809884.jpg',
                    html_url: 'https://github.com/kochie',
                  },
                  stargazers_count: 100,
                  open_issues_count: 10,
                },
              }
            case 'GET /repos/{owner}/{repo}/contributors':
              return { data: new Array(10) }
            case 'GET /repos/{owner}/{repo}/languages':
              return {
                data: { TypeScript: 0.1, Go: 0.9 },
              }
            default:
              throw new Error('Unknown path' + path)
          }
        }),
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
