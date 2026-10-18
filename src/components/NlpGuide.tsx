import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
  Calculator,
  ArrowRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const NlpGuide: React.FC = () => {
  // Mini interactive TF-IDF calculator state
  const [docFreq, setDocFreq] = useState(5);
  const totalDocs = 100;
  const [termCount, setTermCount] = useState(3);
  const totalWordsInDoc = 15;

  const tf = termCount / totalWordsInDoc;
  const idf = Math.log((1 + totalDocs) / (1 + docFreq)) + 1;
  const tfidf = tf * idf;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          Beginner NLP Masterclass
        </div>
        <h2 className="text-2xl font-bold text-white">
          How Natural Language Processing & Sentiment Analysis Work
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          This tutorial explains the complete journey from raw human text to numerical vectors,
          machine learning predictions, and mathematical evaluation.
        </p>
      </div>

      {/* Step 1: Preprocessing */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Text Preprocessing & Cleaning</h3>
            <p className="text-xs text-slate-400">Removing noise so words map consistently</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Computers are case-sensitive and fragile to formatting differences. To make words comparable,
          the NLP pipeline executes 4 standard cleaning stages:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-indigo-300">1. Lowercasing</div>
            <p className="text-slate-400 text-[11px]">
              "AMAZING" and "Amazing" become "amazing" so they share a single model weight.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-indigo-300">2. URL & Handle Removal</div>
            <p className="text-slate-400 text-[11px]">
              Strips links like https://... and @handles that carry no emotional tone.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-indigo-300">3. Punctuation Cleaning</div>
            <p className="text-slate-400 text-[11px]">
              Removes symbols like commas, hashes, and brackets that clutter vocabulary space.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-semibold text-indigo-300">4. Stopword Filtering</div>
            <p className="text-slate-400 text-[11px]">
              Discards common structural words ("the", "is", "at") that contain little sentiment.
            </p>
          </div>
        </div>
      </div>

      {/* Step 2: TF-IDF Explained */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-500/30">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Feature Extraction: TF-IDF Formula</h3>
            <p className="text-xs text-slate-400">Term Frequency - Inverse Document Frequency</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Machine learning algorithms cannot calculate mathematical equations on strings. TF-IDF
          converts text into numerical feature vectors by balancing local frequency with global rarity:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Term Frequency (TF)
            </h4>
            <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-slate-200">
              TF(t, d) = Count(t in d) / Total words in d
            </div>
            <p className="text-xs text-slate-400">
              Measures how frequently term <em>t</em> occurs in the specific review <em>d</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Inverse Document Frequency (IDF)
            </h4>
            <div className="p-2.5 rounded bg-slate-900 font-mono text-xs text-slate-200">
              IDF(t, D) = ln((1 + N) / (1 + df(t))) + 1
            </div>
            <p className="text-xs text-slate-400">
              Penalizes words that appear in every document (like "phone"), while boosting rare,
              informative words (like "defective" or "flawless").
            </p>
          </div>
        </div>

        {/* Interactive TF-IDF Playground */}
        <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Interactive TF-IDF Sandbox Calculator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">
                Occurrences of word in review: <span className="font-mono text-purple-300 font-bold">{termCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={termCount}
                onChange={(e) => setTermCount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">
                Reviews containing this word across entire dataset: <span className="font-mono text-purple-300 font-bold">{docFreq} / 100</span>
              </label>
              <input
                type="range"
                min="1"
                max="95"
                value={docFreq}
                onChange={(e) => setDocFreq(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">TF Value</span>
              <span className="font-bold text-purple-300">{tf.toFixed(3)}</span>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">IDF Weight</span>
              <span className="font-bold text-purple-300">{idf.toFixed(3)}</span>
            </div>
            <div className="p-2 bg-purple-900/40 rounded border border-purple-500/40">
              <span className="text-purple-200 text-[10px] block">Final TF-IDF Feature</span>
              <span className="font-bold text-purple-200 text-sm">{tfidf.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Logistic Regression & Softmax */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center font-bold text-sm border border-pink-500/30">
            3
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Logistic Regression & Softmax Probabilities</h3>
            <p className="text-xs text-slate-400">Transforming weighted dot products into 0% - 100% confidence</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          For each sentiment class <em>c</em> (Positive, Neutral, Negative), Logistic Regression
          computes a linear score:
        </p>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-pink-300">
          z_class = (w1 * tfidf1) + (w2 * tfidf2) + ... + bias
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The <strong>Softmax function</strong> exponentiates each class logit and normalizes by their sum,
          guaranteeing that all class probabilities sum up to exactly 1.0 (100%):
        </p>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
          P(Positive | x) = e^(z_pos) / [e^(z_pos) + e^(z_neu) + e^(z_neg)]
        </div>
      </div>

      {/* Step 4: Model Evaluation Demystified */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
            4
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Understanding Evaluation Metrics</h3>
            <p className="text-xs text-slate-400">Why accuracy alone is never enough</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
              Precision
            </h4>
            <p className="text-slate-300 font-mono text-[11px]">TP / (TP + FP)</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              "When the model flags a review as Positive, how often is it actually Positive?" High
              precision means few false alarms.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              Recall (Sensitivity)
            </h4>
            <p className="text-slate-300 font-mono text-[11px]">TP / (TP + FN)</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              "Out of all truly Positive reviews in the test set, how many did the model successfully find?"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-pink-400 uppercase tracking-wider text-[11px]">
              F1-Score
            </h4>
            <p className="text-slate-300 font-mono text-[11px]">2 * (P * R) / (P + R)</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The harmonic mean of Precision and Recall. Balances false positives and false negatives
              equally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
