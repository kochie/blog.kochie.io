'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Two from 'two.js'
import { Path } from 'two.js/src/path'
import { Polygon } from 'two.js/src/shapes/polygon'

let t = 0
// const dt =

export default function FlatProjectile() {
  const divRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<Path | null>(null)
  const twoRef = useRef<Two | null>(null)

  // w=2PIf=2PI/T
  const [rotation_speed, set_rotation_speed] = useState(1) // rad/s
  const [muzzle_speed, set_muzzle_speed] = useState(10)
  const [g, set_g] = useState(0.02)
  const [dt, set_dt] = useState(1 / 60)
  const [angle, set_angle] = useState(80)
  const [ring_radius, set_radius] = useState(100)

  useLayoutEffect(() => {
    const elem = divRef.current
    if (!elem) return

    const two = new Two({
      width: elem.clientWidth || 500,
      height: 500,
      // domElement: divRef.current,
      type: Two.Types.canvas,
      autostart: true,
    }).appendTo(elem)
    twoRef.current = two

    two.update()

    return () => {
      two.unbind('update')
      two.clear()
      arrowRef.current = null
      twoRef.current = null
      two.renderer.domElement.remove()
      //   divRef.current?.removeChild(two.renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (!twoRef.current) return

    const two = twoRef.current

    const centerX = two.width / 2
    const centerY = two.height / 2

    let x = centerX + ring_radius
    let y = centerY
    const phi = Math.atan2(y - centerY, x - centerX)

    const theta = angle * (Math.PI / 180)

    const la = phi + theta + Math.PI / 2

    arrowRef.current?.remove()
    arrowRef.current = two.makeArrow(
      x,
      y,
      x + 20 * Math.cos(la),
      y + 20 * Math.sin(la),
      5
    )
    arrowRef.current.stroke = 'white'

    // Create outer circle
    const outerCircle = two.makeCircle(centerX, centerY, ring_radius)
    outerCircle.stroke = 'red' // Fill color
    outerCircle.linewidth = 5 // Stroke width
    outerCircle.noFill() // No stroke

    const circle = two.makeCircle(x, y, 5)
    const bullet = two.makeCircle(x, y, 2)

    let launch_speed = new Two.Vector(
      muzzle_speed * Math.cos(la),
      muzzle_speed * Math.sin(la) + rotation_speed * ring_radius
    ).divideScalar(60)
    // console.log(launch_speed)
    // let launch_speed = new Two.Vector(-1,-1)
    // const arrow = twoRef.current.makeArrow(x, y, x + 20 * Math.cos(la), y + 20 * Math.sin(la), 5)

    const a1 = two.makeArrow(
      x,
      y,
      x + muzzle_speed * Math.cos(la),
      y + (muzzle_speed * Math.sin(la) + rotation_speed * ring_radius),
      5
    )

    console.log((muzzle_speed * Math.cos(theta)) / 60)

    a1.stroke = 'green'

    twoRef.current
      .bind('update', function (frameCount: number) {
        let x = centerX + ring_radius * Math.cos(t * rotation_speed)
        let y = centerY + ring_radius * Math.sin(t * rotation_speed)
        // console.log(x,y)

        // theta is relative to the inside fo the circle

        // cons x1 = v0 * Math.cos(theta) * t
        // const y2 = v0 * Math.sin(theta) * t - 0.5 * g * t ** 2

        bullet.position.add(launch_speed)
        // console.log(launch_speed)

        t += dt

        circle.position.set(x, y)

        if (
          Math.pow(bullet.position.x - centerX, 2) +
            Math.pow(bullet.position.y - centerY, 2) >
          Math.pow(ring_radius, 2)
        ) {
          // bullet.translation.set(centerX, centerY)

          x = centerX + ring_radius
          y = centerY

          bullet.translation.set(x, y)
          circle.translation.set(x, y)

          t = 0
          launch_speed = new Two.Vector(
            muzzle_speed * Math.cos(la),
            muzzle_speed * Math.sin(la) + rotation_speed * ring_radius
          ).divideScalar(60)

          // console.log(launch_speed)
          // launch_speed = new Two.Vector(muzzle_speed * Math.cos(la) + rotation_speed * outerRadius, muzzle_speed * Math.sin(la))
        }
      })
      .play()

    two.update()

    return () => {
      two.clear()
      twoRef.current?.unbind('update')
    }
  }, [rotation_speed, g, dt, angle, muzzle_speed, ring_radius])

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
            max="180"
            step={1}
            value={angle}
            onChange={(e) => set_angle(e.target.valueAsNumber)}
          />
          <span>angle {angle}</span>
        </div>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="1"
            step={0.01}
            value={rotation_speed}
            onChange={(e) => set_rotation_speed(e.target.valueAsNumber)}
          />
          <span>rotation speed {rotation_speed} rad/s</span>
        </div>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="300"
            step={0.1}
            value={muzzle_speed}
            onChange={(e) => set_muzzle_speed(e.target.valueAsNumber)}
          />
          <span>Muzzle Speed {muzzle_speed}</span>
        </div>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min="0"
            max="250"
            step={1}
            value={ring_radius}
            onChange={(e) => set_radius(e.target.valueAsNumber)}
          />
          <span>Ring Radius {ring_radius}</span>
        </div>
      </div>
    </div>
  )
}
