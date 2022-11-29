'use client'
import { useEffect } from 'react'

export default function Title({ title }: { title: string }) {
  useEffect(() => {
    document.title = title
  }, [title])

  return null
}
