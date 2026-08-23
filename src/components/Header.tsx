import React, { useRef } from "react";
import {
  BarChart3,
  BookOpen,
  Code2,
  Database,
  Download,
  FileText,
  Upload,
} from "lucide-react";
import { SampleDataset } from "../types";

interface HeaderProps {
  currentDataset: SampleDataset;
  sampleDatasets: SampleDataset[];
  onSelectDataset: (dataset: SampleDataset) => void;
  onFileUpload: (file: File) => void;
  activeView: "studio" | "code" | "notebook" | "report";
  onSelectView: (view: "studio" | "code" | "notebook" | "report") => void;
  onDownloadZip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDataset,
  sampleDatasets,
  onSelectDataset,
  onFileUpload,
  activeView,
  onSelectView,
  onDownloadZip,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Top tier */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/30">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-white">EDA Studio</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                Python 3.12+
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Exploratory Data Analysis & Quality Profiling</p>
          </div>
        </div>

        {/* Dataset Switcher & Upload */}
        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          <div className="flex items-center min-w-0 w-full sm:w-auto overflow-hidden bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 gap-2">
            <Database className="w-4 h-4 text-blue-400 shrink-0" />
            <select
              value={currentDataset.id}
              aria-label="Select dataset"
              onChange={(e) => {
                const found = sampleDatasets.find((d) => d.id === e.target.value);
                if (found) onSelectDataset(found);
              }}
              className="bg-transparent min-w-0 w-0 flex-1 sm:w-auto sm:flex-none text-xs font-medium text-slate-200 outline-none cursor-pointer pr-2"
            >
              {sampleDatasets.map((ds) => (
                <option key={ds.id} value={ds.id} className="bg-slate-900 text-slate-200">
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
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors flex-1 sm:flex-none"
          >
            <Upload className="w-3.5 h-3.5 text-slate-300" />
            <span>Upload CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={onDownloadZip}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/20 transition-colors flex-1 sm:flex-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Project (.zip)</span>
          </button>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectView("studio")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeView === "studio"
              ? "border-blue-500 text-blue-400 bg-slate-800/40 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Interactive EDA Studio</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView("code")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeView === "code"
              ? "border-blue-500 text-blue-400 bg-slate-800/40 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Python Source Modules (`src/`)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView("notebook")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeView === "notebook"
              ? "border-blue-500 text-blue-400 bg-slate-800/40 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Jupyter Notebook (.ipynb)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView("report")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeView === "report"
              ? "border-blue-500 text-blue-400 bg-slate-800/40 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Executive Technical Report</span>
        </button>
      </div>
    </header>
  );
};
