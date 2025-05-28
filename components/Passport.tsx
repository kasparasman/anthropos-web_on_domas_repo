import React from 'react'

interface PassportProps {
  id: number
  nickname: string
  gender: 'male' | 'female'
  avatarUrl: string
}

export default function Passport({ id, nickname, gender, avatarUrl }: PassportProps) {
  return (
    <div className="flex sm:flex-row flex-col gap-4 sm:gap-8 bg-[linear-gradient(-45deg,_#000000_-10%,_#252014_50%,_#000000_110%)] border border-main rounded-xl py-4 px-6 sm:p-4 w-fit mx-auto">
      {/* Avatar Section */}
      <div className="w-50 h-50 rounded-lg overflow-hidden bg-gray">
        <img
          src={''}
          alt={`${nickname}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col items-center sm:items-start text-white gap-3 relative ">
        <div className="flex justify-between items-center py-0.5 px-6 border rounded-full border-main">
          <span className="text- tracking-wide text-main">Anthropos Citizen</span>
        </div>
        <div className="flex flex-col items-center sm:block">
          <span className="block text-sm text-dim_smoke">Nickname</span>
          <span className="block text-lg font-semibold font-smoke">{nickname}</span>
        </div>
        <div className="flex flex-col items-center sm:block">
          <span className="block text-sm text-dim_smoke">Gender</span>
          <span className="block text-lg font-semibold font-smoke">{gender}</span>
        </div>
        <div className="text-main sm:absolute right-0 bottom-0"># 000 000 00{id}</div>

      </div>
    </div>
  )
}
