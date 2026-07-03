import React, { useState } from 'react'
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
  PageBody,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
} from '@blinkdotnew/ui'
import { Search, BrainCircuit, ShieldAlert, ShieldCheck, Database, FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { analyzeSecurity } from '../lib/dns'

type ControlMeta = {
  title: string
  colorClass: string
  badgeClass: string
  meaning: string
  why: string
}

const CONTROL_EXPLANATIONS: Record<'DNSSEC' | 'SPF' | 'DMARC', ControlMeta> = {
  DNSSEC: {
    title: 'DNSSEC',
    colorClass: 'from-cyan-500 to-blue-500',
    badgeClass: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300',
    meaning: 'Protects DNS records from tampering with a signed chain of trust.',
    why: 'The scan checks for DNSKEY and DS data. If both are present, the chain is strong. If only one is present, the trust path is incomplete. If neither is present, DNSSEC is not active.',
  },
  SPF: {
    title: 'SPF',
    colorClass: 'from-emerald-500 to-teal-400',
    badgeClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    meaning: 'Controls which mail servers are allowed to send on behalf of the domain.',
    why: 'The scanner looks for a TXT record that starts with v=spf1. A strict -all policy scores best, soft-fail ~all scores lower, and no SPF record means the domain is easier to spoof.',
  },
  DMARC: {
    title: 'DMARC',
    colorClass: 'from-amber-500 to-orange-400',
    badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    meaning: 'Adds a policy layer on top of SPF so receivers know what to do with suspicious mail.',
    why: 'The scan checks the _dmarc subdomain for p=reject, quarantine, or none. Reject is strongest, quarantine is intermediate, and missing or malformed policy lowers the result.',
  },
}

function statusTone(status: string) {
  if (status === 'SUCCESS') {
    return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
  }

  if (status === 'WARNING') {
    return 'border-amber-500/25 bg-amber-500/10 text-amber-300'
  }

  return 'border-red-500/25 bg-red-500/10 text-red-300'
}

function statusLabel(status: string) {
  if (status === 'SUCCESS') return 'Good signal'
  if (status === 'WARNING') return 'Partial signal'
  return 'Missing signal'
}

function buildReasoning(data: Awaited<ReturnType<typeof analyzeSecurity>> | undefined) {
  if (!data) {
    return []
  }

  const dnssec = data.findings.find((finding) => finding.category === 'DNSSEC')
  const spf = data.findings.find((finding) => finding.category === 'SPF')
  const dmarc = data.findings.find((finding) => finding.category === 'DMARC')

  return [
    {
      title: 'Overall score',
      detail: `The scan starts from a base score and adds points for DNSSEC, SPF, DMARC, and MX coverage. This domain ended at ${data.score}/100 because the strongest controls contributed the most points while missing controls reduced the total.`,
    },
    {
      title: 'DNSSEC result',
      detail: dnssec
        ? dnssec.message
        : 'DNSSEC was not returned by the scan, so there is no trust-chain evidence to evaluate.',
    },
    {
      title: 'SPF result',
      detail: spf
        ? spf.message
        : 'SPF was not detected in the TXT records, so sender authorization is unclear.',
    },
    {
      title: 'DMARC result',
      detail: dmarc
        ? dmarc.message
        : 'DMARC was not detected, so email receivers have less guidance on how to treat suspicious mail.',
    },
  ]
}

export function ResultsWhyPage() {
  const [domain, setDomain] = useState('google.com')
  const [searchQuery, setSearchQuery] = useState('google.com')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['why-results', searchQuery],
    queryFn: () => analyzeSecurity(searchQuery),
    enabled: !!searchQuery,
  })

  const reasoningRows = React.useMemo(() => buildReasoning(data), [data])

  const handleSearch = () => {
    const normalized = domain.trim().toLowerCase()

    if (!normalized) {
      return
    }

    if (normalized === searchQuery) {
      void refetch()
      return
    }

    setSearchQuery(normalized)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-col gap-3">
          <PageTitle className="text-4xl font-black neon-text flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-cyan-400" />
            Why These Results?
          </PageTitle>
          <PageDescription className="text-muted-foreground/80 max-w-3xl">
            Enter a domain and this page explains why the scan produced each result, using the same live DNS checks behind the dashboard.
          </PageDescription>
        </div>
      </PageHeader>

      <PageBody className="space-y-6 pb-6 animate-fade-in">
        <Card className="glass-card border-cyan-500/10">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Check a site</p>
                <p className="text-xs text-muted-foreground">Type a domain to see the reasoning behind the score and findings.</p>
              </div>
              <div className="flex w-full md:max-w-xl items-center gap-2">
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter domain (e.g. google.com)"
                  className="bg-black/20 border-cyan-500/15"
                />
                <Button onClick={handleSearch} size="icon" className="shrink-0 rounded-md neon-glow" disabled={isLoading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isError ? (
          <Card className="glass-card border-red-500/20">
            <CardContent className="p-6 text-center space-y-2">
              <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
              <p className="text-lg font-semibold text-foreground">Could not explain this domain</p>
              <p className="text-sm text-muted-foreground">The scan failed, so there is no result set to interpret yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6">
              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Result Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 rounded-lg border border-cyan-500/10 bg-black/20 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Current domain</p>
                      <p className="text-2xl font-black text-foreground">{data?.domain || searchQuery}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Security score</p>
                      <p className="text-4xl font-black neon-text">{data?.score ?? '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {data?.findings.map((finding) => {
                      const meta = CONTROL_EXPLANATIONS[finding.category]
                      return (
                        <div key={finding.category} className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{meta.title}</p>
                              <p className="text-xs text-muted-foreground">{meta.meaning}</p>
                            </div>
                            <Badge className={statusTone(finding.status)}>{statusLabel(finding.status)}</Badge>
                          </div>
                          <div className={`h-2 rounded-full bg-gradient-to-r ${meta.colorClass}`} />
                          <p className="text-xs text-muted-foreground leading-relaxed">{finding.message}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Why The Score Changed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {reasoningRows.map((row) => (
                    <div key={row.title} className="rounded-lg border border-cyan-500/10 bg-black/20 p-4 space-y-1">
                      <p className="font-semibold text-foreground">{row.title}</p>
                      <p className="text-muted-foreground leading-relaxed">{row.detail}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    What Each Control Means
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {(['DNSSEC', 'SPF', 'DMARC'] as const).map((key) => {
                    const meta = CONTROL_EXPLANATIONS[key]
                    return (
                      <div key={key} className="rounded-lg border border-white/5 bg-black/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-foreground">{meta.title}</p>
                          <Badge className={meta.badgeClass}>{meta.meaning}</Badge>
                        </div>
                        <p className="mt-2 text-muted-foreground leading-relaxed">{meta.why}</p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Data Behind The Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">A records</p>
                      <p className="text-2xl font-black text-foreground">{data?.records.A?.length || 0}</p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">MX records</p>
                      <p className="text-2xl font-black text-foreground">{data?.records.MX?.length || 0}</p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">NS records</p>
                      <p className="text-2xl font-black text-foreground">{data?.records.NS?.length || 0}</p>
                    </div>
                    <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">TXT records</p>
                      <p className="text-2xl font-black text-foreground">{data?.records.TXT?.length || 0}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground rounded-md border border-cyan-500/10 px-3 py-2 bg-cyan-500/5">
                    The page explains the live scan, not a cached summary. Re-run it on another domain to compare the reason chain.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </PageBody>
    </Page>
  )
}