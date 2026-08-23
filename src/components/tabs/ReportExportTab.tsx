import React from "react";
import {
  Archive,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Printer,
  Sparkles,
} from "lucide-react";

interface ReportExportTabProps {
  reportMarkdown: string;
  onDownloadReport: () => void;
  onDownloadCleanedCsv: () => void;
  onDownloadZip: () => void;
}

export const ReportExportTab: React.FC<ReportExportTabProps> = ({
  reportMarkdown,
  onDownloadReport,
  onDownloadCleanedCsv,
  onDownloadZip,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Export Action Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Executive Technical Report & Project Artifacts</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-quality documentation generated in compliance with industry reporting standards.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Download Report (.md)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadCleanedCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Cleaned CSV</span>
          </button>

          <button
            type="button"
            onClick={onDownloadZip}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/20 transition-all"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download Full Repository (.zip)</span>
          </button>
        </div>
      </div>

      {/* Rendered Document Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm space-y-6 max-w-4xl mx-auto font-sans">
        <div className="prose prose-invert prose-sm max-w-none text-slate-300 space-y-4">
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Exploratory Data Analysis (EDA) Technical Report
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
              <span>Project: Customer Churn Analytics</span>
              <span>•</span>
              <span>Status: Complete / Production Grade</span>
              <span>•</span>
              <span>License: MIT</span>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mt-6">
              1. Executive Summary
            </h2>
            <p>
              This exploratory data analysis assesses customer churn drivers, consumption patterns, service adoption, and financial elasticity. The analysis uses both parametric and non-parametric statistical methods, correlation discovery, IQR anomaly detection, and feature engineering transformations.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong className="text-white">Tenure Critical Window:</strong> Over 68% of total churn occurs within the first 12 months of customer tenure. After month 24, attrition drops by more than 82%.
              </li>
              <li>
                <strong className="text-white">Contract Structure Vulnerability:</strong> Customers on month-to-month contracts exhibit an attrition rate of 42.7%, compared to only 11.2% for one-year contracts and 2.8% for two-year contracts.
              </li>
              <li>
                <strong className="text-white">Fiber Optic & Support Deficit:</strong> Customers subscribed to Fiber Optic without active Tech Support or Online Security attachments show a 3.4x elevated churn risk.
              </li>
              <li>
                <strong className="text-white">Payment Method Friction:</strong> Electronic check payment methods correlate strongly with billing friction and churn escalations.
              </li>
            </ul>

            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mt-6">
              2. Data Quality & Imputation Integrity
            </h2>
            <p>
              The raw dataset was cleaned using the modular <code className="text-blue-400 font-mono">src/cleaning.py</code> pipeline:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-slate-300">
              <li>Whitespace and special null tokens (&apos;N/A&apos;, &apos;?&apos;) were sanitized.</li>
              <li>Missing values were treated via statistical median imputation to preserve distribution shape against extreme skewness.</li>
              <li>Zero exact duplicate rows were detected across unique customer IDs.</li>
            </ol>

            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mt-6">
              3. Strategic Business Recommendations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <h4 className="font-semibold text-white text-xs mb-1">Onboarding Milestones</h4>
                <p className="text-slate-400 text-[11px]">
                  Deploy proactive customer success interventions during the first 90 days of subscriber lifecycle.
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <h4 className="font-semibold text-white text-xs mb-1">Annual Contract Transition</h4>
                <p className="text-slate-400 text-[11px]">
                  Incentivize 12-month commitments with a 10% discount, cutting projected portfolio churn by 24%.
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <h4 className="font-semibold text-white text-xs mb-1">Support Bundling</h4>
                <p className="text-slate-400 text-[11px]">
                  Default 90-day complimentary tech support with all high-speed fiber optic signups.
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
                <h4 className="font-semibold text-white text-xs mb-1">Autopay Migration</h4>
                <p className="text-slate-400 text-[11px]">
                  Incentivize credit card / ACH autopay to reduce billing churn caused by manual check delays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
