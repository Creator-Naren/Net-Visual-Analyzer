import { analyzeSecurity } from './dns'

export type ThreatIntelItem = {
  url: string
  domain: string
  type: 'PHISHING' | 'SUSPICIOUS'
  source: string
  confidence: number
}

export type ThreatIntelSnapshot = {
  items: ThreatIntelItem[]
  totalUrls: number
  uniqueDomains: number
  highRiskCount: number
  zonesMonitored: number
}

export type ThreatDomainDetail = {
  domain: string
  riskScore: number
  verdict: 'LOW' | 'ELEVATED' | 'HIGH'
  reasons: string[]
  feedMatches: ThreatIntelItem[]
  dnsScore: number
  feedAvailable: boolean
  domainAgeDays: number | null
  registrationDate: string | null
  expirationDate: string | null
  registrar: string | null
  dnsRecordSummary: {
    a: number
    aaaa: number
    mx: number
    ns: number
    txt: number
  }
  signalBreakdown: ThreatSignal[]
  recommendationSummary: string[]
  dnsFindings: Array<{
    category: 'DNSSEC' | 'SPF' | 'DMARC'
    status: 'SUCCESS' | 'WARNING' | 'ERROR'
    message: string
  }>
}

export type ThreatSignal = {
  id: string
  title: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  impact: string
  evidence: string
  recommendation: string
  scoreDelta: number
}

const OPENPHISH_FEED_URL = 'https://openphish.com/feed.txt'
const DEFAULT_LIMIT = 250

const HIGH_RISK_KEYWORDS = [
  'login',
  'verify',
  'secure',
  'account',
  'bank',
  'wallet',
  'payment',
  'mfa',
  'update',
]

const SUSPICIOUS_TLDS = new Set([
  'top',
  'xyz',
  'click',
  'shop',
  'support',
  'info',
  'live',
])

const BRAND_KEYWORDS = [
  'paypal',
  'microsoft',
  'apple',
  'google',
  'amazon',
  'bank',
  'meta',
]

const COMMON_SECOND_LEVEL_TLDS = new Set([
  'co.uk',
  'org.uk',
  'gov.uk',
  'ac.uk',
  'co.jp',
  'com.au',
  'net.au',
  'org.au',
  'com.br',
  'com.mx',
])

function getApexDomain(hostname: string): string {
  const host = hostname.toLowerCase().replace(/^www\./, '')
  const parts = host.split('.').filter(Boolean)

  if (parts.length <= 2) {
    return host
  }

  const lastTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
  if (COMMON_SECOND_LEVEL_TLDS.has(lastTwo) && parts.length >= 3) {
    return `${parts[parts.length - 3]}.${lastTwo}`
  }

  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`
}

function calculateConfidence(url: string, domain: string): number {
  let score = 22

  let parsed: URL | null = null
  try {
    parsed = new URL(url)
  } catch {
    parsed = null
  }

  const safePath = parsed ? `${parsed.pathname}${parsed.search}`.toLowerCase() : ''
  const safeHost = domain.toLowerCase()
  const fingerprint = `${safeHost} ${safePath}`
  const riskyKeywordHits = HIGH_RISK_KEYWORDS.filter((keyword) => fingerprint.includes(keyword)).length

  score += Math.min(24, riskyKeywordHits * 6)

  const brandHits = BRAND_KEYWORDS.filter((keyword) => fingerprint.includes(keyword)).length
  score += Math.min(18, brandHits * 9)

  if (safeHost.includes('xn--')) {
    score += 22
  }

  const hyphenCount = (safeHost.match(/-/g) || []).length
  if (hyphenCount >= 2) {
    score += 10
  } else if (hyphenCount === 1) {
    score += 4
  }

  if (safeHost.split('.').length >= 4) {
    score += 8
  }

  const digitRatio = (safeHost.match(/\d/g) || []).length / Math.max(safeHost.length, 1)
  if (digitRatio >= 0.2) {
    score += 8
  }

  const tld = safeHost.split('.').pop() || ''
  if (SUSPICIOUS_TLDS.has(tld)) {
    score += 10
  }

  if (safePath.includes('@') || safePath.includes('%40')) {
    score += 12
  }

  if (/redirect|signin|auth|wallet|recovery|reset/.test(safePath)) {
    score += 8
  }

  if (safeHost.length >= 28) {
    score += 6
  }

  return Math.max(5, Math.min(99, Math.round(score)))
}

function classify(url: string, domain: string): ThreatIntelItem['type'] {
  return calculateConfidence(url, domain) >= 70 ? 'PHISHING' : 'SUSPICIOUS'
}

function toSafeHostname(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

function normalizeDomain(input: string): string {
  const value = input.trim().toLowerCase()
  if (!value) return ''
  try {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return new URL(value).hostname.toLowerCase()
    }
    return new URL(`https://${value}`).hostname.toLowerCase()
  } catch {
    return value.replace(/^www\./, '')
  }
}

