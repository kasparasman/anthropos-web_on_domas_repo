const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });



// Create a custom token for testing
async function generateTestToken() {
  try {
    // Create a test user ID or use an existing one
    const uid = process.argv[2] || 'test-useddr-2773';
    const email = process.argv[3] || 'testinddging@example.com';
    
    console.log(`Generating token for user: ${uid} (${email})`);
    
    // Create a custom token
    const customToken = await admin.auth().createCustomToken(uid, {
      email: email
    });
    
    console.log('\n==== CUSTOM TOKEN ====');
    console.log(customToken);
    console.log('==== END CUSTOM TOKEN ====\n');
    
    console.log('This is a CUSTOM token that needs to be exchanged for an ID token');
    console.log('To convert to an ID token for API testing, you need to:');
    console.log('1. Use the Firebase Client SDK to exchange this custom token');
    console.log('2. Or use a test endpoint to perform the exchange server-side');
    
  } catch (error) {
    console.error('Error generating token:', error);
  }
}

// Run the function
generateTestToken();