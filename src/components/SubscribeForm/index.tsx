'use client'

import { FormEventHandler, useCallback, useReducer, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/pro-duotone-svg-icons'

type FormState = 'INITIAL' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'

function reducer(_state: { STATE: FormState }, action: { type: FormState }) {
  return { STATE: action.type }
}

const inputClass =
  'mt-2 block w-full rounded-md border border-rule bg-bg-deep px-3 py-2.5 ' +
  'font-sans text-ui text-text placeholder:text-text-soft ' +
  'focus:border-accent focus:outline-none transition-colors duration-fast ease-motion'

const labelClass =
  'block font-mono text-meta uppercase tracking-wide text-text-soft'

export default function SubscribeForm() {
  const [state, dispatch] = useReducer(reducer, { STATE: 'INITIAL' as const })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit: FormEventHandler = useCallback(async (event) => {
    event.preventDefault()
    dispatch({ type: 'SUBMITTING' })
    setErrorMessage(null)

    const data = new FormData(event.target as HTMLFormElement)
    const email = data.get('email')
    const name = data.get('first_name')

    try {
      const response = await fetch('/api/beehiiv/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ email, name }),
      })

      if (!response.ok) {
        throw new Error(`http ${response.status} — ${response.statusText}`)
      }
      dispatch({ type: 'SUCCESS' })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'unknown error')
      dispatch({ type: 'ERROR' })
    }
  }, [])

  if (state.STATE === 'SUCCESS') {
    return (
      <section
        id="subscribe"
        aria-labelledby="subscribe-heading"
        className="mx-auto max-w-bleed w-full px-4 my-24"
      >
        <div className="border border-rule rounded-md bg-bg-soft p-8 md:p-12">
          <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
            <span className="text-accent">{'// '}SUBSCRIBED</span>
          </div>
          <h2
            id="subscribe-heading"
            className="font-serif font-semibold text-h2 text-text leading-tight mb-3"
          >
            You&apos;re in.
          </h2>
          <p className="font-serif italic text-deck text-text-mute leading-snug max-w-prose">
            Check your inbox to confirm. The next dispatch will land when
            there&apos;s something worth saying.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="subscribe"
      aria-labelledby="subscribe-heading"
      className="mx-auto max-w-bleed w-full px-4 my-24"
    >
      <div className="border border-rule rounded-md bg-bg-soft p-8 md:p-12">
        <div className="font-mono text-meta text-text-soft tracking-wide mb-4">
          <span className="text-accent">{'// '}SUBSCRIBE</span>
        </div>
        <h2
          id="subscribe-heading"
          className="font-serif font-semibold text-h2 text-text leading-tight mb-3"
        >
          Like what you see?
        </h2>
        <p className="font-serif italic text-deck text-text-mute leading-snug mb-8 max-w-prose">
          Find out when I sporadically scream into the void. Long-form notes
          from a one-person engineering studio in Melbourne &mdash; usually
          code, sometimes maths, no fluff.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 md:grid-cols-2 mb-6">
            <div>
              <label htmlFor="subscribe-email" className={labelClass}>
                Email
              </label>
              <input
                id="subscribe-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tony@stark.industries"
                aria-label="Your email address"
                className={inputClass}
                onChange={() => {
                  if (state.STATE !== 'INITIAL') dispatch({ type: 'INITIAL' })
                }}
              />
            </div>

            <div>
              <label htmlFor="subscribe-name" className={labelClass}>
                Name <span className="normal-case">{'// optional'}</span>
              </label>
              <input
                id="subscribe-name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                placeholder="Tony"
                className={inputClass}
              />
            </div>
          </div>

          {state.STATE === 'ERROR' && errorMessage ? (
            <p
              role="alert"
              className="mb-5 font-mono text-meta text-text tracking-wide"
            >
              <span className="text-signal mr-2">{'// '}ERROR</span>
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="submit"
              disabled={state.STATE === 'SUBMITTING'}
              className={
                'inline-flex items-center gap-2 px-5 py-3 ' +
                'border border-accent rounded-md ' +
                'text-text font-serif italic text-base ' +
                'hover:bg-accent hover:text-bg ' +
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-text ' +
                'transition-colors duration-fast ease-motion'
              }
            >
              {state.STATE === 'SUBMITTING' ? (
                <>
                  <FontAwesomeIcon icon={faSync} spin />
                  <span>Subscribing&hellip;</span>
                </>
              ) : state.STATE === 'ERROR' ? (
                <>
                  <span>Try again</span>
                  <span className="text-accent">→</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <span className="text-accent">→</span>
                </>
              )}
            </button>

            <span className="font-mono text-meta text-text-soft tracking-wide">
              no spam &middot; unsubscribe anytime
            </span>
          </div>
        </form>

        <hr className="border-0 border-t border-rule my-8" />

        <p className="font-mono text-meta text-text-soft tracking-wide flex flex-wrap gap-x-3 gap-y-1">
          <span>powered by beehiiv</span>
          <span aria-hidden>&middot;</span>
          <a href="/feed/rss.xml" className="text-accent hover:underline">
            RSS feed →
          </a>
        </p>
      </div>
    </section>
  )
}

export { SubscribeForm }
