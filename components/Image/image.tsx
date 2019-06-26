import React, { useEffect, useRef, CSSProperties } from 'react'

export interface Image {
    lqip: string
    src: string
    width: number | string
    height: number | string
    alt?: string
    style?: CSSProperties
    className?: string
}

import imageStyle from "./image.less"

class Mutex {
    private count: number
    private waiting: ((value?: unknown) => void)[] 
    constructor() {
        this.count = 0
        this.waiting = []
    }

    async lock() {
        this.count++
        const p = new Promise((resolve) => {
            this.waiting.push(resolve)
        })

        await p

        return
    }

    unlock() {
        const resolve = this.waiting.pop()
        if (!resolve) return
        resolve()
        this.count--
    }

    getCount() {
        return this.count
    }
}

const m = new Mutex()

export default ({lqip, src, width, height, style, alt, className = ""}: Image) => {
    const imgRef = useRef<HTMLImageElement>(null)

    async function getImage() {
        try{
            const image = await fetch(src).catch(error => {throw error})

            if (!image.ok) return

            m.lock()
            const blob = await image.blob()
            
            if (imgRef.current) {
                imgRef.current.src = URL.createObjectURL(blob)
                imgRef.current.className = imageStyle.sharpen
            } else {
                console.warn("imgRef does not have a current reference!")
            }
            m.unlock()


        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getImage()
    })

    const containerClasses = [imageStyle.container, className].join(" ")

    return (
        <div className={containerClasses} style={{...style, width, height}}>
            <img ref={imgRef} src={lqip} width={"100%"} height={"100%"} className={imageStyle.blur} alt={alt} />
        </div>
    )
}