import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAI } from 'openai'
import { uploadFromUrlToTmp } from '../../lib/uploadFromUrlToTmp'

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const PROMPT = `I attach you two images in base64 url format, first one is regular selfie which you should use as base, second is style reference image which style you should merge onto the selfie, transforming the person in the selfie with the style. That includes: background from style image, theme, colour pallete, accessories, emotion, effects. Transform this selfie with the reference style. Create a digital portrait avatar for the Anthropos City passport. Preserve facial likeness but render in unified digital brush/AI art style, not photo-realistic. Frontal view, gentle confidence, direct eye contact. Enhanced-reality art style: crisp, vibrant, digital brushwork with bright, balanced lighting. Background: soft gradient glow with subtle urban/digital city silhouettes. Eyes bright, engaged, natural, symmetric. Modern-casual clothing with subtle Limitless Lifestyle motif. Harmonious composition, balanced proportions. Progressive, inclusive, aspirational feel. Most importantly: preserve facial features accurately, no distortion or uncanny valley effects.Finally, inspect USER_SELFIE for visible personal accessories (e.g., glasses, piercings, jewellery, hats).  
Any accessory present in USER_SELFIE **must be reproduced faithfully** in the final avatar—shape, colour and position—*even if* STYLE_REFERENCE omits or conflicts with it.  
Do **not** add accessories that do not appear in USER_SELFIE, and do **not** remove ones that do.
`.trim();

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Set up proper SSE headers with connection keep-alive
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive', //says to remove for safari and http2
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no', // disables nginx / Cloudflare buffering
  });

  // Send initial connection event
  res.write('data: {"type":"connected"}\n\n');

  try {
    const { selfieBase64, styleBase64 } = req.body ?? {};
    if (!selfieBase64 || !styleBase64) {
      res.write('event: error\ndata: Missing base64 images\n\n');
      return res.end();
    }

    console.log('[avatar-gen] Starting avatar generation stream...');

    let lastPartial = '';
    const stream = await ai.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: PROMPT },
            {type:'input_text', text:'USER_SELFIE'},
            { type: 'input_image', image_url: `data:image/png;base64,${selfieBase64}`, detail: 'low' },
            {type:'input_text', text:'STYLE_REFERENCE'},
            { type: 'input_image', image_url: `data:image/png;base64,${styleBase64}`, detail: 'low' },

          ],
        },
      ],
      stream: true,
      tools: [{ type: "image_generation", partial_images: 3, moderation: "low", //quality: "high",  size: "1024x1024",      
      }],
    });

    let imageGenerationStarted = false;
    let streamCompleted = false;

    for await (const e of stream) {
      console.log('[avatar-gen] Received event:', e.type, JSON.stringify(e).substring(0, 200));
      
      // Handle image generation events
      if (e.type === 'response.image_generation_call.partial_image') {
        imageGenerationStarted = true;
        lastPartial = e.partial_image_b64;
        const partialIndex = e.partial_image_index || 0;
        console.log(`[avatar-gen] Partial ${partialIndex}`);
        
        // Send SSE event with proper formatting
        res.write(`event: partial\n`);
        res.write(`id: ${partialIndex}\n`);
        res.write(`data: ${lastPartial}\n\n`);
      }
      
      if (e.type === 'response.image_generation_call.completed') {
        imageGenerationStarted = true;
        // Use the correct field for the final image
        const finalB64 = (e as { image_generation_call?: { result?: string } }).image_generation_call?.result ?? lastPartial;
        console.log(`[avatar-gen] Generation completed`);
        
        res.write(`event: complete\n`);
        res.write(`data: ${finalB64}\n\n`);
        
        // Upload final image to R2
        console.log('[avatar-gen] Uploading to R2...');
        const url = await uploadFromUrlToTmp(`data:image/png;base64,${finalB64}`, 'png');
        console.log('[avatar-gen] Upload complete, URL:', url);
        
        res.write(`event: uploaded\n`);
        res.write(`data: ${url}\n\n`);
        console.log('[avatar-gen] Sent uploaded event with URL:', url);
      }
    }
    
    // After stream ends, check if image generation occurred
    streamCompleted = true;
    console.log('[avatar-gen] Stream completed, imageGenerationStarted:', imageGenerationStarted);
    
    if (!imageGenerationStarted) {
      console.log('[avatar-gen] No image generation occurred - OpenAI likely responded with text');
      res.write(`event: error\n`);
      res.write(`data: Unable to generate avatar from the provided images. Please ensure you're using two different images: one as your selfie and one as the style reference.\n\n`);
      return res.end();
    }
    
    // Send completion event
    res.write(`event: done\n`);
    res.write(`data: Stream completed\n\n`);
    res.end();
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('[avatar-gen] Error:', errorMessage);
    res.write(`event: error\n`);
    res.write(`data: ${errorMessage}\n\n`);
    res.end();
  }
}
