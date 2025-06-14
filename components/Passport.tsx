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
  // Ensure a fixed-width 9-digit display (up to 999,999,999).
  const formattedCitizenId = citizenId !== undefined ?
    String(citizenId).padStart(9, '0') :
    '000000000';

  // Group as 000 000 000 for readability
  const displayId = `${formattedCitizenId.slice(0, 3)} ${formattedCitizenId.slice(3, 6)} ${formattedCitizenId.slice(6, 9)}`;

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
        <div className="block font-semibold font-smoke">
          {nickname
            ? nickname.charAt(0).toUpperCase() + nickname.slice(1)
            : <span className="text-dim_smoke italic">Generating…</span>
          }
        </div>
        <div className="flex text-sm font-medium text-dim_smoke justify-end">Gender</div>
        <div className="block  font-semibold font-smoke">{gender.charAt(0).toUpperCase() + gender.slice(1)}</div>
      </div>
      <div className="text-main font-medium text-center"># {displayId}</div>
    </div>
  )
}
