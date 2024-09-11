'use client'
import React, { useEffect, useRef, useState } from 'react'
import Two from 'two.js'

export default function FlatProjectile() {
  const divRef = useRef<HTMLDivElement>(null)

  const [v0, set_v0] = useState(5)
  const [g, set_g] = useState(0.02)
  const [dt, set_dt] = useState(0.7)
  const [angle, set_angle] = useState(45)

  useEffect(() => {
    const elem = divRef.current
    if (!elem) return

    const two = new Two({
      width: divRef.current.clientWidth || 500,
      height: 500,
      // type: Two.Types.canvas
    }).appendTo(divRef.current)

    // Create a simple shape (a rectangle)
    const projectile = two.makeCircle(10, two.height - 10, 10)
    const points = [new Two.Anchor(10, two.height - 10)]

    projectile.fill = 'red'

    // y = 0.5 * g * t^2

    // Update the renderer
    two.update()
    // const g = 0.002
    // const g = 0.02
    const theta = angle * (Math.PI / 180)

    const path = new Two.Path(points)
    path.stroke = 'green'
    path.fill = 'none'
    path.automatic = true
    path.linewidth = 2
    two.add(path)
    let t = 0
    // const dt = 0.7

    // Animation loop
    two
      .bind('update', (frameCount: number) => {
        const x = v0 * Math.cos(theta) * t + 10
        const y = v0 * Math.sin(theta) * t - 0.5 * g * t ** 2 + 10

        projectile.translation.set(x, two.height - y)
        // console.log(x, y)

        // points.push(new Two.Anchor(x, two.height-y))
        path.vertices.push(new Two.Anchor(x, two.height - y))
        // console.log(points)\
        t += dt

        if (x > two.width || y < 0) {
          t = 0
          path.vertices = [new Two.Anchor(10, two.height - 10)]
        }
      })
      .play()

    return () => {
      two.unbind('update')
      two.clear()
      two.renderer.domElement.remove()
      //   divRef.current?.removeChild(two.renderer.domElement)
    }
  }, [v0, g, dt, angle])

  return (
    <div
      ref={divRef}
      className="dark:bg-gray-800 rounded-2xl bg-gray-400 flex flex-col"
    >
      <div className="flex w-full justify-between order-last">
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={v0}
            onChange={(e) => set_v0(e.target.valueAsNumber)}
          />
          <span>v0 {v0}</span>
        </div>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="5"
            step={0.1}
            value={g}
            onChange={(e) => set_g(e.target.valueAsNumber)}
          />
          <span>gravity {g}</span>
        </div>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="0.5"
            step={0.05}
            value={dt}
            onChange={(e) => set_dt(e.target.valueAsNumber)}
          />
          <span>speed {dt}</span>
        </div>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="90"
            step={1}
            value={angle}
            onChange={(e) => set_angle(e.target.valueAsNumber)}
          />
          <span>angle {angle}</span>
        </div>
      </div>
    </div>
  )
}
