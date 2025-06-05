import { 
  IPassportGeneratorService, 
  PassportData, 
  PassportAsset 
} from '../interfaces/IPassportGeneratorService';
import { uploadFromUrlToTmp } from '../../uploadFromUrlToTmp';
import { prisma } from '../../prisma';

export class PassportGeneratorService implements IPassportGeneratorService {
  async generatePassport(passportData: PassportData): Promise<PassportAsset> {
    try {
      // For now, create a simple HTML-based passport that can be converted to image
      // In production, this could use Canvas API, Puppeteer, or a specialized image generation service
      
      const passportHtml = this.generatePassportHtml(passportData);
      
      // TODO: Convert HTML to image (could use Puppeteer, Canvas, or external service)
      // For now, we'll create a placeholder URL and return it
      const passportId = `passport_${passportData.userId}_${Date.now()}`;
      
      // In a real implementation, you would:
      // 1. Use Puppeteer to screenshot the HTML
      // 2. Or use Canvas API to draw the passport
      // 3. Or call an external image generation service
      // 4. Upload the generated image to R2 storage
      
      // Placeholder implementation - in reality you'd generate and upload the actual passport image
      const passportUrl = await this.createPlaceholderPassport(passportData, passportId);
      
      return {
        passportUrl,
        passportId,
        metadata: {
          width: 1200,
          height: 800,
          format: 'png',
          generatedAt: new Date()
        }
      };

    } catch (error) {
      console.error('[PassportGeneratorService] Generation failed:', error);
      throw new Error(`Passport generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCitizenId(userId: string): Promise<number> {
    // Get the user's citizen ID from their profile
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { citizenId: true }
    });

    if (!profile || !profile.citizenId) {
      throw new Error(`Citizen ID not found for user: ${userId}`);
    }

    return profile.citizenId;
  }

  async validatePassportData(passportData: PassportData): Promise<boolean> {
    // Basic validation
    if (!passportData.userId || !passportData.email || !passportData.nickname) {
      throw new Error('Missing required passport data: userId, email, or nickname');
    }

    if (!passportData.avatarUrl) {
      throw new Error('Avatar URL is required for passport generation');
    }

    if (!passportData.citizenId) {
      throw new Error('Citizen ID is required for passport generation');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(passportData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate nickname length
    if (passportData.nickname.length < 2 || passportData.nickname.length > 50) {
      throw new Error('Nickname must be between 2 and 50 characters');
    }

    return true;
  }

  private generatePassportHtml(data: PassportData): string {
    // Format the citizen ID as AC-NNNN for display
    const formattedCitizenId = `AC-${data.citizenId.toString().padStart(6, '0')}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #fff;
            width: 1160px;
            height: 760px;
            overflow: hidden;
          }
          .passport {
            width: 100%;
            height: 100%;
            border: 3px solid #FFD700;
            border-radius: 15px;
            background: linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%);
            position: relative;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
          }
          .header {
            text-align: center;
            padding: 30px;
            border-bottom: 2px solid #FFD700;
            background: linear-gradient(90deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%);
          }
          .title {
            font-size: 32px;
            font-weight: bold;
            color: #FFD700;
            margin-bottom: 10px;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          .subtitle {
            font-size: 18px;
            color: #ccc;
          }
          .content {
            display: flex;
            padding: 40px;
            height: calc(100% - 200px);
          }
          .left-section {
            flex: 1;
            padding-right: 40px;
          }
          .right-section {
            flex: 1;
            padding-left: 40px;
            border-left: 1px solid #333;
          }
          .avatar {
            width: 200px;
            height: 200px;
            border-radius: 15px;
            border: 3px solid #FFD700;
            margin-bottom: 30px;
            object-fit: cover;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          }
          .field {
            margin-bottom: 25px;
          }
          .field-label {
            font-size: 14px;
            color: #888;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .field-value {
            font-size: 18px;
            color: #fff;
            font-weight: 600;
            padding: 8px 12px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 5px;
            border-left: 3px solid #FFD700;
          }
          .citizen-id {
            font-size: 24px;
            font-weight: bold;
            color: #FFD700;
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            background: rgba(255, 215, 0, 0.1);
            border-radius: 10px;
            border: 2px solid #FFD700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
        </style>
      </head>
      <body>
        <div class="passport">
          <div class="header">
            <div class="title">ANTROPOS CITY</div>
            <div class="subtitle">Digital Citizen Passport</div>
          </div>
          <div class="content">
            <div class="left-section">
              <img src="${data.avatarUrl}" alt="Avatar" class="avatar" />
              <div class="field">
                <div class="field-label">Citizen Name</div>
                <div class="field-value">${data.nickname}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${data.email}</div>
              </div>
            </div>
            <div class="right-section">
              <div class="field">
                <div class="field-label">Issue Date</div>
                <div class="field-value">${data.issueDate.toLocaleDateString()}</div>
              </div>
              <div class="field">
                <div class="field-label">Status</div>
                <div class="field-value">Active Citizen</div>
              </div>
              <div class="field">
                <div class="field-label">Verification</div>
                <div class="field-value">Biometric Verified</div>
              </div>
              <div class="citizen-id">${formattedCitizenId}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async createPlaceholderPassport(data: PassportData, passportId: string): Promise<string> {
    // This is a placeholder implementation
    // In production, you would use the HTML above with Puppeteer or similar to generate an actual image
    
    // Format the citizen ID as AC-NNNN for display
    const formattedCitizenId = `AC-${data.citizenId.toString().padStart(6, '0')}`;
    
    // For now, return a placeholder URL that could be used for the passport
    // You could also generate a simple image using Canvas API or similar
    const placeholderData = {
      type: 'passport',
      userId: data.userId,
      citizenId: formattedCitizenId,
      nickname: data.nickname,
      email: data.email,
      avatarUrl: data.avatarUrl,
      issueDate: data.issueDate.toISOString(),
      passportId
    };

    // Convert to a data URL or upload to storage
    // For this implementation, we'll create a simple text-based "passport" as a placeholder
    const passportText = `ANTROPOS CITY PASSPORT\n\nCitizen: ${data.nickname}\nID: ${formattedCitizenId}\nEmail: ${data.email}\nIssued: ${data.issueDate.toLocaleDateString()}`;
    
    // In a real implementation, this would be an actual image file uploaded to R2
    return `data:text/plain;base64,${Buffer.from(passportText).toString('base64')}`;
  }
} 