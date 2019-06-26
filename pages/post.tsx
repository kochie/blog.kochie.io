import React, { useEffect } from 'react'
import { withRouter, WithRouterProps } from 'next/router'
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ThemeProvider } from 'fannypack';


const Post = (props: WithRouterProps<{name: string}>) => {
    if (!props.router) return null
    if (!props.router.query) return null
    const blogTitle = props.router.query.name.replace(/\.mdx$/, "")

    const DynamicComponent = dynamic(() => import(`../posts/${blogTitle}.mdx`));

    return (
        <>
            <Head>
                <title>{blogTitle}</title>
            </Head>
            <ThemeProvider>
                <h1>{blogTitle}</h1>
                <DynamicComponent />
            </ThemeProvider>
        </>
    )
}

export default withRouter(Post)