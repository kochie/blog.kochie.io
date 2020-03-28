declare module 'tags.json' {
  export interface Tag {
    name: string

    blurb: string

    image: {
      lqip: string

      src: string
    }
  }

  type Tags = Tag[]

  export default Tags
}
