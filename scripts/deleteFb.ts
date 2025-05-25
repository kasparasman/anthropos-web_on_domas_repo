import 'dotenv/config';
import { auth } from 'firebase-admin';

// Validate env vars before importing firebase-admin
const { NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
if (!NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('Env var NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing');
  process.exit(1);
}
if (!FIREBASE_CLIENT_EMAIL) {
  console.error('Env var FIREBASE_CLIENT_EMAIL is missing');
  process.exit(1);
}
if (!FIREBASE_PRIVATE_KEY) {
  console.error('Env var FIREBASE_PRIVATE_KEY is missing');
  process.exit(1);
}

// Dynamically import firebase-admin AFTER env vars are confirmed
const { admin } = await import('../lib/firebase-admin.js');

async function deleteAllUsers(nextPageToken?: string) {
  const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
  const uids = listUsersResult.users.map((user: auth.UserRecord) => user.uid);

  if (uids.length) {
    await admin.auth().deleteUsers(uids);
    console.log(`Deleted ${uids.length} users`);
  }

  if (listUsersResult.pageToken) {
    await deleteAllUsers(listUsersResult.pageToken);
  }
}

await deleteAllUsers();
console.log('All Firebase users deleted!');
process.exit(0);