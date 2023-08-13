'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DoubleSide,
  ExtrudeGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Quaternion,
  RingGeometry,
  Scene,
  Shape,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

function tankExtrude() {
  const length = 0.4
  const width = 0.05

  const x = -length / 2
  const y = -width / 2
  const shape = new Shape()
  shape.moveTo(x, y)
  shape.lineTo(x, y + width)
  shape.lineTo(x + length, y + width)
  shape.lineTo(x + length, y)
  shape.lineTo(x, y)

  const extrudeSettings = {
    steps: 2,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 1,
  }

  const geometry = new ExtrudeGeometry(shape, extrudeSettings)
  const material = new MeshBasicMaterial({
    color: 0x00ff00,
    side: DoubleSide,
    wireframe: true,
  })
  const mesh = new Mesh(geometry, material)

  //   mesh.translateZ(-20)
  mesh.rotateY(Math.PI / 2)
  mesh.translateZ(-0.25)
  return mesh
}

export default function RingProjectile() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [range] = useState(5)

  const mesh = useMemo(() => {
    const geometry = new RingGeometry(2, 2.2, 64)
    const material = new MeshBasicMaterial({
      color: 0x00ffff,
      side: DoubleSide,
      wireframe: true,
    })
    return new Mesh(geometry, material)
  }, [])

  useEffect(() => {
    // setup
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

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.update()

    scene.add(mesh)
    const tank = tankExtrude()
    scene.add(tank)

    let angle = 0
    const r = 2
    const animate = () => {
      mesh.rotation.z += range / 5000
      controls.update()

      angle += range / 5000

      // tank.rotation.x = angle
      // tank.rotateY(angle)
      // tank.lookAt(0,0,0)
      // tank.rotateX(Math.PI / 2);

      tank.position.x = (r - 0.25) * Math.cos(angle)
      tank.position.y = (r - 0.25) * Math.sin(angle)

      tank.rotation.setFromQuaternion(
        new Quaternion().setFromAxisAngle(
          new Vector3(0, 0, 1),
          angle + Math.PI / 2
        )
      )
      // console.log("animate!")
    }

    renderer.setSize(400, 400)
    renderer.setAnimationLoop(() => {
      animate()
      renderer.render(scene, camera)
    })

    return (): void => {
      renderer.setAnimationLoop(null)
    }
  }, [mesh, range])

  return (
    <canvas
      className="dark:bg-gray-800 rounded-2xl bg-gray-400"
      width={400}
      height={400}
      ref={canvasRef}
    />
  )
}
