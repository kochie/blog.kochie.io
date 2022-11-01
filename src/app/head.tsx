import { AppleLinks, Common } from '@/components/index'

export default async function Head() {
  return (
    <>
      <title>Kochie Engineering</title>
      <meta
        name="description"
        content="I'm Rob, this is my blog about software and ECSE engineering, and other things I find interesting!"
      />

      {Common}
      {AppleLinks}
    </>
  )
}
