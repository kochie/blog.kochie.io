import React from 'react'
import { CardDetails } from '..';
import { Image } from '../..';
import Link from 'next/link'

import style from "../articleCards.less"
import { Set, Tag, Text, Paragraph, Heading } from 'fannypack';

export default ({title, image, blurb, readTime, tags, articleName}: CardDetails) => {
    return (
        <div className={[style.card, style.large].join(" ")}>
            <Image {...image} height={300} className={style.largeImage} />
            <div className={style.details}>
                <Set spacing="minor-1">
                    {tags.map(tag => (<Tag key={tag} palette="textTint">{tag}</Tag>))}
                </Set>
                <Link prefetch href={{ pathname: '/post', query: { title: articleName } }}>
                    <a>
                        <Heading use="h4">{title}</Heading>
                    </a>
                </Link>
                <Paragraph>{blurb}</Paragraph>
                <div className={style.readTime}>
                    <Text use="sub">{readTime} min read</Text>
                </div>
            </div>
        </div>
    )
}