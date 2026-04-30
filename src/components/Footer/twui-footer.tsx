import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  faBluesky,
  faGithub,
  faMastodon,
  faTwitter,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Logo from './blog-logo.svg'
import TrackedLink from './TrackedLink'

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
      icon: faBluesky,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/kochie',
      icon: faTwitter,
    },
    {
      name: 'Github',
      href: 'https://github.com/kochie',
      icon: faGithub,
    },
    {
      name: 'Mastodon',
      href: 'https://melb.social/@kochie',
      icon: faMastodon,
    },
  ],
}

interface FooterProps {
  title: string
  description: string
}

export function Footer({ title, description }: FooterProps) {
  const year = new Date().getFullYear()
  return (
    <footer
      aria-labelledby="footer-heading"
      className="mt-24 bg-bg-soft border-t border-rule"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-bleed px-4 py-12">
        {/* Brand attribution */}
        <Link
          href="https://kochie.io"
          className="font-mono text-meta tracking-wide text-text-soft hover:text-accent transition-colors duration-fast"
        >
          {'// '}Part of Kochie Engineering →
        </Link>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-8 md:gap-12">
          {/* Brand block */}
          <div>
            <Image src={Logo} alt={title} className="h-10 w-auto" />
            <p className="mt-4 font-serif italic text-body-sm text-text-mute leading-snug max-w-prose">
              {description}
            </p>
            <div className="mt-6 flex gap-4">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-text-mute hover:text-accent transition-colors duration-fast"
                >
                  <span className="sr-only">{item.name}</span>
                  <FontAwesomeIcon icon={item.icon} size="lg" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Affiliates */}
          <div>
            <h3 className="font-mono text-meta tracking-wide text-text-soft mb-3">
              {'// '}Affiliates
            </h3>
            <ul className="space-y-2 list-none">
              {navigation.affiliates.map((item) => (
                <li key={item.name}>
                  <TrackedLink href={item.href} name={item.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* Friends */}
          <div>
            <h3 className="font-mono text-meta tracking-wide text-text-soft mb-3">
              {'// '}Friends
            </h3>
            <ul className="space-y-2 list-none">
              {navigation.friends.map((item) => (
                <li key={item.name}>
                  <TrackedLink href={item.href} name={item.name} />
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-mono text-meta tracking-wide text-text-soft mb-3">
              {'// '}Links
            </h3>
            <ul className="space-y-2 list-none">
              {navigation.links.map((item) => (
                <li key={item.name}>
                  <TrackedLink href={item.href} name={item.name} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-rule font-mono text-meta tracking-wide text-text-soft">
          © {year} {title}
        </div>
      </div>
    </footer>
  )
}
