import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  datasetName?: string;
  statsBadge?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  datasetName,
  statsBadge,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172033] flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          {subtitle}
        </p>
      </div>

      {(datasetName || statsBadge || actions) && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {datasetName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-mono shadow-xs">
              <span className="text-[#64748B] font-sans text-[11px] uppercase tracking-wider font-medium">Dataset:</span>
              <strong className="text-[#172033] font-semibold tracking-tight">{datasetName}</strong>
            </span>
          )}
          {statsBadge && (
            <span className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] text-xs font-mono shadow-xs">
              {statsBadge}
            </span>
          )}
          {actions}
        </div>
      )}
    </div>
  );
};
