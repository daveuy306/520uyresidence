import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Download,
  Send,
  Check,
  X,
  Code2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  getSheetsWebhookUrl,
  saveSheetsWebhookUrl,
  getAutoSyncSheets,
  setAutoSyncSheets,
  formatTransactionsToCSV,
  downloadCSVFile,
  syncToGoogleSheets,
  APPS_SCRIPT_TEMPLATE
} from '../utils/googleSheets';

export default function GoogleSheetsModal({ isOpen, onClose, transactions, categories }) {
  const [webhookUrl, setWebhookUrl] = useState(() => getSheetsWebhookUrl());
  const [autoSync, setAutoSync] = useState(() => getAutoSyncSheets());
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCSV, setCopiedCSV] = useState(false);
  const [downloadedCSV, setDownloadedCSV] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success'); // 'success' | 'error'
  const [showScriptGuide, setShowScriptGuide] = useState(false);

  if (!isOpen) return null;

  const showStatus = (msg, type = 'success') => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMessage('');
    }, 4000);
  };

  const handleSaveSettings = () => {
    saveSheetsWebhookUrl(webhookUrl);
    setAutoSyncSheets(autoSync);
    showStatus('Settings saved successfully!', 'success');
  };

  const handleSyncNow = async () => {
    const targetUrl = webhookUrl.trim();
    if (!targetUrl) {
      showStatus('Error: Please enter a Google Webhook URL first.', 'error');
      return;
    }

    // Auto-save webhook URL
    saveSheetsWebhookUrl(targetUrl);

    setIsSyncing(true);
    showStatus('Syncing data to Google Sheets...', 'success');
    try {
      await syncToGoogleSheets(transactions, categories, targetUrl);
      showStatus('Successfully populated Google Sheets!', 'success');
    } catch (err) {
      showStatus('Sync request sent! Please check your Google Sheet.', 'success');
    } finally {
      setIsSyncing(false);
    }
  };

  const safeCopyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback for restricted clipboard permissions
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.error('Fallback copy failed', e);
    }
    document.body.removeChild(textarea);
    return Promise.resolve();
  };

  const handleCopyScript = () => {
    safeCopyToClipboard(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleCopyCSV = () => {
    const csvText = formatTransactionsToCSV(transactions, categories);
    safeCopyToClipboard(csvText);
    setCopiedCSV(true);
    setTimeout(() => setCopiedCSV(false), 2500);
  };

  const handleDownloadCSV = () => {
    downloadCSVFile(transactions, categories);
    setDownloadedCSV(true);
    setTimeout(() => setDownloadedCSV(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl bg-[#161920] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-[#12151c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Google Sheets Sync
              </h3>
              <p className="text-xs text-slate-400">Populate & sync your budget data directly to Google Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Actions Card */}
          <div className="bg-[#0f1117] border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Instant Data Export
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleCopyCSV}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1f2430] hover:bg-[#282f3f] active:scale-[0.98] text-slate-200 text-xs font-medium rounded-lg border border-slate-700/80 transition"
              >
                {copiedCSV ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
                {copiedCSV ? 'Copied CSV to Clipboard!' : 'Copy CSV for Google Sheets'}
              </button>

              <button
                onClick={handleDownloadCSV}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1f2430] hover:bg-[#282f3f] active:scale-[0.98] text-slate-200 text-xs font-medium rounded-lg border border-slate-700/80 transition"
              >
                {downloadedCSV ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-emerald-400" />}
                {downloadedCSV ? 'Downloaded CSV File!' : 'Download CSV File'}
              </button>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="bg-[#0f1117] border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Live Google Sheets Webhook Sync
              </h4>
              <button
                onClick={() => setShowScriptGuide(!showScriptGuide)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                {showScriptGuide ? 'Hide Setup Guide' : 'How to Setup (1 Min)'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Google Apps Script Web App URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 bg-[#161920] border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition"
                />
                <button
                  onClick={handleSaveSettings}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Sync Now Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Populate Google Sheet Now
              </button>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => {
                    setAutoSync(e.target.checked);
                    setAutoSyncSheets(e.target.checked);
                  }}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                Auto-sync on transaction edits
              </label>
            </div>

            {statusMessage && (
              <p
                className={`text-xs font-medium border rounded-lg p-2.5 text-center transition animate-fade-in ${
                  statusType === 'error'
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}
              >
                {statusMessage}
              </p>
            )}
          </div>

          {/* Apps Script Guide (Collapsible) */}
          {showScriptGuide && (
            <div className="bg-[#0f1117] border border-indigo-500/30 rounded-xl p-4 space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  1-Minute Setup Guide for Google Sheets:
                </h5>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center gap-1.5 py-1 px-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 active:scale-[0.98] text-indigo-300 text-xs rounded-lg border border-indigo-500/30 transition"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedScript ? 'Script Copied!' : 'Copy Script Code'}
                </button>
              </div>

              <ol className="text-xs text-slate-300 list-decimal list-inside space-y-1.5">
                <li>Open a new or existing Google Sheet.</li>
                <li>In top menu, click <b>Extensions</b> &gt; <b>Apps Script</b>.</li>
                <li>Delete any code in <code className="text-indigo-300">Code.gs</code> and paste the script code.</li>
                <li>Click <b>Deploy</b> &gt; <b>New Deployment</b>.</li>
                <li>Choose Type: <b>Web app</b>. Set Execute as: <b>Me</b> and Who has access: <b>Anyone</b>.</li>
                <li>Click <b>Deploy</b>, copy the Web App URL, and paste it in the box above!</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
