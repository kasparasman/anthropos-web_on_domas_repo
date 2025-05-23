// pages/api/topics/[id]/likes.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '../../../../lib/authOptions'
import { prisma } from '@/lib/prisma';

type LikeResponse = { count: number; likedByMe: boolean }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const topicId = req.query.id as string  // Changed: now using string UUID
  console.log('👍 [likes] session in API:', session)

  // GET /api/topics/[id]/likes
  if (req.method === 'GET') {
    const count = await prisma.topicLike.count({  // Changed: topicLike instead of likes
      where: { topicId }                         // Changed: field name
    })
    const likedByMe = session?.user?.id
      ? (await prisma.topicLike.findFirst({
          where: {
            topicId,
            userId: session.user.id              // Changed: userId instead of user_id
          }
        })) !== null
      : false
    return res.status(200).json({ count, likedByMe } as LikeResponse)
  }

  // POST /api/topics/[id]/likes
  if (req.method === 'POST') {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const userId = session.user.id

    // Check existing like
    const existingLike = await prisma.topicLike.findFirst({
      where: {
        topicId,
        userId
      }
    })

    if (existingLike) {
      // Remove like
      await prisma.topicLike.delete({
        where: {
          userId_topicId: {        // Changed: using composite key
            userId,
            topicId
          }
        }
      })
    } else {
      // Add like
      await prisma.topicLike.create({
        data: {
          userId,
          topicId
        }
      })
    }

    // Fetch updated count
    const newCount = await prisma.topicLike.count({
      where: { topicId }
    })
    const likedByMe = existingLike == null

    return res.status(200).json({ count: newCount, likedByMe } as LikeResponse)
  }
  // Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
