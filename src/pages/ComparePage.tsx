import React, { useState } from 'react'
import { Page, PageHeader, PageTitle, PageDescription, PageBody, Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, DataTable, toast } from '@blinkdotnew/ui'
import { Globe, AlertTriangle, Zap, ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react'
import { BarChart } from '@blinkdotnew/ui'
import { useQuery } from '@tanstack/react-query'
import { analyzeSecurity } from '../lib/dns'
import { addAuditHistory } from '../lib/history'

function findingToScore(status?: string): number {
  if (status === 'SUCCESS') return 100
  if (status === 'WARNING') return 60
  return 20
}

function recordDensityScore(count: number): number {
  return Math.min(100, count * 20)
}

export function ComparePage() {
  const [site1, setSite1] = useState('')
  const [site2, setSite2] = useState('')
  const [isComparing, setIsComparing] = useState(false)

  const { data: dataA, isLoading: isLoadingA, refetch: refetchA, isError: isErrorA } = useQuery({
    queryKey: ['analyze', site1],
    queryFn: () => analyzeSecurity(site1),
    enabled: false,
  })

  const { data: dataB, isLoading: isLoadingB, refetch: refetchB, isError: isErrorB } = useQuery({
    queryKey: ['analyze', site2],
    queryFn: () => analyzeSecurity(site2),
    enabled: false,
  })

  const handleCompare = async () => {
    const domainA = site1.trim().toLowerCase()
    const domainB = site2.trim().toLowerCase()

    if (!domainA || !domainB) {
      toast.error('Enter both domains to run comparison.')
      return
    }

    if (domainA === domainB) {
      toast.error('Choose two different domains for comparison.')
      return
    }

    setSite1(domainA)
    setSite2(domainB)
    setIsComparing(true)

    try {
      await Promise.all([refetchA(), refetchB()])
    } catch {
      toast.error('Failed to analyze domains. Please check the spelling.')
    }
  }

  React.useEffect(() => {
    if (!isComparing || !dataA || !dataB) {
      return
    }

    const averageScore = Math.round(((dataA.score || 0) + (dataB.score || 0)) / 2)
    const status = averageScore >= 90 ? 'COMPLETED' : averageScore >= 70 ? 'WARNING' : 'FAILED'

    addAuditHistory({
      domain: `${dataA.domain} vs ${dataB.domain}`,
      type: 'COMPARISON',
      score: averageScore,
      status,
    })
  }, [isComparing, dataA, dataB])

  const isLoading = isLoadingA || isLoadingB
  const isError = isErrorA || isErrorB

  const getFinding = (result: any, category: string) =>
    result?.findings?.find((finding: any) => finding.category === category)?.status

  const normalizeFinding = (status?: string) => {
    if (status === 'SUCCESS') return 'OK'
    if (status === 'WARNING') return 'WARNING'
    return 'FAILED'
  }

  const getIpState = (result: any) => (result?.records?.A?.length > 0 ? 'OK' : 'FAILED')

  const comparisonRows = [
    { check: 'DNSSEC Signed', siteA: normalizeFinding(getFinding(dataA, 'DNSSEC')), siteB: normalizeFinding(getFinding(dataB, 'DNSSEC')) },
    { check: 'SPF Policy', siteA: normalizeFinding(getFinding(dataA, 'SPF')), siteB: normalizeFinding(getFinding(dataB, 'SPF')) },
    { check: 'DMARC Policy', siteA: normalizeFinding(getFinding(dataA, 'DMARC')), siteB: normalizeFinding(getFinding(dataB, 'DMARC')) },
    { check: 'Public A Record', siteA: getIpState(dataA), siteB: getIpState(dataB) },
    { check: 'MX Records', siteA: dataA?.records?.MX?.length ? 'OK' : 'WARNING', siteB: dataB?.records?.MX?.length ? 'OK' : 'WARNING' },
  ]

  const benchmarkRows = React.useMemo(() => {
    const aRecords = dataA?.records || {}
    const bRecords = dataB?.records || {}

    return [
      {
        name: 'Security Score',
        siteA: dataA?.score || 0,
        siteB: dataB?.score || 0,
      },
      {
        name: 'DNSSEC Strength',
        siteA: findingToScore(getFinding(dataA, 'DNSSEC')),
        siteB: findingToScore(getFinding(dataB, 'DNSSEC')),
      },
      {
        name: 'SPF Strength',
        siteA: findingToScore(getFinding(dataA, 'SPF')),
        siteB: findingToScore(getFinding(dataB, 'SPF')),
      },
      {
        name: 'DMARC Strength',
        siteA: findingToScore(getFinding(dataA, 'DMARC')),
        siteB: findingToScore(getFinding(dataB, 'DMARC')),
      },
      {
        name: 'A Density',
        siteA: recordDensityScore(aRecords.A?.length || 0),
        siteB: recordDensityScore(bRecords.A?.length || 0),
      },
      {
        name: 'MX Density',
        siteA: recordDensityScore(aRecords.MX?.length || 0),
        siteB: recordDensityScore(bRecords.MX?.length || 0),
      },
      {
        name: 'TXT Density',
        siteA: recordDensityScore(aRecords.TXT?.length || 0),
        siteB: recordDensityScore(bRecords.TXT?.length || 0),
      },
      {
        name: 'NS Density',
        siteA: recordDensityScore(aRecords.NS?.length || 0),
        siteB: recordDensityScore(bRecords.NS?.length || 0),
      },
    ]
  }, [dataA, dataB])

  const metricWins = React.useMemo(() => {
    const summary = benchmarkRows.map((row) => {
      const delta = row.siteA - row.siteB
      return {
        metric: row.name,
        winner: delta === 0 ? 'TIE' : delta > 0 ? (dataA?.domain || site1 || 'Site A') : (dataB?.domain || site2 || 'Site B'),
        delta: Math.abs(delta),
      }
    })

    const siteAWins = summary.filter((row) => row.winner === (dataA?.domain || site1 || 'Site A')).length
    const siteBWins = summary.filter((row) => row.winner === (dataB?.domain || site2 || 'Site B')).length
    const ties = summary.filter((row) => row.winner === 'TIE').length

    return {
      rows: summary,
      siteAWins,
      siteBWins,
      ties,
    }
  }, [benchmarkRows, dataA?.domain, dataB?.domain, site1, site2])

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <PageTitle className="text-4xl font-black neon-text">Side-by-Side Comparison</PageTitle>
            <PageDescription className="text-muted-foreground/80 mt-1">
              Benchmark the security posture of two domains against each other.
            </PageDescription>
          </div>
          <Button onClick={handleCompare} disabled={!site1 || !site2} size="lg" className="neon-glow font-bold uppercase tracking-widest gap-2">
            <ArrowRightLeft className="w-4 h-4" /> 
            Run Full Analysis
          </Button>
        </div>
      </PageHeader>
      
      <PageBody className="space-y-8 animate-fade-in pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-cyan-500/5 p-4 rounded-xl border border-cyan-500/20 glass-card">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-cyan-400" />
              </div>
              <Input 
                value={site1}
                onChange={(e) => setSite1(e.target.value.toLowerCase())}
                placeholder="Domain A (e.g. apple.com)" 
                className="bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-lg font-bold"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/20 glass-card">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <Input 
                value={site2}
                onChange={(e) => setSite2(e.target.value.toLowerCase())}
                placeholder="Domain B (e.g. microsoft.com)" 
                className="bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50 text-lg font-bold"
              />
            </div>
          </div>
        </div>

        {isComparing ? (
          <div className="space-y-8 animate-fade-in">
            {isLoading ? (
              <div className="min-h-[50vh] md:min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  <p className="text-muted-foreground animate-pulse font-mono uppercase tracking-widest text-xs">Querying Global DNS Nodes...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="min-h-[50vh] md:min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 glass-card border-red-500/20">
                <AlertTriangle className="w-12 h-12 text-red-400" />
                <h3 className="text-xl font-bold">Analysis Error</h3>
                <p className="text-muted-foreground">Failed to reach DNS resolution endpoints. Check your internet connection or domain spelling.</p>
                <Button onClick={() => handleCompare()}>Retry Analysis</Button>
              </div>
            ) : (
              <>
                {/* Summary Score Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass-card border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl font-black text-cyan-400">{dataA?.domain}</CardTitle>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-mono">
                        {dataA?.records.A?.[0]?.data || 'NO_IP'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-end gap-2">
                        <span className="text-6xl font-black neon-text">{dataA?.score}</span>
                        <span className="text-muted-foreground text-lg font-mono mb-2">/ 100</span>
                      </div>
                      <div className="space-y-3">
                        {dataA?.findings.map((f: any, i: number) => (
                          <SecurityItem key={i} label={f.category} status={f.status.toLowerCase() as any} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl font-black text-blue-400">{dataB?.domain}</CardTitle>
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono">
                        {dataB?.records.A?.[0]?.data || 'NO_IP'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-end gap-2">
                        <span className="text-6xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{dataB?.score}</span>
                        <span className="text-muted-foreground text-lg font-mono mb-2">/ 100</span>
                      </div>
                      <div className="space-y-3">
                        {dataB?.findings.map((f: any, i: number) => (
                          <SecurityItem key={i} label={f.category} status={f.status.toLowerCase() as any} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visual Comparison Chart */}
                <Card className="glass-card border-white/5">
                  <CardHeader>
                    <CardTitle className="text-lg font-mono text-cyan-400 uppercase tracking-widest">Protocol Benchmarks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <BarChart 
                      data={benchmarkRows}
                      dataKey={['siteA', 'siteB']}
                      xAxisKey="name"
                      height={340}
                    />
                    <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2.5 sm:gap-2 text-xs">
                      <div className="rounded-md border border-cyan-500/20 px-3 py-2.5 bg-cyan-500/5">
                        <p className="text-cyan-300 font-mono text-[11px] tracking-wide break-all">{dataA?.domain || site1 || 'Site A'} WINS</p>
                        <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{metricWins.siteAWins}</p>
                      </div>
                      <div className="rounded-md border border-blue-500/20 px-3 py-2.5 bg-blue-500/5">
                        <p className="text-blue-300 font-mono text-[11px] tracking-wide break-all">{dataB?.domain || site2 || 'Site B'} WINS</p>
                        <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{metricWins.siteBWins}</p>
                      </div>
                      <div className="rounded-md border border-white/10 px-3 py-2.5 bg-white/5">
                        <p className="text-muted-foreground font-mono text-[11px] tracking-wide">TIES</p>
                        <p className="text-foreground font-semibold text-sm sm:text-base leading-tight">{metricWins.ties}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/5 overflow-hidden">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-lg font-mono text-cyan-400 uppercase tracking-widest">Metric Winners</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] md:min-w-[640px]">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground">Metric</th>
                          <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground">Winner</th>
                          <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metricWins.rows.map((row) => (
                          <tr key={row.metric} className="border-t border-white/5">
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-tight">{row.metric}</td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-mono break-all leading-tight">
                              {row.winner === 'TIE' ? 'TIE' : row.winner}
                            </td>
                            <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">{row.delta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Detailed Records Table */}
                <Card className="glass-card border-white/5 overflow-hidden">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-lg font-mono text-cyan-400 uppercase tracking-widest">Protocol Audit Logs</CardTitle>
                  </CardHeader>
                  <DataTable 
                    columns={[
                      { accessorKey: 'check', header: 'Security Check' },
                      { 
                        accessorKey: 'siteA', 
                        header: site1,
                        cell: ({ row }) => (
                          <div className="flex items-center gap-2">
                            {row.original.siteA === 'OK' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : row.original.siteA === 'WARNING' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="font-mono text-xs">{row.original.siteA}</span>
                          </div>
                        )
                      },
                      { 
                        accessorKey: 'siteB', 
                        header: site2,
                        cell: ({ row }) => (
                          <div className="flex items-center gap-2">
                            {row.original.siteB === 'OK' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : row.original.siteB === 'WARNING' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="font-mono text-xs">{row.original.siteB}</span>
                          </div>
                        )
                      },
                    ]}
                    data={[
                      ...comparisonRows
                    ]}
                  />
                </Card>
              </>
            )}
          </div>
        ) : (
          <div className="min-h-[50vh] md:min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 glass-card border-dashed border-cyan-500/20 rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-cyan-500/5 flex items-center justify-center border border-cyan-500/10">
              <Zap className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Ready for Analysis</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Enter two domains above and click "Run Full Analysis" to generate a detailed security comparison report.
              </p>
            </div>
          </div>
        )}
      </PageBody>
    </Page>
  )
}

function SecurityItem({ label, status }: { label: string, status: 'success' | 'warning' | 'error' }) {
  const Icon = status === 'success' ? CheckCircle2 : status === 'warning' ? AlertTriangle : XCircle
  const color = status === 'success' ? 'text-green-400' : status === 'warning' ? 'text-amber-400' : 'text-red-400'
  
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground font-mono uppercase tracking-widest text-[10px]">{label}</span>
      <div className={`flex items-center gap-1.5 ${color} font-bold text-xs`}>
        <Icon className="w-3.5 h-3.5" />
        {status.toUpperCase()}
      </div>
    </div>
  )
}
