import { 
  IAvatarGenerationService, 
  AvatarStyle, 
  AvatarGenerationResult 
} from '../interfaces/IAvatarGenerationService';
import { OpenAI } from 'openai';
import { uploadFromUrlToTmp } from '../../uploadFromUrlToTmp';

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export class AvatarGenerationService implements IAvatarGenerationService {
  // Hardcoded styles from the existing codebase - could be moved to database later
  private maleStyles: AvatarStyle[] = [
    { id: 'male_classic', label: 'Classic', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/ChatGPT%20Image%20May%2024%2C%202025%2C%2010_39_50%20AM.png', gender: 'male' },
    { id: 'male_creative', label: 'Creative', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2026%2C%202025%2C%2009_13_57%20PM.png', gender: 'male' },
    { id: 'male_reader', label: 'Reader', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_21_29%20AM.png', gender: 'male' },
    { id: 'male_sportsman', label: 'Sportsman', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_02%20AM.png', gender: 'male' },
    { id: 'male_cyberman', label: 'CyberMan', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_14%20AM.png', gender: 'male' },
    { id: 'male_lead', label: 'The Lead', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_22_31%20AM.png', gender: 'male' },
    { id: 'male_socialist', label: 'Socialist', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20May%2027%2C%202025%2C%2009_27_58%20AM.png', gender: 'male' },
    { id: 'male_techie', label: 'Techie', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/tmp/ChatGPT%20Image%20May%2024%2C%202025%2C%2010_39_50%20AM.png', gender: 'male' }
  ];

  private femaleStyles: AvatarStyle[] = [
    { id: 'female_classic', label: 'Classic', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_30%20AM.png', gender: 'female' },
    { id: 'female_sporty', label: 'Sporty', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_36%20AM.png', gender: 'female' },
    { id: 'female_casual', label: 'Casual', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2012_37_15%20PM.png', gender: 'female' },
    { id: 'female_hipster', label: 'Hipster', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_44%20AM.png', gender: 'female' },
    { id: 'female_elegant', label: 'Elegant', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_48%20AM.png', gender: 'female' },
    { id: 'female_adventurer', label: 'Adventurer', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_51%20AM.png', gender: 'female' },
    { id: 'female_artist', label: 'Artist', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2011_54_54%20AM.png', gender: 'female' },
    { id: 'female_techie', label: 'Techie', styleImageUrl: 'https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/ChatGPT%20Image%20Jun%201%2C%202025%2C%2012_36_58%20PM.png', gender: 'female' }
  ];

  async generateAvatar(
    faceImageUrl: string, 
    styleImageUrl: string, 
    userId: string
  ): Promise<AvatarGenerationResult> {
    try {
      // Convert images to base64
      const [faceBase64, styleBase64] = await Promise.all([
        this.urlToBase64(faceImageUrl),
        this.urlToBase64(styleImageUrl)
      ]);

      // Use the same prompt as the existing avatar-gen endpoint
      const PROMPT = `I attach you two images in base64 url format, first one is regular selfie which you should use as base, second is style reference image which style you should merge onto the selfie, transforming the person in the selfie with the style. That includes: background from style image, theme, colour pallete, accessories, emotion, effects. Transform this selfie with the reference style. Create a digital portrait avatar for the Anthropos City passport. Preserve facial likeness but render in unified digital brush/AI art style, not photo-realistic. Frontal view, gentle confidence, direct eye contact. Enhanced-reality art style: crisp, vibrant, digital brushwork with bright, balanced lighting. Background: soft gradient glow with subtle urban/digital city silhouettes. Eyes bright, engaged, natural, symmetric. Modern-casual clothing with subtle Limitless Lifestyle motif. Harmonious composition, balanced proportions. Progressive, inclusive, aspirational feel. Most importantly: preserve facial features accurately, no distortion or uncanny valley effects.Finally, inspect USER_SELFIE for visible personal accessories (e.g., glasses, piercings, jewellery, hats). Any accessory present in USER_SELFIE **must be reproduced faithfully** in the final avatar—shape, colour and position—*even if* STYLE_REFERENCE omits or conflicts with it. Do **not** add accessories that do not appear in USER_SELFIE, and do **not** remove ones that do.`.trim();

      const stream = await ai.responses.create({
        model: 'gpt-4.1',
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: PROMPT },
              { type: 'input_text', text: 'USER_SELFIE' },
              { type: 'input_image', image_url: `data:image/png;base64,${faceBase64}`, detail: 'low' },
              { type: 'input_text', text: 'STYLE_REFERENCE' },
              { type: 'input_image', image_url: `data:image/png;base64,${styleBase64}`, detail: 'low' },
            ],
          },
        ],
        stream: true,
        tools: [{ type: "image_generation", partial_images: 3, moderation: "low" }],
      });

      let finalImageB64: string | null = null;
      let lastPartial = '';

      for await (const e of stream) {
        if (e.type === 'response.image_generation_call.partial_image') {
          lastPartial = e.partial_image_b64;
        }
        
        if (e.type === 'response.image_generation_call.completed') {
          finalImageB64 = (e as { image_generation_call?: { result?: string } }).image_generation_call?.result ?? lastPartial;
          break;
        }
      }

      if (!finalImageB64) {
        throw new Error('Avatar generation failed - no image produced');
      }

      // Upload to R2 storage
      const avatarUrl = await uploadFromUrlToTmp(`data:image/png;base64,${finalImageB64}`, 'png');

      return {
        avatarUrl,
        generationId: `avatar_${userId}_${Date.now()}`
      };

    } catch (error) {
      console.error('[AvatarGenerationService] Generation failed:', error);
      throw new Error(`Avatar generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAvailableStyles(gender?: 'male' | 'female'): Promise<AvatarStyle[]> {
    if (gender === 'male') return this.maleStyles;
    if (gender === 'female') return this.femaleStyles;
    return [...this.maleStyles, ...this.femaleStyles];
  }

  async checkGenerationStatus(generationId: string): Promise<string | null> {
    // For now, assume immediate completion since we're doing synchronous generation
    // In a more complex setup, this could check a database or queue status
    return null;
  }

  private async urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  }
} 