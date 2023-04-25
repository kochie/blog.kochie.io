export interface SocialMedia {
  name: string
  link: string
  icon: [
    import('@fortawesome/fontawesome-svg-core').IconPrefix,
    import('@fortawesome/fontawesome-svg-core').IconName
  ]
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
    lqip: string
  }
  bio: string
}

export interface Tag {
  name: string
  blurb: string
  image: {
    src: string
    lqip: string
  }
}

export type Authors = { [key: string]: Author }
export type Metadata = {
  authors: Authors
  tags: Tag[]
}
