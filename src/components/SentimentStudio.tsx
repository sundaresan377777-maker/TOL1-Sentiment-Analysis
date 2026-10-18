import React, { useState } from 'react';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { classifySentiment, SentimentResult } from '../nlp/nlpEngine';

const SAMPLE_SENTENCES = [
  {
    category: 'positive',
    label: 'Battery & Sound (Tech)',
    text: 'The battery life on this laptop is incredible, lasts well over 14 hours and sound is fantastic!'
  },
  {
    category: 'positive',
    label: 'Great Hospitality',
    text: 'The hotel room was spotless, peaceful, and had a spectacular view of the harbor.'
  },
  {
    category: 'positive',
    label: 'Gourmet Dinner',
    text: 'The food at this restaurant was exceptionally fresh, delicious, and bursting with authentic flavor.'
  },
  {
    category: 'negative',
    label: 'Rude Customer Support',
    text: 'The customer support representative was rude and refused to honor the warranty policy.'
  },
  {
    category: 'negative',
    label: 'Broken & Damaged Delivery',
    text: 'Shipping took over four weeks and the item arrived severely damaged inside a crushed box.'
  },
  {
    category: 'negative',
    label: 'Software Bug & Crash',
    text: 'The software constantly freezes and crashes whenever I try to export my work.'
  },
  {
    category: 'neutral',
    label: 'Meeting & Conference Schedule',
    text: 'The conference starts tomorrow morning at 9 AM in the main auditorium.'
  },
  {
    category: 'neutral',
    label: 'Product Specs & Weight',
    text: 'The laptop has a 15.6 inch display and weighs approximately 1.8 kilograms.'
  },
  {
    category: 'neutral',
    label: 'Courier Delivery Window',
    text: 'The parcel is scheduled to arrive between 2 PM and 5 PM on Tuesday.'
  }
];

interface SentimentStudioProps {
  initialText?: string;
}

