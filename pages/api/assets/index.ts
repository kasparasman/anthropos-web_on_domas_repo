import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

type AssetRecord = {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string;
  websiteUrl: string | null;
  totalInvestment: number;
  tokenCount: number;
  order: number;
  isActive: boolean;
};

type SumResult = {
  total: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET /api/assets - Get all assets
  if (req.method === 'GET') {
    try {
      const assets = await prisma.$queryRaw<AssetRecord[]>`
        SELECT id, name, description, "logoUrl", "websiteUrl", 
               "totalInvestment", "tokenCount", "order", "isActive"
        FROM assets
        WHERE "isActive" = true
        ORDER BY "order" ASC
      `;
      
      const totalInvestment = await prisma.$queryRaw<SumResult[]>`
        SELECT SUM("totalInvestment") as total FROM assets WHERE "isActive" = true
      `;
      
      const totalTokens = await prisma.$queryRaw<SumResult[]>`
        SELECT SUM("tokenCount") as total FROM assets WHERE "isActive" = true
      `;
      
      return res.status(200).json({
        assets,
        stats: {
          totalInvestment: totalInvestment[0]?.total ? parseFloat(totalInvestment[0].total) : 0,
          totalTokens: totalTokens[0]?.total ? parseFloat(totalTokens[0].total) : 0,
          assetCount: assets.length
        }
      });
    } catch (error) {
      console.error('Error fetching assets:', error);
      return res.status(500).json({ error: 'Failed to fetch assets' });
    }
  }

  // POST /api/assets - Create a new asset (admin only)
  if (req.method === 'POST') {
    // Check for admin authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Only allow admin (You would have proper admin check here)
    // For now, we're simply requiring authentication
    
    try {
      const {
        name,
        description,
        logoUrl,
        websiteUrl,
        totalInvestment,
        tokenCount,
        order,
        isActive
      } = req.body;
      
      if (!name || !logoUrl) {
        return res.status(400).json({ error: 'Name and logo URL are required' });
      }
      
      // Create the asset using raw SQL to avoid Prisma client issues
      await prisma.$executeRaw`
        INSERT INTO assets (
          id, name, description, "logoUrl", "websiteUrl", 
          "totalInvestment", "tokenCount", "order", "isActive",
          "createdAt", "lastModifiedAt"
        ) VALUES (
          gen_random_uuid(), ${name}, ${description || null}, ${logoUrl}, ${websiteUrl || null},
          ${totalInvestment || 0}, ${tokenCount || 0}, ${order || 0}, ${isActive !== false},
          NOW(), NOW()
        )
      `;
      
      return res.status(201).json({ success: true, message: 'Asset created successfully' });
    } catch (error) {
      console.error('Error creating asset:', error);
      return res.status(500).json({ error: 'Failed to create asset' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 