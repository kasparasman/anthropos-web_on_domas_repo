import React from 'react'

interface PassportProps {
  id: number
  nickname: string
  gender: 'male' | 'female'
  avatarUrl: string
}

export default function Passport({ id, nickname, gender, avatarUrl }: PassportProps) {
  return (
    <div className="flex items-center bg-black border border-main rounded-xl p-4 max-w-md">
      {/* Avatar Section */}
      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={avatarUrl}
          alt={`${nickname}'s avatar`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Section */}
      <div className="ml-4 flex-1 text-white">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm uppercase tracking-wide text-neutral-400">Anthropos Citizen</span>
          <span className="text-sm font-medium">#{id}</span>
        </div>
        <div className="mb-1">
          <span className="block text-xs text-neutral-400">Nickname</span>
          <span className="block text-lg font-semibold">{nickname}</span>
        </div>
        <div>
          <span className="block text-xs text-neutral-400">Gender</span>
          <span className="block text-lg font-semibold capitalize">{gender}</span>
        </div>
      </div>
    </div>
  )
}
