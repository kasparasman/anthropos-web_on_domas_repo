// types/dex-tools.ts
export interface DexToolsResponse {
  price: number | string
  volume24h: number | string
  variation24h: number | string
  marketCap: number | string
  mcap?: number | string // alias for compatibility
  // …add any other fields the API returns
}
