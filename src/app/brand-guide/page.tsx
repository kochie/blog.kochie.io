import React from 'react'
import { Metadata } from 'next'
import {
  faLightbulbSlash,
  faLightbulbOn,
  faCogs,
} from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const BRAND_DESCRIPTION =
  'Warm Melbourne, not SF gloss. The brief behind the redesign — palette, typography, motifs, motion.'

export const metadata: Metadata = {
  title: 'Field Manual',
  description: BRAND_DESCRIPTION,
  alternates: {
    canonical: '/brand-guide',
  },
  openGraph: {
    type: 'website',
    url: '/brand-guide',
    title: 'Field Manual | Kochie Engineering',
    description: BRAND_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Field Manual | Kochie Engineering',
    description: BRAND_DESCRIPTION,
  },
}

// Each color carries both modes. The swatch renders the *current* CSS variable
// (so it tracks the live theme) plus a side-by-side reference of the two hexes
// so a reader can see what the other mode looks like without flipping.
type ColorSwatch = {
  token: string
  cssVar: string
  light: string
  dark: string
  role: string
  textOn?: 'dark' | 'light'
}

const SURFACE_SWATCHES: ColorSwatch[] = [
  {
    token: 'bg',
    cssVar: '--color-bg',
    light: '#F4EDD9',
    dark: '#1A1815',
    role: 'Page background. Cream paper in light, warm soot in dark.',
  },
  {
    token: 'bg-deep',
    cssVar: '--color-bg-deep',
    light: '#ECE2C6',
    dark: '#14110E',
    role: 'Code blocks, raised cards. The slightly recessed surface.',
  },
  {
    token: 'bg-soft',
    cssVar: '--color-bg-soft',
    light: '#FAF6E8',
    dark: '#232019',
    role: 'Subtle elevations, callouts, sidenotes.',
  },
]

const TEXT_SWATCHES: ColorSwatch[] = [
  {
    token: 'text',
    cssVar: '--color-text',
    light: '#1A1815',
    dark: '#F4EFE6',
    role: 'Primary body text. Reads as warm near-black or warm near-white.',
  },
  {
    token: 'text-mute',
    cssVar: '--color-text-mute',
    light: '#4D4538',
    dark: '#C9C0B0',
    role: 'Decks, secondary text, blurbs.',
  },
  {
    token: 'text-soft',
    cssVar: '--color-text-soft',
    light: '#847A6B',
    dark: '#8C8576',
    role: 'Captions, mono meta, tertiary type.',
  },
]

const ACCENT_SWATCHES: ColorSwatch[] = [
  {
    token: 'accent',
    cssVar: '--color-accent',
    light: '#C46A4A',
    dark: '#DA8665',
    role: 'Clay. Links, kicker numbers, anchor §, hover, diagram strokes, active TOC.',
  },
  {
    token: 'signal',
    cssVar: '--color-signal',
    light: '#DBC23A',
    dark: '#F2DC4A',
    role: 'Buttery yellow. Spotlights only — pinned essays, code strings, "the one thing that matters".',
  },
]

const NEUTRAL_SWATCHES: ColorSwatch[] = [
  {
    token: 'rule',
    cssVar: '--color-rule',
    light: 'rgba(26,24,21,0.12)',
    dark: 'rgba(244,239,230,0.08)',
    role: 'Hairlines, dividers, frame borders. Always semi-transparent so the surface beneath shows through.',
  },
  {
    token: 'steel-warm-700',
    cssVar: '--color-steel-warm-700',
    light: '#58504A',
    dark: '#58504A',
    role: 'Mid-grey neutral. Mode-agnostic.',
  },
  {
    token: 'steel-warm-500',
    cssVar: '--color-steel-warm-500',
    light: '#8C8576',
    dark: '#8C8576',
    role: 'Mid-tone neutral. Mode-agnostic.',
  },
  {
    token: 'steel-warm-300',
    cssVar: '--color-steel-warm-300',
    light: '#C9C0B0',
    dark: '#C9C0B0',
    role: 'Light borders, inactive states. Mode-agnostic.',
  },
]

