import React from 'react'
import Image from 'next/image'

interface PassportProps {
  id?: number
  citizenId?: number
  nickname: string
  gender: 'male' | 'female'
  avatarUrl: string
}

export default function Passport({ id, citizenId, nickname, gender, avatarUrl }: PassportProps) {
  // Format citizenId to 9 digits with leading zeros
  const formattedCitizenId = citizenId ? 
    String(citizenId).padStart(9, '0') : 
    '000000000';
    
  // Format the ID with spaces for readability: 000 000 000
  const displayId = `${formattedCitizenId.substring(0, 3)} ${formattedCitizenId.substring(3, 6)} ${formattedCitizenId.substring(6, 9)}`;

  return (
    <div className="flex sm:flex-row flex-col gap-4 sm:gap-8 bg-[linear-gradient(-45deg,_#000000_-10%,_#252014_50%,_#000000_110%)] border border-main rounded-xl py-4 px-6 sm:p-4 w-fit mx-auto">
      {/* Avatar Section */}
      <div className="w-35 h-35 rounded-lg overflow-hidden border border-main">
        <Image
          src={avatarUrl || '/default-avatar.png'}
          alt={`${nickname}'s avatar`}
          width={128}
          height={128}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col items-center sm:items-start text-white gap-3 relative ">
        <div className="flex justify-between items-center py-0.5 px-6 border rounded-full border-main">
          <span className="text- tracking-wide text-main whitespace-nowrap">Anthropos Citizen</span>
        </div>
        <div className="flex flex-col items-center sm:block">
          <span className="block text-sm text-dim_smoke">Nickname</span>
          <span className="block text-lg font-semibold font-smoke">{nickname}</span>
        </div>
        <div className="flex flex-col items-center sm:block">
          <span className="block text-sm text-dim_smoke">Gender</span>
          <span className="block text-lg font-semibold font-smoke">{gender}</span>
        </div>
        <div className="text-main sm:absolute right-0 bottom-0">#{displayId}</div>
      </div>
    </div>
  )
}
