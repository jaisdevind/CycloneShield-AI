import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { AICopilotResponse } from '../types';

export const GeminiCopilotPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AICopilotResponse | null>(null);

  const samplePrompts = [
    "Which healthcare facilities have the highest modeled surge exposure?",
    "Which transport and road corridors intersect high-susceptibility zones?",
    "What specific datasets and elevation baselines support this assessment?",
    "What are the main model uncertainties and data gaps for this landfall?",
    "Draft an operational preparedness briefing for District Collectors."
  ];

  const handleExecuteQuery = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setLoading(true);
    setQuery(userQuery);
    try {
      const res = await api.queryAICopilot(userQuery, 'varun_2026');
      setResponse(res);
    } catch (err) {
      console.error('Copilot query error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial query on mount if empty
  React.useEffect(() => {
    handleExecuteQuery("Which healthcare facilities have the highest modeled surge exposure?");
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Gemini AI Geospatial Copilot
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evidence-grounded decision support powered by official Google Gen AI SDK with explicit uncertainty and source context.
          </p>
        </div>

        {response && (
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium border ${
                response.is_ai_generated
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {response.model_identifier}
            </span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          One-Click Tactical Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteQuery(promptText)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input Bar */}
      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask a technical or operational cyclone risk question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExecuteQuery(query)}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
        />
        <button
          onClick={() => handleExecuteQuery(query)}
          disabled={loading}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Inquire</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Display */}
      {response && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-200">Executive Synthesized Assessment</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evidence As Of: {new Date(response.data_freshness_timestamp).toUTCString()}</span>
              </div>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {response.summary}
            </p>
          </div>

          {/* Structured Findings Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Evidence-Grounded Findings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {response.findings.map((f, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${getSeverityBadge(f.severity)}`}>
                        {f.severity}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white">{f.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{f.detail}</p>
                  </div>

                  {f.evidence_data.length > 0 && (
                    <div className="bg-slate-950 p-2 rounded border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-0.5">
                      <span className="text-[10px] text-slate-500 block uppercase">Supporting Facts:</span>
                      {f.evidence_data.map((ev, eIdx) => (
                        <div key={eIdx}>• {ev}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions & Uncertainties Split View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Suggested Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-sm font-semibold text-white">Suggested Operational Actions</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {response.suggested_actions.map((act, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold font-mono">0{idx + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Model Uncertainties & Limitations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-semibold text-white">Model Uncertainties & Data Gaps</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {response.uncertainties.map((unc, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold font-mono">!</span>
                    <span>{unc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cited Sources Footer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Cited Datasets:</span>
              <span className="text-slate-300">{response.cited_sources.slice(0, 3).join(' • ')}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Strict Grounding Protocol v2.5</span>
          </div>
        </div>
      )}
    </div>
  );
};
