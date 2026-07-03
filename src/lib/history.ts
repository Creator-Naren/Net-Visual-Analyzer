export type AuditType = 'FULL_SCAN' | 'COMPARISON'
export type AuditStatus = 'COMPLETED' | 'WARNING' | 'FAILED'

export type AuditHistoryItem = {
  id: string
  timestamp: string
  domain: string
  type: AuditType
  score: number
  status: AuditStatus
}

const STORAGE_KEY = 'netsec.audit.history.v1'
const MAX_HISTORY = 100

function safeReadHistory(): AuditHistoryItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item) =>
      item &&
      typeof item.id === 'string' &&
      typeof item.timestamp === 'string' &&
      typeof item.domain === 'string' &&
      typeof item.type === 'string' &&
      typeof item.score === 'number' &&
      typeof item.status === 'string'
    )
  } catch {
    return []
  }
}

function writeHistory(items: AuditHistoryItem[]) {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
}

export function getAuditHistory(): AuditHistoryItem[] {
  return safeReadHistory()
}

export function clearAuditHistory() {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(STORAGE_KEY)
}

export function addAuditHistory(input: Omit<AuditHistoryItem, 'id' | 'timestamp'>) {
  const existing = safeReadHistory()
  const latest = existing[0]

  // Guard against accidental duplicate writes caused by page refresh or cached query hydration.
  if (latest) {
    const latestTs = new Date(latest.timestamp).getTime()
    const nowTs = Date.now()
    const isRecent = Number.isFinite(latestTs) && nowTs - latestTs < 90 * 1000
    const isSame =
      latest.domain === input.domain &&
      latest.type === input.type &&
      latest.score === input.score &&
      latest.status === input.status

    if (isRecent && isSame) {
      return latest
    }
  }

  const item: AuditHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...input,
  }

  writeHistory([item, ...existing])

  return item
}
