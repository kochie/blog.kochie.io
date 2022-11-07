'use client'

import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote'
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  IMG,
  LI,
  OL,
  P,
  UL,
  HaloInteractive,
  Iframe,
  GithubProject,
  BLOCKQUOTE,
  ANCHOR,
  CODE,
  TOC,
  SUP,
  HR,
  Quote,
} from './components'
import React from 'react'

// https://github.com/hashicorp/next-mdx-remote/blob/main/src/index.tsx
export const MDXContent: React.FC<MDXRemoteProps> = (props) => {
  return (
    <MDXRemote
      {...props}
      components={{
        h1: H1,
        h2: H2,
        h3: H3,
        h4: H4,
        h5: H5,
        h6: H6,
        img: IMG,
        p: P,
        ol: OL,
        ul: UL,
        li: LI,
        HaloInteractive,
        iframe: Iframe,
        GithubProject,
        blockquote: BLOCKQUOTE,
        a: ANCHOR,
        code: CODE,
        TOC,
        sup: SUP,
        hr: HR,
        Quote,
      }}
    />
  )
}
