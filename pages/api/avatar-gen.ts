import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'
//import sharp from 'sharp' // deprecated
import { File } from 'node:buffer'
import { uploadFromUrlToTmp } from '../../lib/uploadFromUrlToTmp'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const STYLE_URL = process.env.STYLE_REF_URL!

const PROMPT = `
Create a digital portrait avatar for the Anthropos City passport. 
- The result must have a strong facial resemblance to the person, but the entire image—including the face—should be rendered in a unified, digital brush/AI art style, not photo-realistic. 
- Frontal, head-and-shoulders view, gentle confidence, direct eye contact. 
- Eliminate highly detailed facial nuances: the face should clearly represent the person, but as a digitalized, computer-generated avatar, not an exact photographic copy.
- Art style is enhanced-reality: crisp, vibrant, digital brushwork, with bright, balanced, warmly optimistic lighting.
- Background: soft gradient glow, subtle urban/digital city silhouettes, light geometric patterns suggesting connectivity and limitless potential.
- Eyes should be bright, engaged, natural, and symmetric—avoid distortion, cross-eyed, or cartoonish effects.
- Clothing is modern-casual, unbranded, clean, and presentable, with a subtle motif or accessory representing the Limitless Lifestyle (bold, black, minimalist shaka hand sign logo (call me gesture, thumb and pinky extended, three fingers curled in, geometric filled icon) on the left chest, the thumb should be pointing upwards, the pinky - right).
- The composition should be harmonious: make the head slightly smaller than the original if needed, with balanced proportions. 
- The overall feel is progressive, inclusive, and aspirational—a passport photo for a city of limitless human growth.
- Most importantly: do not exaggerate, warp, or distort the facial features. No uncanny valley. The result should look like a realistic avatar, not a caricature or cartoon.
`.trim();

// Helper: fetch image as buffer
async function fetchBuf(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed: ${url}`)
  return Buffer.from(await res.arrayBuffer())
}
/* deprecated

 Helper: pick GPT canvas size
function pickCanvas(w: number, h: number) {
  const ratio = w / h
  if (ratio > 1.2)            return { w: 1536, h: 1024, sizeStr: "1536x1024" } // landscape
  if (ratio < 0.8)            return { w: 1024, h: 1536, sizeStr: "1024x1536" } // portrait
  return { w: 1024, h: 1024, sizeStr: "1024x1024" }                             // square
}
*/
// Helper: pad/crop to GPT canvas 
/* deprecated
async function padToCanvas(buf: Buffer) {
  const meta = await sharp(buf).metadata()
  const canvas = pickCanvas(meta.width!, meta.height!)
  const padded = await sharp(buf)
    .resize(canvas.w, canvas.h, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .jpeg({ quality: 90 })
    .toBuffer()
  return { padded, canvas }
}
*/
// Helper: convert buffer to File for OpenAI
function bufToFile(buf: Buffer, name: string, mime: string) {
  return new File([new Uint8Array(buf)], name, { type: mime })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sourceUrl, styleRef } = req.body;
  if (!sourceUrl) return res.status(400).json({ error: 'sourceUrl is required' });

  try {
    // 1. Download selfie
    const selfieRaw = await fetchBuf(sourceUrl);
    const selfieFile = bufToFile(selfieRaw, 'selfie.jpg', 'image/jpeg');

    // 2. Download style reference (use provided styleRef or default)
    const styleUrl = styleRef || STYLE_URL;
    const styleBuf = await fetchBuf(styleUrl);
    const styleFile = bufToFile(styleBuf, 'style.png', 'image/png');

    // --- NEW STEP: Analyze selfie with GPT-4o vision to extract traits ---
    const visionRsp = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [{
        role: 'user',
          content: [
            { type: 'input_text', text: 'Analyze the person in this image and output ONLY a JSON object with these keys: faceShape, eyeColor, skinTone, hairColor, hairStyle, upperBodyClothing, accessories, distinctiveFeatures.' },
            { type: 'input_image', 
              "image_url": sourceUrl,
                "detail": 'auto'
              
            },
          ],
        },
      ],
    });

    let traitsJson = '{}';
    try {
      traitsJson = visionRsp.output_text.trim() ?? '{}';
      // if the model wrapped JSON in markdown, strip it
      const match = traitsJson.match(/\{[\s\S]*\}/);
      if (match) traitsJson = match[0];
    } catch {}

    // Merge traits into final prompt
    const enrichedPrompt = `Here are the subject's traits: ${traitsJson}.\n\n` + PROMPT;

    // 3. OpenAI GPT-Image edit (let size default to auto)
    const edit = await openai.images.edit({
      model: 'gpt-image-1',
      image: [selfieFile, styleFile],
      prompt: enrichedPrompt,
      // size: 'auto' // Omit or set explicitly
    });

    if (!edit.data?.[0]?.b64_json) {
      throw new Error('No image data in response');
    }

    // 4. Upload to R2 (unchanged)
    const tmpAvatarUrl = await uploadFromUrlToTmp(
      'data:image/jpeg;base64,' + edit.data[0].b64_json,
      'jpg'
    );

    return res.status(200).json({ tmpAvatarUrl });
  } catch (err: any) {
    console.error('❌ [avatar-gen] Error:', err);
    res.status(500).json({ error: 'Avatar generation failed', details: err.message });
  }
}
