export interface EpochFormat {
  iso: string
  local: string
  unit: 'seconds' | 'milliseconds'
}

const MIN_REASONABLE_MS = Date.UTC(2000, 0, 1)
const MAX_REASONABLE_MS = Date.UTC(2100, 0, 1)

function inReasonableRange(ms: number): boolean {
  return ms >= MIN_REASONABLE_MS && ms <= MAX_REASONABLE_MS
}

export function formatEpoch(value: unknown): EpochFormat | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null

  let ms: number
  let unit: EpochFormat['unit']

  if (value >= 1_000_000_000 && value < 10_000_000_000) {
    ms = value * 1000
    unit = 'seconds'
  } else if (value >= 1_000_000_000_000 && value < 10_000_000_000_000) {
    ms = value
    unit = 'milliseconds'
  } else {
    return null
  }

  if (!inReasonableRange(ms)) return null

  const date = new Date(ms)
  return {
    iso: date.toISOString(),
    local: date.toLocaleString(),
    unit,
  }
}

export function formatValueWithEpoch(value: unknown): string {
  const epoch = formatEpoch(value)
  if (!epoch) return JSON.stringify(value)
  return `${JSON.stringify(value)} (${epoch.local}, ${epoch.unit})`
}
