'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { applyActionCode, getAuth } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase-client';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Email verification landing page.
 * Users are redirected here by the Firebase email-verification link (action code URL).
 * The page applies the verification code, shows feedback, and sends users back home.
 */
export default function VerifyEmailPage() {
  const router = useRouter();

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('Verifying your email…');

  useEffect(() => {
    if (!router.isReady) return;

    const { oobCode, mode } = router.query;

    // Sanity checks
    if (typeof oobCode !== 'string' || mode !== 'verifyEmail') {
      setStatus('error');
      setMessage('Invalid or missing verification link.');
      return;
    }

    (async () => {
      try {
        await applyActionCode(firebaseAuth, oobCode);
        // call cloud function
        const functions = getFunctions(undefined, 'europe-west1');
        const markVerified = httpsCallable(functions, 'markVerified');
        await markVerified();

        // Force-refresh ID-token so next page load has the isVerified claim
        await firebaseAuth.currentUser?.getIdToken(true);

        setStatus('success');
        setMessage('Email verified! Redirecting you…');
        // Give users a moment to read the message, then send them home.
        setTimeout(() => {
          router.replace('/');
        }, 2500);
      } catch (err) {
        console.error('[VerifyEmail] applyActionCode error:', err);
        setStatus('error');
        setMessage('This verification link is invalid or has expired.');
      }
    })();
  }, [router]);

  return (
    <>
      <Head>
        <title>Email Verification – Anthropos City</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 gap-6 text-center">
        {/* Glow background circle */}
        <div className="absolute w-80 h-80 rounded-full bg-main opacity-20 blur-3xl" />

        {status === 'pending' && (
          <>
            <h1 className="text-2xl font-semibold">Verifying…</h1>
            <p className="text-sm text-neutral-400 max-w-sm">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-semibold text-main">Success!</h1>
            <p className="text-sm text-neutral-300 max-w-sm">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-semibold text-red-500">Verification Failed</h1>
            <p className="text-sm text-neutral-400 max-w-sm">{message}</p>
            <button
              className="mt-4 rounded-md border border-main px-4 py-2 text-main hover:bg-main hover:text-black transition-all"
              onClick={() => router.replace('/')}
            >
              Return Home
            </button>
          </>
        )}
      </main>
    </>
  );
} 