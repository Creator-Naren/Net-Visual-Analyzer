import React, { useState } from 'react'
import {
  Page,
  PageHeader,
  PageTitle,
  PageDescription,
  PageBody,
  StatGroup,
  Stat,
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  toast,
} from '@blinkdotnew/ui'
import {
  Search,
  Globe,
  Shield,
  Activity,
  Lock,
  AlertTriangle,
  Zap,
  Download,
  Copy,
  CheckCircle2,
  FileSpreadsheet,
  Info,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { NetworkGlobe } from '../components/NetworkGlobe'
import { LineChart, BarChart } from '@blinkdotnew/ui'
import { useQuery } from '@tanstack/react-query'
import { analyzeSecurity, type SecurityFinding } from '../lib/dns'
import { addAuditHistory } from '../lib/history'

const PROTOCOL_ORDER = ['A', 'AAAA', 'MX', 'NS', 'TXT'] as const

const PRESET_DOMAINS = [
  { name: 'Google', domain: 'google.com' },
  { name: 'Cloudflare', domain: 'cloudflare.com' },
  { name: 'GitHub', domain: 'github.com' },
  { name: 'DNS Google', domain: 'dns.google' },
  { name: 'Microsoft', domain: 'microsoft.com' },
]

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
      (data?.findings || []).map((finding: SecurityFinding) => ({
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
          finding.message ||
          CONTROL_STATUS_META[finding.status as keyof typeof CONTROL_STATUS_META]?.hint ||
          'No specific guidance.',
      })),
    [data],
  )

  React.useEffect(() => {
    if (data && shouldRecordAudit) {
      addAuditHistory({
        type: 'FULL_SCAN',
        status: data.score >= 80 ? 'COMPLETED' : 'WARNING',
        domain: data.domain,
        score: data.score,
      })
      setShouldRecordAudit(false)
    }
  }, [data, shouldRecordAudit])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!domain.trim()) return
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '')
    setSearchQuery(cleanDomain)
    setShouldRecordAudit(true)
  }

  const handlePresetSelect = (presetDomain: string) => {
    setDomain(presetDomain)
    setSearchQuery(presetDomain)
    setShouldRecordAudit(true)
  }

  const copyRecordsToClipboard = () => {
    if (!data) return
    const exportData = {
      domain: data.domain,
      score: data.score,
      findings: data.findings,
      records: data.records,
      exportedAt: new Date().toISOString(),
    }
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
    toast.success('Analysis details copied to clipboard!')
  }

  const exportJsonReport = () => {
    if (!data) return
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `netsec-${data.domain}-audit.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success(`Exported netsec-${data.domain}-audit.json`)
  }

  const scoreDashOffset = scoreCircumference - ((data?.score || 0) / 100) * scoreCircumference

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <div className="flex items-center gap-2">
              <PageTitle className="text-4xl font-black neon-text">Network Security Visual Analyzer</PageTitle>
              <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">v1.0 Pro</Badge>
            </div>
            <PageDescription className="text-muted-foreground/80 mt-1">
              Real-time DNS & Security Posture Analysis powered by Cloudflare DNS-over-HTTPS.
            </PageDescription>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter domain (e.g., google.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="pl-9 bg-card/60 border-cyan-500/20 focus:border-cyan-400"
              />
            </div>
            <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold gap-2 shrink-0">
              <Zap className="h-4 w-4 fill-current" /> Analyze
            </Button>
          </form>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="text-muted-foreground font-mono uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-cyan-400" /> Quick Presets:
          </span>
          {PRESET_DOMAINS.map((p) => (
            <button
              key={p.domain}
              onClick={() => handlePresetSelect(p.domain)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all ${
                searchQuery === p.domain
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-black/20 text-muted-foreground border-white/10 hover:border-cyan-500/30 hover:text-foreground'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </PageHeader>

      <PageBody className="space-y-6">
        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 glass-card rounded-2xl border border-cyan-500/20">
            <div className="relative">
              <Globe className="h-12 w-12 text-cyan-400 animate-spin" />
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
            </div>
            <p className="text-cyan-300 font-mono text-sm tracking-widest animate-pulse">
              RESOLVING DNS & THREAT DATA...
            </p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center glass-card border-red-500/20 rounded-2xl space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
            <h3 className="text-xl font-bold text-red-400">DNS Resolution Failed</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Unable to query DNS records for "{searchQuery}". Please verify the domain name is valid and publicly registered.
            </p>
            <Button variant="outline" onClick={() => refetch()} className="border-red-500/30 text-red-300">
              Retry Query
            </Button>
          </div>
        ) : (
          <>
            {/* Top Toolbar for Export Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-cyan-500/10 bg-card/30 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300">
                  Target: <strong className="text-foreground">{data?.domain}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-cyan-500/20" onClick={copyRecordsToClipboard}>
                  <Copy className="h-3.5 w-3.5" /> Copy JSON
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-cyan-500/20" onClick={exportJsonReport}>
                  <Download className="h-3.5 w-3.5" /> Export Report
                </Button>
              </div>
            </div>

            {/* Score & Main Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card border-cyan-500/20 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -z-10" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-between">
                    <span>SECURITY SCORE</span>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-[10px]">
                      LIVE SCAN
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r={scoreRadius}
                        className="stroke-white/5"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r={scoreRadius}
                        className="stroke-cyan-400 transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={scoreCircumference}
                        strokeDashoffset={scoreDashOffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-black neon-text">{data?.score}</span>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">OUT OF 100</span>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-4 max-w-[220px]">
                    {data && data.score >= 80
                      ? 'Strong DNS security posture. Baseline controls are active.'
                      : 'Security enhancements recommended for DNS authentication.'}
                  </p>
                </CardContent>
              </Card>

              {/* 3D Network Globe Card */}
              <Card className="glass-card border-cyan-500/10 lg:col-span-2 relative min-h-[300px] overflow-hidden flex flex-col">
                <CardHeader className="absolute top-0 left-0 z-10">
                  <CardTitle className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-4 w-4" /> 3D NETWORK TOPOLOGY MESH
                  </CardTitle>
                </CardHeader>
                <div className="flex-1 w-full h-full min-h-[260px] relative">
                  <NetworkGlobe />
                </div>
              </Card>
            </div>

            {/* Quick Stats Grid */}
            <StatGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat
                label="A RECORDS"
                value={data?.records?.A?.length || 0}
                description="IPv4 Resolution Nodes"
                icon={<Globe className="h-4 w-4 text-cyan-400" />}
                className="glass-card border-cyan-500/10"
              />
              <Stat
                label="AAAA RECORDS"
                value={data?.records?.AAAA?.length || 0}
                description="IPv6 Resolution Nodes"
                icon={<Globe className="h-4 w-4 text-blue-400" />}
                className="glass-card border-cyan-500/10"
              />
              <Stat
                label="MX SERVERS"
                value={data?.records?.MX?.length || 0}
                description="Mail Handling Nodes"
                icon={<Shield className="h-4 w-4 text-emerald-400" />}
                className="glass-card border-cyan-500/10"
              />
              <Stat
                label="TXT RECORDS"
                value={data?.records?.TXT?.length || 0}
                description="SPF/DMARC Verification"
                icon={<Lock className="h-4 w-4 text-amber-400" />}
                className="glass-card border-cyan-500/10"
              />
            </StatGroup>

            {/* Security Action Checklist */}
            <Card className="glass-card border-cyan-500/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Security Action Recommendations
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-cyan-500/20 text-cyan-300">
                  AUTOMATED REMEDIATION
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.findings.map((f, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      f.status === 'SUCCESS'
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200'
                        : f.status === 'WARNING'
                        ? 'border-amber-500/20 bg-amber-500/5 text-amber-200'
                        : 'border-red-500/20 bg-red-500/5 text-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {f.status === 'SUCCESS' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : f.status === 'WARNING' ? (
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold font-mono tracking-wide">{f.category}</p>
                        <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">{f.message}</p>
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 font-mono text-[10px] self-start sm:self-center ${
                        f.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : f.status === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {f.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
                    Protocol Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BarChart data={protocolDistribution} dataKey="count" xAxisKey="name" height={220} />
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
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
                    Response TTL Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-md border border-cyan-500/15 bg-black/20 px-3 py-2">
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      TTL by node ({ttlNodes.length} sample{ttlNodes.length === 1 ? '' : 's'})
                    </p>
                    <p className="text-[11px] sm:text-xs font-mono text-cyan-300">Unit: seconds</p>
                  </div>
                  <LineChart data={ttlNodes} dataKey="ttl" xAxisKey="name" height={220} />
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

            {/* Controls & A Record Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card border-cyan-500/10">
                <CardHeader>
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
                    Control Effectiveness
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {controlStrength.map((row) => (
                      <div key={row.name} className="rounded-lg border border-cyan-500/10 bg-black/20 px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{row.name}</p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{row.hint}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${row.badgeClass}`}
                          >
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
                </CardContent>
              </Card>

              <Card className="glass-card border-cyan-500/10 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">
                    A Record Details
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] font-mono text-cyan-300 gap-1"
                    onClick={copyRecordsToClipboard}
                  >
                    <Copy className="h-3 w-3" /> COPY ALL
                  </Button>
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
                            <tr key={`${row.name}-${row.address}`} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-xs font-mono text-cyan-300">{row.name}</td>
                              <td className="px-4 py-3 text-xs font-mono flex items-center gap-2">
                                {row.address}
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(row.address)
                                    toast.success(`Copied ${row.address}`)
                                  }}
                                  className="text-muted-foreground hover:text-cyan-300 p-1"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </td>
                              <td className="px-4 py-3 text-xs">{row.ttl}s</td>
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
