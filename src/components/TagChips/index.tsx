import React from 'react'
import { Tag, TagSet } from '@/components/Tag'

interface TagChipsProps {
  tags: string[]
  /**
   * Optional label rendered above the chips, e.g. "// FILTER · by tag".
   */
  label?: string
}

/**
 * A horizontal row of tag-pill links. Used on `/archive` as a static filter
 * (each chip navigates to the corresponding tag page). Composes the existing
 * Tag and TagSet primitives.
 */
const TagChips = ({
  tags,
  label,
}: TagChipsProps): React.ReactElement | null => {
  if (tags.length === 0) return null
  return (
    <div>
      {label ? (
        <div className="font-mono text-meta tracking-wide text-text-soft mb-3">
          {label}
        </div>
      ) : null}
      <TagSet>
        {tags.map((tag) => (
          <Tag key={tag} name={tag} link={`/tags/${tag.toLowerCase()}`} />
        ))}
      </TagSet>
    </div>
  )
}

export default TagChips
