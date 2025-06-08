import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';

interface BenefitsProps {
    text: string;
    // icon: React.ReactNode; // Or a specific type for the icon
    className?: string; // Add optional className prop
    delay?: string; // Add optional delay prop
}

const Benefits: React.FC<BenefitsProps> = ({ text, className, delay }) => {
    return (
        <div
            className={clsx(
                "rounded-xl px-4 py-1.5 flex flex-col gap-2",
                className // Merge the passed className
            )}
            style={{
                backgroundImage: 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(37, 32, 20, 0.7), rgba(0, 0, 0, 0.7))',
                border: '1px solid rgba(254, 212, 138, 0.5)',
                backdropFilter: 'blur(4px)',
                width: 'fit-content', // Equivalent to hug horizontal
                height: 'fit-content', // Equivalent to hug vertical
                animation: `moveUpDown 2s ease-in-out infinite ${delay || '0s'}` // Apply the animation with delay
            }}
        >
            <div className="flex items-center w-full gap-0.5">
                {/* Icon Placeholder */}
                <Image
                    src="/Done_round_main.png"
                    alt="Done icon"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                />
                <p
                    className="text-white font-medium text-base"
                >
                    {text}
                </p>
            </div>
        </div>
    );
};

export default Benefits;
