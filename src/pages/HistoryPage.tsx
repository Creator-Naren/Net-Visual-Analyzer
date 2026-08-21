import React, { useState } from 'react'
import { Page, PageHeader, PageTitle, PageDescription, PageBody, DataTable, Badge, Button, toast } from '@blinkdotnew/ui'
import { Globe, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Trash2, Download, FileSpreadsheet } from 'lucide-react'
import { clearAuditHistory, getAuditHistory, type AuditHistoryItem } from '../lib/history'

export function HistoryPage() {
  const [rows, setRows] = useState<AuditHistoryItem[]>([])

  const loadRows = React.useCallback(() => {
    setRows(getAuditHistory())
  }, [])

  React.useEffect(() => {
    loadRows()
  }, [loadRows])

  const handleClear = () => {
    clearAuditHistory()
    loadRows()
    toast.success('Audit history cleared')
  }

  const exportHistoryJson = () => {
    if (!rows.length) {
      toast.error('No audit records to export')
      return
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(rows, null, 2))}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `netsec-audit-history.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Exported audit history JSON')
  }

  const formatTimestamp = (isoDate: string) => {
    const value = new Date(isoDate)
    if (Number.isNaN(value.getTime())) {
      return isoDate
    }

    return value.toLocaleString()
  }

  return (
    <Page>
      <PageHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div>
            <PageTitle className="text-4xl font-black neon-text">Audit History</PageTitle>
            <PageDescription className="text-muted-foreground/80 mt-1">
              Review past DNS security audits and comparison reports.
            </PageDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2 text-xs" onClick={exportHistoryJson}>
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
            <Button variant="outline" className="gap-2 text-xs" onClick={loadRows}>
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button variant="outline" className="gap-2 text-xs text-red-400 border-red-500/20" onClick={handleClear}>
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </PageHeader>
      
      <PageBody className="animate-fade-in space-y-4">
        <DataTable 
          columns={[
            { 
              accessorKey: 'timestamp', 
              header: 'Audit Time',
              cell: ({ row }) => (
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {formatTimestamp(row.original.timestamp)}
                </div>
              )
            },
            { 
              accessorKey: 'domain', 
              header: 'Target Domain',
              cell: ({ row }) => (
                <div className="flex items-center gap-2 font-bold text-cyan-400">
                  <Globe className="w-4 h-4 text-cyan-300" />
                  {row.original.domain}
                </div>
              )
            },
            { 
              accessorKey: 'type', 
              header: 'Audit Type',
              cell: ({ row }) => (
                <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/20 text-cyan-300 uppercase tracking-widest px-2 h-5">
                  {row.original.type}
                </Badge>
              )
            },
            { 
              accessorKey: 'score', 
              header: 'Security Score',
              cell: ({ row }) => {
                const score = row.original.score
                const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
                return <span className={`font-black ${color} drop-shadow-[0_0_8px_rgba(0,255,255,0.2)]`}>{score} / 100</span>
              }
            },
            { 
              accessorKey: 'status', 
              header: 'Status',
              cell: ({ row }) => {
                const status = row.original.status
                const Icon = status === 'COMPLETED' ? CheckCircle2 : status === 'WARNING' ? AlertTriangle : XCircle
                const color = status === 'COMPLETED' ? 'text-green-400' : status === 'WARNING' ? 'text-amber-400' : 'text-red-400'
                return (
                  <div className={`flex items-center gap-1.5 ${color} font-mono text-[10px] tracking-widest font-bold`}>
                    <Icon className="w-3.5 h-3.5" />
                    {status}
                  </div>
                )
              }
            },
          ]}
          data={rows}
          searchable
          searchColumn="domain"
        />
      </PageBody>
    </Page>
  )
}
