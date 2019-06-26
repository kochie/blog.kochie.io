import React from 'react'
import { ThemeProvider } from 'fannypack'
import { Topbar, Jumbotron, Gallery, Footer } from '../components'
import Head from 'next/head'
// import { NextSeo } from 'next-seo';

const image ={
    src: "/static/images/jumbotron.png",
    lqip: "data:image/png;base64,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"
}

const theme = {
    palette: {
        primary: "#741616",
        secondary: "#2e0014"
    }
}

export default () => {
    return (
        <ThemeProvider theme={theme}>
            {/* <NextSeo
                config={{
                    title: "Kochie Engineering",
                    description: "I'm Rob, this is my blog about software and ECSE engineering, and other things I find interesting!",
                    locale: "en_AU"
                }}
            /> */}
            <Head>
                <title>Kochie Engineering</title>
                <meta name="description" content="I'm Rob, this is my blog about software and ECSE engineering, and other things I find interesting!"/>
                <meta name="viewport" content="initial-scale=1.0, width=device-width" />
                <link rel="stylesheet" type="text/css" href="/static/styles/main.css" />
                <link rel="manifest" href="/static/manifest.json" />
                <link rel="icon" href="/static/images/blog-logo-128.png" sizes="128x128"type="image/png" />
                <link rel="icon" href="/static/images/blog-logo-192.png" sizes="192x192"type="image/png" />
                <link rel="icon" href="/static/images/blog-logo-512.png" sizes="512x512" type="image/png" />
                <meta name="theme-color" content="#db5945" />
            </Head>
            <Topbar />
            <Jumbotron image={image} title="Kochie Engineering" subTitle="Robert Koch" logo={"/static/images/blog-logo.svg"}/>
            <Gallery />
            <Footer 
                title={"Kochie Engineering"} 
                links={[
                    { name: "me", src: "https://me.kochie.io" },
                    { name: "linkedin", src: "https://linkedin.com/in/rkkochie"}
                ]}
                divider={<div>.</div>}
            />
        </ThemeProvider>
    )
}