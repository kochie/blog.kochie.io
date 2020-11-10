interface Image {
  url: string
  lqip: string
  palette: string[]
}

declare module '*.png' {
  let image: Image
  export default image
}

declare module '*.jpeg' {
  let image: Image
  export default image
}

declare module '*.jpg' {
  let image: Image
  export default image
}

declare module '*.svg' {
  let src: string
  export default src
}
