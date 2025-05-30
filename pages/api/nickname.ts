import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function getCandidates(avatarUrl: string, exclude: string[] = []) {
  const prompt = `Suggest 10 unique, short nicknames (no spaces) for the person in this profile image which I will attach. Analyze the persons face, expression, theme, how it represents itself, elements in the photo/image. All these should be reflected in the nickname. Also if it's male or female, give the nickname accordingly.
${exclude.length > 0 ? `Do not use any of these nicknames: ${exclude.join(', ')}.` : ''}
Respond with a JSON array of nicknames only.\n\nCriteria:\nNames should sound dignified, aspirational, and fit for a "citizen of the future" or a digital passport.\nAvoid common/generic words and focus on invented or semi-invented names inspired by ancient languages or high-concept terms.\nOptionally, blend Latin/Greek roots with modern or tech-inspired suffixes or forms.`

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [{
          role: "user",
          content: [
              { type: "input_text", text: prompt },
              {type:'input_text', text:'USER_PROFILE_IMAGE'},
              {
                  type: "input_image",
                  image_url: avatarUrl,
                  detail: 'high',
              },
          ],
      }],
    });


  let candidates: string[] = []
  try {
    candidates = JSON.parse(response.output_text ?? '[]')
  } catch {
    // fallback: try to extract nicknames from text
    candidates = (response.output_text ?? '')
      .split(/[^a-z0-9_-]+/i)
      .filter(Boolean)
  }
  // Clean up nicknames
  candidates = candidates
    .map(n => n.trim().replace(/[^a-z0-9_-]/gi, ''))
    .filter(Boolean);

  const RESERVED = new Set(['json', 'array', 'object', 'undefined', 'null', 'nickname', 'name', 'string', 'response']);
  candidates = candidates.filter(n => n && !RESERVED.has(n.toLowerCase()));
  return candidates
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { avatarUrl } = req.body as { avatarUrl: string }

  // 1. Get first batch of candidates
  let candidates = await getCandidates(avatarUrl)

  // 2. Check which are unique
  let taken = await prisma.profile.findMany({
    where: { nickname: { in: candidates } },
    select: { nickname: true },
  })
  let takenSet = new Set(taken.map(n => n.nickname))
  let available = candidates.find(n => !takenSet.has(n))

  // 3. If none are unique, retry with the already-tried names
  if (!available) {
    candidates = await getCandidates(avatarUrl, candidates)
    taken = await prisma.profile.findMany({
      where: { nickname: { in: candidates } },
      select: { nickname: true },
    })
    takenSet = new Set(taken.map(n => n.nickname))
    available = candidates.find(n => !takenSet.has(n))
  }

  // Defensive: if available is a JSON array as a string, parse and pick the first
  if (available && typeof available === 'string' && available.trim().startsWith('[')) {
    try {
      const arr = JSON.parse(available);
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        available = arr[0];
      }
    } catch {}
  }

  res.status(200).json({
    nickname: typeof available === 'string' ? available : '',
  })
}
