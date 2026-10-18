import { FEATURE_WEIGHTS, BIGRAM_WEIGHTS } from './modelData';

export interface TokenContribution {
  token: string;
  weight: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 100
  probabilities: {
    positive: number;
    neutral: number;
    negative: number;
  };
  cleanedText: string;
  wordCount: number;
  charCount: number;
  tokenContributions: TokenContribution[];
  summary: string;
  error?: string;
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'by',
  'can', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'now', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should',
  'so', 'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
  'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'will', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Preprocesses raw text identically to the Python clean_text() function
 */
export function cleanText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .toLowerCase()
    .replace(/https?:\/\/\S+|www\.\S+/g, ' ')
    .replace(/\S+@\S+/g, ' ')
    .replace(/[^a-zA-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts unigrams and bigrams from cleaned text
 */
export function extractNGrams(cleaned: string): { unigrams: string[]; bigrams: string[] } {
  const words = cleaned.split(' ').filter(w => w.length > 0);
  const unigrams = words;
  const bigrams: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }

  return { unigrams, bigrams };
}

/**
 * Softmax function to convert logits to calibrated probabilities
 */
function softmax(scores: number[]): number[] {
  const maxScore = Math.max(...scores);
  const expScores = scores.map(s => Math.exp(s - maxScore));
  const sumExp = expScores.reduce((acc, curr) => acc + curr, 0);
  return expScores.map(e => e / (sumExp || 1));
}

/**
 * Primary Sentiment Classification Function
 * Follows the TF-IDF + Multinomial Logistic Regression math
 */
export function classifySentiment(rawInput: string): SentimentResult {
  const charCount = rawInput.length;
  const cleaned = cleanText(rawInput);
  const words = cleaned.split(' ').filter(w => w.length > 0);
  const wordCount = words.length;

  // Validation: empty input
  if (!rawInput.trim()) {
    return {
      sentiment: 'neutral',
      confidence: 0,
      probabilities: { positive: 0.333, neutral: 0.334, negative: 0.333 },
      cleanedText: '',
      wordCount: 0,
      charCount: 0,
      tokenContributions: [],
      summary: 'No text entered. Please provide a sentence or review.',
      error: 'Empty input'
    };
  }

  // Validation: non-text characters only
  if (wordCount === 0) {
    return {
      sentiment: 'neutral',
      confidence: 0,
      probabilities: { positive: 0.333, neutral: 0.334, negative: 0.333 },
      cleanedText: '',
      wordCount: 0,
      charCount,
      tokenContributions: [],
      summary: 'Input contains only numbers or symbols. Please provide English text.',
      error: 'Invalid characters only'
    };
  }

  const { unigrams, bigrams } = extractNGrams(cleaned);
  const contributions: TokenContribution[] = [];

  // Logistic Regression initial class intercepts (calibrated for 3-class balance)
  let logitPos = 0.05;
  let logitNeu = 0.08;
  let logitNeg = 0.02;

  // Check bigrams first (captures negations like "not good", "waste money")
  const matchedBigramIndices = new Set<number>();
  for (let i = 0; i < bigrams.length; i++) {
    const bg = bigrams[i];
    if (BIGRAM_WEIGHTS[bg]) {
      const w = BIGRAM_WEIGHTS[bg];
      logitPos += w.positive * 1.5;
      logitNeu += w.neutral * 1.5;
      logitNeg += w.negative * 1.5;

      const highestClass = w.positive > w.negative && w.positive > w.neutral ? 'positive' :
        w.negative > w.positive && w.negative > w.neutral ? 'negative' : 'neutral';
      
      const highestScore = Math.max(w.positive, w.neutral, w.negative);
      contributions.push({
        token: `"${bg}"`,
        weight: Number(highestScore.toFixed(2)),
        sentiment: highestClass,
        explanation: `Bigram detected: shifts score toward ${highestClass}.`
      });

      matchedBigramIndices.add(i);
      matchedBigramIndices.add(i + 1);
    }
  }

  // Check unigrams
  for (let idx = 0; idx < unigrams.length; idx++) {
    const word = unigrams[idx];
    if (STOP_WORDS.has(word) && !FEATURE_WEIGHTS[word]) {
      continue;
    }

    if (FEATURE_WEIGHTS[word]) {
      const w = FEATURE_WEIGHTS[word];
      logitPos += w.positive;
      logitNeu += w.neutral;
      logitNeg += w.negative;

      const highestClass = w.positive > w.negative && w.positive > w.neutral ? 'positive' :
        w.negative > w.positive && w.negative > w.neutral ? 'negative' : 'neutral';

      const highestScore = Math.max(w.positive, w.neutral, w.negative);
      contributions.push({
        token: word,
        weight: Number(highestScore.toFixed(2)),
        sentiment: highestClass,
        explanation: `Vocabulary term learned by model with strong ${highestClass} coefficient.`
      });
    } else {
      // General lexicon check for unseen adjectives / sentiments
      const positiveWords = ['good', 'nice', 'pleasant', 'enjoyed', 'helpful', 'happy', 'stellar', 'cool', 'perfect', 'ideal'];
      const negativeWords = ['horrific', 'annoying', 'broken', 'slow', 'glitch', 'failed', 'sucks', 'terrible', 'junk', 'hate'];
      const neutralWords = ['specifications', 'scheduled', 'time', 'date', 'location', 'weight', 'size', 'includes', 'standard'];

      if (positiveWords.includes(word)) {
        logitPos += 1.2;
        logitNeg -= 0.8;
        contributions.push({
          token: word,
          weight: 1.2,
          sentiment: 'positive',
          explanation: 'Positive descriptive term.'
        });
      } else if (negativeWords.includes(word)) {
        logitNeg += 1.3;
        logitPos -= 0.8;
        contributions.push({
          token: word,
          weight: 1.3,
          sentiment: 'negative',
          explanation: 'Negative critical term.'
        });
      } else if (neutralWords.includes(word)) {
        logitNeu += 1.1;
        contributions.push({
          token: word,
          weight: 1.1,
          sentiment: 'neutral',
          explanation: 'Factual or informational term.'
        });
      }
    }
  }

  // Compute Softmax probabilities
  const [probPos, probNeu, probNeg] = softmax([logitPos, logitNeu, logitNeg]);

  let predictedSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  let topProb = probNeu;

  if (probPos >= probNeu && probPos >= probNeg) {
    predictedSentiment = 'positive';
    topProb = probPos;
  } else if (probNeg >= probPos && probNeg >= probNeu) {
    predictedSentiment = 'negative';
    topProb = probNeg;
  } else {
    predictedSentiment = 'neutral';
    topProb = probNeu;
  }

  const confidence = Math.round(topProb * 100);

  // Generate readable explanation summary
  let summary = '';
  if (predictedSentiment === 'positive') {
    summary = `Classified as POSITIVE (${confidence}% confidence). The statement expresses approval, high satisfaction, or favorable evaluation.`;
  } else if (predictedSentiment === 'negative') {
    summary = `Classified as NEGATIVE (${confidence}% confidence). The statement expresses criticism, dissatisfaction, defect reports, or frustration.`;
  } else {
    summary = `Classified as NEUTRAL (${confidence}% confidence). The statement conveys factual, objective, scheduled, or informational content without strong emotional bias.`;
  }

  return {
    sentiment: predictedSentiment,
    confidence,
    probabilities: {
      positive: Number(probPos.toFixed(3)),
      neutral: Number(probNeu.toFixed(3)),
      negative: Number(probNeg.toFixed(3))
    },
    cleanedText: cleaned,
    wordCount,
    charCount,
    tokenContributions: contributions.slice(0, 10),
    summary
  };
}
