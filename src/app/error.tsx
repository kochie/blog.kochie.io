'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

const Error = ({ error, reset }: ErrorBoundaryProps) => {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <button onClick={reset}>Recover</button>
    </div>
  )
}

export default Error
