export interface CardDetails {
    title: string,
    image: {
        src: string,
        lqip: string,
        alt: string
    },
    blurb: string,
    readTime: number,
    tags: string[],
    articleName: string
}

export { default as Small } from "./Small/Small"
export { default as Medium } from "./Medium/Medium"
export { default as Large } from "./Large/Large"