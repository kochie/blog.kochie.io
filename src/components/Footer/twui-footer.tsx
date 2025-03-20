import {
  faBluesky,
  faGithub,
  faMastodon,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons'
import { faCopyright } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import Link from 'next/link'
import Logo from './blog-logo.svg'
import { trackEvent } from 'fathom-client'

const navigation = {
  affiliates: [{ name: 'Blogroll', href: 'https://blogroll.org/' }],
  friends: [
    { name: 'Hugo', href: 'https://hugo.md' },
    { name: 'Terence', href: 'https://terencehuynh.com/' },
    { name: 'Nicholas', href: 'https://nicholas.cloud/' },
    { name: 'Eric', href: 'https://ericjiang.dev/' },
    { name: 'Daniel', href: 'https://daniel.st/' },
    { name: 'Matt', href: 'https://mattseymour.substack.com/' },
  ],
  links: [
    { name: 'Me', href: 'https://me.kochie.io' },
    { name: 'Linkedin', href: 'https://linkedin.com/in/rkkochie' },
    {
      name: 'RSS',
      href: `https://${
        process.env.NEXT_PUBLIC_PROD_URL || process.env.NEXT_PUBLIC_VERCEL_URL
      }/feed/rss.xml`,
    },
  ],
  social: [
    {
      name: 'Bluesky',
      href: 'https://bsky.app/profile/kochie.bsky.social',
      icon: () => <FontAwesomeIcon icon={faBluesky} size="xl" className="" />,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/kochie',
      icon: () => <FontAwesomeIcon icon={faTwitter} size="xl" className="" />,
    },
    {
      name: 'Github',
      href: 'https://github.com/kochie',
      icon: () => <FontAwesomeIcon icon={faGithub} size="xl" className="" />,
    },
    {
      name: 'Mastodon',
      href: 'https://melb.social/@kochie',
      icon: () => <FontAwesomeIcon icon={faMastodon} size="xl" className="" />,
    },
  ],
}

interface FooterProps {
  title: string
  description: string
}

export function Footer({ title, description }: FooterProps) {
  return (
    <footer className="bg-[#222222]" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto lg:max-w-5xl pb-8">
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24" />
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Image className="" src={Logo} alt="Company name" />
            <p className="text-sm leading-6 text-gray-300">{description}</p>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-gray-400"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div className="mt-10 md:mt-0 md:col-start-2">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Affiliates
                </h3>
                <ul role="list" className="mt-6 space-y-3">
                  {navigation.affiliates.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                        onClick={() => trackEvent(item.name)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Friends
                </h3>
                <ul role="list" className="mt-6 space-y-3">
                  {navigation.friends.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                        onClick={() => trackEvent(item.name)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Links
                </h3>
                <ul role="list" className="mt-6 space-y-3">
                  {navigation.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                        onClick={() => trackEvent(item.name)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            <span>{title}</span>{' '}
            <FontAwesomeIcon icon={faCopyright} className={''} />{' '}
            <span>2020</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
