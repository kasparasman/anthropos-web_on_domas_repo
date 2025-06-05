"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const VISION_TASK_FILES_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm";

const FaceScanComponent: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Canvas for FaceLandmarker
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const animationFrameId = useRef<number | null>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);

  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          VISION_TASK_FILES_PATH
        );
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: false, // Set true if you need expression data
          runningMode: "VIDEO",
          numFaces: 1,
        });
        setFaceLandmarker(landmarker);
        setIsModelLoaded(true);
        setError(null);
      } catch (e) {
        console.error("Failed to initialize FaceLandmarker:", e);
        setError(
          "Failed to load face landmark model. Please ensure a stable internet connection and try again."
        );
        setIsModelLoaded(false);
      }
    };
    initializeFaceLandmarker();

    return () => {
      animationFrameId.current && cancelAnimationFrame(animationFrameId.current);
      faceLandmarker?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const predictWebcam = useCallback(async () => {
    if (
      !faceLandmarker ||
      !webcamRef.current?.video ||
      webcamRef.current.video.readyState !== 4 // Video is ready
    ) {
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
      setIsFaceDetected(true);
      for (const landmarks of results.faceLandmarks) {
        // --- Enhanced Tesselation (Main Mesh) ---
        drawingUtilsRef.current.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "rgba(0, 255, 255, 0.7)", lineWidth: 1 } // Brighter Cyan, slightly thicker
        );

        // --- Stylized Feature Outlines ---
        // Face Oval
        drawingUtilsRef.current.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: "rgba(255, 255, 255, 0.8)", lineWidth: 1.5 } // Bright White outline
        );
        // Lips
        drawingUtilsRef.current.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: "rgba(255, 0, 150, 0.8)", lineWidth: 1 } // Vibrant Pink/Magenta
        );
        // Eyes (Combined for simplicity, or draw left/right separately)
        drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "rgba(50, 205, 50, 0.9)", lineWidth: 1 }); // Lime Green
        drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "rgba(50, 205, 50, 0.9)", lineWidth: 1 });
        drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "rgba(50, 205, 50, 0.7)", lineWidth: 1 });
        drawingUtilsRef.current.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "rgba(50, 205, 50, 0.7)", lineWidth: 1 });
        
        // --- Enhanced Keypoints with Intense Glow ---
        const keypointsIndices = [
          // Key facial points: nose tip, chin, eye corners, lip corners, forehead center etc.
          // These are just example indices, you might want to select more or different ones.
          1, 4, 5, 8, // Nose, Forehead region
          33, 263, // Left, Right Cheeks
          61, 291, // Lip corners
          130, 359, // Eye inner corners (approx)
          70, 300, // Eyebrow outer (approx)
          152, // Chin
          10, 151 // Forehead top, bottom mid (approx)
        ]; 
        context.shadowColor = "rgba(0, 255, 255, 1)"; // Intense Cyan Glow Color
        context.shadowBlur = 10; // Increased blur for a softer, larger glow

        keypointsIndices.forEach(index => {
          if (landmarks[index]) {
            context.beginPath();
            context.arc(landmarks[index].x * canvas.width, landmarks[index].y * canvas.height, 2.5, 0, 2 * Math.PI); // Slightly larger points
            context.fillStyle = "rgba(0, 255, 255, 1)"; // Solid Bright Cyan for the point itself
            context.fill();
          }
        });
        context.shadowBlur = 0; // Reset shadow for other drawings
      }
    } else {
      setIsFaceDetected(false);
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

  const handleCaptureButtonClick = async () => {
    if (!webcamRef.current || !isFaceDetected || !isModelLoaded) return;
    
    const newImages: string[] = [];
    setCapturedImages([]); // Clear previous images first
    for (let i = 0; i < 3; i++) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        newImages.push(imageSrc);
      }
      if (i < 2) { // Only delay if not the last image
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    setCapturedImages(newImages);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3>Face Scan with Landmarker</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!isModelLoaded && !error && <p>Loading face landmark model...</p>}
      
      <div style={{ position: "relative", width: "640px", height: "480px", border: "1px solid #555", background: "#000" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
          videoConstraints={{ facingMode: "user" }}
          style={{
            // Video fills the container but might be covered by canvas
            // position: "absolute", top:0, left:0, // if canvas is not transparent
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none", // Canvas doesn't block webcam interaction
          }}
        />
      </div>

      <p style={{ marginTop: "10px" }}>Face Detected: {isFaceDetected ? "Yes" : "No"}</p>
      
      {isModelLoaded && (
        <button
          onClick={handleCaptureButtonClick}
          disabled={capturedImages.length >= 3 || !isFaceDetected}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: (capturedImages.length >= 3 || !isFaceDetected) ? "#555" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            marginTop: "10px",
            opacity: (capturedImages.length >= 3 || !isFaceDetected) ? 0.6 : 1,
          }}
        >
          {capturedImages.length >= 3 ? "3 Images Captured" : "Capture 3 Images"}
        </button>
      )}
      
      {capturedImages.length > 0 && (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: 'wrap', justifyContent: 'center' }}>
          {capturedImages.map((src, index) => (
            <img key={index} src={src} alt={`Captured frame ${index + 1}`} width={100} height={75} style={{border: "1px solid #ddd", borderRadius: "4px", objectFit: 'cover'}}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default FaceScanComponent; 