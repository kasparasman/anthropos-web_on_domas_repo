// pages/api/topics/[id]/comments.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '@/lib/authOptions'
import { prisma }           from '@/lib/prisma'
import OpenAI               from 'openai'

const client        = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const MAX_ALLOWED   = 4          // 1-4 OK, 5-10 blocked
const ACTION_WARN   = 0
const ACTION_BAN    = 1

/*───────────────────────────────────────────────────────────────────────────*/
async function scoreContent(text: string): Promise<{score: number, raw: string}> {
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system',
        content: 'You are a content moderator. You will receive text and must rate it on a scale of 1-10 for inappropriate language, where 1 is completely appropriate and 10 is extremely inappropriate. Respond with ONLY a number and a one-sentence explanation.' },
      { role: 'user',    content: `Rate this text: '${text}'` }
    ]
  })
  const raw = resp.choices[0]?.message?.content?.trim() ?? ''
  const num   = parseInt(raw.match(/\d+/)?.[0] ?? '10', 10)  // fallback 10
  return { score: num, raw }
}

/*───────────────────────────────────────────────────────────────────────────*/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const session = await getServerSession(req, res, authOptions)
  const topicId = req.query.id as string

  /*──── GET ───────────────────────────────────────────────────────────────*/
  if (req.method === 'GET') {
    const comments = await prisma.comment.findMany({
      where: { topicId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        authorId: true,
        body: true,
        createdAt: true,
        topicId: true
      }
    })
    return res.status(200).json(comments.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString()
    })))
  }

  /*──── POST ──────────────────────────────────────────────────────────────*/
  if (req.method === 'POST') {
    if (!session?.user?.id)
      return res.status(401).json({ error: 'Not authenticated' })

    const { content } = req.body
    if (!content || typeof content !== 'string')
      return res.status(400).json({ error: 'Content required' })

    /* Step 1 – Moderation */
    const { score, raw } = await scoreContent(content)
    if (score > MAX_ALLOWED) {
      /* Step 2 – warn / ban inside a transaction */
      const result = await prisma.$transaction(async tx => {
        const profile = await tx.profile.update({
          where: { id: session.user.id },
          data:  { warnings: { increment: 1 } },
          select:{ warnings:true, banned:true }
        })

        const willBan = profile.warnings >= 2
        if (willBan) {
          await tx.profile.update({
            where:{ id: session.user.id },
            data: { banned:true }
          })
        }

        await tx.modLog.create({
          data:{
            userId:   session.user.id,
            commentId:null,            // we blocked the comment
            score:    raw,
            action:   willBan ? ACTION_BAN : ACTION_WARN
          }
        })
        return { warnings: profile.warnings, banned: willBan }
      })

      return res.status(403).json({
        blocked:  true,
        reason:   `Inappropriate score ${score}/10`,
        warnings: result.warnings,
        banned:   result.banned
      })
    }

    /* Step 3 – all good → insert comment */
    const inserted = await prisma.comment.create({
      data:{
        id:       crypto.randomUUID(),
        topicId,
        authorId: session.user.id,
        body:     content.trim()
      }
    })
    return res.status(201).json(inserted)
  }

  /*──── 405 ───────────────────────────────────────────────────────────────*/
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
