/** @server-only */

import type { NextApiRequest, NextApiResponse } from 'next'
import { verifySignature } from '@upstash/qstash/dist/nextjs'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MAX_ALLOWED = 4  // 1-4 OK, 5-10 blocked
const ACTION_WARN = 0
const ACTION_BAN = 1

export const config = { api: { bodyParser: false } }

/*───────────────────────────────────────────────────────────────────────────*/
async function scoreContent(text: string): Promise<{ score: number; raw: string }> {
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You are a content moderator. You will receive text and must rate it on a scale of 1-10 for inappropriate language, where 1 is completely appropriate and 10 is extremely inappropriate. Respond with ONLY a number and a one-sentence explanation.',
      },
      { role: 'user', content: `Rate this text: '${text}'` },
    ],
  })
  const raw = resp.choices[0]?.message?.content?.trim() ?? ''
  const num = parseInt(raw.match(/\d+/)?.[0] ?? '10', 10) // fallback 10
  return { score: num, raw }
}

/*───────────────────────────────────────────────────────────────────────────*/
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // after verifySignature, req.body is already parsed JSON

  const { commentId } = req.body as { commentId?: string }

  if (!commentId) {
    return res.status(400).json({ error: 'commentId missing' })
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { body: true, authorId: true },
    })

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    const { score, raw } = await scoreContent(comment.body)

    if (score <= MAX_ALLOWED) {
      return res.status(200).json({ moderated: true, score })
    }

    // Over threshold – warn / ban + delete comment
    await prisma.$transaction(async (tx: any) => {
      // increment warnings
      const profile = await tx.profile.update({
        where: { id: comment.authorId! },
        data: { warnings: { increment: 1 } },
        select: { warnings: true, banned: true },
      })

      const willBan = profile.warnings >= 2
      if (willBan) {
        await tx.profile.update({ where: { id: comment.authorId! }, data: { banned: true } })
      }

      // record modlog
      await tx.modLog.create({
        data: {
          userId: comment.authorId!,
          commentId: commentId,
          score: raw,
          action: willBan ? ACTION_BAN : ACTION_WARN,
        },
      })

      // delete comment
      await tx.comment.delete({ where: { id: commentId } })
    })

    return res.status(200).json({ moderated: true, blocked: true, score })
  } catch (error) {
    console.error('[Moderation Worker] Error processing', error)
    return res.status(500).json({ error: 'Internal error' })
  }
}

export default process.env.NODE_ENV === 'development'
  ? handler // skip signature locally
  : verifySignature(handler)