// Master tokens that exist in the broader Kochie Engineering family but
// must NOT appear on the blog. Showing them here documents the carve-out.
type ReservedSwatch = { token: string; hex: string; role: string }
const RESERVED_SWATCHES: ReservedSwatch[] = [
  { token: 'coral', hex: '#F26D5B', role: 'Reserved for me.kochie.io.' },
  { token: 'key', hex: '#0E7C7B', role: 'Reserved for touch-typer.kochie.io.' },
  {
    token: 'wire',
    hex: '#1F4FFF',
    role: 'Cool blue master accent. Replaced on the blog by clay.',
  },
  {
    token: 'terminal',
    hex: '#00D17A',
    role: 'Terminal green. Explicitly retired from the blog.',
  },
]

const TYPE_SCALE: {
  token: string
  size: string
  line: string
  weight: string
  use: string
  className: string
  sample: string
}[] = [
  {
    token: 'display-hero',
    size: '3.75 rem (60px)',
    line: '1.02',
    weight: '600',
    use: 'Homepage hero headline.',
    className: 'font-serif font-semibold text-display-hero',
    sample: 'A field journal.',
  },
  {
    token: 'display-h1',
    size: '2.75 rem (44px)',
    line: '1.05',
    weight: '600',
    use: 'Article H1.',
    className: 'font-serif font-semibold text-display-h1',
    sample: 'Halo physics, slowly.',
  },
  {
    token: 'h2',
    size: '1.75 rem (28px)',
    line: '1.15',
    weight: '600',
    use: 'Article H2, homepage section titles.',
    className: 'font-serif font-semibold text-h2',
    sample: 'Building the stack.',
  },
  {
    token: 'h3',
    size: '1.25 rem (20px)',
    line: '1.30',
    weight: '600',
    use: 'Article H3, card titles.',
    className: 'font-serif font-semibold text-h3',
    sample: 'Defining the schema.',
  },
  {
    token: 'deck',
    size: '1.1875 rem (19px)',
    line: '1.45',
    weight: '400 italic',
    use: 'Italic deck under headlines.',
    className: 'font-serif italic text-deck text-text-mute',
    sample:
      'A one-sentence orientation for readers who need more context before committing.',
  },
  {
    token: 'body',
    size: '1.0625 rem (17px)',
    line: '1.70',
    weight: '400',
    use: 'Article body.',
    className: 'font-serif text-body',
    sample:
      "Articles open with a kicker, an H1, and a deck — then they earn the reader's next click.",
  },
  {
    token: 'body-sm',
    size: '0.9375 rem (15px)',
    line: '1.55',
    weight: '400',
    use: 'Cards, secondary blocks.',
    className: 'font-serif text-body-sm',
    sample:
      'Card blurbs and ancillary copy live here. Slightly tighter, slightly smaller.',
  },
  {
    token: 'meta',
    size: '0.75 rem (12px)',
    line: '1.50',
    weight: '500',
    use: 'Mono kickers, dates, figure captions.',
    className: 'font-mono text-meta tracking-wide uppercase',
    sample: '// 12 · SOFTWARE · MELBOURNE',
  },
  {
    token: 'ui',
    size: '0.875 rem (14px)',
    line: '1.50',
    weight: '500',
    use: 'Sans-serif nav and UI.',
    className: 'font-sans text-ui',
    sample: 'Archive · Tags · RSS',
  },
]

const SwatchCard = ({ swatch }: { swatch: ColorSwatch }) => {
  return (
    <li className="border border-rule rounded-md overflow-hidden flex flex-col">
      <div
        className="h-24 w-full"
        style={{ backgroundColor: `var(${swatch.cssVar})` }}
        aria-hidden
      />
      <div className="border-t border-rule px-4 py-3 flex flex-col gap-2 grow">
        <div className="font-mono text-meta tracking-wide flex items-baseline gap-2">
          <span className="text-accent">{`// ${swatch.token}`}</span>
        </div>
        <p className="font-serif italic text-body-sm text-text-mute leading-snug">
          {swatch.role}
        </p>
        <dl className="mt-auto grid grid-cols-2 gap-x-3 font-mono text-meta text-text-soft tracking-wide">
          <div className="flex flex-col">
            <dt>LIGHT</dt>
            <dd className="text-text">{swatch.light}</dd>
          </div>
          <div className="flex flex-col">
            <dt>DARK</dt>
            <dd className="text-text">{swatch.dark}</dd>
          </div>
        </dl>
      </div>
    </li>
  )
}

