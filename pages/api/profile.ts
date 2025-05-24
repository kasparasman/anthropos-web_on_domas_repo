// pages/api/profile.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'
import { prisma } from '@/lib/prisma'

type ErrorResponse = { error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Not authenticated' } as ErrorResponse)
  }
  const uid = session.user.id

  // GET /api/profile
  if (req.method === 'GET') {
    const profile = await prisma.profile.findUnique({
      where: { id: uid },
      select: { id: true, email: true, nickname: true, avatarUrl: true }
    })
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' } as ErrorResponse)
    }
    return res.status(200).json(profile)
  }

  // POST /api/profile
  if (req.method === 'POST') {
    const { nickname, avatarUrl } = req.body as {
      nickname: string
      avatarUrl?: string | null
    }
    if (typeof nickname !== 'string') {
      return res.status(400).json({ error: 'Invalid nickname' } as ErrorResponse)
    }

    const upserted = await prisma.profile.upsert({
      where: { id: uid },
      create: {
        id: uid,
        email: session.user.email ?? '',
        nickname,
        avatarUrl: avatarUrl ?? null
      },
      update: {
        nickname,
        avatarUrl: avatarUrl ?? null
      }
    })

    return res.status(200).json(upserted)
  }

  // Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
