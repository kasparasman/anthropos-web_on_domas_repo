/**
 * Seed script for adding initial assets to the database
 * Run with: npx ts-node scripts/seed-assets.ts
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed assets...');

  // First, clear existing assets
  await prisma.$executeRaw`TRUNCATE TABLE assets RESTART IDENTITY CASCADE`;
  
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
    console.log(`Added asset: ${asset.name}`);
  }

  console.log(`Seeded ${assets.length} assets successfully!`);
}

main()
  .catch((e) => {
    console.error('Error seeding assets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 