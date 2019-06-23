import React, { useEffect, useRef, CSSProperties } from 'react'

export interface Image {
    lqip: string,
    src: string,
    width: number | string,
    height: number | string,
    style?: CSSProperties
}

import imageStyle from "./image.less"

export default ({lqip, src, width, height, style}: Image) => {
    const imgRef = useRef<HTMLImageElement>(null)

    async function getImage() {
        try{
            const image = await fetch(src).catch(error => {throw error})

            if (!image.ok) return

            const blob = await image.blob()
            
            if (imgRef.current) {
                imgRef.current.src = URL.createObjectURL(blob)
                imgRef.current.className = imageStyle.sharpen
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        setTimeout(() => getImage(), 1000)
    })

    return (
        <div className={imageStyle.container} style={{...style, width, height}}>
            <img ref={imgRef} src={lqip} width={"100%"} height={"100%"} className={imageStyle.blur} />
        </div>
    )
}