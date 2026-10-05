import React, { useState, useEffect } from 'react'
import { FileText, Download, FileSpreadsheet, FileCode } from 'lucide-react'
import { reportService } from '../services/api'

export const Reports = () => {
  const [summary, setSummary] = useState(null)
  const [selectedReport, setSelectedReport] = useState('monthly_financial')

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
            <a
              href={reportService.exportPDFUrl(selectedReport)}
              download
              className="flex flex-col items-center justify-center p-4 bg-[#0B0B0A] border border-[#2B2A24] hover:border-[#D4AF37] rounded-2xl text-center text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-all gap-2"
            >
              <FileText className="w-6 h-6 text-red-400" />
              <span>Download PDF</span>
            </a>

            <a
              href={reportService.exportExcelUrl(selectedReport)}
              download
              className="flex flex-col items-center justify-center p-4 bg-[#0B0B0A] border border-[#2B2A24] hover:border-[#D4AF37] rounded-2xl text-center text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-all gap-2"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
              <span>Download Excel (.xlsx)</span>
            </a>

            <a
              href={reportService.exportCSVUrl(selectedReport)}
              download
              className="flex flex-col items-center justify-center p-4 bg-[#0B0B0A] border border-[#2B2A24] hover:border-[#D4AF37] rounded-2xl text-center text-xs font-bold text-[#F5F1E6] hover:text-[#D4AF37] transition-all gap-2"
            >
              <FileCode className="w-6 h-6 text-[#D4AF37]" />
              <span>Download CSV</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
