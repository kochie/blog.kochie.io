import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { Octokit } from '@octokit/core'
import { Endpoints } from '@octokit/types'
import Image from 'next/image'
import colors from './colors.json'
import { faDotCircle, faStar } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
// import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import {
  faCodeBranch,
  faCommentsAlt,
  faUserFriends,
} from '@fortawesome/pro-regular-svg-icons'

interface GithubProjectProps {
  owner: string
  repo: string
}

const octokit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN })
console.log(process.env.NEXT_PUBLIC_GITHUB_TOKEN)

interface Data {
  full_name: string
}

interface LinguistBarProps {
  owner: string
  repo: string
}

interface Languages {
  [key: string]: number
}

const LinguistBar = ({ owner, repo }: LinguistBarProps) => {
  const [languages, setLanguages] = useState<
    Endpoints['GET /repos/{owner}/{repo}/languages']['response']['data']
  >({})

  const fetch_languages = useCallback(async () => {
    try {
      const data = await octokit.request(
        'GET /repos/{owner}/{repo}/languages',
        {
          owner,
          repo,
        }
      )
      // const data = await (await fetch(languages_url)).json()

      setLanguages(data.data)
    } catch (err) {
      console.error(err)
    }
  }, [owner, repo])

  useEffect(() => {
    fetch_languages()
  }, [fetch_languages])

  const total = Object.values(languages).reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  )

  return (
    <div className="absolute bottom-0 w-full">
      <span className="h-4 flex">
        {Object.entries(languages).map(([language, size]) => {
          return (
            <span
              title={`${language} - ${((size / total) * 100).toFixed(2)}%`}
              key={language}
              style={{
                width: `${(size / total) * 100}%`,
                backgroundColor: colors[language],
              }}
              // className=""
            />
          )
        })}
      </span>
    </div>
  )
}

interface StatsProps {
  stargazers: number
  issues: number
  contributors: number
  discussions: number
  forks: number
}

const Stats = ({
  contributors,
  issues,
  discussions,
  stargazers,
  forks,
}: StatsProps) => {
  return (
    <div className="flex justify-between">
      <div className="flex">
        <div className="flex">
          <FontAwesomeIcon icon={faUserFriends} className="" />
          <div>
            <div className="">{contributors}</div>
            <div>Contributors</div>
          </div>
        </div>
        <div className="flex">
          <FontAwesomeIcon icon={faDotCircle} />
          <div>
            <div>{issues}</div>
            <div>Issues</div>
          </div>
        </div>
        {discussions > 0 ? (
          <div className="flex">
            <FontAwesomeIcon icon={faCommentsAlt} />
            <div>
              <div>{discussions}</div>
              <div>Discussions</div>
            </div>
          </div>
        ) : null}
        <div className="flex">
          <FontAwesomeIcon icon={faStar} />
          <div>
            <div>{stargazers}</div>
            <div>Stars</div>
          </div>
        </div>
        <div className="flex">
          <FontAwesomeIcon icon={faCodeBranch} />
          <div>
            <div>{forks}</div>
            <div>Forks</div>
          </div>
        </div>
      </div>
      <div>
        <FontAwesomeIcon icon={faGithub} size="2x" />
      </div>
    </div>
  )
}

const GithubProject = ({ owner, repo }: GithubProjectProps): ReactNode => {
  const [data, setData] =
    useState<Endpoints['GET /repos/{owner}/{repo}']['response']['data']>()
  const [contributors, setContributors] = useState(0)

  const getProject = useCallback(async () => {
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo,
      })
      console.log(response.data)

      if (response?.data?.contributors_url) {
        const contributors = await (
          await fetch(response?.data.contributors_url)
        ).json()
        console.log(contributors)
        setContributors(contributors.length)
      }

      setData(response.data)
    } catch (err) {
      console.log(err)
    }

    // console.log(response.data)
    // return response.data
  }, [owner, repo])

  useEffect(() => {
    getProject()
  }, [getProject])

  return (
    <div className="w-full h-48 rounded bg-gray-500 relative overflow-hidden">
      <div className="m-4">
        <div className="flex justify-between">
          <div className="">
            <div className="flex">
              <div>{data?.owner?.login}</div>
              <div>/</div>
              <div className="font-extrabold">{data?.name}</div>
            </div>
            <div>{data?.description}</div>
          </div>
          <div className="h-16 w-16 rounded-3xl overflow-hidden">
            {data?.owner?.avatar_url ? (
              <Image
                src={data.owner.avatar_url}
                alt="avatar"
                layout="responsive"
                width={100}
                height={100}
              />
            ) : null}
          </div>
        </div>
        <Stats
          stargazers={data?.stargazers_count || 0}
          issues={data?.open_issues_count || 0}
          contributors={contributors}
          forks={data?.forks || 0}
          // discussions={data?.}
        />
      </div>
      <LinguistBar owner={owner} repo={repo} />
    </div>
  )
}

export default GithubProject
