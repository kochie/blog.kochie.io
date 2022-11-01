import { AppleLinks, Common } from '@/components/index'

export default async function Head({
  params,
}: {
  params: { authorId: string }
}) {
  return (
    <>
      <title>{`${params.authorId} | Kochie Engineering`}</title>
      {Common}
      {AppleLinks}
    </>
  )
}
