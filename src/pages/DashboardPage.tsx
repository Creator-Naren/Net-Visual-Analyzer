import React, { useState } from 'react'
import { Page, PageHeader, PageTitle, PageDescription, PageBody, StatGroup, Stat, Button, Input, Card, CardHeader, CardTitle, CardContent } from '@blinkdotnew/ui'
import { Search, Globe, Shield, Activity, Lock, AlertTriangle, Zap } from 'lucide-react'
import { NetworkGlobe } from '../components/NetworkGlobe'
import { LineChart, BarChart } from '@blinkdotnew/ui'
import { useQuery } from '@tanstack/react-query'
import { analyzeSecurity } from '../lib/dns'
import { toast } from '@blinkdotnew/ui'
import { addAuditHistory } from '../lib/history'

const PROTOCOL_ORDER = ['A', 'AAAA', 'MX', 'NS', 'TXT'] as const

const CONTROL_STATUS_META = {
  SUCCESS: {
    label: 'Configured',
    barClass: 'bg-gradient-to-r from-emerald-500 to-cyan-400',
    badgeClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    hint: 'Strong coverage and the expected control is active.',
  },
  WARNING: {
    label: 'Partial',
    barClass: 'bg-gradient-to-r from-amber-500 to-orange-400',
    badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    hint: 'Partially configured or weaker than ideal.',
  },
  ERROR: {
    label: 'Missing',
    barClass: 'bg-gradient-to-r from-rose-500 to-red-400',
    badgeClass: 'border-red-500/25 bg-red-500/10 text-red-300',
    hint: 'Missing, failing, or not returning the expected result.',
  },
} as const

function getStatusStrength(status: string | undefined): number {
  if (status === 'SUCCESS') return 100
  if (status === 'WARNING') return 60
  return 20
}