const ReservedCard = ({ swatch }: { swatch: ReservedSwatch }) => (
  <li className="border border-rule rounded-md overflow-hidden flex flex-col opacity-70">
    <div
      className="h-16 w-full relative"
      style={{ backgroundColor: swatch.hex }}
      aria-hidden
    >
      {/* The diagonal stripes signal "do not use" without an emoji. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 8px, rgba(0,0,0,0.18) 8px 9px)',
        }}
      />
    </div>
    <div className="border-t border-rule px-4 py-3 flex flex-col gap-1">
      <div className="font-mono text-meta tracking-wide text-text-soft">
        <span className="text-accent">{`// ${swatch.token}`}</span>
        <span className="ml-2">{swatch.hex}</span>
      </div>
      <p className="font-serif italic text-body-sm text-text-mute leading-snug">
        {swatch.role}
      </p>
    </div>
  </li>
)

const SectionHeading = ({
  id,
  number,
  children,
}: {
  id: string
  number: string
  children: React.ReactNode
}) => (
  <header className="mx-auto max-w-prose pt-12 pb-2">
    <div className="font-mono text-meta tracking-wide text-text-soft mb-2">
      <span className="text-accent">{`// ${number}`}</span>
    </div>
    <h2
      id={id}
      className="font-serif font-semibold text-h2 text-text leading-tight"
      style={{ scrollMarginTop: '50px' }}
    >
      {children}
    </h2>
  </header>
)

const Hairline = () => (
  <div className="mx-auto max-w-prose">
    <hr className="border-t border-rule my-12" />
  </div>
)

export default function BrandGuide() {
  return (
    <main className="bg-bg text-text">
      {/* Article-style opening — same kicker → H1 → deck → meta sequence
          we use on real essays, applied to the manual itself so it reads as
          part of the system rather than an admin doc. */}
      <header className="mx-auto max-w-prose px-4 pt-16 pb-6">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-4">
          <span className="text-accent">{'// FIELD MANUAL'}</span>
        </div>
        <h1 className="font-serif font-semibold text-display-h1 text-text leading-tight mb-4">
          A field journal.
        </h1>
        <p className="font-serif italic text-deck text-text-mute leading-snug mb-6">
          The working brief for the redesign — palette, type, motifs, motion.
          Codename: Field Journal.
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-meta text-text-soft tracking-wide pb-8 border-b border-rule">
          <span className="font-serif italic text-text">By Robert Koch</span>
          <span aria-hidden>·</span>
          <span>WARM MELBOURNE, NOT SF GLOSS</span>
          <span aria-hidden>·</span>
          <span>EVERGREEN</span>
        </div>
      </header>

      {/* Manifesto — preamble before the numbered sections. Sets the
          emotional tone (warm, Melbourne, brick-and-bluestone) before the
          reader sees the cold token tables. */}
      <header className="mx-auto max-w-prose px-4 pt-12 pb-2">
        <div className="font-mono text-meta tracking-wide text-text-soft mb-2">
          <span className="text-accent">{'// MANIFESTO'}</span>
        </div>
        <h2
          id="manifesto"
          className="font-serif font-semibold text-h2 text-text leading-tight"
          style={{ scrollMarginTop: '50px' }}
        >
          Warm Melbourne.
        </h2>
      </header>
      <section className="mx-auto max-w-prose px-4">
        <p className="font-serif text-body my-4">
          This redesign comes from Melbourne. Not literally — the bytes live
          wherever Vercel decides — but in feel. The city the writing comes from
          sets the tone of every choice in the palette.
        </p>
        <p className="font-serif text-body my-4">
          Melbourne is not a glossy city. It&apos;s a city of wet bluestone
          laneways, brick warehouses in Collingwood, faded Fitzroy terraces
          under terracotta roofs. The dominant colour is brown, not blue. The
          dominant feeling is <em>warm despite the weather</em> — sodium
          streetlights, wool jumpers, paperback library covers, coffee that
          takes itself seriously.
        </p>

        <div className="my-8 border-l-2 border-signal pl-6 py-2">
          <blockquote className="font-serif italic text-2xl leading-snug text-text">
            Warm Melbourne, not SF gloss.
          </blockquote>
        </div>

        <p className="font-serif text-body my-4">
          The page background is{' '}
          <strong className="font-serif text-text">warm soot</strong>, not
          black. The light-mode background is{' '}
          <strong className="font-serif text-text">cream paper</strong>, not
          white. Both modes carry the same warmth; only the polarity flips —
          same room, different time of day.
        </p>
        <p className="font-serif text-body my-4">
          The accent is <span className="text-accent font-semibold">clay</span>{' '}
          — iron-oxide rust on a wrought-iron fence; the brick of a Fitzroy
          wall; the rooftops you see from Punt Road on a clear afternoon. A
          colour that has been around long enough to oxidise. It carries every
          link, every active state, every § anchor.
        </p>
        <p className="font-serif text-body my-4">
          The spotlight is{' '}
          <span
            className="font-semibold"
            style={{ color: 'var(--color-signal)' }}
          >
            signal yellow
          </span>{' '}
          — the slightly buttery yellow of the green-and-yellow trams that ran
          the city for half a century. It appears only for things that genuinely
          matter: a pinned essay, a code string, a single sentence asking to be
          read first.
        </p>
        <p className="font-serif text-body my-4">
          Every neutral is{' '}
          <strong className="font-serif text-text">steel-warm</strong> —
          brown-grey, never blue-grey. Bourke Street pavement is brown after
          rain. San Francisco grey is blue. We don&apos;t do San Francisco grey
          here.
        </p>
        <p className="font-serif text-body my-4">
          Everything that follows — the principles, the type scale, the motion
          tokens — is in service of that one idea. The site should read as if it
          came from a city that knows what a wool jumper is for.
        </p>
      </section>

      <Hairline />

      {/* §01 — Principles */}
      <SectionHeading id="principles" number="01">
        Principles.
      </SectionHeading>
      <section className="mx-auto max-w-prose px-4">
        <p className="font-serif text-body my-4">
          Five principles govern every decision in this system. When tokens
          conflict, the principle wins.
        </p>
        <ol className="list-none p-0 mt-6 space-y-4 font-serif text-body">
          {[
            [
              'Type does the work.',
              'A strong typographic system carries the brand. The serif body is the identity.',
            ],
            [
              'The figure frame holds everything.',
              'Code, video, tweet, math, canvas — same numbered, mono-captioned frame. Sibling content reads as siblings.',
            ],
            [
              'Warm Melbourne, not SF gloss.',
              'Every neutral is brown-grey, every accent biased warm. No cool slates, no terminal greens.',
            ],
            [
              'Hook first, hero second.',
              'The article opening rewards a strong first sentence over a giant image. Hero figures are optional.',
            ],
            [
              'Dark-first, light first-class.',
              'Both modes are designed simultaneously. Same warmth across both.',
            ],
          ].map(([title, body], i) => (
            <li key={i} className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="font-mono text-meta tracking-wide text-accent pt-1">
                {`0${i + 1}`}
              </span>
              <div>
                <span className="font-serif font-semibold text-text">
                  {title}
                </span>{' '}
                <span className="font-serif text-text-mute">{body}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Hairline />

      {/* §02 — Palette */}
      <SectionHeading id="palette" number="02">
        Palette.
      </SectionHeading>
      <section className="mx-auto max-w-bleed px-4">
        <p className="mx-auto max-w-prose font-serif text-body my-4">
          Two surfaces — cream paper and warm soot — paired with one warm accent
          (clay) and one buttery spotlight (signal). Every neutral reads warm.
          Hexes for both modes are listed on each card; the painted area shows
          the live theme.
        </p>

        <div className="mt-8">
          <h3 className="mx-auto max-w-prose font-mono text-meta tracking-wide text-text-soft mb-3">
            <span className="text-accent">{'// SURFACES'}</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0">
            {SURFACE_SWATCHES.map((s) => (
              <SwatchCard key={s.token} swatch={s} />
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h3 className="mx-auto max-w-prose font-mono text-meta tracking-wide text-text-soft mb-3">
            <span className="text-accent">{'// TEXT'}</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0">
            {TEXT_SWATCHES.map((s) => (
              <SwatchCard key={s.token} swatch={s} />
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h3 className="mx-auto max-w-prose font-mono text-meta tracking-wide text-text-soft mb-3">
            <span className="text-accent">{'// ACCENTS'}</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
            {ACCENT_SWATCHES.map((s) => (
              <SwatchCard key={s.token} swatch={s} />
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h3 className="mx-auto max-w-prose font-mono text-meta tracking-wide text-text-soft mb-3">
            <span className="text-accent">{'// NEUTRALS & RULES'}</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 list-none p-0">
            {NEUTRAL_SWATCHES.map((s) => (
              <SwatchCard key={s.token} swatch={s} />
            ))}
          </ul>
        </div>

        <div className="mt-12">
          <h3 className="mx-auto max-w-prose font-mono text-meta tracking-wide text-text-soft mb-3">
            <span className="text-accent">{'// RESERVED'}</span>
            <span className="ml-2">— do not use on the blog</span>
          </h3>
          <p className="mx-auto max-w-prose font-serif text-body-sm text-text-mute leading-snug mb-4 italic">
            These colors live in the wider Kochie Engineering family but never
            appear in blog chrome. They&apos;re documented here so a future edit
            doesn&apos;t accidentally reach for them.
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 list-none p-0">
            {RESERVED_SWATCHES.map((s) => (
              <ReservedCard key={s.token} swatch={s} />
            ))}
          </ul>
        </div>
      </section>

      <Hairline />

      {/* §03 — Typography */}
      <SectionHeading id="typography" number="03">
        Typography.
      </SectionHeading>
      <section className="mx-auto max-w-bleed px-4">
        <p className="mx-auto max-w-prose font-serif text-body my-4">
          Three families. Source Serif 4 carries display and body — it&apos;s
          the brand. Geist Mono handles every kicker, caption, and code line.
          Geist Sans only ever appears in chrome (nav, UI controls).
        </p>

        <div className="mx-auto max-w-prose mt-8 grid grid-cols-3 gap-4 border border-rule rounded-md">
          {[
            ['SERIF', 'Source Serif 4', 'font-serif text-h2'],
            ['MONO', 'Geist Mono', 'font-mono text-h3'],
            ['SANS', 'Geist Sans', 'font-sans text-h3'],
          ].map(([role, name, klass]) => (
            <div
              key={role}
              className="px-5 py-6 border-r last:border-r-0 border-rule"
            >
              <div className="font-mono text-meta tracking-wide text-text-soft mb-2">
                <span className="text-accent">{`// ${role}`}</span>
              </div>
              <div className={`${klass} text-text`}>{name}</div>
              <div className="mt-2 font-serif italic text-body-sm text-text-mute leading-snug">
                {role === 'SERIF'
                  ? 'Display + body.'
                  : role === 'MONO'
                    ? 'Kickers, captions, code.'
                    : 'Nav and UI only.'}
              </div>
            </div>
          ))}
        </div>

        <h3 className="mx-auto max-w-prose font-mono text-meta tracking-wide text-text-soft mt-12 mb-3">
          <span className="text-accent">{'// TYPE SCALE'}</span>
        </h3>
        <ol className="mx-auto max-w-prose list-none p-0 divide-y divide-rule border-y border-rule">
          {TYPE_SCALE.map((t) => (
            <li
              key={t.token}
              className="grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-3 py-5"
            >
              <div className="flex flex-col gap-1 font-mono text-meta tracking-wide text-text-soft">
                <span className="text-accent">{`// ${t.token}`}</span>
                <span>{t.size}</span>
                <span>LH {t.line}</span>
                <span>{t.weight}</span>
              </div>
              <div className="min-w-0">
                <div className={`${t.className} text-text`}>{t.sample}</div>
                <div className="mt-2 font-serif italic text-body-sm text-text-mute leading-snug">
                  {t.use}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Hairline />

      {/* §04 — Motifs */}
      <SectionHeading id="motifs" number="04">
        Typographic motifs.
      </SectionHeading>
      <section className="mx-auto max-w-prose px-4">
        <p className="font-serif text-body my-4">
          Small recurring patterns that give the publication its rhythm. Always
          mono, always with the leading slash, almost always with one element
          coloured clay.
        </p>

        <ul className="space-y-6 mt-8">
          <li className="border border-rule rounded-md p-5">
            <div className="font-mono text-meta tracking-wide text-text-soft mb-2">
              <span className="text-accent">{'// 13'}</span>
              <span className="ml-2">SOFTWARE · MELBOURNE</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug">
              <span className="not-italic font-mono uppercase mr-2">
                Article kicker.
              </span>
              The article number is in clay; tags follow in mono uppercase
              separated by middle dots.
            </p>
          </li>

          <li className="border border-rule rounded-md p-5">
            <div className="font-mono text-meta tracking-wide text-text-soft mb-2">
              <span className="text-accent">FIG. 04</span>
              <span className="ml-2">An artificial gravity lab</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug">
              <span className="not-italic font-mono uppercase mr-2">
                Figure caption.
              </span>
              Numbered per article. Source attribution sits below the caption in
              smaller mono.
            </p>
          </li>

          <li className="border border-rule rounded-md p-5">
            <div className="font-mono text-meta tracking-wide text-text-soft mb-2">
              <span className="text-accent">EQ. 02</span>
              <span className="ml-2">a = v² / r</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug">
              <span className="not-italic font-mono uppercase mr-2">
                Equation label.
              </span>
              Separate counter from figures. KaTeX block in the wide tier.
            </p>
          </li>

          <li className="border border-rule rounded-md p-5">
            <div className="font-mono text-meta tracking-wide text-text-soft mb-2">
              <span className="text-accent">{'// ARCHIVE'}</span>
              <span className="ml-2">all essays, by year</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug">
              <span className="not-italic font-mono uppercase mr-2">
                Section label.
              </span>
              First word after the slash is in clay; tail copy in soft text.
            </p>
          </li>

          <li className="border border-rule rounded-md p-5">
            <div className="font-serif italic text-deck text-text-mute leading-snug">
              A one-sentence orientation for readers who need more context
              before committing.
            </div>
            <p className="mt-2 font-serif italic text-body-sm text-text-mute leading-snug">
              <span className="not-italic font-mono uppercase mr-2">
                Italic deck.
              </span>
              Serif italic, ≤25 words. Sits under every H1.
            </p>
          </li>

          <li className="border border-rule rounded-md p-5">
            <div className="font-serif font-semibold text-h3 text-text leading-tight relative pl-6">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-accent font-mono text-base">
                §
              </span>
              Linkable heading
            </div>
            <p className="mt-2 font-serif italic text-body-sm text-text-mute leading-snug">
              <span className="not-italic font-mono uppercase mr-2">
                Anchor mark.
              </span>
              Every H2 and H3 carries an id. Hovering reveals a clay § to the
              left — a copy-link target.
            </p>
          </li>
        </ul>
      </section>

      <Hairline />

      {/* §05 — Layout */}
      <SectionHeading id="layout" number="05">
        Width tiers.
      </SectionHeading>
      <section className="mx-auto max-w-bleed px-4">
        <p className="mx-auto max-w-prose font-serif text-body my-4">
          Articles use three width tiers. Embeds opt in via the{' '}
          <code className="font-mono text-text-mute">tier</code> prop on
          <code className="font-mono text-text-mute"> &lt;Figure&gt;</code>. The
          bars below are drawn at scale — the hairlines mark each tier&apos;s
          right edge.
        </p>
        <div className="mt-8 space-y-4">
          {[
            {
              label: 'prose',
              max: '40rem · 640px',
              use: 'Paragraphs, lists, blockquotes, default text.',
              widthClass: 'max-w-prose',
            },
            {
              label: 'wide',
              max: '55rem · 880px',
              use: 'Code blocks, equations, GitHub project cards.',
              widthClass: 'max-w-wide',
            },
            {
              label: 'bleed',
              max: '78rem · 1248px',
              use: 'Hero figures, full-width canvases, large diagrams.',
              widthClass: 'max-w-bleed',
            },
          ].map((tier) => (
            <div key={tier.label}>
              <div className="font-mono text-meta tracking-wide flex items-baseline gap-2 mb-2">
                <span className="text-accent">{`// ${tier.label}`}</span>
                <span className="text-text-soft">{tier.max}</span>
              </div>
              <div
                className={`${tier.widthClass} h-10 rounded border border-rule bg-bg-deep relative`}
              >
                <span className="absolute inset-0 flex items-center px-3 font-serif italic text-body-sm text-text-mute leading-snug">
                  {tier.use}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto max-w-prose font-serif italic text-body-sm text-text-mute leading-snug mt-10">
          Site chrome — topbar and footer — caps at <strong>86rem</strong>{' '}
          (1376px). The body grid centers content within this on wide screens
          and reserves a 14rem gutter on the left for the sticky TOC.
        </p>
      </section>

      <Hairline />

      {/* §06 — Motion */}
      <SectionHeading id="motion" number="06">
        Motion.
      </SectionHeading>
      <section className="mx-auto max-w-prose px-4">
        <p className="font-serif text-body my-4">
          Motion is sparing. Hover and focus get 150ms; theme switches and
          drawers get 250ms. Easing is out-expo so transitions decelerate
          gracefully. Anything triggered by scroll position is forbidden — no
          fade-ins on viewport entry.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 mt-6">
          <li className="border border-rule rounded-md p-5">
            <div className="font-mono text-meta tracking-wide text-text-soft mb-1">
              <span className="text-accent">{'// motion-fast'}</span>
            </div>
            <div className="font-serif font-semibold text-h3 text-text">
              150ms
            </div>
            <p className="mt-1 font-serif italic text-body-sm text-text-mute leading-snug">
              Hover, focus, link colour, border tints.
            </p>
          </li>
          <li className="border border-rule rounded-md p-5">
            <div className="font-mono text-meta tracking-wide text-text-soft mb-1">
              <span className="text-accent">{'// motion-slow'}</span>
            </div>
            <div className="font-serif font-semibold text-h3 text-text">
              250ms
            </div>
            <p className="mt-1 font-serif italic text-body-sm text-text-mute leading-snug">
              Theme switch cross-fade, drawer open/close.
            </p>
          </li>
        </ul>
        <div className="mt-6 border border-rule rounded-md p-5">
          <div className="font-mono text-meta tracking-wide text-text-soft mb-1">
            <span className="text-accent">{'// motion-ease'}</span>
          </div>
          <div className="font-mono text-body text-text-mute">
            cubic-bezier(0.16, 1, 0.3, 1)
          </div>
          <p className="mt-2 font-serif italic text-body-sm text-text-mute leading-snug">
            Out-expo. Fast at the start, slow into the rest.
          </p>
        </div>
        <p className="font-serif italic text-body-sm text-text-mute leading-snug mt-6">
          Users with{' '}
          <code className="font-mono text-text-mute">
            prefers-reduced-motion: reduce
          </code>{' '}
          see no transitions at all — both tokens drop to 0ms.
        </p>
      </section>

      <Hairline />

      {/* §07 — Iconography */}
      <SectionHeading id="icons" number="07">
        Iconography.
      </SectionHeading>
      <section className="mx-auto max-w-prose px-4">
        <p className="font-serif text-body my-4">
          The mark is a four-color stylized K — orange, dark red, and yellow on
          transparent. It sits in the topbar, the favicon, and inside the
          OpenGraph card; it never recolors to follow the theme. Inline icons
          come from Font Awesome Pro Duotone; they take their color from{' '}
          <span className="font-mono text-text-mute">currentColor</span>, so a
          hovered icon picks up the clay accent automatically.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
          <div className="border border-rule rounded-md p-5 flex flex-col items-center gap-3">
            <div className="w-20 h-20 flex items-center justify-center">
              {/* Render the SVG mark inline — keeps the geometry sharp at any
                  size and doesn't require a network round-trip. */}
              <svg
                viewBox="0 0 60 60"
                width="80"
                height="80"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Kochie Engineering logo"
              >
                <path
                  d="M24.938,17.891C26.891,15.939 30.057,15.94 32.009,17.892C34.963,20.847 39.154,25.04 42.108,27.994C43.046,28.932 43.572,30.204 43.572,31.53C43.572,32.856 43.045,34.128 42.107,35.065C35.534,41.637 22.095,55.072 22.095,55.072C20.219,56.947 17.676,58 15.025,58C10.781,58 4.8,58 4.8,58C3.255,58 2,56.745 2,55.2L2,44.966C2,42.313 3.054,39.769 4.93,37.894C4.93,37.894 18.366,24.462 24.938,17.891Z"
                  fill="#C34406"
                />
                <path
                  d="M55.2,58L27.238,58C26.834,58 26.469,57.756 26.314,57.383C26.16,57.009 26.245,56.579 26.531,56.293C32.235,50.59 50.59,32.241 56.293,26.54C56.579,26.254 57.009,26.168 57.383,26.323C57.756,26.478 58,26.843 58,27.247C58,34.434 58,55.2 58,55.2C58,56.745 56.746,58 55.2,58Z"
                  fill="#741516"
                />
                <path
                  d="M32.795,2C33.194,2 33.553,2.24 33.706,2.609C33.859,2.978 33.774,3.402 33.492,3.684C27.815,9.359 9.42,27.749 3.708,33.459C3.422,33.745 2.991,33.831 2.618,33.676C2.244,33.521 2,33.156 2,32.752C2,25.563 2,4.8 2,4.8C2,3.255 3.254,2 4.8,2L32.795,2Z"
                  fill="#FDBB0D"
                />
                <path
                  d="M36.96,12.943C36.022,12.006 35.495,10.734 35.496,9.408C35.496,8.082 36.023,6.81 36.961,5.872C37.513,5.32 37.905,4.928 37.905,4.928C39.781,3.053 42.324,2 44.975,2C49.219,2 55.2,2 55.2,2C56.746,2 58,3.255 58,4.8L58,15.034C58,17.687 56.946,20.231 55.07,22.106C55.07,22.106 54.68,22.496 54.13,23.046C52.177,24.999 49.011,24.998 47.059,23.045C44.105,20.091 39.914,15.898 36.96,12.943Z"
                  fill="#C34406"
                />
              </svg>
            </div>
            <div className="font-mono text-meta tracking-wide text-text-soft text-center">
              <span className="text-accent">{'// IDENTITY MARK'}</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug text-center">
              Stylised K. Three master fills: orange{' '}
              <span className="font-mono text-text">#C34406</span>, red{' '}
              <span className="font-mono text-text">#741516</span>, yellow{' '}
              <span className="font-mono text-text">#FDBB0D</span>.
            </p>
          </div>

          <div className="border border-rule rounded-md p-5 flex flex-col items-center gap-3">
            <div className="w-20 h-20 flex items-center justify-center text-text-mute">
              <FontAwesomeIcon icon={faLightbulbSlash} className="text-3xl" />
            </div>
            <div className="font-mono text-meta tracking-wide text-text-soft text-center">
              <span className="text-accent">{'// THEME · DARK'}</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug text-center">
              Lightbulb-slash icon. Click cycles to light.
            </p>
          </div>

          <div className="border border-rule rounded-md p-5 flex flex-col items-center gap-3">
            <div className="w-20 h-20 flex items-center justify-center text-text-mute">
              <FontAwesomeIcon icon={faLightbulbOn} className="text-3xl" />
            </div>
            <div className="font-mono text-meta tracking-wide text-text-soft text-center">
              <span className="text-accent">{'// THEME · LIGHT'}</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug text-center">
              Lightbulb-on. Click cycles to system.
            </p>
          </div>

          <div className="border border-rule rounded-md p-5 flex flex-col items-center gap-3">
            <div className="w-20 h-20 flex items-center justify-center text-text-mute">
              <FontAwesomeIcon icon={faCogs} className="text-3xl" />
            </div>
            <div className="font-mono text-meta tracking-wide text-text-soft text-center">
              <span className="text-accent">{'// THEME · SYSTEM'}</span>
            </div>
            <p className="font-serif italic text-body-sm text-text-mute leading-snug text-center">
              Cogs. Follows the OS preference.
            </p>
          </div>
        </div>
      </section>

      <Hairline />

      {/* §08 — Retired */}
      <SectionHeading id="retired" number="08">
        What we retired.
      </SectionHeading>
      <section className="mx-auto max-w-prose px-4 pb-24">
        <p className="font-serif text-body my-4">
          Documenting what the system explicitly does <em>not</em> use is almost
          as load-bearing as documenting what it does. Future edits
          shouldn&apos;t accidentally reintroduce these.
        </p>
        <ul className="list-none p-0 mt-6 space-y-4 font-serif text-body">
          {[
            [
              'The PCB-image jumbotron homepage.',
              'Replaced by a Spectrum-style hero feature plus a numbered archive.',
            ],
            [
              'Lato as the primary font.',
              'Replaced by Source Serif 4 for body, Geist for mono and sans.',
            ],
            [
              'Terminal green on near-black.',
              'Reads as code-IDE register. The blog wants editorial register.',
            ],
            [
              'Cool-slate base tokens.',
              'Replaced by warm soot, cream paper, and steel-warm neutrals.',
            ],
            ['Title Case headings.', 'Sentence case throughout, always.'],
            [
              'Hero text scroll-reveal animations.',
              'Hero never animates on scroll. The first sentence does the work.',
            ],
          ].map(([title, body], i) => (
            <li key={i} className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="font-mono text-meta tracking-wide text-text-soft pt-1">
                {`0${i + 1}`}
              </span>
              <div>
                <span className="font-serif font-semibold text-text">
                  {title}
                </span>{' '}
                <span className="font-serif text-text-mute">{body}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 pt-8 border-t border-rule font-mono text-meta tracking-wide text-text-soft">
          <span className="text-accent">{'// END OF MANUAL'}</span>
        </div>
      </section>
    </main>
  )
}
