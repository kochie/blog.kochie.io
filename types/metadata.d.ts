declare module 'metadata.yaml' {
  export interface SocialMedia {
    name: string
    link: string
    icon: import('@fortawesome/fontawesome-svg-core').IconProp
    color: string
    tracking: string
  }

  export interface Author {
    username: string
    fullName: string
    email: string
    socialMedia: SocialMedia[]
    avatar: {
      src: string
    }
    bio: string
  }

  export interface Tag {
    name: string
    blurb: string
    image: {
        src: string
    }
  }

  type Authors = {[key: string]: Author}
  type Metadata = {
    authors: Authors
    tags: Tags[]
  }
  
  export default Metadata
}

declare module '*.yaml' {
  const data: any
  export default data
}