export function DashboardPage() {
  const [domain, setDomain] = useState('google.com')
  const [searchQuery, setSearchQuery] = useState('google.com')
  const [shouldRecordAudit, setShouldRecordAudit] = useState(false)
  const scoreRadius = 42
  const scoreCircumference = 2 * Math.PI * scoreRadius

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analyze', searchQuery],
    queryFn: () => analyzeSecurity(searchQuery),
    enabled: !!searchQuery,
  })

  const protocolDistribution = React.useMemo(() => {
    const rows = PROTOCOL_ORDER.map((protocol) => {
      const count = data?.records?.[protocol]?.length || 0
      return { name: protocol, count }
    })

    const total = rows.reduce((acc, row) => acc + row.count, 0)

    return rows.map((row) => ({
      ...row,
      percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
    }))
  }, [data])

  const ttlNodes = React.useMemo(() => {
    const records = data?.records?.A || []
    return records.map((record: any, index: number) => ({
      name: `Node ${index + 1}`,
      ttl: record.TTL,
      address: record.data,
    }))
  }, [data])

  const ttlSummary = React.useMemo(() => {
    if (!ttlNodes.length) {
      return { min: 0, max: 0, avg: 0, range: 0 }
    }

    const ttlValues = ttlNodes.map((node) => node.ttl)
    const min = Math.min(...ttlValues)
    const max = Math.max(...ttlValues)
    const avg = Math.round(ttlValues.reduce((acc, value) => acc + value, 0) / ttlValues.length)
    const range = max - min
    return { min, max, avg, range }
  }, [ttlNodes])

  const ttlInterpretation = React.useMemo(() => {
    if (!ttlNodes.length) {
      return 'No A record TTL data available for this domain.'
    }

    if (ttlNodes.length === 1) {
      return 'Single-node sample: trend comparison is limited until more A records are returned.'
    }

    if (ttlSummary.range <= 30) {
      return 'TTL values are tightly grouped, suggesting consistent caching behavior across nodes.'
    }

    if (ttlSummary.range <= 300) {
      return 'TTL values vary moderately across nodes. Verify expected DNS profile for this domain.'
    }

    return 'TTL spread is high across nodes, which can indicate mixed cache or routing behavior.'
  }, [ttlNodes, ttlSummary.range])

  const controlStrength = React.useMemo(
    () =>
      (data?.findings || []).map((finding: any) => ({
        name: finding.category,
        score: getStatusStrength(finding.status),
        status: finding.status,
        statusLabel: CONTROL_STATUS_META[finding.status as keyof typeof CONTROL_STATUS_META]?.label || 'Unknown',
        barClass:
          CONTROL_STATUS_META[finding.status as keyof typeof CONTROL_STATUS_META]?.barClass ||
          'bg-gradient-to-r from-slate-500 to-slate-400',
        badgeClass:
          CONTROL_STATUS_META[finding.status as keyof typeof CONTROL_STATUS_META]?.badgeClass ||
          'border-slate-500/25 bg-slate-500/10 text-slate-300',
        hint:
          CONTROL_STATUS_META[finding.status as keyof typeof CONTROL_STATUS_META]?.hint ||
          'Status not recognized in the current scan result.',
      })),
    [data]
  )

  const handleSearch = () => {
    const normalized = domain.trim().toLowerCase()

    if (!normalized) {
      toast.error('Enter a domain name to start analysis.')
      return
    }

    if (normalized === searchQuery) {
      setShouldRecordAudit(true)
      refetch()
      return
    }

    setShouldRecordAudit(true)
    setSearchQuery(normalized)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  React.useEffect(() => {
    if (!data || !shouldRecordAudit) {
      return
    }

    addAuditHistory({
      domain: data.domain,
      type: 'FULL_SCAN',
      score: data.score,
      status: data.score >= 90 ? 'COMPLETED' : data.score >= 70 ? 'WARNING' : 'FAILED',
    })
    setShouldRecordAudit(false)
  }, [data, shouldRecordAudit])

  React.useEffect(() => {
    if (!isError || !searchQuery) {
      return
    }
    toast.error(`Could not analyze ${searchQuery}.`)
  }, [isError, searchQuery])

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <PageTitle className="text-4xl font-black neon-text">Security Dashboard</PageTitle>
            <PageDescription className="text-muted-foreground/80 mt-1">
              Analyze and visualize DNS security posture in real-time.
            </PageDescription>
          </div>
          <div className="flex items-center gap-2 max-w-sm w-full bg-cyan-500/5 p-1 rounded-lg border border-cyan-500/20 glass-card">
            <Input 
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter domain (e.g. google.com)..." 
              className="bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
            />
            <Button onClick={handleSearch} size="icon" className="shrink-0 rounded-md neon-glow" disabled={isLoading}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </PageHeader>
      
      <PageBody className="space-y-8 animate-fade-in pb-6">
        {isLoading ? (
          <div className="min-h-[50vh] md:min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-xs">Decrypting DNS Records...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="min-h-[50vh] md:min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 glass-card border-red-500/20">
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <h3 className="text-xl font-bold">Analysis Error</h3>
            <p className="text-muted-foreground">Could not analyze {searchQuery}. Please verify the domain and try again.</p>
            <Button
              onClick={() => {
                setShouldRecordAudit(true)
                refetch()
              }}
            >
              Retry Analysis
            </Button>
          </div>
        ) : (
          <>
            {/* 3D Visualization Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[420px]">
              <Card className="lg:col-span-2 overflow-hidden bg-black/40 border-cyan-500/10 neon-glow relative min-h-[260px] lg:min-h-0">
                <div className="absolute top-4 left-6 z-10 pointer-events-none">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Network Topology Visualizer
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">TARGET: {data?.domain} // STATUS: ACTIVE</p>
                </div>
                
                {/* 3D Globe Component */}
                <div className="w-full h-[260px] lg:h-full cursor-grab active:cursor-grabbing">
                  <NetworkGlobe />
                </div>
              </Card>

              <div className="space-y-6 lg:h-full">
                <Card className="glass-card border-cyan-500/10 h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2 text-cyan-400 uppercase tracking-widest">
                      <Shield className="w-4 h-4" />
                      Security Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center pt-4">
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r={scoreRadius}
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="transparent"
                          className="text-cyan-500/10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r={scoreRadius}
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={scoreCircumference}
                          strokeDashoffset={scoreCircumference - (scoreCircumference * (data?.score || 0)) / 100}
                          className="text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)] transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-5xl font-black neon-text">{data?.score}</span>
                        <span className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">
                          {data?.score && data.score >= 90 ? 'A+ Elite' : data?.score && data.score >= 80 ? 'A- Good' : 'B Secure'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-8 space-y-3 w-full">
                      {data?.findings.map((finding: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5 uppercase tracking-tighter text-[10px]">
                            {finding.category === 'DNSSEC' && <Lock className="w-3 h-3 text-cyan-400" />}
                            {finding.category === 'SPF' && <Shield className="w-3 h-3 text-cyan-400" />}
                            {finding.category === 'DMARC' && <Activity className="w-3 h-3 text-cyan-400" />}
                            {finding.category} Status
                          </span>
                          <span className={`${finding.status === 'SUCCESS' ? 'text-green-400' : 'text-amber-400'} font-mono text-[10px]`}>
                            {finding.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <StatGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat 
                label="A Records" 
                value={data?.records.A?.length || 0} 
                icon={<Globe className="text-cyan-400" />}
                className="glass-card border-cyan-500/10"
              />
              <Stat 
                label="MX Servers" 
                value={data?.records.MX?.length || 0} 
                icon={<Shield className="text-red-400" />}
                className="glass-card border-cyan-500/10"
              />
              <Stat 
                label="NS Nodes" 
                value={data?.records.NS?.length || 0} 
                icon={<Zap className="text-yellow-400" />}
                className="glass-card border-cyan-500/10"
              />
              <Stat 
                label="TXT Data" 
                value={data?.records.TXT?.length || 0} 
                icon={<Lock className="text-green-400" />}
                className="glass-card border-cyan-500/10"
              />
            </StatGroup>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Protocol Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BarChart 
                    data={protocolDistribution}
                    dataKey="count"
                    xAxisKey="name"
                    height={220}
                  />
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-2 text-xs">
                    {protocolDistribution.map((row) => (
                      <div key={row.name} className="rounded-md border border-cyan-500/15 px-3 py-2.5 bg-black/20">
                        <p className="text-cyan-300 font-mono text-[11px] tracking-wide">{row.name}</p>
                        <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{row.count}</p>
                        <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">{row.percent}% of total</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Response TTL Map</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-md border border-cyan-500/15 bg-black/20 px-3 py-2">
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      TTL by node ({ttlNodes.length} sample{ttlNodes.length === 1 ? '' : 's'})
                    </p>
                    <p className="text-[11px] sm:text-xs font-mono text-cyan-300">
                      Unit: seconds
                    </p>
                  </div>
                  <LineChart
                    data={ttlNodes}
                    dataKey="ttl"
                    xAxisKey="name"
                    height={220}
                  />
                  <div className="grid grid-cols-2 min-[420px]:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-2 text-xs">
                    <div className="rounded-md border border-cyan-500/15 px-3 py-2.5 bg-black/20">
                      <p className="text-cyan-300 font-mono text-[11px] tracking-wide">MIN TTL</p>
                      <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{ttlSummary.min}</p>
                    </div>
                    <div className="rounded-md border border-cyan-500/15 px-3 py-2.5 bg-black/20">
                      <p className="text-cyan-300 font-mono text-[11px] tracking-wide">AVG TTL</p>
                      <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{ttlSummary.avg}</p>
                    </div>
                    <div className="rounded-md border border-cyan-500/15 px-3 py-2.5 bg-black/20">
                      <p className="text-cyan-300 font-mono text-[11px] tracking-wide">MAX TTL</p>
                      <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{ttlSummary.max}</p>
                    </div>
                    <div className="rounded-md border border-cyan-500/15 px-3 py-2.5 bg-black/20">
                      <p className="text-cyan-300 font-mono text-[11px] tracking-wide">RANGE</p>
                      <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{ttlSummary.range}</p>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground rounded-md border border-cyan-500/10 px-3 py-2 bg-cyan-500/5">
                    {ttlInterpretation}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Control Effectiveness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[11px] sm:text-xs text-muted-foreground rounded-md border border-cyan-500/10 px-3 py-2 bg-cyan-500/5">
                    Each control gets its own color so users can instantly separate configured, partial, and missing protection.
                  </p>
                  <div className="space-y-3">
                    {controlStrength.map((row) => (
                      <div key={row.name} className="rounded-lg border border-cyan-500/10 bg-black/20 px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{row.name}</p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{row.hint}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${row.badgeClass}`}>
                            {row.statusLabel}
                          </span>
                        </div>
                        <div className="mt-3 flex items-end gap-3">
                          <div className="flex-1">
                            <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
                              <div
                                className={`h-full rounded-full ${row.barClass} shadow-[0_0_16px_rgba(34,211,238,0.15)]`}
                                style={{ width: `${row.score}%` }}
                                aria-label={`${row.name} ${row.status} score ${row.score} out of 100`}
                              />
                            </div>
                          </div>
                          <div className="w-12 text-right">
                            <p className="text-sm font-mono text-foreground">{row.score}</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">/100</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2.5 sm:gap-2 text-xs">
                    <div className="rounded-md border border-emerald-500/20 px-3 py-2.5 bg-emerald-500/5">
                      <p className="text-emerald-300 font-mono text-[11px] tracking-wide">SUCCESS</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">100 strength · fully configured</p>
                    </div>
                    <div className="rounded-md border border-amber-500/20 px-3 py-2.5 bg-amber-500/5">
                      <p className="text-amber-300 font-mono text-[11px] tracking-wide">WARNING</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">60 strength · partially configured</p>
                    </div>
                    <div className="rounded-md border border-red-500/20 px-3 py-2.5 bg-red-500/5">
                      <p className="text-red-300 font-mono text-[11px] tracking-wide">ERROR</p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs leading-tight">20 strength · missing or failing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-cyan-500/10 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">A Record Detail</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[460px]">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Node</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Address</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">TTL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ttlNodes.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-5 text-sm text-center text-muted-foreground">
                              No A records available for this query.
                            </td>
                          </tr>
                        ) : (
                          ttlNodes.map((row) => (
                            <tr key={`${row.name}-${row.address}`} className="border-t border-white/5">
                              <td className="px-4 py-3 text-xs font-mono text-cyan-300">{row.name}</td>
                              <td className="px-4 py-3 text-xs font-mono">{row.address}</td>
                              <td className="px-4 py-3 text-xs">{row.ttl}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </PageBody>
    </Page>
  )
}
