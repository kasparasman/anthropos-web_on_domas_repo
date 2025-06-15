// pages/api/topics/[id]/comments.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '@/lib/authOptions'
import { prisma }           from '@/lib/prisma'
import { Client as QStash } from '@upstash/qstash'
import crypto               from 'crypto'

const qstash = new QStash({
  token: process.env.QSTASH_TOKEN!,
})

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
        parentId: true,
        body: true,
        createdAt: true,
        topicId: true,
        author: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true
          }
        }
      }
    })
    return res.status(200).json(comments.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString()
    })))
  }

  /*──── POST ──────────────────────────────────────────────────────────────*/
  if (req.method === 'POST') {
    if (!session?.user?.id)
      return res.status(401).json({ error: 'Not authenticated' })

    const { content, parentId } = req.body
    if (!content || typeof content !== 'string')
      return res.status(400).json({ error: 'Content required' })

    // Validate parentId if provided
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { topicId: true }
      })
      
      if (!parentComment || parentComment.topicId !== topicId) {
        return res.status(400).json({ error: 'Invalid parent comment' })
      }
    }

    /* Step 1 – insert comment immediately */
    const inserted = await prisma.comment.create({
      data:{
        id:       crypto.randomUUID(),
        topicId,
        authorId: session.user.id,
        parentId: parentId || null,
        body:     content.trim()
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true
          }
        }
      }
    })

    /* Step 2 – enqueue moderation job */
    try {
      await qstash.publishJSON({
        url: (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.anthroposcity.com').replace(/\/$/, '') + '/api/workers/moderate-comment',
        body: { commentId: inserted.id },
        retries: 3,
      })
    } catch (err) {
      console.error('[QStash] Failed to enqueue moderation job', err)
    }

    return res.status(201).json(inserted)
  }

  /*──── 405 ───────────────────────────────────────────────────────────────*/
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
