// components/BanWarnDialog.tsx
import { signOut } from 'next-auth/react'

export default function BanWarnDialog({
    banned, warnings, reason, onClose
  }: {
    banned: boolean
    warnings: number
    reason: string
    onClose: () => void
  }) {

    const handleClose = async () => {
        if (banned) {
          await signOut({redirect: false})
        }
        onClose()                     // clear the warn state in parent
      }
    

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-stone-800 p-8 rounded-lg w-full max-w-md border-2 border-red-500">
          <h2 className={`text-2xl font-bold mb-6 ${banned ? 'text-red-500' : 'text-yellow-500'}`}>
            {banned ? "⚠️ Account Banned" : "⚠️ Content Warning"}
          </h2>
  
          <p className="mb-6 text-lg">{reason}</p>
  
          {!banned && (
            <p className="mb-6 text-yellow-500 font-semibold">
              Warning count: {warnings} / 2
              <br />
              <span className="text-red-500">After two warnings your account will be permanently banned.</span>
            </p>
          )}
  
          {banned && (
            <p className="mb-6 text-red-500">
              Your account has been permanently disabled due to repeated violations.
              <br /><br />
              Contact support if you believe this is an error.
            </p>
          )}
  
          <button
            className={`px-6 py-3 rounded-lg font-semibold ${
              banned 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            } text-black transition-colors`}
            onClick={handleClose}
          >
            {banned ? 'Close and Sign Out' : 'Acknowledge Warning'}
          </button>
        </div>
      </div>
    )
  }
  