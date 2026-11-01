import React, { useState, useEffect } from 'react'
import { FileText, Download, FileSpreadsheet, FileCode, Loader2 } from 'lucide-react'
import { reportService } from '../services/api'

export const Reports = () => {
  const [summary, setSummary] = useState(null)
  const [selectedReport, setSelectedReport] = useState('monthly_financial')
  const [downloadingFormat, setDownloadingFormat] = useState(null)

  useEffect(() => {
    reportService.getSummary()
      .then(res => { if (res.data?.success) setSummary(res.data.data) })
      .catch(() => {})
  }, [])

  const reportsList = summary?.available_reports || [
    { id: 'monthly_financial', name: 'Monthly Financial Statement' },
    { id: 'expense', name: 'Detailed Expense Audit Report' },
    { id: 'budget', name: 'Budget Adherence & Variance Report' },
    { id: 'investment', name: 'Investment Portfolio Tax & Return Report' },
    { id: 'net_worth', name: 'Net Worth Statement' },
  ]

  const handleDownload = async (format) => {
    setDownloadingFormat(format)
    const ext = format === 'excel' ? 'xlsx' : format
    const filename = `finora_${selectedReport}_report.${ext}`

    try {
      const response = await reportService.downloadReport(format, selectedReport)
      
      const mimeTypes = {
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv'
      }
      
      const blob = new Blob([response.data], { type: mimeTypes[format] || 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (err) {
      console.warn('Axios blob download failed, falling back to direct authenticated URL download...', err)
      // Fallback: direct authenticated window navigation / anchor using token query param
      try {
        const directUrl = reportService.getDownloadUrl(format, selectedReport)
        const fallbackLink = document.createElement('a')
        fallbackLink.href = directUrl
        fallbackLink.setAttribute('download', filename)
        fallbackLink.target = '_blank'
        document.body.appendChild(fallbackLink)
        fallbackLink.click()
        fallbackLink.parentNode.removeChild(fallbackLink)
      } catch (fallbackErr) {
        console.error('All download methods failed:', fallbackErr)
        alert('Could not download file. Please check that your server session is active.')
      }
    } finally {
      setDownloadingFormat(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#2B2A24] pb-5">
        <h1 className="text-2xl font-bold text-[#F5F1E6] font-['Space_Grotesk']">Official Financial Statements & Export</h1>
        <p className="text-xs text-[#A9A59A] mt-1">Generate verified PDF, Excel & CSV financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Selector List */}
        <div className="bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A9A59A] mb-3">Select Report</h3>
          {reportsList.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${
                selectedReport === r.id
                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-[#0B0B0A] border-[#2B2A24] text-[#F5F1E6] hover:border-[#D4AF37]/30'
              }`}
            >
              <span>{r.name}</span>
              <FileText className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Download Actions Card */}
        <div className="md:col-span-2 bg-[#171714] border border-[#2B2A24] rounded-3xl p-6 lg:p-8 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
              Ready for Download
            </span>
            <h2 className="text-xl font-bold text-[#F5F1E6] font-['Space_Grotesk'] mt-3 capitalize">
              {selectedReport.replace('_', ' ')} Statement
            </h2>
            <p className="text-xs text-[#A9A59A] mt-1 leading-relaxed">
              This statement includes itemized account balances, transaction categorization, and financial metrics verified by Finora backend engines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#2B2A24]">
            <button
              type="button"
              disabled={downloadingFormat !== null}
              onClick={() => handleDownload('pdf')}
              className="flex flex-col items-center justify-center p-4 bg-[#0B0B0A] border border-[#2B2A24] hover:border-[#D4AF37] disabled:opacity-50 rounded-2xl text-center text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-all gap-2"
            >
              {downloadingFormat === 'pdf' ? (
                <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
              ) : (
                <FileText className="w-6 h-6 text-red-400" />
              )}
              <span>{downloadingFormat === 'pdf' ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              disabled={downloadingFormat !== null}
              onClick={() => handleDownload('excel')}
              className="flex flex-col items-center justify-center p-4 bg-[#0B0B0A] border border-[#2B2A24] hover:border-[#D4AF37] disabled:opacity-50 rounded-2xl text-center text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-all gap-2"
            >
              {downloadingFormat === 'excel' ? (
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              )}
              <span>{downloadingFormat === 'excel' ? 'Exporting...' : 'Download Excel (.xlsx)'}</span>
            </button>

            <button
              type="button"
              disabled={downloadingFormat !== null}
              onClick={() => handleDownload('csv')}
              className="flex flex-col items-center justify-center p-4 bg-[#0B0B0A] border border-[#2B2A24] hover:border-[#D4AF37] disabled:opacity-50 rounded-2xl text-center text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-all gap-2"
            >
              {downloadingFormat === 'csv' ? (
                <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
              ) : (
                <FileCode className="w-6 h-6 text-[#D4AF37]" />
              )}
              <span>{downloadingFormat === 'csv' ? 'Exporting...' : 'Download CSV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
