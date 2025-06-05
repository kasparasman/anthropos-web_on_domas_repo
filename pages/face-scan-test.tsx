import React from "react";
import dynamic from 'next/dynamic';

// Dynamically import the FaceScanComponent with SSR turned off
const FaceScanComponentWithNoSSR = dynamic(
  () => import("@/components/faceScan/FaceScanComponent"),
  { ssr: false, loading: () => <p>Loading Face Scanner...</p> } // Optional: Add a loading component
);

const FaceScanTestPage: React.FC = () => {
  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>Face Scan Test</h1>
      <p style={{textAlign: "center"}}>
        This page tests the <code>FaceScanComponent</code>. <br />
        Please allow webcam access. The component will load a face detection model, <br />
        indicate if a face is detected, and allow capturing 3 images.
      </p>
      <hr style={{width: "50%", margin: "20px 0"}}/>
      <FaceScanComponentWithNoSSR />
    </div>
  );
};

export default FaceScanTestPage;
