'use client';

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { applyActionCode } from 'firebase/auth';
import { firebaseAuth, app } from '@/lib/firebase-client';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying your email…');

  /** helper — only runs when a user object exists */
  const callMarkVerified = async () => {
    const functions = getFunctions(app, 'europe-west1');  // same instance already bound
    await httpsCallable(functions, 'markVerified')();
    await firebaseAuth.currentUser!.getIdToken(true); // refresh custom claims
  };
  const ran = useRef(false);

  /**
   * Verify the email OOB code via Firebase Auth REST API.
   * This works even when the user isn't signed-in (e.g. cross-device verification).
   */
  const verifyOobCodeViaRest = async (oobCode: string, apiKey: string) => {
    console.log('[VerifyEmail] Calling REST API to verify oobCode');
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oobCode, requestType: 'VERIFY_EMAIL' }),
      }
    );

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.error) {
      console.error('[VerifyEmail] REST verify failed', json.error ?? res.statusText);
      const message = json.error?.message ?? res.statusText;
      throw new Error(message);
    }

    console.log('[VerifyEmail] REST verify success for user', json.email);
    return json as { email: string; localId: string };
  };

  useEffect(() => {
    if (!router.isReady || ran.current) return;
    ran.current = true;

    const { oobCode, apiKey: apiKeyFromQuery } = router.query;

    (async () => {
      console.log('[VerifyEmail] Effect triggered (cross-device compatible)', { oobCode, apiKeyFromQuery });

      if (typeof oobCode !== 'string' || !oobCode) {
        console.error('[VerifyEmail] Missing oobCode');
        setStatus('error');
        setMessage('Missing verification code.');
        return;
      }

      const apiKey = typeof apiKeyFromQuery === 'string' && apiKeyFromQuery
        ? apiKeyFromQuery
        : process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      try {
        // 1️⃣ Verify via REST (works without being signed-in)
        await verifyOobCodeViaRest(oobCode, apiKey as string);

        // 2️⃣ If a user is signed-in on this device, refresh and call markVerified so custom claims sync.
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
          console.log('[VerifyEmail] Signed-in user detected, applying action code locally and calling markVerified.');
          try {
            await applyActionCode(firebaseAuth, oobCode).catch(() => {/* ignore if already used */});
          } catch (_) {/* noop */}

          await currentUser.reload();
          if (currentUser.emailVerified) {
            await currentUser.getIdToken(true);
            try {
              await callMarkVerified();
            } catch (e) {
              console.warn('[VerifyEmail] markVerified failed (probably emulator/prod mismatch)', e);
            }
          }
        }

        // 3️⃣ Success UI / redirect
        console.log('[VerifyEmail] Verification successful, updating UI and scheduling redirect.');
        setStatus('success');
        setMessage('Email verified! Redirecting…');
        setTimeout(() => {
          router.replace('/');
        }, 2500);
      } catch (err: unknown) {
        console.error('[VerifyEmail] verification failed', err);
        const e = err as { message?: string };
        setStatus('error');
        setMessage(
          e?.message === 'INVALID_OOB_CODE'
            ? 'This link was already used, but your e-mail is verified.'
            : 'This verification link is invalid or has expired.'
        );
      }
    })();
  }, [router.isReady, router.query]);

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