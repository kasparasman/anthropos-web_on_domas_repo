import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { uploadFromUrlToTmp } from '../../lib/uploadFromUrlToTmp'   // helper below

const LIGHTX_API_URL = 'https://api.lightxeditor.com/external/api/v1/avatar'
const LIGHTX_STATUS_URL = 'https://api.lightxeditor.com/external/api/v1/order-status'
const MAX_RETRIES = 5
const RETRY_DELAY = 3000 // 3 seconds in milliseconds

// Helper function to wait for specified milliseconds
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to check order status
async function checkOrderStatus(orderId: string, apiKey: string): Promise<{ status: string; output?: string }> {
  const { data } = await axios.post(
    LIGHTX_STATUS_URL,
    { orderId },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    }
  )

  console.log('📊 [avatar-gen] Status check response:', data)

  if (data?.statusCode !== 2000) {
    throw new Error(`Invalid status response: ${JSON.stringify(data)}`)
  }

  return {
    status: data.body.status,
    output: data.body.output
  }
}

// Helper function to poll for completion
async function pollForCompletion(orderId: string, apiKey: string): Promise<string> {
  let retries = 0

  while (retries < MAX_RETRIES) {
    const { status, output } = await checkOrderStatus(orderId, apiKey)
    console.log(`🔄 [avatar-gen] Attempt ${retries + 1}/${MAX_RETRIES}: Status = ${status}`)

    if (status === 'active' && output) {
      return output
    }

    if (status === 'failed') {
      throw new Error('Avatar generation failed')
    }

    // Wait before next retry
    await delay(RETRY_DELAY)
    retries++
  }

  throw new Error(`Timed out after ${MAX_RETRIES} retries`)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  console.log('🎨 [avatar-gen] Starting generation with body:', req.body)

  // Validate environment variables
  if (!process.env.LIGHTX_API_KEY) {
    console.error('❌ [avatar-gen] Missing API key')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const { sourceUrl } = req.body as { sourceUrl: string }
  
  if (!sourceUrl) {
    console.error('❌ [avatar-gen] Missing sourceUrl in request body')
    return res.status(400).json({ error: 'sourceUrl is required' })
  }

  try {
    console.log('📡 [avatar-gen] Calling LightX API with URL:', sourceUrl)

    /* 1️⃣  Call LightX AI Avatar */
    const requestBody = JSON.stringify({
      imageUrl: sourceUrl,
      styleImageUrl: sourceUrl, // Use same image as style reference
      textPrompt: "Create a professional, high-quality avatar in a modern style"
    })

    console.log('📤 [avatar-gen] Request body:', requestBody)

    const { data: initResponse } = await axios.post(
      LIGHTX_API_URL,
      requestBody,
      { 
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': process.env.LIGHTX_API_KEY 
        }
      }
    )

    console.log('📥 [avatar-gen] Initial response:', initResponse)

    // Validate initial response
    if (initResponse?.statusCode !== 2000 || !initResponse?.body?.orderId) {
      console.error('❌ [avatar-gen] Invalid initial response:', initResponse)
      throw new Error('Invalid response from LightX API')
    }

    /* 2️⃣  Poll for completion */
    console.log('⏳ [avatar-gen] Polling for completion...')
    const avatarUrl = await pollForCompletion(
      initResponse.body.orderId,
      process.env.LIGHTX_API_KEY
    )

    /* 3️⃣  Re-upload avatar into our R2 tmp/ folder (so we control it) */
    console.log('📤 [avatar-gen] Re-uploading to R2:', avatarUrl)
    const tmpAvatarUrl = await uploadFromUrlToTmp(avatarUrl, 'png')

    console.log('✅ [avatar-gen] Success:', { tmpAvatarUrl })
    res.status(200).json({ tmpAvatarUrl })
  } catch (err: any) {
    const errorDetails = {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      requestBody: err.config?.data
    }
    console.error('❌ [avatar-gen] Error:', errorDetails)
    res.status(500).json({ 
      error: 'Avatar generation failed',
      details: errorDetails
    })
  }
}
