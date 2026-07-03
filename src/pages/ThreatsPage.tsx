import React from 'react'
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
  PageBody,
  StatGroup,
  Stat,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DataTable,
  Button,
  Input,
  toast,
} from '@blinkdotnew/ui'
import { Shield, AlertTriangle, Zap, Activity, MapPin, ExternalLink, Skull, RefreshCw, Search } from 'lucide-react'
import { BarChart } from '@blinkdotnew/ui'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchThreatIntel, getThreatDetailsForDomain } from '../lib/threatIntel'

const FALLBACK_DATA = {
  items: [
    {
      domain: 'pay-pal-secure-login.top',
      type: 'PHISHING' as const,
      source: 'OpenPhish Community Feed',
      confidence: 98,
      url: 'https://openphish.com/feed.txt',
    },
    {
      domain: 'bank-of-america-verify.com',
      type: 'PHISHING' as const,
      source: 'OpenPhish Community Feed',
      confidence: 95,
      url: 'https://openphish.com/feed.txt',
    },
    {
      domain: 'update-my-windows-sys.net',
      type: 'SUSPICIOUS' as const,
      source: 'OpenPhish Community Feed',
      confidence: 88,
      url: 'https://openphish.com/feed.txt',
    },
  ],
  totalUrls: 3,
  uniqueDomains: 3,
  highRiskCount: 2,
  zonesMonitored: 3,
}

function buildRiskMix(items: { confidence: number }[]) {
  const critical = items.filter((item) => item.confidence >= 95).length
  const high = items.filter((item) => item.confidence >= 90 && item.confidence < 95).length
  const medium = items.filter((item) => item.confidence >= 80 && item.confidence < 90).length

  return [
    { name: 'Critical', count: critical },
    { name: 'High', count: high },
    { name: 'Medium', count: medium },
  ]
}

