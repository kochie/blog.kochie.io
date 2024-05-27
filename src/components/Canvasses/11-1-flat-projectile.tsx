'use client'
import React, { useEffect, useRef } from 'react'
import Two from 'two.js'

export default function FlatProjectile() {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elem = divRef.current
    if (!elem) return

    const two = new Two({
      width: 800,
      height: 500,
      // type: Two.Types.canvas
    }).appendTo(divRef.current)

    // Create a simple shape (a rectangle)
    const projectile = two.makeCircle(10, two.height - 10, 10)
    projectile.fill = 'red'

    // y = 0.5 * g * t^2

    // Update the renderer
    two.update()

    const v0 = 1.4
    const g = 0.002
    const theta = 70 * (Math.PI / 180)

    // Animation loop
    two
      .bind('update', (frameCount) => {
        const t = frameCount / 2

        const x = v0 * Math.cos(theta) * t
        // const y=10
        const y = v0 * Math.sin(theta) * t - 0.5 * g * t ** 2
        projectile.translation.set(x, two.height - y)
        // console.log(x, y)
      })
      .play()

    return () => {
      two.unbind('update')
      two.clear()
      //   divRef.current?.removeChild(two.renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={divRef}
      className="dark:bg-gray-800 rounded-2xl bg-gray-400 block"
    />
  )
}
