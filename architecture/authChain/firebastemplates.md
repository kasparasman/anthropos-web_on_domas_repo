Email adress verification: firebase
password reset: firebase
email adress change: firebase

Email adress verification:

This logic will obviously only work on register, so:
After a user successfully creates an account using createUserWithEmailAndPassword , you immediately send them a verification email. -> Send the Verification Email: You call the sendEmailVerification() method on that User object.
This is client side, and the + emailverified is also client side. 
Now we need to decide on the archietcture of this app:

Flow:
We can do the before hand email verification by creating email only account - but this is not the best way to do it.
More in flow way would be to allow user to create account, pass neon, firebase steps and then before payment, get sent the email verification - then we show the state of "sending email verification..." to user as better UX.
Then we either get a webhook or polling to backend from here, once verified - we continue the chain flow. - iF not successful after timeout, we abort the operation - show toast, rollback and delete the created left over account.


The decided fast to ship flow: 
WE send email ver, then set a timer, call await auth.currentUser.reload() and check if auth.currentUser.emailVerified is true.
If it's true , clear the timer, update the UI, and proceed with the flow.
If not, logic as above mentioned - stop the flow and show error + rollback.

- Decision reversed because we use next auth.


Logic finalization:
Creating Cloud firestore - done
The main flow: 
user passes the firebase accuont creation up to firebase email verification point, then we call the email verification function -> Show the state in the register page verifying email..., then email link is sent to user, once clicks -> updates status gets read by firebase authenthification,  Writes Status -- Cloud Function (onAuthUpdate) -> Real-time Listener --- Firestore - getting back to regsiter page, if all good we further on move the chain if not we rollback and show error, meaning the verification failed.

Integration into the register page:
The handle handleGeneratePassport is the key function here:
we registrate the user with:       const cred = await registerClient(email, password);
      idToken = await cred.user.getIdToken();
; This calls: createUserWithEmailAndPassword; then we pass this to /api/auth/setup-registration; 
Here the endpoint takes over verifying the firebase token, with which the work in firebase is finished.

The thing is that we might need to isolate firebase token verification as a seperate backend endpoint, to not inrerupts

This previously mentioned archeitecture is faulty since bad assumptions were made about firebase libs, the functions are not there. 

New archeitecture proposal:

User clicks verify link in email -> our page: 
await applyActionCode(auth, oobCode); // tells Auth “e-mail verified”

We call the function 
httpsCallable(getFunctions(undefined, 'europe-west1'), 'markVerified');

google cloud function:
      export const markVerified = onCall(
      { region: 'europe-west1' },
      async (request): Promise<void> => {
      const uid = request.auth?.uid;
      if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Not signed in');

      // 1. Write Firestore
      await db.doc(`userVerificationStatus/${uid}`).set(
            {
            emailVerified: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
      );

      // 2. Add a custom claim so future ID-tokens carry `isVerified: true`
      await admin.auth().setCustomUserClaims(uid, { isVerified: true });

WE also add seperate backedn token verification middleware:


export async function verifyFirebaseIdToken(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  try {
    const idToken =
      req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split('Bearer ')[1]
        : req.cookies.token;                             // fallback
    if (!idToken) throw new Error('No token');

    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.isVerified) throw new Error('EMAIL_NOT_VERIFIED');   // block early
    (req as any).user = decoded;                                     // attach uid etc.
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  }
}



main flow revisited:

 | 1. Client registers user (createUserWithEmailAndPassword)                     |
 | 2. Client writes userVerificationStatus/{uid} (emailVerified:false)           |
 | 3. Client sendsEmailVerification(continueUrl=/verify-email)                  |
 | 4. Client signOut(); show “Waiting for e-mail verification …”                 |
 | 5. Client onSnapshot(userVerificationStatus/{uid}) → waiting                 |


User gets email and clicks link:
lands on our page: verifyEmail, we grab the oobCode:
| 7. applyActionCode(oobCode)  ➜ Auth backend sets email_verified=true          |
| 8. callable markVerified()   ➜ {emailVerified:true, updatedAt:…} in Firestore |
|                              ➜ sets custom claim {isVerified:true}            |
The markverified is our cloud function.

futher on:
| 9. Firestore listener in the first tab fires (emailVerified:true)             |
|10. Client clears timeout ➜ handleVerificationSuccess()                        |
|11. keep going with the rest of your registration chain (OUR LOGIC IN setup-registration endpoint which will need to be altered to accept this intermediate verification step.)           |
└─────────────────────────────────────────────────────────────────────────────────┘

next moving on the integration into the register page is this:

We first create user account which auto signins the user, then we 

// 2. pre-create status doc *as* the signed-in user
await setDoc(doc(db, 'userVerificationStatus', cred.user.uid), {
  emailVerified: false,
  createdAt: serverTimestamp(),
});
// 3. send verification e-mail
await sendEmailVerification(cred.user, {
  url: `${window.location.origin}/verify-email`,   // your custom page
});

// 5. sign out *after* the writes
await auth.signOut();           // now local Firebase session is gone

// 6. kick off UI: start onSnapshot listener, show “waiting…”
setIsWaitingForVerification(true);

after calling markVerified() we can signout the firebase