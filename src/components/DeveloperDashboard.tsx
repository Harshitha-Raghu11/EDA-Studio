import React from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  Github,
  Globe,
  Layers,
  Linkedin,
  Network,
  ShieldAlert,
  Sparkles,
  Table,
  Terminal,
  Wand2,
  Zap,
} from "lucide-react";
import { DatasetMetadata, ParametricStat } from "../types";

interface DeveloperDashboardProps {
  metadata: DatasetMetadata;
  parametricStats: ParametricStat[];
  onNavigateTab: (tab: string) => void;
  onNavigateView: (view: "studio" | "report") => void;
  datasetName: string;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  metadata,
  parametricStats,
  onNavigateTab,
  onNavigateView,
  datasetName,
}) => {
  const developer = {
    name: "Harshitha R",
    role: "Lead Full-Stack & Data Intelligence Engineer",
    github: "https://github.com/Harshitha-Raghu11",
    linkedin: "https://www.linkedin.com/in/harshitha-r-83065133b/",
  };

  const capabilities = [
    {
      title: "Interactive EDA Studio",
      category: "Studio Experience",
      icon: Table,
      color: "from-brand to-brand-2",
      desc: "Comprehensive dataset profiling, interactive column filtering, schema classification, and automated statistics.",
      features: ["Schema Type Detection", "Dynamic Null & Memory Footprint", "Column Visibility Toggles", "Deep Statistical Tables"],
      tabAction: "overview",
      viewAction: "studio" as const,
    },
    {
      title: "Automated Data Cleaning",
      category: "Data Hygiene Pipeline",
      icon: Wand2,
      color: "from-success to-teal",
      desc: "Robust sanitization with configurable imputation strategies (auto/median/mean/mode/drop), duplicate elimination, and audit logs.",
      features: ["Whitespace Stripping", "Statistical Imputation", "Deduplication Auditing", "Reversible Transformations"],
      tabAction: "cleaning",
      viewAction: "studio" as const,
    },
    {
      title: "Descriptive & Parametric Statistics",
      category: "Mathematical Moments",
      icon: Activity,
      color: "from-brand-2 to-brand",
      desc: "Rigorous parametric moments, quantiles, variance, IQR, standard error of mean, skewness, and Fisher kurtosis.",
      features: ["Central Tendency (Mean, Median, Mode)", "Dispersion & Quantiles", "Fisher Kurtosis & Skewness", "Categorical Frequency Ranks"],
      tabAction: "statistics",
      viewAction: "studio" as const,
    },
    {
      title: "Publication-Grade Visualizations",
      category: "Exploratory Visuals",
      icon: BarChart3,
      color: "from-warning to-amber-600",
      desc: "High-resolution histograms with mean/median markers, categorical distribution bars, boxplots, and bivariate scatter correlation.",
      features: ["Dynamic Binning Histograms", "Grouped Categorical Counts", "Outlier Boxplot Whisker Diagnostics", "Bivariate Regression Lines"],
      tabAction: "visualization",
      viewAction: "studio" as const,
    },
    {
      title: "Correlation Discovery Engine",
      category: "Collinearity Analytics",
      icon: Network,
      color: "from-brand-2 to-indigo-700",
      desc: "Dual-mode Pearson (linear) and Spearman (rank-order) correlation heatmaps with automated top-pair ranking.",
      features: ["Triangular & Full Heatmaps", "Absolute Magnitude Sorting", "Color-coded Association Matrix", "Multi-Collinearity Detection"],
      tabAction: "correlation",
      viewAction: "studio" as const,
    },
    {
      title: "Outlier Audit & Winsorization",
      category: "Anomaly Detection",
      icon: ShieldAlert,
      color: "from-danger to-warning",
      desc: "Dual Tukey 1.5× IQR and Parametric Z-score (3.0σ) detection with one-click Winsorization clipping.",
      features: ["Tukey IQR Boundary Math", "Standard Deviation Z-Score Filtering", "Boundary Winsorization", "Anomaly Impact Summaries"],
      tabAction: "outliers",
      viewAction: "studio" as const,
    },
    {
      title: "Feature Engineering Studio",
      category: "Model Preprocessing",
      icon: Cpu,
      color: "from-brand to-brand-2",
      desc: "One-Hot encoding, Z-score standard scaling, MinMax normalization, Log1p transformations, and custom interaction ratios.",
      features: ["One-Hot Categorical Encoding", "Standard & MinMax Scalers", "Log1p Skew Stabilization", "Custom Numerical Interaction Ratios"],
      tabAction: "feature_eng",
      viewAction: "studio" as const,
    },
    {
      title: "Automated Statistical Insights",
      category: "Intelligence & Summary",
      icon: Sparkles,
      color: "from-brand to-brand-2",
      desc: "Client-side deterministic intelligence identifying distribution warnings, high-leverage correlations, and actionable business playbooks.",
      features: ["Executive Summary Synthesizer", "Distribution Skew Warnings", "Strategic Action Playbooks", "Interactive Dataset Q&A Engine"],
      tabAction: "insights",
      viewAction: "studio" as const,
    },
    {
      title: "Executive Technical Report",
      category: "Publication & Export",
      icon: FileText,
      color: "from-teal to-brand",
      desc: "Publication-grade markdown technical report generator with instant browser printing/PDF saving and full zip bundling.",
      features: ["Markdown report.md Export", "Print & Save to PDF Ready", "Processed Clean CSV Download", "Full Project .zip Bundle Packaging"],
      tabAction: "report_export",
      viewAction: "report" as const,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-card p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-brand-2/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand p-0.5 shadow-xs">
                <div className="w-full h-full bg-white rounded-[14px] flex flex-col items-center justify-center text-ink">
                  <span className="text-2xl sm:text-3xl font-black tracking-wider text-brand font-mono">
                    HR
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#64748B] font-semibold mt-0.5">
                    DEV
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-[10px] text-white font-bold shadow-xs" title="Verified Creator">
                ✓
              </div>
            </div>

            {/* Dev Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
                  {developer.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-blue-50 text-[#2563EB] border border-blue-200">
                  Lead Developer
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-indigo-50 text-[#6366F1] border border-indigo-200">
                  Data Systems Architect
                </span>
              </div>
              <p className="text-sm text-[#172033] font-medium">
                Creator & Architect of <span className="text-[#2563EB] font-semibold">DATA LENS</span> — Exploratory Data Analysis & Quality Intelligence Engine
              </p>
              <p className="text-xs text-[#64748B] max-w-2xl leading-relaxed">
                Empowering data scientists and business analysts with instant in-browser data hygiene audits, parametric profiling, multi-collinearity discovery, and automated executive reporting.
              </p>
            </div>
          </div>

          {/* Social Links & Netlify Badge */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <a
              href={developer.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] text-[#172033] border border-[#E2E8F0] hover:border-slate-300 text-xs font-semibold shadow-xs transition-all group cursor-pointer"
            >
              <Github className="w-4 h-4 text-[#64748B] group-hover:text-[#172033]" />
              <span>GitHub Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#172033]" />
            </a>

            <a
              href={developer.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white border border-blue-600 text-xs font-semibold shadow-xs transition-all group cursor-pointer"
            >
              <Linkedin className="w-4 h-4 text-white" />
              <span>LinkedIn Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-200 group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block">Active Dataset</span>
            <span className="text-sm font-bold text-[#172033] truncate block mt-0.5">{datasetName}</span>
            <span className="text-[11px] text-[#2563EB] font-mono mt-0.5 block">{metadata.numRows.toLocaleString()} rows × {metadata.numColumns} cols</span>
          </div>

          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block">Architecture</span>
            <span className="text-sm font-bold text-[#10B981] block mt-0.5">Client-Side SPA</span>
            <span className="text-[11px] text-[#64748B] mt-0.5 block">Zero Server Roundtrips</span>
          </div>

          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block">Privacy & Security</span>
            <span className="text-sm font-bold text-[#2563EB] block mt-0.5">100% In-Browser</span>
            <span className="text-[11px] text-[#64748B] mt-0.5 block">Zero Cloud Data Upload</span>
          </div>

          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-3 shadow-2xs">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold block">Python Pipeline</span>
            <span className="text-sm font-bold text-[#F59E0B] block mt-0.5">PEP 8 / Jupyter</span>
            <span className="text-[11px] text-[#64748B] mt-0.5 block">Modular `src/` modules</span>
          </div>
        </div>
      </div>

      {/* Feature Showcase Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-lg font-bold text-[#172033] tracking-tight">Full System Feature Showcase</h2>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Click any feature card to jump directly into its operational interactive workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>11 Core Modules Operational</span>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-[#E2E8F0] hover:border-blue-300 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header Icon + Category */}
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    {item.category}
                  </span>
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="text-sm font-bold text-[#172033] group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Key feature pills */}
                <div className="pt-2">
                  <div className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Included Capabilities
                  </div>
                  <ul className="space-y-1">
                    {item.features.map((feat, fIdx) => (
                      <li key={fIdx} className="text-[11px] text-[#172033] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateView(item.viewAction);
                    if (item.viewAction === "studio") {
                      onNavigateTab(item.tabAction);
                    }
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#2563EB] text-[#172033] hover:text-white border border-[#E2E8F0] hover:border-transparent text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <span>Launch {item.title.split(" ")[0]}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Architecture & Engineering Specifications Panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#2563EB]" />
            <div>
              <h3 className="text-sm font-bold text-[#172033]">System Architecture & Engineering Standards</h3>
              <p className="text-xs text-[#64748B]">High-performance browser computing with deterministic privacy and single-page routing</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-blue-50 text-[#2563EB] text-[10px] font-mono uppercase font-semibold border border-blue-200">
            Engineered by Harshitha R
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#2563EB] font-semibold text-xs">
              <Terminal className="w-4 h-4" />
              <span>Static Deployment Pipeline</span>
            </div>
            <pre className="text-[11px] font-mono text-[#172033] bg-white p-2.5 rounded border border-[#E2E8F0] overflow-x-auto shadow-2xs">
{`[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`}
            </pre>
            <p className="text-[11px] text-[#64748B]">
              Deterministic single-page application routing configured via <code>netlify.toml</code>.
            </p>
          </div>

          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#10B981] font-semibold text-xs">
              <Zap className="w-4 h-4" />
              <span>Edge Fallback Redundancy</span>
            </div>
            <pre className="text-[11px] font-mono text-[#172033] bg-white p-2.5 rounded border border-[#E2E8F0] overflow-x-auto shadow-2xs">
{`/*    /index.html   200`}
            </pre>
            <p className="text-[11px] text-[#64748B]">
              Clean routing fallback provided via <code>public/_redirects</code>.
            </p>
          </div>

          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#6366F1] font-semibold text-xs">
              <Layers className="w-4 h-4" />
              <span>Full In-Browser Computing</span>
            </div>
            <p className="text-[11px] text-[#172033] leading-relaxed">
              All statistical math, PapaParse ingestion, correlations, outlier filters, and charts execute 100% locally in the user's browser. No backend server dependency required.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[#10B981] font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero server maintenance cost</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
