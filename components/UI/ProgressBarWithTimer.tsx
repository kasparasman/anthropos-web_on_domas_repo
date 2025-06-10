import React, { useState, useEffect } from 'react';

const ProgressBarWithTimer = () => {
    const [progress, setProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(90);
    const [timeText, setTimeText] = useState("Estimated time: 90 seconds");

    useEffect(() => {
        const startTime = Date.now();
        const duration = 90000; // 90 seconds in milliseconds

        // Progress update interval (every 100ms for smooth animation)
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            const remaining = Math.max(90 - Math.floor(elapsed / 1000), 0);
            setTimeRemaining(remaining);
        }, 100);

        // Text update interval (every 30 seconds)
        const textInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(90 - Math.floor(elapsed / 1000), 0);

            if (remaining > 60) {
                setTimeText(`Estimated time: ${remaining} seconds`);
            } else if (remaining > 30) {
                setTimeText(`Almost ready: ${remaining} seconds`);
            } else if (remaining > 0) {
                setTimeText(`Final touches: ${remaining} seconds`);
            } else {
                setTimeText("Completing your passport...");
            }
        }, 30000);

        // Initial text update
        setTimeText("Estimated time: 90 seconds");

        // Cleanup intervals
        return () => {
            clearInterval(progressInterval);
            clearInterval(textInterval);
        };
    }, []);

    return (
        <div className="w-80 mb-6">
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-main/50 to-main h-2 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Time Remaining Text */}
            <p className="text-center text-gray-300">
                {timeText}
            </p>
        </div>
    );
};

export default ProgressBarWithTimer; 