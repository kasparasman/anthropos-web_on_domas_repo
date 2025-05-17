import React from 'react'

interface Props { body: string | null }
export default function TopicBody({ body }: Props) {
  if (!body) return <p className="italic text-zinc-400">No content provided.</p>
  return (
    <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
  )
}
