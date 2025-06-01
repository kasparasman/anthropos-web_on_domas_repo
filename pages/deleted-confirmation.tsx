import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function DeletedConfirmation() {
  return (
    <>
      <Head>
        <title>Account Deleted | Anthropos City</title>
        <meta name="description" content="Your account has been permanently deleted from Anthropos City" />
      </Head>
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-smoke p-4">
        <div className="max-w-md text-center space-y-6 bg-stone-900 p-8 rounded-xl border border-main">
          <h1 className="text-3xl font-bold text-main">Account Deleted</h1>
          
          <div className="space-y-4">
            <p className="text-lg">Your account has been permanently deleted from Anthropos City.</p>
            <p>As per our security policy, you cannot register a new account using the same face.</p>
            <p className="text-dim_smoke">This is an irreversible action for security and community protection.</p>
          </div>
          
          <Link 
            href="/" 
            className="block mt-8 px-6 py-2 bg-main text-black font-semibold rounded-lg hover:shadow-[0_0_24px_0_rgba(254,212,138,0.5)] transition-shadow"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </>
  );
} 