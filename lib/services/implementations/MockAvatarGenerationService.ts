import { 
  IAvatarGenerationService, 
  AvatarStyle, 
  AvatarGenerationResult 
} from '../interfaces/IAvatarGenerationService';

export class MockAvatarGenerationService implements IAvatarGenerationService {
  // Same style definitions as the real service for consistency
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

  // Collection of placeholder avatar URLs for different genders and styles
  private mockAvatars = {
    male: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    ],
    female: [
      'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    ]
  };

  async generateAvatar(
    faceImageUrl: string, 
    styleImageUrl: string, 
    userId: string
  ): Promise<AvatarGenerationResult> {
    console.log('[MockAvatarGenerationService] Generating mock avatar for user:', userId);
    console.log('[MockAvatarGenerationService] Face URL:', faceImageUrl);
    console.log('[MockAvatarGenerationService] Style URL:', styleImageUrl);

    // Simulate some processing time (1-3 seconds)
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Determine gender from style URL or randomly pick
    const isFemaleStyle = styleImageUrl.includes('female') || styleImageUrl.includes('Jun%201');
    const gender = isFemaleStyle ? 'female' : 'male';
    
    // Pick a random mock avatar from the appropriate gender
    const availableAvatars = this.mockAvatars[gender];
    const randomIndex = Math.floor(Math.random() * availableAvatars.length);
    const avatarUrl = availableAvatars[randomIndex];

    const generationId = `mock_avatar_${userId}_${Date.now()}`;

    console.log(`[MockAvatarGenerationService] Generated mock ${gender} avatar:`, avatarUrl);

    return {
      avatarUrl,
      generationId
    };
  }

  async getAvailableStyles(gender?: 'male' | 'female'): Promise<AvatarStyle[]> {
    // Return the same styles as the real service for consistency
    if (gender === 'male') return this.maleStyles;
    if (gender === 'female') return this.femaleStyles;
    return [...this.maleStyles, ...this.femaleStyles];
  }

  async checkGenerationStatus(generationId: string): Promise<string | null> {
    // Mock service assumes immediate completion
    console.log('[MockAvatarGenerationService] Checking generation status for:', generationId);
    return null; // Indicates completed
  }
} 