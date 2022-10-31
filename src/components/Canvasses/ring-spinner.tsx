'use client'
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ArrowHelper,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { axisBottom, axisLeft, line, range, scaleLinear, select } from 'd3'

const margin = { top: 10, right: 30, bottom: 30, left: 60 }
const width = 400 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

const data = range(0, 120, 1).map((x) => ({
  x: x,
  y: ((x * x) / 10000) * 9.81,
}))

const Simulation = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<SVGSVGElement>(null)
  const [range, setRange] = useState(5)

  const arrowHelper = useMemo(() => {
    const dir = new Vector3(0, 1, 0).normalize()
    const origin = new Vector3(0, -2, 0)
    const length = 1
    const arrowHelper = new ArrowHelper(dir, origin, length, 0xff0000)
    return arrowHelper
  }, [])

  const mesh = useMemo(() => {
    const geometry = new RingGeometry(2, 2.2, 64)
    const material = new MeshBasicMaterial({
      color: 0x00ffff,
      side: DoubleSide,
      wireframe: true,
    })
    return new Mesh(geometry, material)
  }, [])

  const animate = useCallback((): void => {
    mesh.rotation.z += range / 5000
  }, [range, mesh])

  const x = scaleLinear().domain([1, 120]).range([0, width])
  const y = scaleLinear().domain([0, 15]).range([height, 0])

  useEffect(() => {
    const svg = select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('stroke-width', 2)
      .call(axisBottom(x))

    svg.append('g').attr('stroke-width', 2).call(axisLeft(y))

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr(
        'd',
        line<{ x: number; y: number }>()
          .x(function (d) {
            return x(d.x)
          })
          .y(function (d) {
            return y(d.y)
          })
      )

    return (): void => {
      svg.selectAll('*').remove()
    }
  }, [x, y])

  useEffect(() => {
    const svg = select(chartRef.current)

    const focus = svg
      .append('g')
      .append('circle')
      .style('fill', 'blue')
      .attr('stroke', 'black')
      .attr('r', 8.5)
      .style('opacity', 1)

    focus
      .attr('cx', x(range) + margin.left)
      .attr('cy', y(((range * range) / 10000) * 9.81) + margin.top)

    return (): void => {
      focus.remove()
    }
  }, [range, x, y])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const context = canvasRef.current.getContext('webgl2')
    if (!context) return
    const renderer = new WebGLRenderer({
      antialias: true,
      context,
      canvas,
    })
    const camera = new PerspectiveCamera(70, 400 / 400, 0.01, 100)
    camera.position.z = 4
    const scene = new Scene()

    scene.add(arrowHelper)
    scene.add(mesh)

    renderer.setSize(400, 400)
    renderer.setAnimationLoop(() => {
      animate()
      renderer.render(scene, camera)
    })

    return (): void => {
      renderer.setAnimationLoop(null)
    }
  }, [arrowHelper, mesh, animate])

  useEffect(() => {
    arrowHelper.setLength((range * range) / 5000)
  }, [range, arrowHelper])

  return (
    <div className="w-full my-10">
      <div className="flex gap-4 justify-center mb-6 mx-auto">
        <input
          type="range"
          min="0"
          max="120"
          value={range}
          onChange={(event): void => setRange(parseInt(event.target.value))}
          className="w-96"
        />
        <div>{range}%</div>
        <div>
          {(((range * range) / 10000) * 9.81).toFixed(2)} ms<sup>-2</sup>
        </div>
        <div>
          {Math.sqrt(((range * range) / 10000) * 9.81 * 5000000).toFixed(2)} ms
          <sup>-1</sup>
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full justify-evenly">
        <canvas
          className="dark:bg-gray-800 rounded-2xl bg-gray-400"
          width={400}
          height={400}
          ref={canvasRef}
        />
        <svg
          className="rounded-2xl dark:bg-gray-800 bg-gray-400"
          width={400}
          height={400}
          ref={chartRef}
        />
      </div>
    </div>
  )
}

export default Simulation
