"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import Image from "next/image";
import MainButton from "@/components/UI/button";

// Props for the component
interface FaceScanComponentProps {
  onCapture: (imageFile: File) => void;
  onRescan: () => void;
  capturedImage: File | null;
  isFaceChecking: boolean;
  isFaceUnique: boolean | null;
  faceCheckError: string | null;
  isLoading: boolean;
  onVideoReady?: (aspectRatio: number) => void;
}

const VISION_TASK_FILES_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";

// Helper to convert data URI to File object
function dataURItoFile(dataURI: string, filename: string): File {
  const arr = dataURI.split(',');
  // The first part of the array is the mime type
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Could not find MIME type in data URI');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const FaceScanComponent: React.FC<FaceScanComponentProps> = ({ 
  onCapture, 
  onRescan,
  capturedImage,
  isFaceChecking,
  isFaceUnique,
  faceCheckError,
  isLoading,
  onVideoReady,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for capture readiness
  const [isFaceSteady, setIsFaceSteady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);   // 3-2-1 overlay
  const hasCapturedRef = useRef(false);                              // block double capture
  const steadyFaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const animationFrameId = useRef<number | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);

  // --- Image URL State ---
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // --- Video dimensions state ---
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  // --- Aspect ratio derived from videoDimensions ---
  const aspectRatio = videoDimensions ? videoDimensions.width / videoDimensions.height : 1;

  // --- Loading phase: 'model' until model loads, then 'camera' until videoDimensions ready ---
  const loadingPhase: 'model' | 'camera' | null = !isModelLoaded
    ? 'model'
    : videoDimensions
    ? null
    : 'camera';

  useEffect(() => {
    if (capturedImage) {
      const url = URL.createObjectURL(capturedImage);
      setImageUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
        setImageUrl(null);
      };
    }
  }, [capturedImage]);

  // --- Initialization and Cleanup ---
  useEffect(() => {
    if (capturedImage) return; // Don't initialize if we are just showing the result

    isMountedRef.current = true;
    
    const initializeFaceLandmarker = async () => {
      try {
        setError(null);
        const filesetResolver = await FilesetResolver.forVisionTasks(VISION_TASK_FILES_PATH);
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1,
        });
        
        if (isMountedRef.current) {
          setFaceLandmarker(landmarker);
          setIsModelLoaded(true);
        } else {
          // Component was unmounted during initialization
          landmarker.close();
        }
      } catch (e) {
        console.error("Failed to initialize FaceLandmarker:", e);
        if (isMountedRef.current) {
          setError("Failed to load face detection model. Please refresh and try again.");
          setIsModelLoaded(false);
        }
      }
    };
    
    initializeFaceLandmarker();

    return () => {
      isMountedRef.current = false;
      
      // Cancel animation frame
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      
      // Clear timeouts
      if (steadyFaceTimeoutRef.current) {
        clearTimeout(steadyFaceTimeoutRef.current);
        steadyFaceTimeoutRef.current = null;
      }
      
      // Close MediaPipe model
      if (faceLandmarker) {
        faceLandmarker.close();
      }
      
      // Stop webcam streams - let react-webcam handle this mostly
      try {
        if (webcamRef.current && webcamRef.current.video) {
          const video = webcamRef.current.video;
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
          }
        }
      } catch (err) {
        console.warn('Error stopping webcam streams:', err);
      }
    };
  }, [capturedImage]);

  const predictWebcam = useCallback(() => {
    if (capturedImage || !isMountedRef.current) return;
    
    if (!faceLandmarker || !webcamRef.current?.video || webcamRef.current.video.readyState !== 4) {
      if (isMountedRef.current) {
        animationFrameId.current = requestAnimationFrame(predictWebcam);
      }
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      if (isMountedRef.current) {
        animationFrameId.current = requestAnimationFrame(predictWebcam);
      }
      return;
    }
    
    const context = canvas.getContext("2d");
    if (!context) {
      if (isMountedRef.current) {
        animationFrameId.current = requestAnimationFrame(predictWebcam);
      }
      return;
    }

    if (!drawingUtilsRef.current) {
      drawingUtilsRef.current = new DrawingUtils(context);
    }
    
    // Resize canvas only when dimensions change
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results.faceLandmarks?.length) {
        const landmarks = results.faceLandmarks[0];
        const SAFE_MARGIN_RATIO = 0.12;
        const STEADY_MS         = 700;

        // Bounding-box calculation (optimized)
        let minX = video.videoWidth, maxX = 0, minY = video.videoHeight, maxY = 0;
        for (const point of landmarks) {
            const x = point.x * video.videoWidth;
            const y = point.y * video.videoHeight;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        
        const marginX = video.videoWidth * SAFE_MARGIN_RATIO;
        const marginY = video.videoHeight * SAFE_MARGIN_RATIO;
        
        const isCentered =
          minX > marginX &&
          maxX < video.videoWidth  - marginX &&
          minY > marginY &&
          maxY < video.videoHeight - marginY;

        // Only set state if "steady" really changes
        if (isCentered) {
          if (!steadyFaceTimeoutRef.current && isMountedRef.current) {
            steadyFaceTimeoutRef.current = setTimeout(() => {
              if (!isFaceSteady && isMountedRef.current) {
                setIsFaceSteady(true);
              }
            }, STEADY_MS);
          }
        } else {
          if (steadyFaceTimeoutRef.current) {
            clearTimeout(steadyFaceTimeoutRef.current);
            steadyFaceTimeoutRef.current = null;
          }
          // Only clear if was previously "steady"
          if (isFaceSteady) {
            setIsFaceSteady(false);
            setCountdown(null);
          }
        }
        
        for (const landmarks of results.faceLandmarks) {
          drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "rgba(0, 255, 255, 0.7)", lineWidth: 1 });
          drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "rgba(255, 255, 255, 0.8)", lineWidth: 1.5 });
        }
      } else {
        // No face → reset state only if needed
        if (steadyFaceTimeoutRef.current) {
          clearTimeout(steadyFaceTimeoutRef.current);
          steadyFaceTimeoutRef.current = null;
        }
        if (isFaceSteady) {
          setIsFaceSteady(false);
          setCountdown(null);
        }
      }
    } catch (err) {
      console.warn('Error in face detection:', err);
    }

    if (isMountedRef.current) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    }
  }, [faceLandmarker, isFaceSteady]);

  useEffect(() => {
    if (isModelLoaded && faceLandmarker && isMountedRef.current) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isModelLoaded, faceLandmarker, predictWebcam]);

  const handleCapture = () => {
    if (!webcamRef.current || !isFaceSteady || !isMountedRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const imageFile = dataURItoFile(imageSrc, 'face-scan.jpg');
      onCapture(imageFile); // Pass the File object up
    } else {
      setError("Could not capture image from webcam.");
    }
  };

  /* ⬇️  When `isFaceSteady` flips true, start a 3-2-1 countdown */
  useEffect(() => {
    if (isFaceSteady && !hasCapturedRef.current && isMountedRef.current) {
      setCountdown(3);
      const tick = setInterval(() => {
        setCountdown(c => {
          if (c === null || !isMountedRef.current) return null;
          if (c === 1) {
            clearInterval(tick);
            hasCapturedRef.current = true;
            handleCapture();
            return null;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(tick);
    }
  }, [isFaceSteady]);

  const handleUserMedia = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video) {
      return;
    }

    const pollForDimensions = () => {
      // Stop polling if the component has been unmounted
      if (!isMountedRef.current) {
        return;
      }
      
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        // Store video dimensions
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight
        });

        // Calculate aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight;
        
        // Call the parent callback with the aspect ratio
        if (onVideoReady) {
          onVideoReady(aspectRatio);
        }
      } else {
        // If not ready, try again on the next available frame
        requestAnimationFrame(pollForDimensions);
      }
    };

    pollForDimensions();
  }, [onVideoReady]);

  // Handle webcam errors with more specific error messages
  const handleWebcamError = (error: string | DOMException) => {
    console.error("Webcam Error:", error);
    if (isMountedRef.current) {
        setError("Could not access the camera. Please check permissions and ensure no other application is using it.");
    }
  };

  const StatusOverlay = () => {
    if (isFaceChecking) {
        return (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-4 rounded-2xl">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-lg font-semibold">Verifying uniqueness...</p>
            </div>
        );
    }

    if (isFaceUnique === true) {
        return (
            <div className="absolute inset-0 bg-green-500/50 flex flex-col items-center justify-center text-white p-4 rounded-2xl">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="mt-2 text-xl font-bold">Face Verified</p>
            </div>
        );
    }

    if (isFaceUnique === false) {
        return (
            <div className="absolute inset-0 bg-red-800/80 flex flex-col items-center justify-center text-white text-center p-4 rounded-2xl">
                 <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
                <p className="mt-2 text-xl font-bold">Registration Blocked</p>
                <p className="mt-1 text-base max-w-xs">{faceCheckError || 'This face is already registered.'}</p>
            </div>
        );
    }

    return null;
  };

  // --- Render Logic ---
  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-black rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ aspectRatio: aspectRatio }}
    >
      {imageUrl && capturedImage ? (
        // --- CAPTURED VIEW ---
        <>
          <Image src={imageUrl} alt="Captured face" layout="fill" className="object-cover rounded-2xl" />
          <StatusOverlay />
          <div className="absolute top-4 right-4 z-10">
            <MainButton variant="outline" onClick={onRescan} disabled={isLoading}>
              Rescan
            </MainButton>
          </div>
        </>
      ) : (
        // --- SCANNING VIEW ---
        <>
          {error && <div className="absolute inset-0 flex items-center justify-center bg-black p-4 text-center text-red-400 z-30 rounded-2xl">{error}</div>}

          {/* Model loading spinner */}
          {!error && loadingPhase === 'model' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-black/80">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4">Loading face model...</p>
            </div>
          )}

          {/* Always render Webcam and canvas */}
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleWebcamError}
            className={`w-full h-full object-cover rounded-2xl transition-opacity duration-500 ${videoDimensions ? 'opacity-100' : 'opacity-0'}`}
            videoConstraints={{
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            }}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none transform -scale-x-100" />

          {/* Camera loading spinner */}
          {loadingPhase === 'camera' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60">
              <div className="w-10 h-10 border-4 border-main border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-main">Loading camera…</p>
            </div>
          )}

          {isModelLoaded && !error && (
            <>
              {isFaceSteady && countdown === null && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-green-400 bg-black/80 p-2 rounded z-20 text-sm">
                  Face steady – hold still…
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {countdown !== null && (
                  <span className="text-6xl font-bold text-white" style={{ textShadow: '0 0 15px black' }}>
                    {countdown}
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FaceScanComponent;
