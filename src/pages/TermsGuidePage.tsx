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
  Badge,
  Input,
} from '@blinkdotnew/ui'
import { BookOpenText, BarChart3, ShieldCheck, AlertTriangle, Database, Search } from 'lucide-react'

type TermRow = {
  term: string
  meaning: string
  howToRead: string
}

const dashboardTerms: TermRow[] = [
  {
    term: 'Node',
    meaning: 'A single endpoint in DNS/network data, usually one returned A record (IP address target).',
    howToRead: 'In charts or tables, each node is one concrete data point you can inspect (name, address, TTL).',
  },
  {
    term: 'Security Score',
    meaning: 'Composite DNS posture score from DNSSEC, SPF, DMARC, and record presence checks.',
    howToRead: 'Higher is better. 90+ indicates strong baseline controls.',
  },
  {
    term: 'Protocol Distribution',
    meaning: 'Count and percentage of DNS record types (A, AAAA, MX, NS, TXT).',
    howToRead: 'Shows DNS footprint. Sudden changes can indicate config drift.',
  },
  {
    term: 'Response TTL',
    meaning: 'Time To Live value returned in A records.',
    howToRead: 'Lower TTL means faster DNS update propagation but higher query churn.',
  },
  {
    term: 'Control Effectiveness',
    meaning: 'Normalized control strength from DNS findings (SUCCESS/WARNING/ERROR).',
    howToRead: '100 = healthy, 60 = warning, 20 = failing control.',
  },
]

const threatTerms: TermRow[] = [
  {
    term: 'Confidence',
    meaning: 'Signal-based risk estimate from URL/domain characteristics in threat feed items.',
    howToRead: '95-100 very suspicious, 90-94 high, 80-89 medium, below 80 lower confidence.',
  },
  {
    term: 'Risk Severity Mix',
    meaning: 'Breakdown of feed entries by confidence severity bands.',
    howToRead: 'Use to monitor whether feed quality is shifting toward higher-risk indicators.',
  },
  {
    term: 'Top Alerts',
    meaning: 'Highest-confidence indicators from current feed snapshot.',
    howToRead: 'Prioritize these for triage and policy block checks.',
  },
  {
    term: 'IOC Stream',
    meaning: 'Live indicator table containing domain, classification, source, and confidence.',
    howToRead: 'Search to investigate specific domains and open source evidence quickly.',
  },
]

const compareTerms: TermRow[] = [
  {
    term: 'Protocol Benchmarks',
    meaning: 'Side-by-side normalized scores for controls and DNS record density.',
    howToRead: 'Higher bars indicate stronger posture for that metric.',
  },
  {
    term: 'Metric Winners',
    meaning: 'Per-metric winner plus absolute margin between two sites.',
    howToRead: 'Use margin to judge if difference is significant or negligible.',
  },
  {
    term: 'Protocol Audit Logs',
    meaning: 'Check-by-check status table for core email and DNS controls.',
    howToRead: 'OK means pass, WARNING means partial coverage, FAILED means gap.',
  },
]

const graphVocabularyTerms: TermRow[] = [
  {
    term: 'X-Axis',
    meaning: 'Horizontal axis showing categories or time steps (for example A, AAAA, MX or Node 1, Node 2).',
    howToRead: 'Use this first to understand what each bar/point represents.',
  },
  {
    term: 'Y-Axis / Value',
    meaning: 'Vertical numeric measure such as count, score, TTL, or percentage.',
    howToRead: 'Higher value means more of that metric, not always better security.',
  },
  {
    term: 'Series',
    meaning: 'One measurable variable in a chart (for example siteA vs siteB).',
    howToRead: 'Compare same-category values across series to find differences.',
  },
  {
    term: 'Data Point',
    meaning: 'One individual measurement at a specific category/time.',
    howToRead: 'A point can be traced to raw table values for verification.',
  },
  {
    term: 'Bar',
    meaning: 'Rectangular mark used for category comparison.',
    howToRead: 'Best for quickly seeing rank/order between groups.',
  },
  {
    term: 'Line',
    meaning: 'Connected points used to show progression or trend.',
    howToRead: 'Look for slope changes and outliers rather than single spikes only.',
  },
  {
    term: 'Area',
    meaning: 'Filled line chart emphasizing magnitude over a sequence.',
    howToRead: 'Helpful when cumulative visual weight matters.',
  },
  {
    term: 'Bucket / Band',
    meaning: 'Range grouping such as 95-100 confidence or 80-89 confidence.',
    howToRead: 'Use bands to understand risk distribution, not just averages.',
  },
  {
    term: 'Percentage Share',
    meaning: 'Portion of total represented by one category.',
    howToRead: 'Good for composition; check count too so small totals are not overinterpreted.',
  },
  {
    term: 'Margin / Delta',
    meaning: 'Absolute difference between two compared values.',
    howToRead: 'Bigger margin means stronger separation between domains/metrics.',
  },
]

