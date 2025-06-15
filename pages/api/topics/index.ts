// pages/api/topics/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

type TopicWithCounts = {
  id: string;
  title: string;
  body: string;
  videoUrl: string;
  imageUrl: string | null;
  createdAt: Date;
  _count: { topicLikes: number; comments: number };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();

  // Fetch session to compute likedByUser flag (optional)
  const session = await getServerSession(req, res, authOptions)

  // 1) Fetch topics with aggregated counts in **one** query
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      body: true,
      videoUrl: true,
      imageUrl: true,
      createdAt: true,
      _count: {
        select: {
          topicLikes: true,
          comments: true,
        },
      },
    },
  }) as TopicWithCounts[]

  // 2) Determine which topics the current user already liked (single query)
  let likedSet = new Set<string>()
  if (session?.user?.id) {
    const likes = await prisma.topicLike.findMany({
      where: {
        userId: session.user.id,
        topicId: { in: topics.map((t: TopicWithCounts) => t.id) },
      },
      select: { topicId: true },
    })
    likedSet = new Set(likes.map((l: { topicId: string }) => l.topicId))
  }

  // 3) Shape payload for client – include counts & liked flag
  const payload = topics.map((t: TopicWithCounts) => ({
    id: t.id,
    title: t.title,
    body: t.body,
    videoUrl: t.videoUrl,
    imageUrl: t.imageUrl,
    createdAt: t.createdAt,
    likes: t._count.topicLikes,
    comments: t._count.comments,
    likedByUser: likedSet.has(t.id),
  }))

  res.status(200).json(payload)
}
