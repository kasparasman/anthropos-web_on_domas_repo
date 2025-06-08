import React from 'react'
import Image from 'next/image'
import QRCode from 'react-qr-code';

interface PassportProps {
  id?: number
  citizenId?: number
  nickname: string
  gender: 'male' | 'female'
  avatarUrl: string
  className?: string
}

export default function Passport({ id, citizenId, nickname, gender, avatarUrl, className }: PassportProps) {
  // Format citizenId to 9 digits with leading zeros
  const formattedCitizenId = citizenId ?
    String(citizenId).padStart(10, '0') :
    '0000000000';

  // Format the ID with spaces for readability: 000 000 000
  const displayId = `${formattedCitizenId.substring(0, 1)} ${formattedCitizenId.substring(1, 4)} ${formattedCitizenId.substring(4, 7)} ${formattedCitizenId.substring(6, 9)}`;

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/users/${nickname}`;

  return (
    <div className={`flex  flex-col justify-center gap-3 bg-[linear-gradient(-45deg,#252014_0%,#000000_50%,#252014_100%)] border border-main rounded-[16px] p-4 ${className}`}>
      {/* Avatar Section */}
      <div className="w-60 h-60 rounded-lg overflow-hidden relative">
        <Image
          src={avatarUrl || '/communicator.png'}
          alt={`${nickname}'s avatar`}
          width={600}
          height={600}
          className="w-60 h-60 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-white p-1 rounded-md">
          <QRCode
            value={profileUrl}
            size={40}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="L"
          />
        </div>
      </div>

      {/* Info Section */}
      <span className="text-[20px] text-main font-semibold whitespace-nowrap text-center">Anthropos Citizen</span>
      <div className="grid grid-cols-2 gap-2 items-center">
        <div className="flex text-sm font-medium text-dim_smoke justify-end">Name</div>
        <div className="block  font-semibold font-smoke">{nickname}</div>
        <div className="flex text-sm font-medium text-dim_smoke justify-end">Gender</div>
        <div className="block  font-semibold font-smoke">{gender}</div>
      </div>
      <div className="text-main font-medium text-center"># {displayId}</div>
    </div>
  )
}
