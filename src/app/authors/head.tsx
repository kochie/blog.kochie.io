import { AppleLinks, Common } from '@/components/index'

export default async function Head() {
  return (
    <>
      <title>Authors | Kochie Engineering</title>
      {Common}
      {AppleLinks}
    </>
  )
}