function isRelatedDomain(target: string, candidate: string): boolean {
  return candidate === target || candidate.endsWith(`.${target}`) || target.endsWith(`.${candidate}`)
}

async function fetchRdapProfile(domain: string): Promise<{
  domainAgeDays: number | null
  registrationDate: string | null
  expirationDate: string | null
  registrar: string | null
}> {
  try {
    const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      redirect: 'follow',
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`RDAP lookup failed (${response.status})`)
    }

    const payload = await response.json()
    const events = Array.isArray(payload?.events) ? payload.events : []
    const registrationDate = events.find((event) => event?.eventAction === 'registration')?.eventDate ?? null
    const expirationDate = events.find((event) => event?.eventAction === 'expiration')?.eventDate ?? null
    const registrar =
      Array.isArray(payload?.entities) && payload.entities.length > 0
        ? payload.entities.find((entity) => entity?.roles?.includes('registrar'))?.vcardArray?.[1]?.find(
            (entry) => Array.isArray(entry) && entry[0] === 'fn',
          )?.[3] ?? null
        : null

    let domainAgeDays: number | null = null
    if (registrationDate) {
      const createdAt = new Date(registrationDate).getTime()
      if (!Number.isNaN(createdAt)) {
        domainAgeDays = Math.max(0, Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)))
      }
    }

    return { domainAgeDays, registrationDate, expirationDate, registrar }
  } catch {
    return { domainAgeDays: null, registrationDate: null, expirationDate: null, registrar: null }
  }
}

