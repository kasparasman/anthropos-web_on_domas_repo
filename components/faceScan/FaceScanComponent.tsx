"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

// Props for the component
interface FaceScanComponentProps {
  onCapture: (imageFile: File) => void;
  onCancel: () => void;
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

const FaceScanComponent: React.FC<FaceScanComponentProps> = ({ onCapture, onCancel }) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for capture readiness
  const [isFaceSteady, setIsFaceSteady] = useState(false);
  const steadyFaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const animationFrameId = useRef<number | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  // --- Initialization and Cleanup ---
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
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
        setFaceLandmarker(landmarker);
        setIsModelLoaded(true);
        setError(null);
      } catch (e) {
        console.error("Failed to initialize FaceLandmarker:", e);
        setError("Failed to load face detection model. Please check your connection and try again.");
        setIsModelLoaded(false);
      }
    };
    initializeFaceLandmarker();

    return () => {
      // Cleanup on unmount
      animationFrameId.current && cancelAnimationFrame(animationFrameId.current);
      faceLandmarker?.close();
      if (webcamRef.current?.stream) {
        webcamRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (steadyFaceTimeoutRef.current) {
        clearTimeout(steadyFaceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const predictWebcam = useCallback(async () => {
    if (!faceLandmarker || !webcamRef.current?.video || webcamRef.current.video.readyState !== 4) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    if (!canvas) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }
    
    const context = canvas.getContext("2d");
    if (!context) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
      return;
    }

    if (!drawingUtilsRef.current) {
      drawingUtilsRef.current = new DrawingUtils(context);
    }
    
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    const startTimeMs = performance.now();
    const results = faceLandmarker.detectForVideo(video, startTimeMs);

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      // --- Face is detected, manage steady timer ---
      if (!steadyFaceTimeoutRef.current) {
        steadyFaceTimeoutRef.current = setTimeout(() => {
          setIsFaceSteady(true); // Enable capture after 1.5 seconds of continuous detection
        }, 1500);
      }
      
      for (const landmarks of results.faceLandmarks) {
        drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "rgba(0, 255, 255, 0.7)", lineWidth: 1 });
        drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "rgba(255, 255, 255, 0.8)", lineWidth: 1.5 });
      }
    } else {
      // --- No face detected, reset steady timer ---
      if (steadyFaceTimeoutRef.current) {
        clearTimeout(steadyFaceTimeoutRef.current);
        steadyFaceTimeoutRef.current = null;
      }
      setIsFaceSteady(false);
    }

    animationFrameId.current = requestAnimationFrame(predictWebcam);
  }, [faceLandmarker]);

  useEffect(() => {
    if (isModelLoaded && faceLandmarker) {
      animationFrameId.current = requestAnimationFrame(predictWebcam);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isModelLoaded, faceLandmarker, predictWebcam]);

  const handleCapture = () => {
    if (!webcamRef.current || !isFaceSteady) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const imageFile = dataURItoFile(imageSrc, 'face-scan.jpg');
      onCapture(imageFile); // Pass the File object up
    } else {
      setError("Could not capture image from webcam.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-2xl">
      <div className="relative w-full h-full">
        {error && <p className="absolute top-2 left-1/2 -translate-x-1/2 text-red-500 bg-black p-2 rounded z-20">{error}</p>}
        {!isModelLoaded && !error && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 text-white z-20">Loading Model...</p>}

        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user", width: 1280, height: 720 }}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        />
      </div>
      
      <div className="w-full p-4 flex flex-col items-center gap-2">
        <p className="text-white text-sm">
          {isFaceSteady ? "Ready!" : "Center your face..."}
        </p>
        <button
          onClick={handleCapture}
          disabled={!isFaceSteady}
          className="w-full py-2 text-base font-semibold rounded-full transition-all
                     bg-yellow-400 text-black 
                     disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed
                     hover:enabled:bg-yellow-300"
        >
          Capture
        </button>
        <button onClick={onCancel} className="text-gray-400 text-sm hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FaceScanComponent; 