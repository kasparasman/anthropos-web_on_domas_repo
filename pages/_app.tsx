// pages/_app.tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../hooks/useFirebaseNextAuth'
import { RegistrationStatusProvider } from '../hooks/useRegistrationStatus'
import MandatoryProfileCompletion from '../components/global/MandatoryProfileCompletion'
import AuthModal from '../components/auth/AuthModal'
import { AuthModalManagerProvider, useAuthModalManager } from '../contexts/AuthModalManagerContext'
import { useEffect } from 'react'
import Toaster from '../components/Toaster'
import GridWithRays from '../components/GridWithRays'
import CookieConsent from 'react-cookie-consent'
import Footer from '../components/Footer'


// Load Google fonts and assign to CSS variables
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

function AppContent({ Component, pageProps, router }: AppProps) {
  const { state: authModalState, closeAuthModal, setMode } = useAuthModalManager();

  useEffect(() => {
    console.log('[AppContent] MOUNTED/RE-MOUNTED');
    return () => {
      console.log('[AppContent] UNMOUNTING');
    };
  }, []);

  const hideNavbarOn = ['/register2'];

  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PKQZ2XXM');
          `,
        }}
      />
      <GridWithRays />

      {!hideNavbarOn.includes(router.pathname) && (
        <Navbar
          onLoginClick={() => {
            setMode('login');
          }}
        />
      )}
      <MandatoryProfileCompletion />
      <AuthModal
        open={authModalState.isModalOpen}
        onClose={closeAuthModal}
      />
      <Component {...pageProps} />
      <Toaster />
      <Footer />

      <CookieConsent
        location="bottom"
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          marginLeft: '1rem',
          marginBottom: '1rem',
          width: '320px',
          background: 'rgb(22, 22, 22)',
          border: '1px solid rgb(70, 70, 70)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderRadius: '8px',
          boxSizing: 'border-box',
          fontWeight: 500,
        }}
        buttonText="Accept"
        declineButtonText="Decline"
        enableDeclineButton
        cookieName="site_cookie_consent"
        expires={365}
        buttonStyle={{
          background: '#20c997',
          color: '#fff',
          fontSize: '14px',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          marginLeft: '0.5rem',
        }}
        declineButtonStyle={{
          background: 'transparent',
          color: '#fff',
          fontSize: '14px',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontWeight: 600,
          border: '1px solid #fff',
          cursor: 'pointer',
        }}
        onAccept={() => console.log('🎉 cookies accepted')}
        onDecline={() => console.log('🚫 cookies declined')}
      >
        <span style={{
          color: '#fff',
          flex: 1
        }}>
          We use cookies to improve your experience.
        </span>
        <a
          href="/cookie-policy"
          style={{
            color: '#fff',
            textDecoration: 'underline',
            marginLeft: '0.5rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          Our policy
        </a>
      </CookieConsent>
    </>
  );
}

export default function MyApp(props: AppProps) {
  const { Component, pageProps, router } = props;
  const { session, ...restPageProps } = pageProps;

  return (
    <RegistrationStatusProvider>
      <AuthProvider>
        <SessionProvider session={session}>
          <AuthModalManagerProvider>
            <Head>
              <meta charSet="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io (2)/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io (2)/favicon-32x32.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io (2)/favicon-16x16.png" />
              <link rel="manifest" href="/favicon_io (2)/site.webmanifest" />
              <link rel="icon" href="/favicon_io (2)/favicon.ico" />
              <title>Anthropos City</title>
              <meta name="description" content="Anthropos City: A vibrant and innovative hub, designed for progress and community." />
            </Head>
            <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
              <AppContent Component={Component} pageProps={restPageProps} router={router} />
            </div>
          </AuthModalManagerProvider>
        </SessionProvider>
      </AuthProvider>
    </RegistrationStatusProvider>
  );
}
