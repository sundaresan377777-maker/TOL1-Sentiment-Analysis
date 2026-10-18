/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { SentimentStudio } from './components/SentimentStudio';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { DatasetBrowser } from './components/DatasetBrowser';
import { ProjectCodeViewer } from './components/ProjectCodeViewer';
import { NlpGuide } from './components/NlpGuide';
import { ShieldCheck, Heart, Terminal, Sparkles, Download } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'metrics' | 'dataset' | 'files' | 'guide'>('analyzer');
  const [analyzerText, setAnalyzerText] = useState<string>(
    'The battery life on this laptop is incredible, lasts well over 14 hours on a single charge!'
  );

  const handleSelectDatasetSample = (text: string) => {
    setAnalyzerText(text);
    setActiveTab('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'analyzer' && (
          <SentimentStudio key={analyzerText} initialText={analyzerText} />
        )}

        {activeTab === 'metrics' && <EvaluationDashboard />}

        {activeTab === 'dataset' && (
          <DatasetBrowser onSelectSample={handleSelectDatasetSample} />
        )}

        {activeTab === 'files' && <ProjectCodeViewer />}

        {activeTab === 'guide' && <NlpGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="font-semibold text-slate-300">SentimentScope System</span>
            <span className="text-slate-600">|</span>
            <span>Python 3.10+ • Scikit-learn • Streamlit • TF-IDF • NLTK</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Local (Zero External AI API Calls)
            </span>
            <a
              href="/sentiment-analysis.zip"
              download="sentiment-analysis.zip"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <Download className="w-3 h-3" />
              sentiment-analysis.zip
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
