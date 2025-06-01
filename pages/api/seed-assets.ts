import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// This endpoint will only work in development mode
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Prevent running in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if we already have assets
    const count = await prisma.$queryRaw<[{count: number}]>`
      SELECT COUNT(*) as count FROM assets
    `;
    
    if (count[0].count > 0) {
      return res.status(200).json({ message: 'Assets already exist', count: count[0].count });
    }

    // Define some initial assets
    const assets = [
      {
        name: 'Anthropos Bank',
        description: 'Central financial institution of Anthropos City',
        logoUrl: '/assets/logos/bank.svg',
        websiteUrl: 'https://bank.anthropos.city',
        totalInvestment: 12500000,
        tokenCount: 25000,
        order: 1,
      },
      {
        name: 'City Energy',
        description: 'Sustainable energy provider for the citizens',
        logoUrl: '/assets/logos/energy.svg',
        websiteUrl: 'https://energy.anthropos.city',
        totalInvestment: 8750000,
        tokenCount: 17500,
        order: 2,
      },
      {
        name: 'Digital Transit',
        description: 'Modern public transportation network',
        logoUrl: '/assets/logos/transit.svg',
        websiteUrl: 'https://transit.anthropos.city',
        totalInvestment: 5000000,
        tokenCount: 10000,
        order: 3,
      },
      {
        name: 'Health Services',
        description: 'City-wide healthcare system',
        logoUrl: '/assets/logos/health.svg',
        websiteUrl: 'https://health.anthropos.city',
        totalInvestment: 7250000,
        tokenCount: 14500,
        order: 4,
      },
      {
        name: 'Education Center',
        description: 'Educational institutions and research',
        logoUrl: '/assets/logos/education.svg',
        websiteUrl: 'https://education.anthropos.city',
        totalInvestment: 4500000,
        tokenCount: 9000,
        order: 5,
      },
    ];

    // Insert assets
    for (const asset of assets) {
      await prisma.$executeRaw`
        INSERT INTO assets (
          id, name, description, "logoUrl", "websiteUrl", 
          "totalInvestment", "tokenCount", "order", "isActive",
          "createdAt", "lastModifiedAt"
        ) VALUES (
          gen_random_uuid(), ${asset.name}, ${asset.description}, ${asset.logoUrl}, ${asset.websiteUrl},
          ${asset.totalInvestment}, ${asset.tokenCount}, ${asset.order}, true,
          NOW(), NOW()
        )
      `;
    }

    return res.status(200).json({ 
      success: true, 
      message: `Seeded ${assets.length} assets successfully!` 
    });
  } catch (error) {
    console.error('Error seeding assets:', error);
    return res.status(500).json({ error: 'Failed to seed assets' });
  }
} 