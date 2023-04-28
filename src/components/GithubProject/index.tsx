'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Octokit } from '@octokit/core'
import { Endpoints } from '@octokit/types'
import Image from 'next/image'
import colors from './colors.json' assert { type: 'json' }
import { faDotCircle, faStar } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import useSWR from 'swr'
import {
  faCodeBranch,
  faCommentsAlt,
  faUserFriends,
} from '@fortawesome/pro-regular-svg-icons'
import Link from 'next/link'

interface GithubProjectProps {
  owner: string
  repo: string
}

interface LinguistBarProps {
  owner: string
  repo: string
}

const octokit = new Octokit({})
// { auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN }

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

      setLanguages(data.data)
    } catch (err) {
      console.error(err)
    }
  }, [owner, repo])

  useEffect(() => {
    fetch_languages()
  }, [fetch_languages])

  const total =
    Object.values(languages).reduce(
      (accumulator, currentValue) => accumulator ?? 0 + (currentValue ?? 0),
      0
    ) ?? 1

  return (
    <div className="absolute bottom-0 w-full">
      <span className="h-4 flex">
        {Object.entries(languages).map(([language, size]) => {
          return (
            <span
              title={`${language} - ${((size ?? 0 / total) * 100).toFixed(2)}%`}
              key={language}
              style={{
                width: `${(size ?? 0 / total) * 100}%`,
                // @ts-expect-error cbf
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
  const stats = [
    {
      name: 'Contributors',
      count: contributors,
      icon: faUserFriends,
    },
    {
      name: 'Issues',
      count: issues,
      icon: faDotCircle,
    },
    {
      name: 'Discussions',
      count: discussions,
      icon: faCommentsAlt,
    },
    {
      name: 'Stars',
      count: stargazers,
      icon: faStar,
    },
    {
      name: 'Forks',
      count: forks,
      icon: faCodeBranch,
    },
  ]

  return (
    <div className="flex justify-between my-4">
      <div className="flex gap-8">
        {stats.map((stat) => {
          if (stat.count > 0)
            return (
              <div className="flex group" key={stat.name}>
                <div className="">
                  <div className="group-hover:scale-125 transform-gpu fa-stack ease-in-out duration-100">
                    <FontAwesomeIcon
                      icon={stat.icon}
                      className="fa-stack-1x group-hover:animate-wiggle"
                    />
                  </div>
                </div>
                <div>
                  <div className="">{stat.count}</div>
                  <div className="text-sm">{stat.name}</div>
                </div>
              </div>
            )
          return null
        })}
      </div>
      <div className="my-auto">
        <a href="https://github.com" aria-label="github">
          <FontAwesomeIcon
            icon={faGithub}
            size="2x"
            className="hover:scale-110 transform-gpu ease-in-out duration-100"
          />
        </a>
      </div>
    </div>
  )
}

const GithubProject = ({ owner, repo }: GithubProjectProps) => {
  // console.log(owner, repo)
  const getRepo = useSWR(
    [
      'GET /repos/{owner}/{repo}',
      {
        owner,
        repo,
      },
    ],
    ([route, options]) => {
      // console.log(route, options)
      return octokit.request(route, options)
    }
  )
  const getContributors = useSWR(
    [
      'GET /repos/{owner}/{repo}/contributors',
      {
        owner,
        repo,
      },
    ],
    ([route, options]) => octokit.request(route, options)
  )

  if (getRepo.error || getContributors.error) {
    throw new Error(getRepo.error || getContributors.error)
  }

  // console.log(getRepo?.data)
  const repoData = getRepo?.data?.data
  const contributorsData = getContributors?.data?.data

  return (
    <div className="w-full rounded bg-white dark:bg-gray-500 relative overflow-hidden">
      <div className="m-8">
        <div className="flex justify-between">
          <div className="">
            <div className="flex text-4xl mb-4">
              <a href={repoData?.html_url} className="flex hover:underline">
                <div>{repoData?.owner?.login}</div>
                <div>/</div>
                <div className="font-extrabold">{repoData?.name}</div>
              </a>
            </div>
            <div className="mb-4">{repoData?.description}</div>
          </div>
          <div className="h-16 w-16 rounded-3xl overflow-hidden">
            {repoData?.owner?.avatar_url ? (
              <Link href={repoData?.owner?.html_url}>
                <Image
                  src={repoData?.owner?.avatar_url}
                  alt="avatar"
                  width={100}
                  height={100}
                  className="hover:scale-110 transform-gpu ease-in-out duration-100"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </Link>
            ) : null}
          </div>
        </div>
        <Stats
          stargazers={repoData?.stargazers_count || 0}
          issues={repoData?.open_issues_count || 0}
          contributors={contributorsData?.length}
          forks={repoData?.forks || 0}
          discussions={0}
        />
      </div>
      <LinguistBar owner={owner} repo={repo} />
    </div>
  )
}

export default GithubProject
