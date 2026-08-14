// 1 CKB = 100,000,000 shannons
const SHANNONS_PER_CKB = BigInt(100_000_000)

/**
 * Convert CKB (number entered by user) to shannons (integer for storage)
 * e.g. 1000 CKB → 100000000000n shannons
 */
export function ckbToShannons(ckb: number): bigint {
  return BigInt(Math.round(ckb)) * SHANNONS_PER_CKB
}

/**
 * Convert shannons (from database) to CKB for display
 * e.g. 100000000000n → 1000
 */
export function shannonsToCkb(shannons: number | bigint): number {
  return Number(BigInt(shannons) / SHANNONS_PER_CKB)
}

/**
 * Format shannons as a readable CKB string
 * e.g. 100000000000 → "1,000 CKB"
 */
export function formatCkb(shannons: number | bigint): string {
  return `${shannonsToCkb(shannons).toLocaleString()} CKB`
}