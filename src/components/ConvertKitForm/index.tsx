'use client'

import { FormEventHandler, useCallback, useReducer, useState } from 'react'
import { Card } from '@/components/index'
import { Logo } from './convertkit-logo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faSync } from '@fortawesome/pro-duotone-svg-icons'
import { animated, useTransition } from '@react-spring/web'

function reducer(_state: { STATE: string }, action: { type: string }) {
  switch (action.type) {
    case 'INITIAL':
      return { STATE: 'INITIAL' }
    case 'SUBMITTING':
      return { STATE: 'SUBMITTING' }
    case 'SUCCESS':
      return { STATE: 'SUCCESS' }
    case 'ERROR':
      return { STATE: 'ERROR' }
    default:
      throw new Error()
  }
}

const ConvertKitForm = ({ formId }: { formId: string }) => {
  const [state, dispatch] = useReducer(reducer, { STATE: 'INITIAL' })
  const [errors, setErrors] = useState<string[]>([])

  const errorTransitions = useTransition(errors, {
    from: { opacity: 0 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0 },
  })

  const onSubmit: FormEventHandler = useCallback(
    async (event) => {
      dispatch({ type: 'SUBMITTING' })
      setErrors([])
      event.preventDefault()

      const target = event.target as HTMLFormElement
      const data = new FormData(target)
      const email = data.get('email')
      const name = data.get('first_name')

      const body = JSON.stringify({
        formId,
        email,
        name,
      })

      const headers = new Headers({
        'Content-Type': 'application/json; charset=utf-8',
      })

      try {
        const response = await fetch(`/api/convertkit/subscribe`, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers,
          body,
        })

        if (response.status !== 200) {
          throw new Error(
            `http error - ${response.status} - ${response.statusText}`
          )
        }
        dispatch({ type: 'SUCCESS' })
      } catch (error) {
        if (error instanceof Error) setErrors([error.message])
        // api.start({ to: { opacity: 1, y: 0 } })
        dispatch({ type: 'ERROR' })
      }
    },
    [formId]
  )

  // if (success === false) {
  //   return <p>Apologies, an error occurred</p>
  // }

  // if (success) {
  //   return <p>You&apos;re in! Thank you for subscribing.</p>
  // }

  return (
    <div
      id="convertkit-embed"
      className="relative max-w-5xl mx-auto px-4 mb-0 pb-10 mt-10 transition-all transform duration-500 scale-y-100"
    >
      <Card>
        <div className="p-4 md:p-8 lg:p-14 group">
          <form target="_blank" className="" onSubmit={onSubmit}>
            <div className="mb-5 items-center">
              <h1 className="text-4xl mb-3">Like what you see?</h1>
              <h2 className="text-xl">
                Find out when I sporadically scream into the void...
              </h2>
            </div>

            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="member_email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:text-white dark:bg-stone-900"
                  name="email"
                  id="member_email"
                  aria-label="Your email address"
                  placeholder="tony@stark.industries"
                  required
                  onChange={() => dispatch({ type: 'INITIAL' })}
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label
                  htmlFor="member_first_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-100"
                >
                  Name <span className="italic text-gray-400">(Optional)</span>
                </label>
                <input
                  className="text-black px-3 py-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:text-white dark:bg-stone-900"
                  placeholder="Tony"
                  type="text"
                  name="first_name"
                  id="member_first_name"
                />
              </div>

              {errorTransitions((style, item) => (
                <animated.div className="col-span-6" style={style}>
                  <span className="text-sm mb-1">
                    Whoops... There&apos;s been some issues submitting this form
                    -{' '}
                  </span>
                  <span className="list-none text-sm dark:text-red-400 text-red-600 font-bold">
                    {item}
                  </span>
                </animated.div>
              ))}

              <div className="col-span-6 md:col-span-1 text-sm">
                <button
                  type="submit"
                  disabled={state.STATE === 'SUBMITTING'}
                  className={`w-full p-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500 disabled:cursor-not-allowed text-white font-bold rounded transform duration-200 cursor-pointer`}
                >
                  {state.STATE === 'SUBMITTING' ? (
                    <span>
                      <FontAwesomeIcon icon={faSync} className="" spin />
                    </span>
                  ) : null}
                  {state.STATE === 'INITIAL' ? 'Subscribe' : null}
                  {state.STATE === 'SUCCESS' ? (
                    <div className="duration-100 transform">
                      <FontAwesomeIcon icon={faCheck} className="" />
                      <span>Subscribed</span>
                    </div>
                  ) : null}
                  {state.STATE === 'ERROR' ? 'Try Again' : null}
                </button>
              </div>
              <div className="col-span-4 md:place-self-center self-center">
                <p className="md:mt-2 ml-1 md:text-center text-sm">
                  Privacy respected. Unsubscribe at anytime.
                </p>
              </div>
              <div
                className="col-span-2 md:col-span-1 place-self-end self-center"
                title="Powered by ConvertKit"
              >
                {Logo}
              </div>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default ConvertKitForm
