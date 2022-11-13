import { AppleLinks, Common } from '@/components/index'

export default async function Head({ params }: { params: { tagId: string } }) {
  return <>
    <title>{`${params.tagId.replace(/^\w/, (c) =>
      c.toUpperCase()
    )} | Kochie Engineering`}</title>
    {Common}
    {AppleLinks}
  </>;
}
