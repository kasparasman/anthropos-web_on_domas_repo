import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { avatarUrl } = req.body as { avatarUrl: string }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Suggest one playful, short nickname (no spaces) for the \
person in this profile image: ${avatarUrl}. Respond with the nickname only.`,
      },
    ],
    max_tokens: 5,
  })

  res.status(200).json({
    nickname: completion.choices[0].message?.content?.trim().replace(/[^a-z0-9_-]/gi, '') ?? '',
  })
}
