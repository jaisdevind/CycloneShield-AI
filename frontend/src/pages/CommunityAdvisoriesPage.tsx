import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  CheckCircle,
  Clock,
  Printer,
  Languages,
  Users,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { AdvisoryItem } from '../types';

export const CommunityAdvisoriesPage: React.FC = () => {
  const [advisories, setAdvisories] = useState<AdvisoryItem[]>([]);
  const [selectedAdvisory, setSelectedAdvisory] = useState<AdvisoryItem | null>(null);

  // New draft controls
  const [audience, setAudience] = useState<string>('general_public');
  const [language, setLanguage] = useState<string>('en');
  const [generating, setGenerating] = useState(false);

  // Editing controls
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Human approval modal state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('Dr. P. V. Ramana');
  const [officialTitle, setOfficialTitle] = useState('District Disaster Management Officer');
  const [confirmCertified, setConfirmCertified] = useState(false);
  const [approving, setApproving] = useState(false);

  const selectDraft = (adv: AdvisoryItem) => {
    setSelectedAdvisory(adv);
    setEditTitle(adv.title);
    setEditContent(adv.content);
    setReviewNotes(adv.review_notes || '');
  };

  const fetchAdvisories = useCallback(async () => {
    try {
      const data = await api.getAdvisories();
      setAdvisories(data);
      if (data.length > 0) {
        selectDraft(data[0]);
      }
    } catch (err) {
      console.error('Failed to load advisories:', err);
    }
  }, []);

  useEffect(() => {
    fetchAdvisories();
  }, [fetchAdvisories]);

  const handleGenerateNewDraft = async () => {
    setGenerating(true);
    try {
      const created = await api.createAdvisoryDraft({
        scenario_id: 'varun_2026',
        audience,
        language
      });
      await fetchAdvisories();
      selectDraft(created);
    } catch (err) {
      console.error('Failed to create advisory:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedAdvisory) return;
    setSaving(true);
    try {
      const updated = await api.updateAdvisoryDraft(selectedAdvisory.id, {
        title: editTitle,
        content: editContent,
        review_notes: reviewNotes
      });
      await fetchAdvisories();
      selectDraft(updated);
    } catch (err) {
      console.error('Failed to update advisory:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAdvisory = async () => {
    if (!selectedAdvisory || !confirmCertified) return;
    setApproving(true);
    try {
      const approved = await api.approveAdvisory(selectedAdvisory.id, {
        reviewer_name: reviewerName,
        official_title: officialTitle,
        review_notes: reviewNotes
      });
      setShowApprovalModal(false);
      await fetchAdvisories();
      selectDraft(approved);
    } catch (err) {
      console.error('Failed to approve advisory:', err);
    } finally {
      setApproving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Community Advisory & Human-in-the-Loop Approval
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized bilingual preparedness bulletins (English / Telugu). Mandatory official authorization prior to dispatch.
          </p>
        </div>

        <div className="bg-amber-950/60 border border-amber-900/60 px-3 py-1.5 rounded-lg text-amber-300 text-xs font-mono">
          Strict Safety: Automated broadcasting disabled
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator & Saved Drafts Sidebar */}
        <div className="space-y-5">
          {/* Draft Generator Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Draft Generator
            </h2>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Intended Audience</span>
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="general_public">General Coastal Public</option>
                <option value="fishermen">Marine Fishermen & Boats</option>
                <option value="collectors_responders">District Collectors & Responders</option>
                <option value="port_operators">Port & Industrial Operators</option>
              </select>
            </div>

            {/* Language Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span>Bulletin Language</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                    language === 'en'
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  English (en)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('te')}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                    language === 'te'
                      ? 'bg-cyan-600 text-white border-cyan-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateNewDraft}
              disabled={generating}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Generate New Grounded Draft</span>
                </>
              )}
            </button>
          </div>

          {/* Drafts Archive List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Advisory Register ({advisories.length})
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {advisories.map((adv) => {
                const isSelected = selectedAdvisory?.id === adv.id;
                return (
                  <div
                    key={adv.id}
                    onClick={() => selectDraft(adv)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500/50 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="capitalize text-slate-400 font-mono text-[11px]">
                        {adv.audience.replace('_', ' ')} • {adv.language.toUpperCase()}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                          adv.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {adv.status}
                      </span>
                    </div>
                    <div className="font-semibold text-white truncate">{adv.title}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(adv.updated_at || adv.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Advisory Workspace, Editor & Sign-off Panel */}
        <div className="lg:col-span-2 space-y-5">
          {selectedAdvisory ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-xl">
              {/* Draft Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase ${
                        selectedAdvisory.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {selectedAdvisory.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {selectedAdvisory.id}</span>
                  </div>
                  {selectedAdvisory.approved_by && (
                    <div className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Authorized by: <strong>{selectedAdvisory.approved_by}</strong></span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Bulletin</span>
                  </button>

                  {selectedAdvisory.status !== 'approved' && (
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-md"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Review & Authorize</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Bulletin Headline
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              {/* Body Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Advisory Body & Directives
                </label>
                <textarea
                  rows={10}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                ></textarea>
              </div>

              {/* Evidence & Uncertainty Grounding Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-cyan-400 font-semibold block mb-0.5">Evidence Grounding</span>
                  <span className="text-slate-400">{selectedAdvisory.evidence_summary}</span>
                </div>
                <div>
                  <span className="text-amber-400 font-semibold block mb-0.5">Uncertainty Disclosure</span>
                  <span className="text-slate-400">{selectedAdvisory.uncertainty_statement}</span>
                </div>
              </div>

              {/* Review Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Internal Verification Audit Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cross-checked with IMD 03:00 UTC bulletin and APSDMA port report..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Save Draft Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveEdits}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Draft Revisions'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
              Select or generate an advisory draft from the left panel.
            </div>
          )}
        </div>
      </div>

      {/* Human Approval Sign-off Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-base font-bold text-white">Official Human Review Sign-Off</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              By authorizing this advisory, you confirm that the meteorological and vulnerability evidence has been human-inspected and adheres to official civil-defense protocol.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Reviewing Officer Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Official Designation / Title</label>
                <input
                  type="text"
                  value={officialTitle}
                  onChange={(e) => setOfficialTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start space-x-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={confirmCertified}
                    onChange={(e) => setConfirmCertified(e.target.checked)}
                    className="mt-0.5 rounded accent-emerald-500"
                  />
                  <span className="text-[11px] leading-snug">
                    I certify that this bulletin has been human-reviewed, verified against current meteorological data, and is approved for community dissemination.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveAdvisory}
                disabled={!confirmCertified || approving}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
              >
                {approving ? 'Recording...' : 'Authorize & Sign Bulletin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
