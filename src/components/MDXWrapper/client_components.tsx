'use client'

import { useEffect } from 'react'
import { useWindowSize } from '@uidotdev/usehooks'

interface LinkedInEmbedProps {
  url: string
  width?: number
  height?: number
}

export function LinkedInEmbed({
  url,
  width = 504,
  height = 573,
}: LinkedInEmbedProps) {
  const { width: windowWidth } = useWindowSize()

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <iframe
        src={url}
        width={Math.min((windowWidth ?? Infinity) - 60, width)}
        height={height}
        allowFullScreen
        title="LinkedIn post"
        style={{
          borderRadius: 8,
          border: '1px solid #ccc',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  )
}
