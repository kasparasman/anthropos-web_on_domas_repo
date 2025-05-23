-- Insert 10 mock topics with video URLs
INSERT INTO topics (id, title, body, "videoUrl", "createdAt") VALUES
(
  gen_random_uuid(), 
  'Introduction to Web3 Gaming',
  'Exploring the intersection of blockchain technology and gaming. How NFTs and cryptocurrencies are reshaping the gaming industry.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  NOW() - INTERVAL '10 days'
),
(
  gen_random_uuid(),
  'DeFi Explained: Yield Farming Basics',
  'A comprehensive guide to understanding yield farming in DeFi protocols. Learn about liquidity pools and earning strategies.',
  'https://www.youtube.com/watch?v=Y_OLslE3bX8',
  NOW() - INTERVAL '9 days'
),
(
  gen_random_uuid(),
  'NFT Art Revolution',
  'How digital artists are leveraging blockchain technology to monetize their work and create unique digital experiences.',
  'https://www.youtube.com/watch?v=6Pn-NOQ9688',
  NOW() - INTERVAL '8 days'
),
(
  gen_random_uuid(),
  'Smart Contract Security Best Practices',
  'Essential security considerations when developing and auditing smart contracts. Common vulnerabilities and how to avoid them.',
  'https://www.youtube.com/watch?v=gyMwXuJrbJQ',
  NOW() - INTERVAL '7 days'
),
(
  gen_random_uuid(),
  'Layer 2 Scaling Solutions',
  'Comparing different Layer 2 scaling solutions: Rollups, Sidechains, and State Channels. Which one is right for your project?',
  'https://www.youtube.com/watch?v=7pWxCklcNsU',
  NOW() - INTERVAL '6 days'
),
(
  gen_random_uuid(),
  'DAO Governance Models',
  'Different approaches to decentralized governance. Case studies of successful DAOs and their decision-making processes.',
  'https://www.youtube.com/watch?v=M576WGiDBdQ',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  'Tokenomics Design Patterns',
  'Understanding token economics: supply mechanisms, incentive structures, and value accrual in crypto projects.',
  'https://www.youtube.com/watch?v=1YyAzVmP9xQ',
  NOW() - INTERVAL '4 days'
),
(
  gen_random_uuid(),
  'Cross-chain Interoperability',
  'How different blockchain networks communicate and transfer assets. Overview of bridge protocols and their security models.',
  'https://www.youtube.com/watch?v=_Nlq_YE6Q9w',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  'Zero-Knowledge Proofs in DeFi',
  'Implementing privacy in decentralized finance using zero-knowledge proofs. Technical deep dive into zk-SNARKs.',
  'https://www.youtube.com/watch?v=HJ9K_o-RRSY',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'Sustainable Blockchain Networks',
  'Exploring energy-efficient consensus mechanisms and their impact on network security and decentralization.',
  'https://www.youtube.com/watch?v=0RTgBYL4-sA',
  NOW() - INTERVAL '1 day'
); 