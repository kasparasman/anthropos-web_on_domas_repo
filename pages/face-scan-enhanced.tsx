import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import faceIO from '@faceio/fiojs';

export default function FaceScanEnhanced() {
  const faceioRef = useRef<faceIO | null>(null);
  const [email, setEmail] = useState<string>('');
  const [userLogin, setUserLogin] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scanningStage, setScanningStage] = useState<string>('');
  const [showScanOverlay, setShowScanOverlay] = useState<boolean>(false);

  const publicKey = process.env.NEXT_PUBLIC_FACEIO_PUBLIC_ID || 'your-faceio-public-id-here';

  const initialiseFaceio = async () => {
    try {
      faceioRef.current = new faceIO(publicKey);
      console.log('FaceIO initialized successfully');
      setStatus('🤖 Antropos Biometric System Initialized');
      setError('');
    } catch (error) {
      console.error('FaceIO initialization failed:', error);
      setError(`Biometric system initialization failed: ${error}`);
      handleError(error);
    }
  };

  useEffect(() => {
    initialiseFaceio();
  }, []);

  const handleRegister = async () => {
    try {
      if (!faceioRef.current) {
        setError('Biometric system not initialized');
        return;
      }

      if (!email || !email.includes('@')) {
        setError('Please enter a valid Antropos City citizen email');
        return;
      }

      setIsLoading(true);
      setError('');
      setShowScanOverlay(true);
      setScanningStage('🔍 Initializing biometric scan...');
      
      setTimeout(() => setScanningStage('👤 Detecting facial features...'), 1000);
      setTimeout(() => setScanningStage('🧬 Analyzing biometric patterns...'), 2000);
      setTimeout(() => setScanningStage('🔐 Encrypting citizen data...'), 3000);

      const userInfo = await faceioRef.current.enroll({
        userConsent: false,
        locale: 'auto',
        payload: { 
          email: email,
          citizenType: 'Antropos_Resident',
          registrationDate: new Date().toISOString()
        },
      });

      setShowScanOverlay(false);
      setStatus(`✅ Citizen Successfully Registered! Biometric ID: ${userInfo.facialId}`);
      
      // Custom success animation
      setTimeout(() => {
        alert(`🏛️ ANTROPOS CITY REGISTRATION COMPLETE 🏛️

🆔 Citizen Biometric ID: ${userInfo.facialId}
📅 Registration Date: ${userInfo.timestamp}
👤 Profile: ${userInfo.details?.gender || 'N/A'} | ${userInfo.details?.age || 'N/A'} years
🔐 Security Level: MAXIMUM

Welcome to the future of Antropos City!`);
      }, 500);
        
    } catch (error) {
      setShowScanOverlay(false);
      console.error('Registration error:', error);
      handleError(error);
      faceioRef.current?.restartSession();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      if (!faceioRef.current) {
        setError('Biometric system not initialized');
        return;
      }

      setIsLoading(true);
      setError('');
      setShowScanOverlay(true);
      setScanningStage('🔍 Scanning for registered citizen...');
      
      setTimeout(() => setScanningStage('🧬 Matching biometric signature...'), 1000);
      setTimeout(() => setScanningStage('🔐 Verifying citizen credentials...'), 2000);

      const authenticate = await faceioRef.current.authenticate();
      
      setShowScanOverlay(false);
      setUserLogin(String(authenticate.payload?.email) || 'Unknown Citizen');
      setIsLoggedIn(true);
      setStatus('🎉 Access Granted! Welcome to Antropos City');
      
      setTimeout(() => {
        alert(`🏛️ ANTROPOS CITY ACCESS GRANTED 🏛️

🆔 Citizen ID: ${authenticate.facialId}
📧 Email: ${authenticate.payload?.email || 'N/A'}
🔐 Security Status: VERIFIED
🌟 Welcome back, citizen!`);
      }, 500);
        
    } catch (error) {
      setShowScanOverlay(false);
      console.error('Authentication error:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserLogin('');
    setStatus('👋 Citizen session terminated');
    setError('');
  };

  const restartSession = async () => {
    try {
      if (faceioRef.current) {
        await faceioRef.current.restartSession();
        setStatus('🔄 Biometric session restarted');
        setError('');
      }
    } catch (error) {
      console.error('Error restarting session:', error);
      handleError(error);
    }
  };

  function handleError(errCode: unknown) {
    if (!faceioRef.current) {
      setError(`⚠️ System Error: ${String(errCode)}`);
      return;
    }

    const fioErrs = faceioRef.current.fetchAllErrorCodes();
    switch (errCode) {
      case fioErrs.PERMISSION_REFUSED:
        setError('🚫 Camera access denied. Biometric scan requires camera permission.');
        break;
      case fioErrs.NO_FACES_DETECTED:
        setError('👤 No face detected. Please position yourself in front of the camera.');
        break;
      case fioErrs.UNRECOGNIZED_FACE:
        setError('❌ Citizen not recognized. Please register first or try again.');
        break;
      case fioErrs.MANY_FACES:
        setError('👥 Multiple faces detected. Only one person should be in frame.');
        break;
      case fioErrs.FACE_DUPLICATION:
        setError('⚠️ Citizen already registered! Cannot register twice.');
        break;
      case fioErrs.MINORS_NOT_ALLOWED:
        setError('🔞 Minors cannot register for Antropos City services.');
        break;
      case fioErrs.PAD_ATTACK:
        setError('🛡️ Security breach detected! Please use live face, not photos/videos.');
        break;
      case fioErrs.UNAUTHORIZED:
        setError('🚨 System authorization error. Contact Antropos City administration.');
        break;
      default:
        setError('⚠️ Biometric system error. Please try again or contact support.');
        break;
    }
  }

  // Custom Scanning Overlay Component
  const ScanningOverlay = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="relative">
        {/* Scanning Frame */}
        <div className="relative w-80 h-80 border-4 border-yellow-400 rounded-lg overflow-hidden">
          {/* Animated scanning lines */}
          <div className="absolute inset-0">
            <div className="scanning-line-1 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
            <div className="scanning-line-2 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          </div>
          
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-yellow-400"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-yellow-400"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-yellow-400"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-yellow-400"></div>
          
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 border-2 border-yellow-400 rounded-full border-dashed animate-spin"></div>
          </div>
        </div>
        
        {/* Status text */}
        <div className="text-center mt-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">🏛️ ANTROPOS BIOMETRIC SCAN</h2>
          <p className="text-yellow-300 text-lg animate-pulse">{scanningStage}</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-0"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard View
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-yellow-900">
        <Head>
          <title>Antropos City - Citizen Dashboard</title>
        </Head>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-black to-gray-900 border border-yellow-400 rounded-lg p-8 mb-8 shadow-2xl">
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-yellow-400 mb-2">🏛️ ANTROPOS CITY</h1>
                <p className="text-yellow-300">CITIZEN PORTAL</p>
              </div>
              <div className="border-t border-yellow-400 pt-6">
                <h2 className="text-2xl font-bold mb-4 text-white">Welcome, Citizen</h2>
                <p className="text-xl mb-6 text-gray-300">
                  Authenticated: <span className="text-yellow-400 font-mono">{userLogin}</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800 border border-yellow-400 rounded p-4 text-center">
                    <div className="text-2xl mb-2">🔐</div>
                    <div className="text-yellow-400 font-semibold">Security Level</div>
                    <div className="text-white">MAXIMUM</div>
                  </div>
                  <div className="bg-gray-800 border border-yellow-400 rounded p-4 text-center">
                    <div className="text-2xl mb-2">🌟</div>
                    <div className="text-yellow-400 font-semibold">Citizen Status</div>
                    <div className="text-white">VERIFIED</div>
                  </div>
                  <div className="bg-gray-800 border border-yellow-400 rounded p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-yellow-400 font-semibold">Access Level</div>
                    <div className="text-white">FULL</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded border border-red-500 transition-all duration-300"
                >
                  🚪 TERMINATE SESSION
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-yellow-900 relative">
      <Head>
        <title>Antropos City - Biometric Authentication</title>
      </Head>

      {/* Custom scanning overlay */}
      {showScanOverlay && <ScanningOverlay />}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-yellow-400 mb-4">🏛️ ANTROPOS CITY</h1>
            <p className="text-2xl text-yellow-300 mb-2">ADVANCED BIOMETRIC AUTHENTICATION</p>
            <p className="text-gray-400">Secure • Future-Ready • Instant Recognition</p>
          </div>
          
          {/* Registration Panel */}
          <div className="mb-8 p-8 bg-gradient-to-r from-black to-gray-900 border border-yellow-400 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-yellow-400 text-center">👤 CITIZEN REGISTRATION</h2>
            <p className="mb-6 text-gray-300 text-center">Register your biometric signature for secure city access</p>
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1">
                <label className="block text-yellow-400 text-sm font-bold mb-2">
                  📧 Citizen Email Address
                </label>
                <input
                  type="email"
                  placeholder="citizen@antropos-city.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-yellow-400 focus:border-yellow-300 focus:outline-none font-mono"
                />
              </div>
              <button
                onClick={handleRegister}
                disabled={isLoading || !email.includes('@')}
                className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-bold rounded border border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 min-w-[200px]"
              >
                {isLoading ? '⚡ SCANNING...' : '🔍 REGISTER BIOMETRIC'}
              </button>
            </div>
          </div>

          {/* Authentication Panel */}
          <div className="mb-8 p-8 bg-gradient-to-r from-black to-gray-900 border border-yellow-400 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-yellow-400 text-center">🔐 CITIZEN ACCESS</h2>
            <p className="mb-6 text-gray-300 text-center">Authenticate using your registered biometric signature</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-bold rounded border border-yellow-400 disabled:opacity-50 transition-all duration-300 min-w-[200px]"
              >
                {isLoading ? '⚡ VERIFYING...' : '🔍 AUTHENTICATE CITIZEN'}
              </button>
              
              <button
                onClick={restartSession}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded border border-gray-500 disabled:opacity-50 transition-all duration-300"
              >
                🔄 RESTART SESSION
              </button>
            </div>
          </div>

          {/* Status Display */}
          {status && (
            <div className="mb-6 p-6 bg-gradient-to-r from-green-900 to-green-800 border border-green-400 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-green-300">📊 SYSTEM STATUS</h3>
              <p className="text-green-200">{status}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-6 bg-gradient-to-r from-red-900 to-red-800 border border-red-400 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-red-300">⚠️ SYSTEM ALERT</h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Info Panel */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-400 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-blue-300">🔬 ADVANCED BIOMETRIC TECHNOLOGY</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-200">
              <div>
                <h4 className="font-semibold mb-2">🛡️ Security Features:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Military-grade facial recognition</li>
                  <li>• Anti-spoofing protection</li>
                  <li>• Encrypted biometric storage</li>
                  <li>• 99.8% accuracy rate</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">⚡ Performance:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• &lt;100ms recognition speed</li>
                  <li>• Cross-browser compatibility</li>
                  <li>• No biometric sensors required</li>
                  <li>• Real-time verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scanning-line-1 {
          animation: scan-vertical 2s infinite linear;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }
        .scanning-line-2 {
          animation: scan-vertical 2s infinite linear reverse;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }
        
        @keyframes scan-vertical {
          0% { transform: translateY(0); opacity: 1; }
          50% { opacity: 0.5; }
          100% { transform: translateY(300px); opacity: 0; }
        }
      `}</style>
    </div>
  );
} 