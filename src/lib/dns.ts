/**
 * DNS Lookup utility using Cloudflare's DoH API
 * https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/dns-json/
 */

export type DNSRecord = {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export type DNSResponse = {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: { name: string; type: number }[];
  Answer?: DNSRecord[];
  Authority?: DNSRecord[];
  Additional?: DNSRecord[];
}

export type SecurityFinding = {
  category: 'DNSSEC' | 'SPF' | 'DMARC'
  status: 'SUCCESS' | 'WARNING' | 'ERROR'
  message: string
}

export type SecurityAnalysis = {
  domain: string
  score: number
  findings: SecurityFinding[]
  records: {
    A?: DNSRecord[]
    AAAA?: DNSRecord[]
    MX?: DNSRecord[]
    TXT?: DNSRecord[]
    NS?: DNSRecord[]
  }
}

const TYPE_MAP: Record<string, number> = {
  'A': 1,
  'AAAA': 28,
  'MX': 15,
  'TXT': 16,
  'NS': 2,
  'CNAME': 5,
  'SOA': 6,
  'SRV': 33,
  'CAA': 257,
  'DNSSEC': 48, // DNSKEY
  'DS': 43,
}

function normalizeTxtRecord(value: string): string {
  return value.replace(/"/g, '').trim().toLowerCase()
}

function evaluateSpf(txtRecords: DNSRecord[] | undefined): { points: number; finding: SecurityFinding } {
  if (!txtRecords?.length) {
    return {
      points: 0,
      finding: { category: 'SPF', status: 'ERROR', message: 'Missing SPF record' },
    }
  }

  const spfRecordRaw = txtRecords
    .map((record) => normalizeTxtRecord(record.data))
    .find((record) => record.startsWith('v=spf1'))

  if (!spfRecordRaw) {
    return {
      points: 0,
      finding: { category: 'SPF', status: 'ERROR', message: 'SPF record not found in TXT records' },
    }
  }

  if (spfRecordRaw.includes(' -all')) {
    return {
      points: 15,
      finding: { category: 'SPF', status: 'SUCCESS', message: 'SPF strict policy (-all) is configured' },
    }
  }

  if (spfRecordRaw.includes(' ~all')) {
    return {
      points: 8,
      finding: { category: 'SPF', status: 'WARNING', message: 'SPF soft-fail (~all) detected; consider stricter enforcement' },
    }
  }

  if (spfRecordRaw.includes(' +all') || spfRecordRaw.includes(' ?all')) {
    return {
      points: 2,
      finding: { category: 'SPF', status: 'ERROR', message: 'SPF policy is too permissive (+all/?all)' },
    }
  }

  return {
    points: 5,
    finding: { category: 'SPF', status: 'WARNING', message: 'SPF record exists but all-mechanism is not strict' },
  }
}

function evaluateDmarc(dmarcRecords: DNSRecord[] | undefined): { points: number; finding: SecurityFinding } {
  if (!dmarcRecords?.length) {
    return {
      points: 0,
      finding: { category: 'DMARC', status: 'WARNING', message: 'DMARC policy missing' },
    }
  }

  const dmarcRaw = dmarcRecords
    .map((record) => normalizeTxtRecord(record.data))
    .find((record) => record.includes('v=dmarc1'))

  if (!dmarcRaw) {
    return {
      points: 0,
      finding: { category: 'DMARC', status: 'WARNING', message: 'DMARC TXT exists but policy is invalid' },
    }
  }

  const policyMatch = dmarcRaw.match(/(?:^|;)\s*p=([a-z]+)/i)
  const policy = policyMatch?.[1]?.toLowerCase()

  if (policy === 'reject') {
    return {
      points: 20,
      finding: { category: 'DMARC', status: 'SUCCESS', message: 'DMARC reject policy is enforced' },
    }
  }

  if (policy === 'quarantine') {
    return {
      points: 15,
      finding: { category: 'DMARC', status: 'SUCCESS', message: 'DMARC quarantine policy is enabled' },
    }
  }

  if (policy === 'none') {
    return {
      points: 5,
      finding: { category: 'DMARC', status: 'WARNING', message: 'DMARC policy is monitor-only (p=none)' },
    }
  }

  return {
    points: 0,
    finding: { category: 'DMARC', status: 'WARNING', message: 'DMARC policy value is unknown or malformed' },
  }
}

function evaluateDnssec(dnskey: DNSResponse, ds: DNSResponse): { points: number; finding: SecurityFinding } {
  const hasDnskey = Boolean(dnskey.Answer?.length)
  const hasDs = Boolean(ds.Answer?.length)

  if (hasDnskey && hasDs) {
    return {
      points: 25,
      finding: { category: 'DNSSEC', status: 'SUCCESS', message: 'DNSSEC key material and DS chain are present' },
    }
  }

  if (hasDnskey || hasDs) {
    return {
      points: 10,
      finding: { category: 'DNSSEC', status: 'WARNING', message: 'Partial DNSSEC data found; chain of trust may be incomplete' },
    }
  }

  return {
    points: 0,
    finding: { category: 'DNSSEC', status: 'ERROR', message: 'DNSSEC is not implemented' },
  }
}

export async function lookupDNS(name: string, type: keyof typeof TYPE_MAP = 'A'): Promise<DNSResponse> {
  const typeId = TYPE_MAP[type]
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${typeId}`
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/dns-json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`DNS lookup failed with status ${response.status}`)
  }
  
  return response.json()
}

export async function analyzeSecurity(domain: string): Promise<SecurityAnalysis> {
  try {
    const [a, aaaa, mx, txt, dnskey, ds, ns] = await Promise.all([
      lookupDNS(domain, 'A'),
      lookupDNS(domain, 'AAAA'),
      lookupDNS(domain, 'MX'),
      lookupDNS(domain, 'TXT'),
      lookupDNS(domain, 'DNSSEC'),
      lookupDNS(domain, 'DS'),
      lookupDNS(domain, 'NS'),
    ])

    const dmarc = await lookupDNS(`_dmarc.${domain}`, 'TXT').catch(() => null)
    
    let score = 35
    const findings: SecurityFinding[] = []
    const dnssecResult = evaluateDnssec(dnskey, ds)
    const spfResult = evaluateSpf(txt.Answer)
    const dmarcResult = evaluateDmarc(dmarc?.Answer)

    score += dnssecResult.points
    score += spfResult.points
    score += dmarcResult.points
    findings.push(dnssecResult.finding, spfResult.finding, dmarcResult.finding)

    if (mx.Answer && mx.Answer.length > 0) {
      score += 5
    }

    return {
      domain,
      score: Math.min(Math.round(score), 100),
      findings,
      records: {
        A: a.Answer,
        AAAA: aaaa.Answer,
        MX: mx.Answer,
        TXT: txt.Answer,
        NS: ns.Answer,
      }
    }
  } catch (error) {
    console.error('Analysis failed:', error)
    throw error
  }
}
