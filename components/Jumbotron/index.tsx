import React, { useEffect } from 'react'

import style from './jumbotron.less'
import { Image } from '..';

interface JumbotronProps {
    image: {
        src: string,
        lqip: string
    },
    title: string,
    subTitle: string,
    logo: string
}

export default ({image, title, subTitle, logo}: JumbotronProps) => {
    return (
        <div className={style.container}>
            <div className={style.image}>
                <Image {...image} width={"100vw"} height={"100vh"} style={{backgroundColor:"black"}} alt={"jumbotron background"}/>
            </div>
            <div className={style.titles}>
                <div style={{float: 'left'}}>
                    <img width={192} height={192} src={logo} alt={"logo - kochie engineering"} />
                </div>
                <div style={{float: 'right', paddingLeft: '40px'}}>
                    <h1>{title}</h1>
                    <h2>{subTitle}</h2>
                </div>
            </div>
        </div>
    )
}