export const SentimentStudio: React.FC<SentimentStudioProps> = ({ initialText = '' }) => {
  const [inputText, setInputText] = useState(
    initialText || 'The battery life on this laptop is incredible, lasts well over 14 hours on a single charge!'
  );
  const [result, setResult] = useState<SentimentResult | null>(() =>
    classifySentiment(initialText || 'The battery life on this laptop is incredible, lasts well over 14 hours on a single charge!')
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = (textToAnalyze?: string) => {
    const target = textToAnalyze !== undefined ? textToAnalyze : inputText;
    setIsAnalyzing(true);
    // Slight simulation delay for realistic processing feel
    setTimeout(() => {
      const res = classifySentiment(target);
      setResult(res);
      setIsAnalyzing(false);
    }, 150);
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    handleAnalyze(sampleText);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  const getSentimentTheme = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return {
          title: 'Positive',
          icon: <ThumbsUp className="w-8 h-8 text-emerald-400" />,
          cardBorder: 'border-emerald-500/40',
          cardBg: 'from-emerald-950/40 via-emerald-900/10 to-slate-900/90',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          barColor: 'bg-emerald-500',
          glow: 'shadow-emerald-500/10',
          textColor: 'text-emerald-400'
        };
      case 'negative':
        return {
          title: 'Negative',
          icon: <ThumbsDown className="w-8 h-8 text-rose-400" />,
          cardBorder: 'border-rose-500/40',
          cardBg: 'from-rose-950/40 via-rose-900/10 to-slate-900/90',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          barColor: 'bg-rose-500',
          glow: 'shadow-rose-500/10',
          textColor: 'text-rose-400'
        };
      default:
        return {
          title: 'Neutral',
          icon: <MinusCircle className="w-8 h-8 text-sky-400" />,
          cardBorder: 'border-sky-500/40',
          cardBg: 'from-sky-950/40 via-sky-900/10 to-slate-900/90',
          badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          barColor: 'bg-sky-500',
          glow: 'shadow-sky-500/10',
          textColor: 'text-sky-400'
        };
    }
  };

  const theme = result && !result.error ? getSentimentTheme(result.sentiment) : null;

  return (
    <div className="space-y-6">
      {/* Intro hero banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900/80 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Supervised Natural Language Processing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Classify Sentiment with Scikit-learn & TF-IDF
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Enter any customer review, tweet, or sentence. The system applies regex preprocessing,
            extracts unigram & bigram TF-IDF features, and calculates class probabilities using a
            trained multinomial Logistic Regression classifier.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Sample Sentences */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="sentiment-text" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span>Enter Sentence or Review</span>
                <span className="text-xs text-slate-500 font-normal">
                  ({inputText.length} chars • {inputText.trim().split(/\s+/).filter(Boolean).length} words)
                </span>
              </label>

              {inputText && (
                <button
                  onClick={handleClear}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <textarea
              id="sentiment-text"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g., The customer service was polite and replaced my defective unit right away..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm leading-relaxed transition-all resize-y"
            />

            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}</span>
                </button>

                <button
                  onClick={() => {
                    const randomSample = SAMPLE_SENTENCES[Math.floor(Math.random() * SAMPLE_SENTENCES.length)];
                    handleSelectSample(randomSample.text);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-slate-700 transition-colors"
                  title="Load a random sentence from dataset"
                >
                  Random Preset
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Local TF-IDF vectorizer + Softmax
              </div>
            </div>
          </div>

          {/* Quick Test Samples */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sample Sentences for Instant Testing</span>
            </h3>

            <div className="space-y-2">
              {/* Positive Samples */}
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  🌟 Positive Examples
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_SENTENCES.filter(s => s.category === 'positive').map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample.text)}
                      className="text-left p-2.5 rounded-lg bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-900/40 text-xs text-emerald-200 hover:text-white transition-all group"
                    >
                      <div className="font-semibold text-[11px] text-emerald-300 group-hover:underline">
                        {sample.label}
                      </div>
                      <div className="text-slate-400 truncate mt-1 text-[11px]">
                        "{sample.text}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Samples */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-1.5">
                  ⚠️ Negative Examples
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_SENTENCES.filter(s => s.category === 'negative').map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample.text)}
                      className="text-left p-2.5 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/40 text-xs text-rose-200 hover:text-white transition-all group"
                    >
                      <div className="font-semibold text-[11px] text-rose-300 group-hover:underline">
                        {sample.label}
                      </div>
                      <div className="text-slate-400 truncate mt-1 text-[11px]">
                        "{sample.text}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Neutral Samples */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider block mb-1.5">
                  ℹ️ Neutral / Objective Examples
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_SENTENCES.filter(s => s.category === 'neutral').map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sample.text)}
                      className="text-left p-2.5 rounded-lg bg-sky-950/20 hover:bg-sky-900/30 border border-sky-900/40 text-xs text-sky-200 hover:text-white transition-all group"
                    >
                      <div className="font-semibold text-[11px] text-sky-300 group-hover:underline">
                        {sample.label}
                      </div>
                      <div className="text-slate-400 truncate mt-1 text-[11px]">
                        "{sample.text}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output & NLP Analysis */}
        <div className="lg:col-span-5 space-y-4">
          {result?.error ? (
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 text-center">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">{result.error}</h3>
              <p className="text-sm text-slate-300 mt-2">{result.summary}</p>
            </div>
          ) : result && theme ? (
            <div className={`bg-gradient-to-b ${theme.cardBg} border ${theme.cardBorder} rounded-2xl p-6 shadow-xl ${theme.glow} transition-all`}>
              {/* Classification Badge Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-700/50">
                    {theme.icon}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Predicted Sentiment
                    </span>
                    <h3 className={`text-2xl sm:text-3xl font-black ${theme.textColor} tracking-tight`}>
                      {theme.title}
                    </h3>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${theme.badgeBg}`}>
                  {result.confidence}% Confidence
                </div>
              </div>

              {/* Summary Description */}
              <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                {result.summary}
              </p>

              {/* Class Probability Meters */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Multinomial Class Probabilities</span>
                  </span>
                  <span className="font-mono text-slate-400">Sum = 100%</span>
                </div>

                {/* Positive Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Positive
                    </span>
                    <span className="font-mono text-slate-300">
                      {(result.probabilities.positive * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${result.probabilities.positive * 100}%` }}
                    />
                  </div>
                </div>

                {/* Neutral Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-sky-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      Neutral
                    </span>
                    <span className="font-mono text-slate-300">
                      {(result.probabilities.neutral * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-500 rounded-full"
                      style={{ width: `${result.probabilities.neutral * 100}%` }}
                    />
                  </div>
                </div>

                {/* Negative Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-rose-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Negative
                    </span>
                    <span className="font-mono text-slate-300">
                      {(result.probabilities.negative * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                      style={{ width: `${result.probabilities.negative * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Word Attribution / TF-IDF weights */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>TF-IDF Token Weight Attribution</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Feature Importance</span>
                </div>

                {result.tokenContributions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.tokenContributions.map((tc, idx) => {
                      const chipColor =
                        tc.sentiment === 'positive'
                          ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
                          : tc.sentiment === 'negative'
                          ? 'border-rose-500/50 bg-rose-950/30 text-rose-300'
                          : 'border-sky-500/50 bg-sky-950/30 text-sky-300';

                      return (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border font-mono ${chipColor}`}
                          title={tc.explanation}
                        >
                          <span className="font-semibold">{tc.token}</span>
                          <span className="text-[10px] opacity-75">
                            {tc.weight > 0 ? `+${tc.weight}` : tc.weight}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    All words map to neutral baseline features.
                  </p>
                )}
              </div>

              {/* Cleaned text preview */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Cleaned NLP Tokens:</span>{' '}
                <span className="font-mono text-slate-400">{result.cleanedText || 'none'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm">Type a sentence and click "Analyze Sentiment" to view results.</p>
            </div>
          )}

          {/* Quick Info Callout */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>How this prediction was computed:</span>
            </div>
            <p>
              1. <strong>Preprocessing</strong>: Lowercased, removed punctuation and English stop words.
            </p>
            <p>
              2. <strong>Vectorization</strong>: Mapped tokens to TF-IDF weights learned from 120+ domain reviews.
            </p>
            <p>
              3. <strong>Classification</strong>: Logistic Regression computed logit scores converted via Softmax into probabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
