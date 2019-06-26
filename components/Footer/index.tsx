import React from 'react'
import { Text } from 'fannypack';
import style from './footer.less'

interface FooterProps {
    title: string
    links: {
        name: string
        src: string
    }[]
    divider: JSX.Element
}

export default ({title, links, divider}: FooterProps) => {
    return (
        <div className={style.container}>
            <Text>{title} © {new Date().getFullYear()}</Text>
            <div className={style.links}>
                {links.map((link, i: number) => {
                    const classes = [style.link]
                    i === 0 ? null : classes.push(style.divider)
                    return (
                        <div key={link.src} className={classes.join(" ")}><a href={link.src}>{link.name}</a></div>
                    )
                })}
            </div>
        </div>
    )
}