const formulaRows = [
  {
    title: 'Threat Confidence Model',
    detail:
      'Combines keyword hits, brand impersonation hints, punycode, domain shape, path risk markers, and suspicious TLD signals. Result is capped to 5-99.',
  },
  {
    title: 'Threat Domain Risk Score',
    detail:
      'Aggregates feed-match contribution, DNS control gaps, domain-format risk, and domain age signals. Result is capped to 0-100 and mapped to LOW / ELEVATED / HIGH.',
  },
  {
    title: 'Unique Domains',
    detail:
      'Computed from apex domain normalization (for example a.b.example.co.uk -> example.co.uk) to avoid over-counting subdomains.',
  },
]

function TermsTable({ rows, filter }: { rows: TermRow[]; filter: string }) {
  const filtered = rows.filter(
    (r) =>
      r.term.toLowerCase().includes(filter.toLowerCase()) ||
      r.meaning.toLowerCase().includes(filter.toLowerCase()) ||
      r.howToRead.toLowerCase().includes(filter.toLowerCase()),
  )

  if (filtered.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-muted-foreground">
        No terms match "{filter}".
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px]">
        <thead className="bg-white/5">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Term</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Meaning</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">How To Interpret</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.term} className="border-t border-white/5 align-top hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-sm font-mono text-cyan-300 font-bold">{row.term}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground leading-relaxed">{row.meaning}</td>
              <td className="px-4 py-3 text-sm leading-relaxed">{row.howToRead}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TermsGuidePage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <PageTitle className="text-4xl font-black neon-text flex items-center gap-2">
              <BookOpenText className="w-8 h-8 text-cyan-400" />
              Terms & Metrics Guide
            </PageTitle>
            <PageDescription className="text-muted-foreground/80 max-w-3xl mt-1">
              Understand what every graph and table means, how each metric is calculated, and how to interpret risk levels consistently.
            </PageDescription>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <Input
              type="text"
              placeholder="Search glossary terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-card/60 border-cyan-500/20 focus:border-cyan-400 text-xs"
            />
          </div>
        </div>
      </PageHeader>

      <PageBody className="space-y-6 pb-6 animate-fade-in">
        <Card className="glass-card border-cyan-500/10">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Quality Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Threat feed metrics are based on live OpenPhish data plus deterministic URL/domain signal scoring.
            </p>
            <p>
              Domain counts use apex-domain normalization to reduce inflated totals caused by many subdomains.
            </p>
            <p>
              DNS metrics are generated in real-time from DNS-over-HTTPS lookups and mapped to explicit control statuses.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TermsTable rows={dashboardTerms} filter={searchTerm} />
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Threat Intelligence Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TermsTable rows={threatTerms} filter={searchTerm} />
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Comparison Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TermsTable rows={compareTerms} filter={searchTerm} />
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Graph Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TermsTable rows={graphVocabularyTerms} filter={searchTerm} />
          </CardContent>
        </Card>

        <Card className="glass-card border-cyan-500/10">
          <CardHeader>
            <CardTitle className="text-sm font-mono text-cyan-400 uppercase tracking-widest">Scoring Formula Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formulaRows.map((row) => (
              <div key={row.title} className="rounded-md border border-cyan-500/15 p-3 bg-black/20">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase border-cyan-500/30 text-cyan-300">
                    Formula
                  </Badge>
                  <h3 className="text-sm font-semibold">{row.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{row.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
