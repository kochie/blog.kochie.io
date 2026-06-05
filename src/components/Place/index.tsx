import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'

interface PlaceProps {
  children: string
  link: string
  instagram?: string
  map?: string
}

export default function Place({ children, link, instagram, map }: PlaceProps) {
  return (
    <span className="inline-flex items-center gap-0.5">
      <Link
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base text-accent underline underline-offset-2"
      >
        {children}
      </Link>
      {instagram && (
        <Link
          href={`https://instagram.com/${instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${children} on Instagram`}
          className="leading-none translate-y-0.5 text-[1.25em] text-text-mute hover:text-accent transition-colors"
        >
          <FontAwesomeIcon icon={faInstagram} />
        </Link>
      )}
      {map && (
        <Link
          href={map}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${children} on Maps`}
          className="leading-none translate-y-0.5 text-[1.25em] text-text-mute hover:text-accent transition-colors"
        >
          <FontAwesomeIcon icon={faLocationDot} />
        </Link>
      )}
    </span>
  )
}
