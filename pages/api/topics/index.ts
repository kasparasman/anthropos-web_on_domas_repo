// pages/api/topics/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();
const topics = await prisma.topic.findMany({
  orderBy: { createdAt: 'desc' },
  select: {
    id: true,
    title: true,
    createdAt: true,
  }
})
  res.status(200).json(topics);
}