export async function fetchThreatIntel(limit = DEFAULT_LIMIT): Promise<ThreatIntelSnapshot> {
  const response = await fetch(OPENPHISH_FEED_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Threat feed request failed (${response.status})`)
  }

  const body = await response.text()
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('http://') || line.startsWith('https://'))

  const uniqueUrls = Array.from(new Set(lines))
  const chosen = uniqueUrls.slice(0, limit)

  const items: ThreatIntelItem[] = chosen
    .map((url) => {
      const domain = toSafeHostname(url)
      if (!domain) return null

      return {
        url,
        domain,
        source: 'OpenPhish Community Feed',
        type: classify(url, domain),
        confidence: calculateConfidence(url, domain),
      } satisfies ThreatIntelItem
    })
    .filter((item): item is ThreatIntelItem => Boolean(item))

  const uniqueDomains = new Set(items.map((item) => getApexDomain(item.domain)))
  const zonesMonitored = new Set(
    items.map((item) => {
      const parts = getApexDomain(item.domain).split('.')
      return parts[parts.length - 1] || 'unknown'
    }),
  )

  return {
    items,
    totalUrls: uniqueUrls.length,
    uniqueDomains: uniqueDomains.size,
    highRiskCount: items.filter((item) => item.confidence >= 90).length,
    zonesMonitored: zonesMonitored.size,
  }
}

export async function getThreatDetailsForDomain(rawDomain: string): Promise<ThreatDomainDetail> {
  const domain = normalizeDomain(rawDomain)
  if (!domain) {
    throw new Error('Enter a valid domain')
  }

  const [snapshotResult, dnsResult, rdapResult] = await Promise.allSettled([
    fetchThreatIntel(5000),
    analyzeSecurity(domain),
    fetchRdapProfile(domain),
  ])

  const feedAvailable = snapshotResult.status === 'fulfilled'
  const snapshot =
    snapshotResult.status === 'fulfilled'
      ? snapshotResult.value
      : { items: [] as ThreatIntelItem[], totalUrls: 0, uniqueDomains: 0, highRiskCount: 0, zonesMonitored: 0 }

  if (dnsResult.status === 'rejected') {
    throw new Error('DNS analysis failed')
  }
  const dnsAnalysis = dnsResult.value

  const feedMatches = snapshot.items.filter((item) => isRelatedDomain(domain, item.domain)).slice(0, 25)
  const avgConfidence =
    feedMatches.length > 0
      ? Math.round(feedMatches.reduce((sum, item) => sum + item.confidence, 0) / feedMatches.length)
      : 0

  let riskScore = 0
  const reasons: string[] = []
  const signalBreakdown: ThreatSignal[] = []

  if (feedMatches.length > 0) {
    const feedRisk = Math.min(55, Math.round(avgConfidence * 0.45) + Math.min(20, feedMatches.length * 3))
    riskScore += feedRisk
    reasons.push(`Found ${feedMatches.length} OpenPhish match${feedMatches.length > 1 ? 'es' : ''}`)
    signalBreakdown.push({
      id: 'openphish-match',
      title: 'OpenPhish Match Detected',
      severity: 'HIGH',
      impact: 'The domain or closely related host appears in a community phishing feed.',
      evidence: `${feedMatches.length} matched IOC entr${feedMatches.length > 1 ? 'ies' : 'y'}; average confidence ${avgConfidence}%.`,
      recommendation: 'Block this domain in DNS/web filter and investigate recent user activity for possible credential theft.',
      scoreDelta: feedRisk,
    })
  } else {
    reasons.push(feedAvailable ? 'No OpenPhish matches found for this domain' : 'Live OpenPhish feed unavailable; result based on DNS analysis')
    signalBreakdown.push({
      id: 'openphish-unavailable-or-clean',
      title: feedAvailable ? 'No Feed Matches' : 'Feed Temporarily Unavailable',
      severity: feedAvailable ? 'LOW' : 'MEDIUM',
      impact: feedAvailable
        ? 'No direct IOC hit was found in the live feed snapshot.'
        : 'Threat feed could not be verified in real time.',
      evidence: feedAvailable ? '0 IOC matches in OpenPhish sample.' : 'OpenPhish snapshot request failed during lookup.',
      recommendation: feedAvailable
        ? 'Continue monitoring and correlate with DNS controls.'
        : 'Retry lookup and verify with an additional threat feed source.',
      scoreDelta: 0,
    })
  }

  const dnsPenalty = Math.max(0, 100 - dnsAnalysis.score)
  const dnsPenaltyContribution = Math.round(dnsPenalty * 0.35)
  riskScore += dnsPenaltyContribution

  const warningOrError = dnsAnalysis.findings.filter((finding) => finding.status !== 'SUCCESS')
  if (warningOrError.length > 0) {
    reasons.push(`DNS security gaps detected: ${warningOrError.map((finding) => finding.category).join(', ')}`)
    signalBreakdown.push({
      id: 'dns-control-gap',
      title: 'DNS Control Gaps',
      severity: warningOrError.some((finding) => finding.status === 'ERROR') ? 'HIGH' : 'MEDIUM',
      impact: 'Missing or weak DNS controls can make spoofing/phishing abuse easier.',
      evidence: warningOrError.map((finding) => `${finding.category}: ${finding.message}`).join(' | '),
      recommendation: 'Harden SPF/DMARC/DNSSEC policies and re-scan after DNS propagation.',
      scoreDelta: dnsPenaltyContribution,
    })
  } else {
    reasons.push('DNS security controls look healthy')
    signalBreakdown.push({
      id: 'dns-controls-healthy',
      title: 'DNS Controls Healthy',
      severity: 'LOW',
      impact: 'Strong DNS controls reduce impersonation and email spoofing risk.',
      evidence: 'DNSSEC, SPF, and DMARC checks are passing.',
      recommendation: 'Maintain current DNS policies and continue monitoring.',
      scoreDelta: 0,
    })
  }

  if (domain.includes('xn--') || domain.includes('--')) {
    riskScore += 10
    reasons.push('Domain format may indicate spoofing risk (punycode or suspicious separators)')
    signalBreakdown.push({
      id: 'domain-format-risk',
      title: 'Suspicious Domain Formatting',
      severity: 'MEDIUM',
      impact: 'Punycode or unusual separators are commonly used in lookalike phishing domains.',
      evidence: `Observed format pattern in ${domain}.`,
      recommendation: 'Validate brand similarity and consider user-facing block/warning controls.',
      scoreDelta: 10,
    })
  }

  const rdap = rdapResult.status === 'fulfilled' ? rdapResult.value : null
  if (rdap && rdap.domainAgeDays !== null) {
    if (rdap.domainAgeDays < 30) {
      riskScore += 25
      reasons.push(`Domain is very new (${rdap.domainAgeDays} days old)`)
      signalBreakdown.push({
        id: 'domain-age-very-new',
        title: 'Very New Domain',
        severity: 'HIGH',
        impact: 'Brand-new domains are frequently used in short-lived phishing campaigns.',
        evidence: `Domain age: ${rdap.domainAgeDays} days.`,
        recommendation: 'Treat as high-risk until trusted business legitimacy is established.',
        scoreDelta: 25,
      })
    } else if (rdap.domainAgeDays < 180) {
      riskScore += 12
      reasons.push(`Domain is relatively new (${rdap.domainAgeDays} days old)`)
      signalBreakdown.push({
        id: 'domain-age-new',
        title: 'Recently Registered Domain',
        severity: 'MEDIUM',
        impact: 'Newer domains carry elevated abuse probability.',
        evidence: `Domain age: ${rdap.domainAgeDays} days.`,
        recommendation: 'Require additional validation before trust and monitor for abuse signals.',
        scoreDelta: 12,
      })
    } else {
      reasons.push(`Domain age is ${rdap.domainAgeDays} days`)
      signalBreakdown.push({
        id: 'domain-age-established',
        title: 'Established Domain Age',
        severity: 'LOW',
        impact: 'Older domains are generally less likely to be throwaway phishing infrastructure.',
        evidence: `Domain age: ${rdap.domainAgeDays} days.`,
        recommendation: 'Use age as context only; still combine with feed and DNS controls.',
        scoreDelta: 0,
      })
    }
  } else {
    signalBreakdown.push({
      id: 'rdap-unavailable',
      title: 'Registration Metadata Unavailable',
      severity: 'LOW',
      impact: 'Could not fetch domain age/registrar for additional confidence.',
      evidence: 'RDAP lookup unavailable for this query.',
      recommendation: 'Retry later or enrich via secondary WHOIS/RDAP source.',
      scoreDelta: 0,
    })
  }

  riskScore = Math.min(100, riskScore)
  const verdict: ThreatDomainDetail['verdict'] = riskScore >= 70 ? 'HIGH' : riskScore >= 35 ? 'ELEVATED' : 'LOW'

  const recommendationSummary = signalBreakdown
    .filter((signal) => signal.severity !== 'LOW')
    .slice(0, 3)
    .map((signal) => signal.recommendation)

  return {
    domain,
    riskScore,
    verdict,
    reasons,
    feedMatches,
    dnsScore: dnsAnalysis.score,
    feedAvailable,
    domainAgeDays: rdap?.domainAgeDays ?? null,
    registrationDate: rdap?.registrationDate ?? null,
    expirationDate: rdap?.expirationDate ?? null,
    registrar: rdap?.registrar ?? null,
    dnsRecordSummary: {
      a: dnsAnalysis.records.A?.length ?? 0,
      aaaa: dnsAnalysis.records.AAAA?.length ?? 0,
      mx: dnsAnalysis.records.MX?.length ?? 0,
      ns: dnsAnalysis.records.NS?.length ?? 0,
      txt: dnsAnalysis.records.TXT?.length ?? 0,
    },
    signalBreakdown,
    recommendationSummary,
    dnsFindings: dnsAnalysis.findings,
  }
}
