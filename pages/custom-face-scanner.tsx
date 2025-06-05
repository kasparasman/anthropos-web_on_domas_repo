import React, { useRef, useEffect, useState } from 'react';
import Head from 'next/head';
import * as faceapi from 'face-api.js';

export default function CustomFaceScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentDetection, setCurrentDetection] = useState<faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68> | null>(null);
  const [biometricData, setBiometricData] = useState({
    faceWidth: 0,
    faceHeight: 0,
    eyeDistance: 0,
    confidence: 0,
    headRotation: { x: 0, y: 0, z: 0 },
    blinkRate: 0,
    expression: 'neutral'
  });
  const [scanMode, setScanMode] = useState<'idle' | 'analyzing' | 'mapping' | 'complete'>('idle');
  const particlesRef = useRef<Array<{x: number, y: number, vx: number, vy: number, life: number}>>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Initialize particle system
  const initParticles = () => {
    particlesRef.current = [];
    if (!overlayCanvasRef.current) return;
    const width = overlayCanvasRef.current.width;
    const height = overlayCanvasRef.current.height;
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5, // Slower particles
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * 1 + 0.5 // Longer life
      });
    }
  };

  // Animate particles
  const animateParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.05)'; // Fainter particles
    
    particlesRef.current.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.005; // Slower decay
      
      if (particle.life <= 0 || particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height) {
        particlesRef.current[index] = {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: Math.random() * 1 + 0.5
        };
      }
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(0, particle.life * 1.5), 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawBackgroundEffects = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    animateParticles(ctx, width, height);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.03)';
    ctx.lineWidth = 0.3;
    const gridSize = 15;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    if (scanMode === 'analyzing') {
      ctx.fillStyle = 'rgba(0, 255, 100, 0.05)';
      ctx.font = '8px monospace';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
      }
    }
  };

  const drawAdvancedFaceOverlay = (
    ctx: CanvasRenderingContext2D, 
    detection: faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68>, 
    canvasWidth: number, 
    canvasHeight: number
  ) => {
    console.log('[DEBUG] drawAdvancedFaceOverlay CALLED', detection);
    const landmarks = detection.landmarks;
    const box = detection.detection.box;

    ctx.save();

    // --- TEMPORARY DEBUG DRAWING: Bright Red Rectangle ---
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Bright red, semi-transparent
    ctx.fillRect(box.x, box.y, box.width, box.height);
    console.log(`[DEBUG] Drew red box at x: ${box.x}, y: ${box.y}, w: ${box.width}, h: ${box.height}`);
    // --- END TEMPORARY DEBUG DRAWING ---

    ctx.restore(); 
  };

  // Calculate advanced biometric data
  const calculateBiometricData = (detection: faceapi.WithFaceLandmarks<{detection: faceapi.FaceDetection}, faceapi.FaceLandmarks68>) => {
    const landmarks = detection.landmarks;
    const box = detection.detection.box;
    
    // Calculate face dimensions
    const faceWidth = box.width;
    const faceHeight = box.height;
    
    // Calculate eye distance
    const leftEyeCenter = landmarks.getLeftEye().reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
    leftEyeCenter.x /= landmarks.getLeftEye().length;
    leftEyeCenter.y /= landmarks.getLeftEye().length;
    
    const rightEyeCenter = landmarks.getRightEye().reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
    rightEyeCenter.x /= landmarks.getRightEye().length;
    rightEyeCenter.y /= landmarks.getRightEye().length;
    
    const eyeDistance = Math.sqrt(
      Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + 
      Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2)
    );
    
    // Simulate head rotation (simplified)
    const nose = landmarks.getNose();
    const noseTip = nose[nose.length - 1];
    const noseBase = nose[0];
    const rotationY = Math.atan2(noseTip.x - noseBase.x, noseTip.y - noseBase.y) * (180 / Math.PI);
    
    setBiometricData({
      faceWidth: Math.round(faceWidth),
      faceHeight: Math.round(faceHeight),
      eyeDistance: Math.round(eyeDistance),
      confidence: Math.round(detection.detection.score * 100),
      headRotation: { 
        x: Math.round((Math.random() - 0.5) * 10), // Simulated
        y: Math.round(rotationY), 
        z: Math.round((Math.random() - 0.5) * 5) 
      },
      blinkRate: Math.round(60 + Math.random() * 20), // Simulated
      expression: ['focused', 'alert', 'calm', 'engaged'][Math.floor(Math.random() * 4)]
    });
  };

  // Load face-api models
  const loadFaceApiModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
      ]);
      setFaceApiLoaded(true);
      initParticles();
      console.log('Face-api models loaded successfully');
    } catch (error) {
      console.error('Error loading face-api models:', error);
      setFaceApiLoaded(false);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraLoaded(true);
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera access denied. Please allow camera permissions and refresh the page.');
    }
  };

  // Face detection and tracking
  const startFaceDetection = async () => {
    console.log('[DEBUG] startFaceDetection CALLED');

    if (!faceApiLoaded) {
      console.log('[DEBUG] startFaceDetection: Aborting - faceApi NOT loaded');
      if (videoRef.current && videoRef.current.srcObject) { 
        animationFrameRef.current = requestAnimationFrame(startFaceDetection);
      }
      return;
    }
    if (!videoRef.current || !overlayCanvasRef.current || !videoRef.current.srcObject) {
      console.log('[DEBUG] startFaceDetection: Aborting - prerequisites (video/canvas refs, stream) not met');
      return;
    }

    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.log('[DEBUG] startFaceDetection: Aborting - no canvas context');
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('[DEBUG] startFaceDetection: Video dimensions not ready, requesting next frame');
      animationFrameRef.current = requestAnimationFrame(startFaceDetection);
      return;
    }
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      console.log(`[DEBUG] startFaceDetection: Resizing canvas to ${video.videoWidth}x${video.videoHeight}`);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (particlesRef.current.length === 0) {
        console.log('[DEBUG] startFaceDetection: Initializing particles');
        initParticles(); 
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackgroundEffects(ctx, canvas.width, canvas.height);

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.4 }))
        .withFaceLandmarks();

      console.log(`[DEBUG] startFaceDetection: Detections length - ${detections.length}`);

      if (detections.length > 0) {
        setFaceDetected(true);
        const detection = detections[0];
        setCurrentDetection(detection);
        if (detection) calculateBiometricData(detection); 
        
        setScanMode(isScanning ? 'analyzing' : 'mapping');
        
        drawAdvancedFaceOverlay(ctx, detection, canvas.width, canvas.height);
        
      } else {
        setFaceDetected(false);
        setCurrentDetection(null);
        setScanMode('idle');
      }
    } catch (error) {
      console.error('Face detection error in startFaceDetection:', error);
      setFaceDetected(false);
      setCurrentDetection(null);
      setScanMode('idle');
    }
    
    if (videoRef.current && videoRef.current.srcObject) { 
        animationFrameRef.current = requestAnimationFrame(startFaceDetection);
    }
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: faceapi.Point[], closed = false) => {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    if (closed) {
      ctx.closePath();
    }
    
    ctx.stroke();
  };

  const drawScanningGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;

    // Draw grid lines
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  const stopFaceDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current); // Clear any old interval if it exists
      detectionIntervalRef.current = null;
    }
  };

  // Stop camera
  const stopCamera = () => {
    stopFaceDetection();
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // Animate progress smoothly
  const animateProgress = (target: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const start = scanProgress;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (target - start) * progress;
        
        setScanProgress(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  };

  // Simulate biometric scanning process
  const startBiometricScan = async () => {
    if (!userEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    if (!cameraLoaded) {
      alert('Camera not ready. Please wait for camera to load.');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    
    // Stage 1: Initialization
    setScanStage('🔍 Initializing quantum biometric sensors...');
    await animateProgress(15, 1000);
    
    // Stage 2: Face Detection
    setScanStage('👤 Detecting facial biometric markers...');
    await animateProgress(35, 1200);
    
    // Stage 3: Geometric Analysis
    setScanStage('📐 Analyzing facial geometry patterns...');
    await animateProgress(55, 1000);
    
    // Stage 4: Neural Processing
    setScanStage('🧠 Processing neural biometric signature...');
    await animateProgress(75, 1500);
    
    // Stage 5: Encryption
    setScanStage('🔐 Encrypting citizen data with quantum keys...');
    await animateProgress(95, 800);
    
    // Stage 6: Complete
    setScanStage('✅ Biometric registration complete!');
    await animateProgress(100, 300);
    
    // Capture the frame
    captureFrame();
    
    setIsRegistered(true);
    setIsScanning(false);
    
    setTimeout(() => {
      alert(`🏛️ ANTROPOS CITY REGISTRATION COMPLETE 🏛️

📧 Citizen Email: ${userEmail}
🆔 Biometric ID: AC-${Math.random().toString(36).substr(2, 9).toUpperCase()}
📅 Registration Date: ${new Date().toLocaleDateString()}
🔐 Security Level: MAXIMUM
🌟 Status: VERIFIED CITIZEN

Welcome to the future of Antropos City!`);
    }, 1000);
  };

  const authenticateUser = async () => {
    if (!isRegistered) {
      alert('⚠️ Please register your biometric signature first!');
      return;
    }

    if (!cameraLoaded) {
      alert('Camera not ready. Please wait for camera to load.');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    
    setScanStage('🔍 Scanning for registered citizen...');
    await animateProgress(25, 800);
    
    setScanStage('🧬 Matching biometric signature...');
    await animateProgress(60, 1000);
    
    setScanStage('🔐 Verifying citizen credentials...');
    await animateProgress(90, 600);
    
    setScanStage('✅ Access Granted!');
    await animateProgress(100, 300);
    
    setIsScanning(false);
    setIsLoggedIn(true);
    
    setTimeout(() => {
      alert(`🏛️ ANTROPOS CITY ACCESS GRANTED 🏛️

👤 Citizen: ${userEmail}
🔐 Security Status: VERIFIED
⚡ Login Time: ${new Date().toLocaleTimeString()}
🌟 Welcome back, citizen!

Redirecting to citizen dashboard...`);
    }, 500);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setScanProgress(0);
    setScanStage('');
  };

  useEffect(() => {
    loadFaceApiModels();
    startCamera(); // startCamera will call startFaceDetection after video is loaded
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Dashboard view after login
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
                <p className="text-yellow-300">CITIZEN PORTAL - AUTHENTICATED</p>
              </div>
              <div className="border-t border-yellow-400 pt-6">
                <h2 className="text-2xl font-bold mb-4 text-white">Welcome, Verified Citizen</h2>
                <p className="text-xl mb-6 text-gray-300">
                  Authenticated: <span className="text-yellow-400 font-mono">{userEmail}</span>
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
                <div className="flex gap-4">
                  <button
                    onClick={logout}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded border border-red-500 transition-all duration-300"
                  >
                    🚪 TERMINATE SESSION
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-bold py-3 px-6 rounded border border-yellow-400 transition-all duration-300"
                  >
                    🏠 RETURN TO MAIN PORTAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-yellow-900">
      <Head>
        <title>Antropos City - Quantum Biometric Scanner</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-yellow-400 mb-4">🏛️ ANTROPOS CITY</h1>
            <h2 className="text-3xl text-yellow-300 mb-2">QUANTUM BIOMETRIC SCANNER</h2>
            <p className="text-gray-400">Advanced Neural Recognition • Quantum Encryption • Future-Ready</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Feed */}
            <div className="relative">
              <div className="relative bg-black rounded-lg overflow-hidden border-2 border-yellow-400 shadow-2xl">
                {cameraError ? (
                  <div className="w-full h-96 flex items-center justify-center bg-red-900 border border-red-500">
                    <div className="text-center p-6">
                      <div className="text-4xl mb-4">📷</div>
                      <h3 className="text-xl font-bold text-red-300 mb-2">Camera Access Required</h3>
                      <p className="text-red-200 mb-4">{cameraError}</p>
                      <button 
                        onClick={startCamera}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Retry Camera Access
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto max-h-96 object-cover"
                    />
                    {/* Face tracking overlay canvas */}
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />
                  </div>
                )}
                
                {/* Scanning Overlay */}
                {isScanning && cameraLoaded && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="text-center">
                      {/* Scanning Animation */}
                      <div className="relative w-64 h-64 border-4 border-yellow-400 rounded-lg mb-6">
                        {/* Corner brackets */}
                        <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-yellow-400"></div>
                        <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-yellow-400"></div>
                        <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-yellow-400"></div>
                        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-yellow-400"></div>
                        
                        {/* Scanning lines */}
                        <div 
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transition-all duration-300"
                          style={{ top: `${scanProgress}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-yellow-400 to-transparent transition-all duration-500"
                          style={{ left: `${scanProgress}%` }}
                        ></div>
                        
                        {/* Center crosshair */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-16 h-16 border-2 border-yellow-400 rounded-full border-dashed animate-spin"></div>
                        </div>

                        {/* Progress ring */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="60"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="transparent"
                              className="text-gray-600"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="60"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="transparent"
                              strokeDasharray={377}
                              strokeDashoffset={377 - (377 * scanProgress) / 100}
                              className="text-yellow-400 transition-all duration-300"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="w-64 h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
                            style={{ width: `${scanProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-yellow-300 text-lg mt-2 font-mono">{Math.round(scanProgress)}%</p>
                      </div>
                      
                      {/* Stage text */}
                      <p className="text-yellow-400 text-lg animate-pulse">{scanStage}</p>
                      
                      {/* Matrix effect dots */}
                      <div className="mt-4 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-0"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-225"></div>
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Static scanning frame when not scanning */}
                {!isScanning && cameraLoaded && (
                  <div className="absolute inset-4 border-2 border-yellow-400 border-dashed rounded-lg opacity-50 pointer-events-none">
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-yellow-400"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-yellow-400"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-yellow-400"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-yellow-400"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400 text-xs">
                      BIOMETRIC SCAN ZONE
                    </div>
                  </div>
                )}
              </div>
              
              {/* Camera info */}
              <div className="mt-4 text-center">
                {cameraLoaded ? (
                  <div>
                    <p className="text-gray-400 text-sm">✅ Quantum HD Neural Vision Active • Real-time Processing</p>
                    {faceApiLoaded ? (
                      <p className="text-yellow-400 text-xs mt-1">
                        {faceDetected ? '🎯 Biometric Face Lock Acquired' : '👤 Scanning for Face...'}
                      </p>
                    ) : (
                      <p className="text-blue-400 text-xs mt-1">⚡ Loading Neural Network Models...</p>
                    )}
                  </div>
                ) : cameraError ? (
                  <p className="text-red-400 text-sm">❌ Camera Access Required</p>
                ) : (
                  <p className="text-yellow-400 text-sm">⏳ Initializing Camera...</p>
                )}
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              {/* User Input */}
              <div className="bg-gradient-to-r from-black to-gray-900 border border-yellow-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">📧 Citizen Registration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-yellow-300 text-sm font-bold mb-2">
                      Citizen Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="citizen@antropos-city.gov"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-yellow-400 focus:border-yellow-300 focus:outline-none font-mono"
                    />
                  </div>
                  
                  <button
                    onClick={startBiometricScan}
                    disabled={isScanning || !userEmail.includes('@') || !cameraLoaded}
                    className="w-full px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-black font-bold rounded border border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isScanning ? '⚡ SCANNING...' : '🔍 REGISTER BIOMETRIC'}
                  </button>
                </div>
              </div>

              {/* Authentication */}
              <div className="bg-gradient-to-r from-black to-gray-900 border border-yellow-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">🔐 Citizen Authentication</h3>
                <button
                  onClick={authenticateUser}
                  disabled={isScanning || !isRegistered || !cameraLoaded}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded border border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mb-4"
                >
                  {isScanning ? '⚡ VERIFYING...' : '🔍 AUTHENTICATE CITIZEN'}
                </button>
                
                {!isRegistered && (
                  <p className="text-gray-400 text-sm">Register your biometric signature first</p>
                )}
                {isRegistered && (
                  <p className="text-green-400 text-sm">✅ Biometric signature registered - Ready for authentication</p>
                )}
              </div>

              {/* Captured Image */}
              {capturedImage && (
                <div className="bg-gradient-to-r from-black to-gray-900 border border-yellow-400 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4">📸 Captured Biometric</h3>
                  <img 
                    src={capturedImage} 
                    alt="Captured biometric" 
                    className="w-full rounded border border-yellow-400"
                  />
                  <p className="text-gray-400 text-sm mt-2">Biometric signature successfully captured and encrypted</p>
                </div>
              )}

              {/* Features */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-4">🔬 Scanner Capabilities</h3>
                <div className="grid grid-cols-2 gap-4 text-blue-200 text-sm">
                  <div>
                    <div className="font-semibold mb-1">🛡️ Security:</div>
                    <ul className="space-y-1">
                      <li>• Quantum encryption</li>
                      <li>• 68-point facial mapping</li>
                      <li>• Real-time wireframe tracking</li>
                      <li>• Anti-spoofing protection</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">⚡ Performance:</div>
                    <ul className="space-y-1">
                      <li>• 10 FPS face detection</li>
                      <li>• HD biometric capture</li>
                      <li>• Neural landmark analysis</li>
                      <li>• Instant verification</li>
                    </ul>
                  </div>
                </div>
                {faceApiLoaded && (
                  <div className="mt-4 p-3 bg-green-900 border border-green-400 rounded">
                    <p className="text-green-300 text-sm">
                      ✅ <strong>Neural Face Tracking:</strong> Advanced facial landmark detection active
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
} 