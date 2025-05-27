import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'
import { uploadFromUrlToTmp } from '../../lib/uploadFromUrlToTmp'
import { File } from 'node:buffer'   // Node 18/20 polyfill for browser File

/* ─── OpenAI client ────────────────────────────────────── */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/* ─── helper: Buffer → File ─────────────────────────────── */
async function fetchAsFile(url: string, name: string, mime: string): Promise<File> {
  const arrayBuffer = await fetch(url).then(r => r.arrayBuffer())
  return new File([new Uint8Array(arrayBuffer)], name, { type: mime })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  console.log('🎨 [avatar-gen] Starting generation with body:', req.body)

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY || !process.env.STYLE_REF_URL) {
    console.error('❌ [avatar-gen] Missing required env vars')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const { sourceUrl } = req.body
  if (!sourceUrl) {
    console.error('❌ [avatar-gen] Missing sourceUrl in request body')
    return res.status(400).json({ error: 'sourceUrl is required' })
  }

  try {
    console.log('📡 [avatar-gen] Preparing files for GPT Image generation')

    /* 1. prepare Uploadables (selfie FIRST, style SECOND) */
    const [selfieFile, styleFile] = await Promise.all([
      fetchAsFile(sourceUrl, 'selfie.jpg', 'image/jpeg'),
      fetchAsFile(process.env.STYLE_REF_URL, 'style.png', 'image/png'),
    ])

    console.log('📤 [avatar-gen] Files prepared:', {
      selfieSize: selfieFile.size,
      styleSize: styleFile.size
    })

    /* 2. GPT-Image-1 edit WITHOUT MASK */
    const rsp = await openai.images.edit({
      model: 'gpt-image-1',
      image: [selfieFile, styleFile],
      size: '1024x1024',
      output_format: 'jpeg',          // ✅ Correct parameter name
      prompt:
        'Create a stylised avatar. Preserve **all facial proportions, skin tone, ' +
        'eye shape, and hairline exactly**. Change only background, lighting, and ' +
        'color palette to match the reference style.',
    })

    if (!rsp.data?.[0]?.b64_json) {
      throw new Error('No image data in response')
    }

    console.log('📥 [avatar-gen] Got GPT Image response, converting to buffer')

    /* 3. Convert base64 to buffer */
    const imageBuffer = Buffer.from(rsp.data[0].b64_json, 'base64')

    /* 4. Upload to our R2 tmp/ folder */
    console.log('📤 [avatar-gen] Uploading to R2 tmp folder')
    const tmpAvatarUrl = await uploadFromUrlToTmp(
      'data:image/jpeg;base64,' + rsp.data[0].b64_json,
      'jpg'
    )

    console.log('✅ [avatar-gen] Success:', { tmpAvatarUrl })
    res.status(200).json({ tmpAvatarUrl })

  } catch (err: any) {
    const errorDetails = {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    }
    console.error('❌ [avatar-gen] Error:', errorDetails)
    res.status(500).json({
      error: 'Avatar generation failed',
      details: errorDetails
    })
  }
}
