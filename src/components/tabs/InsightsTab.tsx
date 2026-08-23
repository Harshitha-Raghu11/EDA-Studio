import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  Send,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { CorrelationPair, DataInsightResponse, DatasetMetadata, ParametricStat } from "../../types";

interface InsightsTabProps {
  metadata: DatasetMetadata;
  parametricStats: ParametricStat[];
  correlationPairs: CorrelationPair[];
  datasetName: string;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  metadata,
  parametricStats,
  correlationPairs,
  datasetName,
}) => {
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [dataInsights, setDataInsights] = useState<DataInsightResponse | null>(null);

  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "analyst"; text: string; time: string }>
  >([
    {
      sender: "analyst",
      text: `Hello! I have indexed **${datasetName}** (${metadata.numRows.toLocaleString()} observations, ${metadata.numColumns} features). Ask a statistical question, request feature hypotheses, or explore business implications.`,
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const generateInsights = () => {
    setLoadingInsights(true);
    const strongestPair = correlationPairs[0];
    const mostSkewed = [...parametricStats].sort((a, b) => Math.abs(b.skewness) - Math.abs(a.skewness))[0];
    setDataInsights({
      source: "local",
      executiveSummary: `${datasetName} contains ${metadata.numRows.toLocaleString()} observations across ${metadata.numColumns} features. Missing values account for ${metadata.totalNullPercentage.toFixed(2)}% of cells. The summary is calculated from the active dataset.`,
      keyDrivers: correlationPairs.slice(0, 3).map((pair) => ({
        feature: `${pair.feature1} & ${pair.feature2}`,
        impact: pair.absR >= 0.7 ? "High" : "Medium",
        description: `${pair.relationshipCategory} relationship with r = ${pair.r.toFixed(2)}.`,
      })),
      anomaliesAndRisks: metadata.totalNullCells > 0
        ? [{
            riskArea: "Missing values",
            severity: metadata.totalNullPercentage >= 10 ? "High" : "Medium",
            mitigation: "Review missing-value patterns and choose a cleaning strategy before interpretation.",
          }]
        : [],
      strategicRecommendations: [
        strongestPair ? `Investigate ${strongestPair.feature1} and ${strongestPair.feature2} in the Correlation tab.` : "Add numerical features to enable pairwise correlation analysis.",
        mostSkewed ? `Review the distribution of ${mostSkewed.feature} before choosing a transformation.` : "Add numerical features to enable distribution analysis.",
      ],
    });
    setLoadingInsights(false);
  };

  const handleSendMessage = async (suggestedQuestion?: string) => {
    const textToSend = suggestedQuestion || chatInput.trim();
    if (!textToSend) return;

    const userMsg = {
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!suggestedQuestion) setChatInput("");
    setChatLoading(true);

    const question = textToSend.toLowerCase();
    const strongestPair = correlationPairs[0];
    const mostSkewed = [...parametricStats].sort((a, b) => Math.abs(b.skewness) - Math.abs(a.skewness))[0];
    let reply = `The active dataset contains ${metadata.numRows.toLocaleString()} rows and ${metadata.numColumns} features. `;
    if (question.includes("missing") || question.includes("null")) {
      reply += `${metadata.totalNullCells.toLocaleString()} missing cells were detected (${metadata.totalNullPercentage.toFixed(2)}% of all cells). Review the Cleaning tab for treatment options.`;
    } else if (question.includes("skew")) {
      reply += mostSkewed
        ? `${mostSkewed.feature} has the largest absolute skewness at ${mostSkewed.skewness.toFixed(2)} (${mostSkewed.skewnessCategory.toLowerCase()}). Consider a transformation only after reviewing its distribution.`
        : "No numerical feature is available for skewness analysis.";
    } else if (question.includes("correlation") || question.includes("relationship")) {
      reply += strongestPair
        ? `The strongest observed relationship is between ${strongestPair.feature1} and ${strongestPair.feature2}, with r = ${strongestPair.r.toFixed(2)}.`
        : "At least two numerical features are needed for correlation analysis.";
    } else {
      reply += strongestPair
        ? `The strongest observed relationship is ${strongestPair.feature1} and ${strongestPair.feature2} (r = ${strongestPair.r.toFixed(2)}). Review the Overview, Statistics, and Correlation tabs for more context.`
        : "Review the Overview and Statistics tabs to understand the available features.";
    }
    setChatMessages((prev) => [...prev, {
      sender: "analyst",
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setChatLoading(false);
  };

  const analysisSuggestions = [
    "What are the top 3 drivers of customer churn?",
    "How should I handle skewness in total_charges?",
    "Which machine learning model is best suited for this dataset?",
    "Explain the business significance of monthly charges correlation.",
  ];

  const baselineInsights = useMemo(() => {
    const strongestPair = correlationPairs[0];
    const mostSkewed = [...parametricStats].sort((a, b) => Math.abs(b.skewness) - Math.abs(a.skewness))[0];
    const qualityText =
      metadata.totalNullCells > 0
        ? `${metadata.totalNullCells.toLocaleString()} missing cells remain across the active dataset. Review the Cleaning tab before drawing conclusions.`
        : metadata.duplicateRowsCount > 0
          ? `${metadata.duplicateRowsCount.toLocaleString()} duplicate rows were detected. Review the Cleaning tab before modelling.`
          : "No missing cells or duplicate rows were detected in the active dataset. Review outlier counts before modelling.";

    return [
      {
        title: "Data quality status",
        text: qualityText,
        icon: CheckCircle2,
        color: metadata.totalNullCells > 0 || metadata.duplicateRowsCount > 0 ? "text-amber-400" : "text-emerald-400",
      },
      {
        title: strongestPair ? "Strongest observed relationship" : "Correlation coverage",
        text: strongestPair
          ? `${strongestPair.feature1} and ${strongestPair.feature2} have the strongest observed ${strongestPair.relationshipCategory.toLowerCase()} relationship (r = ${strongestPair.r.toFixed(2)}).`
          : "At least two numerical columns are needed before pairwise relationships can be assessed.",
        icon: TrendingUp,
        color: "text-blue-400",
      },
      {
        title: mostSkewed ? "Distribution shape" : "Distribution coverage",
        text: mostSkewed
          ? `${mostSkewed.feature} is the most asymmetric numerical feature in the current data (${mostSkewed.skewnessCategory.toLowerCase()}, skewness ${mostSkewed.skewness.toFixed(2)}).`
          : "No numerical columns are available for distribution-shape analysis.",
        icon: Target,
        color: "text-violet-400",
      },
    ];
  }, [correlationPairs, metadata, parametricStats]);

  return (
    <div className="space-y-6">
      {/* Insight generation card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Statistical & Strategic Business Intelligence</h3>
              <p className="text-xs text-slate-400">Automated synthesis of telemetry patterns, risk vectors, and retention playbooks</p>
            </div>
          </div>

          <button
            type="button"
            onClick={generateInsights}
            disabled={loadingInsights}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/20 disabled:opacity-50 transition-all"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{loadingInsights ? "Calculating Insights..." : "Generate Insights"}</span>
          </button>
        </div>

        {/* Display generated or default empirical insights */}
        {dataInsights ? (
          <div className="space-y-5">
            {/* Executive Summary */}
            {dataInsights.executiveSummary && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Executive Statistical Summary</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {dataInsights.executiveSummary}
                </p>
              </div>
            )}

            {/* Key Drivers & Risk Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Drivers */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>Primary Key Drivers</span>
                </h4>
                <div className="space-y-2.5">
                  {(dataInsights.keyDrivers || []).map((kd, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-slate-200">{kd.feature}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {kd.impact} Impact
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{kd.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomalies and Risks */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risk Areas & Mitigations</span>
                </h4>
                <div className="space-y-2.5">
                  {(dataInsights.anomaliesAndRisks || []).map((risk, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium text-rose-400">{risk.riskArea}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {risk.severity} Severity
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            {dataInsights.strategicRecommendations && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Actionable Strategic Recommendations</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {dataInsights.strategicRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <span className="text-emerald-400 font-bold text-xs mt-0.5">#{i + 1}</span>
                      <p className="text-xs text-slate-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {baselineInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.title} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className={`flex items-center gap-2 ${insight.color}`}>
                    <Icon className="w-4 h-4" />
                    <h4 className="text-xs font-semibold uppercase">{insight.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{insight.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive dataset analysis chat */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[460px]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ask Your Dataset</h3>
              <p className="text-xs text-slate-400">Ask statistical questions, modeling advice, or dataset quality queries</p>
            </div>
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/40">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "analyst" && (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-xl rounded-xl p-3.5 text-xs space-y-1 ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20"
                    : "bg-slate-900 border border-slate-800 text-slate-200"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div className="text-[10px] text-slate-400 text-right">{msg.time}</div>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs animate-pulse">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span>Analyzing dataset and formulating statistical response...</span>
            </div>
          )}
        </div>

        {/* Analysis suggestions */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-slate-500 uppercase font-semibold shrink-0">Explore:</span>
          {analysisSuggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(s)}
              className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] whitespace-nowrap border border-slate-800 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your statistical query or hypothesis..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={chatLoading || !chatInput.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-md shadow-blue-900/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
