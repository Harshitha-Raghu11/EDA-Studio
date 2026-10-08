import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  ChevronDown,
  Database,
  Download,
  FileText,
  LayoutGrid,
  Menu,
  MoonStar,
  ShieldAlert,
  SunMedium,
  Upload,
  Wand2,
} from "lucide-react";
import { SampleDataset } from "../types";

interface HeaderProps {
  currentDataset: SampleDataset;
  sampleDatasets: SampleDataset[];
  onSelectDataset: (dataset: SampleDataset) => void;
  onFileUpload: (file: File) => void;
  activeView: "studio" | "report";
  onSelectView: (view: "studio" | "report") => void;
  activeStudioTab: string;
  onSelectStudioTab: (tab: string) => void;
  onDownloadZip: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  sampleDatasets,
  onSelectDataset,
  onFileUpload,
  activeView,
  onSelectView,
  activeStudioTab,
  onSelectStudioTab,
  onDownloadZip,
  theme,
  onToggleTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "cleaning", label: "Data Cleaning", icon: Wand2 },
    { id: "statistics", label: "Descriptive Stats", icon: Activity },
    { id: "visualization", label: "Visualizations", icon: BarChart3 },
    { id: "correlation", label: "Correlation Matrix", icon: Database },
    { id: "outliers", label: "Outlier Audit", icon: ShieldAlert },
    { id: "feature_eng", label: "Feature Engineering", icon: Database },
    { id: "insights", label: "Insights & Analysis", icon: BarChart3 },
    { id: "report_export", label: "Report & Export", icon: FileText },
  ];

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--panel)]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((prev) => !prev);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-alt)] px-3 py-2 text-sm font-medium text-[var(--text)] shadow-sm transition hover:border-[var(--primary)]"
              >
                <Menu className="h-4 w-4 text-[var(--primary)]" />
                <span>Navigation</span>
                <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] transition ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-[var(--shadow)] transition-all ${
                  menuOpen ? "translate-y-0 opacity-100 visible" : "pointer-events-none -translate-y-2 opacity-0 invisible"
                }`}
                onClick={(event) => event.stopPropagation()}
              >
                {navItems.map(({ id, label, icon: Icon }) => {
                  const isReport = id === "report_export";
                  const isActive = isReport ? activeView === "report" : activeStudioTab === id && activeView === "studio";

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        if (isReport) {
                          onSelectView("report");
                        } else {
                          onSelectView("studio");
                          onSelectStudioTab(id);
                        }
                        setMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                        isActive ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--text)] hover:bg-[var(--panel-alt)]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      {isActive && <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-base font-semibold tracking-tight text-[var(--text)]">DATA LENS</span>
                  <span className="rounded-full border border-[var(--primary)]/25 bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                    Studio
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Data quality intelligence dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-end gap-2.5">
            <div className="flex min-w-0 items-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel-alt)] px-2.5 py-1.5">
              <Database className="mr-2 h-4 w-4 text-[var(--primary)]" />
              <select
                value={currentDataset.id}
                aria-label="Select dataset"
                onChange={(e) => {
                  const found = sampleDatasets.find((d) => d.id === e.target.value);
                  if (found) onSelectDataset(found);
                }}
                className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[var(--text)] outline-none"
              >
                {sampleDatasets.map((ds) => (
                  <option key={ds.id} value={ds.id} className="bg-[var(--panel)] text-[var(--text)]">
                    {ds.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx"
              aria-label="Upload CSV or Excel file"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-alt)] px-3 py-2 text-xs font-medium text-[var(--text)] transition hover:border-[var(--primary)]"
            >
              <Upload className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span>Upload</span>
            </button>

            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-alt)] text-[var(--text)] transition hover:border-[var(--primary)]"
              aria-label="Toggle light and dark theme"
            >
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onDownloadZip}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.25)] transition hover:bg-[var(--primary-strong)]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
