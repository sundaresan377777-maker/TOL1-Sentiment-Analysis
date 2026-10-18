import React, { useState } from 'react';
import { Search, Filter, Play, Check, RefreshCw } from 'lucide-react';
import { LABELED_DATASET, DatasetItem } from '../nlp/modelData';

interface DatasetBrowserProps {
  onSelectSample: (text: string) => void;
}

export const DatasetBrowser: React.FC<DatasetBrowserProps> = ({ onSelectSample }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [testedId, setTestedId] = useState<number | null>(null);

  // Extract unique domains
  const domains = Array.from(new Set(LABELED_DATASET.map(d => d.domain))).sort();

  // Filter items
  const filteredDataset = LABELED_DATASET.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    const matchesDomain = domainFilter === 'all' || item.domain === domainFilter;
    return matchesSearch && matchesSentiment && matchesDomain;
  });

  const handleTestSample = (item: DatasetItem) => {
    setTestedId(item.id);
    onSelectSample(item.text);
    setTimeout(() => setTestedId(null), 1500);
  };

  const posCount = LABELED_DATASET.filter(d => d.sentiment === 'positive').length;
  const neuCount = LABELED_DATASET.filter(d => d.sentiment === 'neutral').length;
  const negCount = LABELED_DATASET.filter(d => d.sentiment === 'negative').length;

  return (
    <div className="space-y-6">
      {/* Overview Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Samples</div>
            <div className="text-2xl font-bold text-white mt-0.5">{LABELED_DATASET.length}</div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Balanced
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-medium">Positive Samples</div>
            <div className="text-2xl font-bold text-emerald-300 mt-0.5">{posCount}</div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
            {Math.round((posCount / LABELED_DATASET.length) * 100)}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-sky-400 font-medium">Neutral Samples</div>
            <div className="text-2xl font-bold text-sky-300 mt-0.5">{neuCount}</div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-900">
            {Math.round((neuCount / LABELED_DATASET.length) * 100)}%
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-400 font-medium">Negative Samples</div>
            <div className="text-2xl font-bold text-rose-300 mt-0.5">{negCount}</div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-900">
            {Math.round((negCount / LABELED_DATASET.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search words (e.g., battery, delivery, schedule)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Domain Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              <option value="all">All Domains ({domains.length})</option>
              {domains.map(dom => (
                <option key={dom} value={dom}>{dom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sentiment Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-medium mr-1">Sentiment Filter:</span>
          {(['all', 'positive', 'neutral', 'negative'] as const).map(sentiment => {
            const isActive = sentimentFilter === sentiment;
            const label = sentiment === 'all' ? 'All Classes' : sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
            return (
              <button
                key={sentiment}
                onClick={() => setSentimentFilter(sentiment)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${
                  isActive
                    ? sentiment === 'positive'
                      ? 'bg-emerald-600 text-white'
                      : sentiment === 'negative'
                      ? 'bg-rose-600 text-white'
                      : sentiment === 'neutral'
                      ? 'bg-sky-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}

          <span className="ml-auto text-xs text-slate-500 font-mono">
            Showing {filteredDataset.length} of {LABELED_DATASET.length} samples
          </span>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-3.5 w-16">#</th>
                <th className="py-3 px-3.5">Review / Sentence Text</th>
                <th className="py-3 px-3.5 w-32">Sentiment Label</th>
                <th className="py-3 px-3.5 w-36">Domain</th>
                <th className="py-3 px-3.5 w-36 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDataset.length > 0 ? (
                filteredDataset.map((item) => {
                  const badgeColor =
                    item.sentiment === 'positive'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                      : item.sentiment === 'negative'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-800/50'
                      : 'bg-sky-950/60 text-sky-300 border-sky-800/50';

                  const isJustTested = testedId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3.5 text-slate-500 font-mono">{item.id}</td>
                      <td className="py-3 px-3.5 text-slate-200 leading-relaxed font-sans max-w-xl">
                        "{item.text}"
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                          {item.sentiment}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-400 font-medium">
                        {item.domain}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => handleTestSample(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isJustTested
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-500'
                          }`}
                        >
                          {isJustTested ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Loaded!</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Test in Studio</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No matching sentences found. Try adjusting your search query or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
