'use client';

import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { applyActionCode, onAuthStateChanged } from 'firebase/auth';
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

  useEffect(() => {
    if (!router.isReady || ran.current) return;
    ran.current = true;
  
    const { oobCode } = router.query;

    console.log('[VerifyEmail] Effect triggered, router ready:', router.isReady, 'query:', router.query);
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      console.log('[VerifyEmail] onAuthStateChanged fired. user:', user);
      unsub(); // run once
      try {
        console.log('[VerifyEmail] Handler start');

        // Production path: apply the code if present
        if (typeof oobCode === 'string' && oobCode) {
          console.log('[VerifyEmail] oobCode present, applying action code:', oobCode);
          await applyActionCode(firebaseAuth, oobCode).catch((err) => {
            if ((err as { code?: string }).code !== 'auth/invalid-action-code') throw err;
            console.log('[VerifyEmail] Action code already used, continuing.');
          });
        } else {
          console.log('[VerifyEmail] No oobCode present, emulator/auto path.');
        }

        // Ensure we have a signed-in user and the flag is set
        if (!user) {
          console.warn('[VerifyEmail] No current user after auth hydration.');
          throw new Error('no-current-user');
        }

        console.log('[VerifyEmail] Reloading user to check emailVerified.');
        await user.reload();
        if (!user.emailVerified) {
          console.warn('[VerifyEmail] User not email verified after reload.');
          throw new Error('email-not-verified');
        }
        await user.getIdToken(true);


        // Call Cloud Function for both prod & emulator flows
        console.log('[VerifyEmail] Calling markVerified cloud function.');
        await callMarkVerified();

        console.log('[VerifyEmail] Verification successful, updating UI and scheduling redirect.');
        setStatus('success');
        setMessage('Email verified! Redirecting…');
        setTimeout(() => {
          console.log('[VerifyEmail] Redirecting to home.');
          router.replace('/');
        }, 2500);
      } catch (err: unknown) {
        console.error('[VerifyEmail] verification failed', err);
        const e = err as { code?: string };
        setStatus('error');
        setMessage(
          e?.code === 'auth/invalid-action-code'
            ? 'This link was already used, but your e-mail is verified.'
            : 'This verification link is invalid or has expired.'
        );
      }
    });

    return () => unsub();
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