// types/asset.ts
export interface Asset {
  id: string
  name: string
  description?: string | null
  logoUrl: string
  websiteUrl?: string | null
  totalInvestment: number
  tokenCount: number
  order?: number
  isActive?: boolean
}

export interface AssetStats {
  totalInvestment: number
  totalTokens: number
  assetCount: number
}
