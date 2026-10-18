import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Terminal,
  CheckCircle,
  FolderGit2
} from 'lucide-react';
import { PROJECT_FILES, ProjectFile } from '../data/projectFiles';

export const ProjectCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [osTab, setOsTab] = useState<'unix' | 'windows'>('unix');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyCommand = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Download Button */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            Complete Standalone Package Ready
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Download or Inspect the Python Source Code
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            All files are fully generated: Streamlit app, Scikit-learn model training script,
            labeled dataset, requirements.txt, and comprehensive README.md.
          </p>
        </div>

        <a
          href="/sentiment-analysis.zip"
          download="sentiment-analysis.zip"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all border border-emerald-400/40 active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download sentiment-analysis.zip</span>
        </a>
      </div>

      {/* Local Execution Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Step-by-Step Local Setup & Execution Guide
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setOsTab('unix')}
              className={`px-3 py-1 rounded-md transition-colors ${
                osTab === 'unix' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              macOS / Linux
            </button>
            <button
              onClick={() => setOsTab('windows')}
              className={`px-3 py-1 rounded-md transition-colors ${
                osTab === 'windows' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Windows (PowerShell)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center justify-between">
              <span>1. Extract & Navigate</span>
              <button
                onClick={() => handleCopyCommand('cd sentiment-analysis', 'step1')}
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedCommand === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <code className="block font-mono bg-slate-900 p-2 rounded text-[11px] text-indigo-300">
              cd sentiment-analysis
            </code>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center justify-between">
              <span>2. Virtual Environment</span>
              <button
                onClick={() =>
                  handleCopyCommand(
                    osTab === 'unix'
                      ? 'python3 -m venv venv && source venv/bin/activate'
                      : 'python -m venv venv; .\\venv\\Scripts\\Activate.ps1',
                    'step2'
                  )
                }
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedCommand === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <code className="block font-mono bg-slate-900 p-2 rounded text-[11px] text-indigo-300 truncate">
              {osTab === 'unix' ? 'source venv/bin/activate' : '.\\venv\\Scripts\\Activate.ps1'}
            </code>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center justify-between">
              <span>3. Install & Train</span>
              <button
                onClick={() => handleCopyCommand('pip install -r requirements.txt && python train_model.py', 'step3')}
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedCommand === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <code className="block font-mono bg-slate-900 p-2 rounded text-[11px] text-indigo-300">
              python train_model.py
            </code>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center justify-between">
              <span>4. Run Web App</span>
              <button
                onClick={() => handleCopyCommand('streamlit run app.py', 'step4')}
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedCommand === 'step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <code className="block font-mono bg-slate-900 p-2 rounded text-[11px] text-emerald-300 font-bold">
              streamlit run app.py
            </code>
          </div>
        </div>
      </div>

      {/* File Explorer and Code Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File Tree */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Project Structure</span>
            </div>

            <div className="space-y-1.5">
              {PROJECT_FILES.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.name.endsWith('.py') ? (
                        <FileCode className="w-4 h-4 shrink-0 opacity-80" />
                      ) : (
                        <FileText className="w-4 h-4 shrink-0 opacity-80" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </div>

                    <span className="text-[10px] opacity-70 uppercase font-sans font-semibold">
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-200">About this file:</div>
            <p className="leading-relaxed">{selectedFile.description}</p>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 font-semibold">
                {selectedFile.path}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedFile.content.split('\n').length} lines
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {copiedFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy File Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Area */}
          <div className="p-4 bg-slate-950/90 overflow-x-auto max-h-[580px] font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="selection:bg-indigo-500/40">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
