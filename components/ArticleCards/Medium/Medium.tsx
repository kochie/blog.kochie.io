import React from 'react'
import { CardDetails } from '..';
import { Image } from '../..';
import Link from 'next/link'

import style from "../articleCards.less"
import { Set, Tag, Text, Paragraph, Heading } from 'fannypack';

export default ({title, image, blurb, readTime, tags, articleName}: CardDetails) => {
    return (
        <div className={[style.card, style.medium].join(" ")}>
            <Image {...image} width={''} height={200} style={{backgroundColor: 'black', borderRadius: '10px 10px 0 0'}}/>
            <div style={{padding:'10px'}}>
                <Set spacing="minor-1">
                    {tags.map(tag => (<Tag key={tag} palette="textTint">{tag}</Tag>))}
                </Set>
                <Link href={{ pathname: '/post', query: { name: articleName } }}><Heading use="h4"><a>{title}</a></Heading></Link>
                <Paragraph>{blurb}</Paragraph>
                <div className={style.readTime}>
                    <Text use="sub">{readTime} min read</Text>
                </div>
            </div>
        </div>
    )
}