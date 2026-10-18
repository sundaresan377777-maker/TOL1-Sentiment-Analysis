export interface ProjectFile {
  path: string;
  name: string;
  language: string;
  description: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    path: "sentiment-analysis/app.py",
    name: "app.py",
    language: "python",
    description: "Interactive Streamlit web application with text input, visual badges, probability metrics, and NLP token contribution inspector.",
    content: `"""
=============================================================================
SentimentScope: NLP Sentiment Analysis Web Application (Streamlit)
=============================================================================
Author: Natural Language Processing (NLP) Tutorial Project
Description:
    An interactive, beginner-friendly Streamlit application that accepts any
    sentence, product review, or social media text, applies NLP preprocessing,
    and classifies sentiment as Positive, Negative, or Neutral using a trained
    Scikit-learn Logistic Regression + TF-IDF model.
=============================================================================
"""

import os
import re
import joblib
import pandas as pd
import numpy as np
import streamlit as st

# -----------------------------------------------------------------------------
# Page Configuration & Styling
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="SentimentScope - NLP Sentiment Analyzer",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Clean CSS for polished presentation
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        color: #94a3b8;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .sentiment-card {
        padding: 1.5rem;
        border-radius: 12px;
        margin: 1rem 0;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .pos-card {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%);
        border-left: 6px solid #10b981;
    }
    .neg-card {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%);
        border-left: 6px solid #ef4444;
    }
    .neu-card {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%);
        border-left: 6px solid #3b82f6;
    }
    .badge {
        display: inline-block;
        padding: 0.35rem 0.8rem;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 0.95rem;
        letter-spacing: 0.05em;
    }
    .badge-pos { background-color: #10b981; color: #ffffff; }
    .badge-neg { background-color: #ef4444; color: #ffffff; }
    .badge-neu { background-color: #3b82f6; color: #ffffff; }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# NLP Helper Functions
# -----------------------------------------------------------------------------
def clean_text(text: str) -> str:
    """Cleans raw text for NLP processing."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\\S+|www\\.\\S+", " ", text)
    text = re.sub(r"\\S+@\\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\\s]", " ", text)
    text = re.sub(r"\\s+", " ", text).strip()
    return text


@st.cache_resource
def load_trained_model():
    """Loads the serialized Scikit-learn pipeline from disk."""
    model_path = os.path.join(os.path.dirname(__file__), "models", "sentiment_pipeline.pkl")
    if os.path.exists(model_path):
        try:
            pipeline = joblib.load(model_path)
            return pipeline, None
        except Exception as e:
            return None, f"Failed to load model file: {e}"
    return None, f"Model file not found at {model_path}. Please run train_model.py first."


@st.cache_data
def load_dataset():
    """Loads the labeled dataset for explorer tab."""
    dataset_path = os.path.join(os.path.dirname(__file__), "data", "sentiment_dataset.csv")
    if os.path.exists(dataset_path):
        return pd.read_csv(dataset_path)
    return None


def get_token_contributions(pipeline, text):
    """Computes individual word coefficients to explain why the model made its decision."""
    try:
        vectorizer = pipeline.named_steps["tfidf"]
        classifier = pipeline.named_steps["classifier"]
        
        words = clean_text(text).split()
        if not words:
            return []
        
        feature_names = {term: idx for idx, term in enumerate(vectorizer.get_feature_names_out())}
        classes = list(classifier.classes_)
        
        contributions = []
        for word in words:
            if word in feature_names:
                feat_idx = feature_names[word]
                word_scores = {cls: classifier.coef_[c_idx][feat_idx] for c_idx, cls in enumerate(classes)}
                contributions.append({
                    "word": word,
                    "scores": word_scores,
                    "dominant": max(word_scores, key=word_scores.get)
                })
        return contributions
    except Exception:
        return []


# Layout Header
st.markdown('<div class="main-header">🧠 SentimentScope</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Natural Language Processing (NLP) Sentiment Classifier using TF-IDF and Scikit-learn Logistic Regression</div>', unsafe_allow_html=True)

# Sidebar
st.sidebar.title("⚙️ System Controls")
st.sidebar.markdown("**Technology Stack**:")
st.sidebar.markdown("""
- **Language**: Python 3.10+
- **NLP**: Regex, Tokenization, Stopwords
- **Feature Extraction**: TF-IDF (Unigrams + Bigrams)
- **Classifier**: Logistic Regression (Multinomial)
- **Framework**: Streamlit
""")

st.sidebar.divider()
st.sidebar.markdown("### 📚 Quick Test Presets")
preset_options = {
    "-- Select an example --": "",
    "🌟 Positive (Tech Review)": "The battery life on this laptop is incredible, lasts over 14 hours on a single charge!",
    "🌟 Positive (Hospitality)": "The hotel room was spotless, peaceful, and had a spectacular view of the harbor.",
    "⚠️ Negative (Customer Support)": "Customer service was rude, delayed, and utterly unhelpful with my request.",
    "⚠️ Negative (Defective Product)": "Terrible audio quality with a persistent buzzing static that gave me a headache.",
    "ℹ️ Neutral (Factual Schedule)": "The conference starts tomorrow morning at 9 AM in the main auditorium.",
    "ℹ️ Neutral (Product Specs)": "The laptop has a 15.6 inch display and weighs approximately 1.8 kilograms."
}

selected_preset_label = st.sidebar.selectbox("Choose a sample sentence:", list(preset_options.keys()))
default_input_text = preset_options[selected_preset_label] if selected_preset_label != "-- Select an example --" else ""

# Load Model
model_pipeline, model_error = load_trained_model()

# Navigation Tabs
tab_analyze, tab_dataset, tab_metrics, tab_nlp_guide = st.tabs([
    "🔍 Sentiment Analyzer",
    "📊 Dataset Explorer",
    "📈 Model Performance & Metrics",
    "📖 How NLP Works"
])

with tab_analyze:
    st.markdown("### Enter Text to Analyze")
    user_input = st.text_area(
        label="Input Sentence:",
        value=default_input_text,
        height=130,
        placeholder="e.g., The food was delicious and our server was exceptionally attentive and kind!"
    )
    
    col_btn1, col_btn2, _ = st.columns([1.5, 1.5, 5])
    with col_btn1:
        analyze_clicked = st.button("🚀 Analyze Sentiment", type="primary", use_container_width=True)
    with col_btn2:
        clear_clicked = st.button("🗑️ Clear", use_container_width=True)
        if clear_clicked:
            user_input = ""
            st.rerun()

    if model_error:
        st.warning(f"⚠️ {model_error}")
        st.info("Run 'python train_model.py' in your terminal to train and save the model.")
    elif analyze_clicked or (user_input and user_input == default_input_text):
        cleaned_input = clean_text(user_input)
        if not user_input.strip():
            st.error("⚠️ Please enter a sentence or review before clicking Analyze.")
        elif not cleaned_input:
            st.warning("⚠️ Input contains only symbols. Please include descriptive English words.")
        else:
            prediction = model_pipeline.predict([cleaned_input])[0]
            probabilities = model_pipeline.predict_proba([cleaned_input])[0]
            classes = list(model_pipeline.classes_)
            prob_map = {cls: prob for cls, prob in zip(classes, probabilities)}
            
            pos_score = prob_map.get("positive", 0.0) * 100
            neu_score = prob_map.get("neutral", 0.0) * 100
            neg_score = prob_map.get("negative", 0.0) * 100
            top_conf = prob_map.get(prediction, 0.0) * 100
            
            card_class = "pos-card" if prediction == "positive" else ("neg-card" if prediction == "negative" else "neu-card")
            badge_class = "badge-pos" if prediction == "positive" else ("badge-neg" if prediction == "negative" else "badge-neu")
            emoji_icon = "🟢" if prediction == "positive" else ("🔴" if prediction == "negative" else "🔵")
            
            st.markdown(f"""
            <div class="sentiment-card {card_class}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 1.1rem; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Predicted Sentiment</span>
                        <h2 style="margin: 0.3rem 0; font-size: 2rem;">{emoji_icon} {prediction.capitalize()}</h2>
                    </div>
                    <div>
                        <span class="badge {badge_class}">{top_conf:.1f}% Confidence</span>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            st.markdown("#### Probability Breakdown")
            pcol1, pcol2, pcol3 = st.columns(3)
            with pcol1:
                st.metric("🟢 Positive", f"{pos_score:.1f}%")
                st.progress(pos_score / 100)
            with pcol2:
                st.metric("🔵 Neutral", f"{neu_score:.1f}%")
                st.progress(neu_score / 100)
            with pcol3:
                st.metric("🔴 Negative", f"{neg_score:.1f}%")
                st.progress(neg_score / 100)
`
  },
  {
    path: "sentiment-analysis/train_model.py",
    name: "train_model.py",
    language: "python",
    description: "Machine learning training pipeline: loads dataset, cleans text, extracts TF-IDF unigram and bigram features, trains Logistic Regression, evaluates test accuracy/precision/recall/F1, and saves model.",
    content: `"""
=============================================================================
Sentiment Analysis Model Training Script
=============================================================================
Author: Natural Language Processing (NLP) Tutorial Project
Description:
    This script loads a labeled sentiment dataset (positive, negative, neutral),
    performs text preprocessing, extracts features using TF-IDF (Term Frequency -
    Inverse Document Frequency), trains a Logistic Regression classifier using
    Scikit-learn, evaluates model performance (Accuracy, Precision, Recall, F1),
    and saves the trained pipeline into the 'models/' directory for production use.
=============================================================================
"""

import os
import re
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


def clean_text(text: str) -> str:
    """Cleans raw text for NLP processing."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\\S+|www\\.\\S+", " ", text)
    text = re.sub(r"\\S+@\\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\\s]", " ", text)
    text = re.sub(r"\\s+", " ", text).strip()
    return text


def load_and_preprocess_data(dataset_path: str):
    """Loads CSV, inspects distribution, and pre-cleans text."""
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset file not found at: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    df = df.dropna(subset=["text", "sentiment"]).copy()
    df["sentiment"] = df["sentiment"].astype(str).str.strip().str.lower()
    df["cleaned_text"] = df["text"].apply(clean_text)
    df = df[df["cleaned_text"].str.len() > 0].copy()
    
    print(f"Loaded {len(df)} samples across classes.")
    return df["cleaned_text"], df["sentiment"], df


def train_sentiment_model(X, y):
    """Constructs TF-IDF + Logistic Regression pipeline and evaluates."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english", sublinear_tf=True, max_features=3000)),
        ("classifier", LogisticRegression(C=1.5, max_iter=1000, random_state=42, class_weight="balanced"))
    ])
    
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred, labels=["positive", "neutral", "negative"])
    
    return pipeline, accuracy, report, conf_matrix


def save_model(pipeline, output_path: str = "models/sentiment_pipeline.pkl"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(pipeline, output_path)
    print(f"Model successfully saved to {output_path}")


if __name__ == "__main__":
    dataset_path = "data/sentiment_dataset.csv"
    X, y, _ = load_and_preprocess_data(dataset_path)
    pipeline, accuracy, report, conf_matrix = train_sentiment_model(X, y)
    print(f"Test Accuracy: {accuracy * 100:.2f}%")
    save_model(pipeline)
`
  },
  {
    path: "sentiment-analysis/requirements.txt",
    name: "requirements.txt",
    language: "text",
    description: "Python package dependencies specification for Python 3.9+ environments.",
    content: `streamlit>=1.30.0
scikit-learn>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
nltk>=3.8.1
joblib>=1.3.0`
  },
  {
    path: "sentiment-analysis/test_sample.py",
    name: "test_sample.py",
    language: "python",
    description: "Lightweight command-line interface tester for rapid inference without launching the web server.",
    content: `import sys
import os
import re
import joblib

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\\S+|www\\.\\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\\s]", " ", text)
    return re.sub(r"\\s+", " ", text).strip()

def main():
    model_path = os.path.join(os.path.dirname(__file__), "models", "sentiment_pipeline.pkl")
    if not os.path.exists(model_path):
        print(f"[ERROR] Trained model file not found at: {model_path}")
        print("Please train the model first by running: python train_model.py")
        sys.exit(1)
        
    pipeline = joblib.load(model_path)
    sentence = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "The battery lasts over 14 hours and sound is wonderful!"
    
    cleaned = clean_text(sentence)
    prediction = pipeline.predict([cleaned])[0]
    probabilities = pipeline.predict_proba([cleaned])[0]
    classes = list(pipeline.classes_)
    prob_map = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
    
    print("=" * 50)
    print(f"Input:       \"{sentence}\"")
    print(f"Prediction:  [{prediction.upper()}]")
    print(f"Confidence:  {prob_map[prediction]*100:.1f}%")
    print(f"Breakdown:   Pos: {prob_map.get('positive',0)*100:.1f}% | Neu: {prob_map.get('neutral',0)*100:.1f}% | Neg: {prob_map.get('negative',0)*100:.1f}%")
    print("=" * 50)

if __name__ == "__main__":
    main()
`
  },
  {
    path: "sentiment-analysis/README.md",
    name: "README.md",
    language: "markdown",
    description: "Complete beginner-friendly project documentation, mathematical explanations of TF-IDF & Logistic Regression, and setup commands.",
    content: `# SentimentScope: Beginner-Friendly NLP Sentiment Analysis System

A complete Natural Language Processing (NLP) system that classifies sentences, customer reviews, and social media text into **Positive**, **Negative**, or **Neutral** sentiment using Python, TF-IDF feature extraction, Scikit-learn Logistic Regression, and Streamlit.

## Quick Start
1. Clone / extract the folder:
   \`\`\`bash
   cd sentiment-analysis
   \`\`\`
2. Create and activate a virtual environment:
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\\venv\\Scripts\\activate
   \`\`\`
3. Install dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
4. Train the model:
   \`\`\`bash
   python train_model.py
   \`\`\`
5. Launch the Streamlit application:
   \`\`\`bash
   streamlit run app.py
   \`\`\`
`
  },
  {
    path: "sentiment-analysis/data/sentiment_dataset.csv",
    name: "sentiment_dataset.csv",
    language: "csv",
    description: "Multi-domain labeled dataset with positive, negative, and neutral classes across electronics, food, software, retail, travel, and support.",
    content: `text,sentiment,domain
"The battery life on this laptop is incredible, lasts well over 14 hours on a single charge.",positive,electronics
"Absolutely fantastic sound quality and very comfortable to wear for long listening sessions.",positive,electronics
"I am thoroughly impressed with the camera clarity in low-light environments.",positive,electronics
"Super fast delivery and the packaging was immaculate. Highly recommend this seller!",positive,service
"Customer service responded within five minutes and resolved my refund request immediately.",positive,service
"The food at this restaurant was exceptionally fresh and bursting with authentic flavor.",positive,food
"This software application is smooth, intuitive, and has significantly boosted my daily productivity.",positive,software
"The device stopped working after just three days of very light usage.",negative,electronics
"Terrible audio quality with a persistent buzzing background static that gives me a headache.",negative,electronics
"The customer support representative was rude and refused to honor the warranty policy.",negative,service
"Shipping took over four weeks and the item arrived severely damaged inside a crushed box.",negative,service
"The parcel is scheduled to arrive between 2 PM and 5 PM on Tuesday.",neutral,service
"The laptop has a 15.6 inch display and weighs approximately 1.8 kilograms.",neutral,electronics
"The conference starts tomorrow morning at 9 AM in the main auditorium.",neutral,general
"The recipe calls for two tablespoons of olive oil and one teaspoon of sea salt.",neutral,food
`
  }
];
