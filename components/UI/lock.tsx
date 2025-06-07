import React from 'react';

interface LockProps {
    hideLines?: boolean;
    imgSrc?: string;
}

export const Lock: React.FC<LockProps> = ({ hideLines = false, imgSrc = '/lock.png' }) => {
    return (
        <div className="flex flex-row justify-center items-center gap-3">
            {!hideLines && <div className="w-[120px] h-0 border-t border-smoke border-solid"></div>}
            {/* Lock_alt_light (Component Instance) */}
            <div className="flex flex-row justify-center items-center w-10.5 h-10.5 p-0.5 rounded-[100px] bg-[#333333]">
                <img src={imgSrc} alt="Lock icon" className="w-full h-full object-contain" />
            </div>
            {!hideLines && <div className="w-[120px] h-0 border-t border-smoke border-solid"></div>}
        </div>
    );
};