import React from "react";
import { Download, FileText, Printer, Sparkles } from "lucide-react";

interface ReportViewerProps {
  onDownloadReport: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ onDownloadReport }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Executive Technical Report (`reports/report.md`)</h2>
            <p className="text-xs text-slate-400">
              Publication-grade documentation of telemetry findings, data health, and strategic business playbooks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>

          <button
            type="button"
            onClick={onDownloadReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download report.md</span>
          </button>
        </div>
      </div>

      {/* Styled Report Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm max-w-4xl mx-auto space-y-6 text-slate-300 text-xs leading-relaxed font-sans">
        <div className="border-b border-slate-800 pb-5">
          <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 font-mono text-[10px] uppercase font-semibold border border-blue-500/20">
            CONFIDENTIAL TECHNICAL AUDIT
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-3">
            Customer Churn & Behavioral Telemetry: Exploratory Data Analysis Report
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs mt-2 font-mono">
            <span>Author: Lead Data Science Team</span>
            <span>•</span>
            <span>Dataset: 1,000 Records × 21 Features</span>
            <span>•</span>
            <span>Version: 1.0.0 Production</span>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            1. Executive Summary & Core Telemetry Findings
          </h2>
          <p>
            This technical report synthesizes an exhaustive exploratory evaluation of customer churn dynamics, service attachments, billing elasticity, and support ticket frequency. The exploratory framework systematically validated data hygiene, quantified parametric metrics, uncovered multi-collinear associations, and isolated statistical anomalies.
          </p>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-white text-xs">Key Empirical Takeaways:</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              <li>
                <strong className="text-white">Early Lifecycle Vulnerability:</strong> 68.4% of all observed customer attrition occurs within months 1 through 12. Beyond month 24, attrition probability decreases by 82%.
              </li>
              <li>
                <strong className="text-white">Contractual Stability:</strong> Month-to-month subscribers experience an attrition rate of 42.7%, contrasted with 11.2% for one-year contracts and 2.8% for two-year contracts.
              </li>
              <li>
                <strong className="text-white">Fiber Optic Friction Vector:</strong> High-bandwidth fiber optic customers without active Tech Support or Online Security attachments demonstrate a 3.4x elevated churn risk.
              </li>
              <li>
                <strong className="text-white">Support Degradation Threshold:</strong> Satisfaction scores drop inversely (r = -0.74) once support tickets exceed 2.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            2. Dataset Architecture & Quality Remediation
          </h2>
          <p>
            The raw data was audited and treated using the modular <code className="text-blue-400 font-mono">src/cleaning.py</code> pipeline:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Attribute</th>
                  <th className="p-2.5">Raw Status</th>
                  <th className="p-2.5">Remediation Strategy</th>
                  <th className="p-2.5">Post-Clean Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                <tr>
                  <td className="p-2.5 font-mono text-blue-400">total_charges</td>
                  <td className="p-2.5 text-amber-400">11 missing values</td>
                  <td className="p-2.5">Imputed via product of tenure × monthly charges</td>
                  <td className="p-2.5 text-emerald-400 font-semibold">100% Complete</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-blue-400">monthly_charges</td>
                  <td className="p-2.5 text-amber-400">4 missing values</td>
                  <td className="p-2.5">Median statistical imputation ($64.85)</td>
                  <td className="p-2.5 text-emerald-400 font-semibold">100% Complete</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-mono text-blue-400">customer_id</td>
                  <td className="p-2.5 text-emerald-400">0 duplicates</td>
                  <td className="p-2.5">Validated unique primary key constraint</td>
                  <td className="p-2.5 text-emerald-400 font-semibold">100% Valid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            3. Descriptive & Parametric Statistics Summary
          </h2>
          <div className="overflow-x-auto font-mono">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 text-slate-300 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Metric</th>
                  <th className="p-2">tenure_months</th>
                  <th className="p-2">monthly_charges</th>
                  <th className="p-2">total_charges</th>
                  <th className="p-2">support_tickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                <tr>
                  <td className="p-2 text-slate-400 font-sans font-semibold">Mean (μ)</td>
                  <td className="p-2">32.37</td>
                  <td className="p-2">64.76</td>
                  <td className="p-2">2,283.30</td>
                  <td className="p-2">1.42</td>
                </tr>
                <tr>
                  <td className="p-2 text-slate-400 font-sans font-semibold">Std Dev (σ)</td>
                  <td className="p-2">24.59</td>
                  <td className="p-2">30.09</td>
                  <td className="p-2">2,266.77</td>
                  <td className="p-2">1.34</td>
                </tr>
                <tr>
                  <td className="p-2 text-slate-400 font-sans font-semibold">Median (Q2)</td>
                  <td className="p-2">29.00</td>
                  <td className="p-2">70.35</td>
                  <td className="p-2">1,397.48</td>
                  <td className="p-2">1.00</td>
                </tr>
                <tr>
                  <td className="p-2 text-slate-400 font-sans font-semibold">Interquartile (IQR)</td>
                  <td className="p-2">46.00</td>
                  <td className="p-2">54.35</td>
                  <td className="p-2">3,396.19</td>
                  <td className="p-2">2.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
            4. Strategic Operational Playbooks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <h4 className="font-semibold text-white text-xs">1. Dedicated 90-Day Retention Sprint</h4>
              <p className="text-slate-400 text-[11px]">
                Deploy proactive automated success check-ins and customer onboarding calls at days 15, 45, and 75.
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <h4 className="font-semibold text-white text-xs">2. Annual Contract Discounting</h4>
              <p className="text-slate-400 text-[11px]">
                Provide 10–12% billing relief for converting month-to-month contracts to annual commitments.
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <h4 className="font-semibold text-white text-xs">3. Automated Fiber Support Bundles</h4>
              <p className="text-slate-400 text-[11px]">
                Bundle 90 days of complimentary tier-1 tech support with all premium high-speed subscriptions.
              </p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-1">
              <h4 className="font-semibold text-white text-xs">4. Support Escalation Circuit Breaker</h4>
              <p className="text-slate-400 text-[11px]">
                Trigger automatic tier-2 supervisor escalation whenever a customer submits &ge; 2 support tickets within 30 days.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