function buildConfidenceBands(items: { confidence: number }[]) {
  const buckets = [
    { name: '95-100', min: 95, max: 100 },
    { name: '90-94', min: 90, max: 94 },
    { name: '80-89', min: 80, max: 89 },
    { name: '<80', min: 0, max: 79 },
  ]

  const total = items.length

  return buckets.map((bucket) => {
    const count = items.filter((item) => item.confidence >= bucket.min && item.confidence <= bucket.max).length
    return {
      name: bucket.name,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })
}

export function ThreatsPage() {
  const [domainInput, setDomainInput] = React.useState('google.com')
  const [iocSearch, setIocSearch] = React.useState('')
  const [selectedClassification, setSelectedClassification] = React.useState<{
    domain: string
    classification: 'PHISHING' | 'SUSPICIOUS'
    reasons: string[]
    details?: Array<{
      title: string
      severity: 'LOW' | 'MEDIUM' | 'HIGH'
      impact: string
      evidence: string
      recommendation: string
    }>
  } | null>(null)
  const [checkedIocRows, setCheckedIocRows] = React.useState<
    Array<{
      domain: string
      type: 'PHISHING' | 'SUSPICIOUS'
      source: string
      confidence: number
      url: string
    }>
  >([])
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['threat-intel', 'openphish-community'],
    queryFn: () => fetchThreatIntel(250),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  })
  const domainLookup = useMutation({
    mutationFn: (domain: string) => getThreatDetailsForDomain(domain),
    onSuccess: (detail) => {
      const derivedRow = {
        domain: detail.domain,
        type: detail.verdict === 'HIGH' ? ('PHISHING' as const) : ('SUSPICIOUS' as const),
        source: 'Website Threat Details',
        confidence: Math.max(5, Math.min(99, detail.riskScore)),
        url: `https://${detail.domain}`,
      }

      setCheckedIocRows((previous) => {
        const next = [derivedRow, ...previous.filter((row) => row.domain !== detail.domain)]
        return next.slice(0, 30)
      })
    },
    onError: () => toast.error('Could not fetch threat details for this website.'),
  })

  const runLookup = () => {
    const value = domainInput.trim()
    if (!value) {
      toast.error('Enter a website name first.')
      return
    }
    domainLookup.mutate(value)
  }

  const riskBadgeClass =
    domainLookup.data?.verdict === 'HIGH'
      ? 'bg-red-500/10 text-red-400 border-red-500/20'
      : domainLookup.data?.verdict === 'ELEVATED'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-green-500/10 text-green-400 border-green-500/20'

  const snapshot = data ?? FALLBACK_DATA
  const rows = snapshot.items.slice(0, 40)
  const activeLookupRow = React.useMemo(() => {
    if (!domainLookup.data) return null
    return {
      domain: domainLookup.data.domain,
      type: domainLookup.data.verdict === 'HIGH' ? ('PHISHING' as const) : ('SUSPICIOUS' as const),
      source: 'Website Threat Details',
      confidence: Math.max(5, Math.min(99, domainLookup.data.riskScore)),
      url: `https://${domainLookup.data.domain}`,
    }
  }, [domainLookup.data])

  const iocRows = React.useMemo(() => {
    const seen = new Set<string>()
    const combined = [
      ...(activeLookupRow ? [activeLookupRow] : []),
      ...checkedIocRows,
      ...rows,
    ]

    return combined.filter((row) => {
      const key = `${row.domain}|${row.source}|${row.url}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [activeLookupRow, checkedIocRows, rows])

  const filteredRows = React.useMemo(() => {
    const query = iocSearch.trim().toLowerCase()
    if (!query) return iocRows

    return iocRows.filter((row) => {
      const fingerprint = `${row.domain} ${row.type} ${row.source} ${row.url}`.toLowerCase()
      return fingerprint.includes(query)
    })
  }, [iocRows, iocSearch])

  const alerts = [...rows].sort((a, b) => b.confidence - a.confidence).slice(0, 3)
  const riskMixRows = React.useMemo(() => buildRiskMix(rows), [rows])
  const confidenceBands = React.useMemo(() => buildConfidenceBands(rows), [rows])
  const phishingCount = rows.filter((item) => item.type === 'PHISHING').length
  const suspiciousCount = rows.filter((item) => item.type === 'SUSPICIOUS').length
  const updatedLabel =
    dataUpdatedAt > 0 ? new Date(dataUpdatedAt).toLocaleString() : 'Using fallback sample'

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <PageTitle className="text-4xl font-black neon-text">Threat Intelligence</PageTitle>
            <PageDescription className="text-muted-foreground/80 mt-1">
              Live phishing indicators from OpenPhish community feed.
            </PageDescription>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Refresh Feed
          </Button>
        </div>
      </PageHeader>

      <PageBody className="space-y-8 animate-fade-in pb-6">
        {isLoading ? (
          <div className="min-h-[50vh] md:min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-xs">
                Syncing Threat Feed...
              </p>
            </div>
          </div>
        ) : (
          <>
            {isError ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
                Live feed could not be reached right now. Showing last safe fallback snapshot.
              </div>
            ) : null}

            <StatGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat
                label="Active URLs"
                value={snapshot.totalUrls.toLocaleString()}
                icon={<Skull className="text-red-400" />}
                className="glass-card border-red-500/10"
              />
              <Stat
                label="Unique Domains"
                value={snapshot.uniqueDomains.toLocaleString()}
                icon={<Shield className="text-cyan-400" />}
                className="glass-card border-cyan-500/10"
              />
              <Stat
                label="High Confidence"
                value={snapshot.highRiskCount.toLocaleString()}
                icon={<AlertTriangle className="text-amber-400" />}
                className="glass-card border-amber-500/10"
              />
              <Stat
                label="TLD Zones"
                value={snapshot.zonesMonitored.toLocaleString()}
                icon={<MapPin className="text-green-400" />}
                className="glass-card border-green-500/10"
              />
            </StatGroup>

            <Card className="glass-card border-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
                  Website Threat Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    value={domainInput}
                    onChange={(event) => setDomainInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') runLookup()
                    }}
                    placeholder="Enter a domain like example.com"
                    className="bg-transparent border-cyan-500/20"
                  />
                  <Button onClick={runLookup} className="gap-2" disabled={domainLookup.isPending}>
                    <Search className="w-4 h-4" />
                    Check Threats
                  </Button>
                </div>

                {domainLookup.isPending ? (
                  <div className="text-sm text-muted-foreground">Analyzing threat signals...</div>
                ) : null}

                {domainLookup.data ? (
                  <div className="space-y-4">
                    {(() => {
                      const domainResultRows =
                        domainLookup.data.feedMatches.length > 0
                          ? domainLookup.data.feedMatches.map((item) => ({
                              ...item,
                              reasons:
                                item.type === 'PHISHING'
                                  ? [
                                      'Domain appears in OpenPhish community feed.',
                                      `Confidence score from feed heuristics: ${item.confidence}%.`,
                                    ]
                                  : [
                                      'Domain appears in IOC feed but does not match strong phishing keywords.',
                                      `Confidence score from feed heuristics: ${item.confidence}%.`,
                                    ],
                              details: domainLookup.data.signalBreakdown,
                            }))
                          : [
                              {
                                domain: domainLookup.data.domain,
                                type: domainLookup.data.verdict === 'HIGH' ? 'PHISHING' : 'SUSPICIOUS',
                                confidence: Math.max(5, domainLookup.data.riskScore),
                                url: `https://${domainLookup.data.domain}`,
                                source: 'DNS/RDAP Domain Analysis',
                                reasons: domainLookup.data.reasons,
                                details: domainLookup.data.signalBreakdown,
                              },
                            ]

                      return (
                        <>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">{domainLookup.data.domain}</h3>
                      <Badge className={riskBadgeClass}>{domainLookup.data.verdict} RISK</Badge>
                      <Badge variant="outline">Risk Score {domainLookup.data.riskScore}/100</Badge>
                      <Badge variant="outline">DNS Score {domainLookup.data.dnsScore}/100</Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <Card className="bg-black/20 border-cyan-500/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                            Why This Result
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {domainLookup.data.reasons.map((reason) => (
                            <p key={reason} className="text-muted-foreground">
                              - {reason}
                            </p>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-black/20 border-cyan-500/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                            DNS Control Findings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          {domainLookup.data.dnsFindings.map((finding) => (
                            <p key={finding.category} className="text-muted-foreground">
                              <span className="text-cyan-300">{finding.category}:</span> {finding.message}
                            </p>
                          ))}
                          <p className="text-muted-foreground">
                            <span className="text-cyan-300">Domain Age:</span>{' '}
                            {domainLookup.data.domainAgeDays !== null ? `${domainLookup.data.domainAgeDays} days` : 'Unavailable'}
                          </p>
                          <p className="text-muted-foreground">
                            <span className="text-cyan-300">Registrar:</span> {domainLookup.data.registrar ?? 'Unavailable'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-black/20 border-cyan-500/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                          Domain Record Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div className="rounded-md border border-cyan-500/15 px-3 py-2">
                          <p className="text-cyan-300 text-xs">A</p>
                          <p className="font-semibold">{domainLookup.data.dnsRecordSummary.a}</p>
                        </div>
                        <div className="rounded-md border border-cyan-500/15 px-3 py-2">
                          <p className="text-cyan-300 text-xs">AAAA</p>
                          <p className="font-semibold">{domainLookup.data.dnsRecordSummary.aaaa}</p>
                        </div>
                        <div className="rounded-md border border-cyan-500/15 px-3 py-2">
                          <p className="text-cyan-300 text-xs">MX</p>
                          <p className="font-semibold">{domainLookup.data.dnsRecordSummary.mx}</p>
                        </div>
                        <div className="rounded-md border border-cyan-500/15 px-3 py-2">
                          <p className="text-cyan-300 text-xs">NS</p>
                          <p className="font-semibold">{domainLookup.data.dnsRecordSummary.ns}</p>
                        </div>
                        <div className="rounded-md border border-cyan-500/15 px-3 py-2">
                          <p className="text-cyan-300 text-xs">TXT</p>
                          <p className="font-semibold">{domainLookup.data.dnsRecordSummary.txt}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 border-cyan-500/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                          Recommended Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {domainLookup.data.recommendationSummary.length > 0 ? (
                          domainLookup.data.recommendationSummary.map((recommendation) => (
                            <p key={recommendation} className="text-muted-foreground">
                              - {recommendation}
                            </p>
                          ))
                        ) : (
                          <p className="text-muted-foreground">No urgent action suggested for this domain.</p>
                        )}
                      </CardContent>
                    </Card>

                    <DataTable
                      columns={[
                        { accessorKey: 'domain', header: 'Matched Domain' },
                        {
                          accessorKey: 'type',
                          header: 'Classification',
                          cell: ({ row }) => (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedClassification({
                                  domain: row.original.domain,
                                  classification:
                                    row.original.type === 'PHISHING' ? 'PHISHING' : 'SUSPICIOUS',
                                  reasons:
                                    row.original.reasons ??
                                    ['No detailed reason available for this record.'],
                                  details: row.original.details,
                                })
                              }
                              className="focus:outline-none"
                              aria-label={`Show reason for ${row.original.type} classification`}
                            >
                              <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-mono text-[10px] uppercase hover:bg-red-500/20 transition-colors">
                                {row.original.type}
                              </Badge>
                            </button>
                          ),
                        },
                        {
                          accessorKey: 'confidence',
                          header: 'Confidence',
                          cell: ({ row }) => <span className="font-mono text-xs">{row.original.confidence}%</span>,
                        },
                        {
                          id: 'url',
                          header: 'Source URL',
                          cell: ({ row }) => (
                            <a href={row.original.url} target="_blank" rel="noreferrer" className="text-cyan-400 text-xs hover:underline">
                              View IOC
                            </a>
                          ),
                        },
                      ]}
                      data={domainResultRows}
                    />
                    {selectedClassification ? (
                      <Card className="bg-black/20 border-cyan-500/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs font-mono uppercase tracking-widest text-cyan-300">
                            Classification Insight
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <p className="text-foreground">
                            <span className="text-cyan-300">{selectedClassification.domain}</span> was marked as{' '}
                            <span className="text-amber-300">{selectedClassification.classification}</span> for these reasons:
                          </p>
                          {selectedClassification.reasons.map((reason) => (
                            <p key={`${selectedClassification.domain}-${reason}`} className="text-muted-foreground">
                              - {reason}
                            </p>
                          ))}
                          {selectedClassification.details?.length ? (
                            <div className="mt-3 space-y-2">
                              {selectedClassification.details.map((signal) => (
                                <div key={`${selectedClassification.domain}-${signal.title}`} className="rounded-md border border-cyan-500/10 px-3 py-2">
                                  <p className="text-cyan-300 text-xs font-mono uppercase tracking-widest">
                                    {signal.title} ({signal.severity})
                                  </p>
                                  <p className="text-muted-foreground text-sm mt-1">
                                    <span className="text-cyan-300">Impact:</span> {signal.impact}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    <span className="text-cyan-300">Evidence:</span> {signal.evidence}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    <span className="text-cyan-300">Action:</span> {signal.recommendation}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Click a classification badge to see the exact reason.
                      </p>
                    )}
                        </>
                      )
                    })()}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Risk Severity Mix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BarChart
                    data={riskMixRows}
                    dataKey="count"
                    xAxisKey="name"
                    height={280}
                  />
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-2 text-xs">
                    {riskMixRows.map((row) => (
                      <div key={row.name} className="rounded-md border border-cyan-500/15 px-3 py-2.5 bg-black/20">
                        <p className="text-cyan-300 font-mono text-[11px] tracking-wide">{row.name}</p>
                        <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{row.count}</p>
                        <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">entries</p>
                      </div>
                    ))}
                    <div className="rounded-md border border-red-500/20 px-3 py-2.5 bg-red-500/5">
                      <p className="text-red-300 font-mono text-[11px] tracking-wide">PHISHING</p>
                      <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{phishingCount}</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">classification total</p>
                    </div>
                    <div className="rounded-md border border-amber-500/20 px-3 py-2.5 bg-amber-500/5">
                      <p className="text-amber-300 font-mono text-[11px] tracking-wide">SUSPICIOUS</p>
                      <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{suspiciousCount}</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">classification total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Top Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={`${alert.domain}-${alert.confidence}`} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-red-300 truncate">{alert.domain}</h4>
                        <p className="text-xs text-muted-foreground">
                          Potential phishing indicator in live community feed.
                        </p>
                        <span className="text-[10px] font-mono text-red-400/60 uppercase">
                          CONFIDENCE {alert.confidence}% // {alert.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-cyan-500/10">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Confidence Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BarChart
                  data={confidenceBands}
                  dataKey="count"
                  xAxisKey="name"
                  height={220}
                />
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-2 text-xs">
                  {confidenceBands.map((bucket) => (
                    <div key={bucket.name} className="rounded-md border border-cyan-500/15 px-3 py-2.5 bg-black/20">
                      <p className="text-cyan-300 font-mono text-[11px] tracking-wide">{bucket.name}</p>
                      <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{bucket.count}</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">{bucket.percent}% of stream</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/5">
                <CardTitle className="text-lg font-mono text-cyan-400 uppercase tracking-widest">
                  Live IOC Stream
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Source: OpenPhish Community Feed ({updatedLabel})
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This section shows current feed entries only. Use "Website Threat Details" above to analyze any domain.
                </p>
                <div className="mt-3 relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/70" />
                  <Input
                    value={iocSearch}
                    onChange={(event) => setIocSearch(event.target.value)}
                    placeholder="Search IOC stream by domain, classification, source, or URL"
                    className="pl-10 bg-transparent border-cyan-500/20"
                  />
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Domain</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Classification</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Intel Source</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Confidence</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                          No results.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, index) => (
                        <tr key={`${row.domain}-${row.source}-${index}`} className="border-t border-white/5">
                          <td className="px-4 py-3 text-sm">{row.domain}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 font-mono text-[10px] uppercase">
                              {row.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{row.source}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <svg
                                className="flex-1 h-1.5 w-16 overflow-hidden rounded-full bg-white/5"
                                viewBox="0 0 100 4"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                              >
                                <rect x="0" y="0" width="100" height="4" rx="2" fill="rgba(255,255,255,0.05)" />
                                <rect x="0" y="0" width={row.confidence} height="4" rx="2" fill="#ef4444" />
                              </svg>
                              <span className="font-mono text-[10px]">{row.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a href={row.url} target="_blank" rel="noreferrer" aria-label={`Open IOC ${row.domain}`}>
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-cyan-400 transition-colors" />
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 text-xs text-muted-foreground border-t border-white/5">
                Showing {filteredRows.length} of {iocRows.length} IOC entries (including checked domains)
              </div>
            </Card>
          </>
        )}
      </PageBody>
    </Page>
  )
}
