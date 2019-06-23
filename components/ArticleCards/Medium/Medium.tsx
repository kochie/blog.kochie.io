import React from 'react'
import { CardDetails } from '..';
import { Image } from '../..';

import style from "../articleCards.less"
import { Set, Tag, Text, Paragraph, Heading } from 'fannypack';

export default ({title, image, blurb, readTime, tags}: CardDetails) => {
    return (
        <div className={[style.card, style.medium].join(" ")}>
            <Image {...image} width={''} height={200} style={{backgroundColor: 'black', borderRadius: '10px 10px 0 0'}}/>
            <div style={{padding:'10px'}}>
                <Set spacing="minor-1">
                    {tags.map(tag => (<Tag key={tag} palette="textTint">{tag}</Tag>))}
                </Set>
                <Heading use="h4">{title}</Heading>
                <Paragraph>{blurb}</Paragraph>
                <div className={style.readTime}>
                    <Text use="sub">{readTime} min read</Text>
                </div>
            </div>
        </div>
    )
}