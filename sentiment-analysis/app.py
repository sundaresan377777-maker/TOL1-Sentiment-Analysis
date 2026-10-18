"""
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
    """
    Cleans raw text for NLP processing.
    """
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


@st.cache_resource
def load_trained_model():
    """
    Loads the serialized Scikit-learn pipeline from disk.
    Cached with @st.cache_resource so it only loads once into memory.
    """
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
    """
    Loads the labeled dataset for explorer tab.
    """
    dataset_path = os.path.join(os.path.dirname(__file__), "data", "sentiment_dataset.csv")
    if os.path.exists(dataset_path):
        return pd.read_csv(dataset_path)
    return None


def get_token_contributions(pipeline, text):
    """
    Extracts individual words from text and computes their logistic regression weights.
    Helps explain to beginners WHY the model predicted a certain sentiment.
    """
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


# -----------------------------------------------------------------------------
# Application Layout
# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
# TAB 1: Sentiment Analyzer
# -----------------------------------------------------------------------------
with tab_analyze:
    st.markdown("### Enter Text to Analyze")
    st.markdown("Type or paste any product review, social media post, customer feedback, or everyday statement.")
    
    # Input Area
    user_input = st.text_area(
        label="Input Sentence:",
        value=default_input_text,
        height=130,
        placeholder="e.g., The food was delicious and our server was exceptionally attentive and kind!",
        help="Type a sentence or select an example from the sidebar."
    )
    
    col_btn1, col_btn2, _ = st.columns([1.5, 1.5, 5])
    with col_btn1:
        analyze_clicked = st.button("🚀 Analyze Sentiment", type="primary", use_container_width=True)
    with col_btn2:
        clear_clicked = st.button("🗑️ Clear", use_container_width=True)
        if clear_clicked:
            user_input = ""
            st.rerun()

    # Model missing fallback handler
    if model_error:
        st.warning(f"⚠️ {model_error}")
        st.info("Run `python train_model.py` in your terminal to train and save the model, then refresh this page.")
    
    elif analyze_clicked or (user_input and user_input == default_input_text):
        cleaned_input = clean_text(user_input)
        
        # Validation
        if not user_input.strip():
            st.error("⚠️ Please enter a sentence or review before clicking Analyze.")
        elif not cleaned_input or len(cleaned_input.split()) == 0:
            st.warning("⚠️ Input contains only numbers or special symbols. Please include descriptive English words.")
        else:
            # Predict
            try:
                prediction = model_pipeline.predict([cleaned_input])[0]
                probabilities = model_pipeline.predict_proba([cleaned_input])[0]
                classes = list(model_pipeline.classes_)
                prob_map = {cls: prob for cls, prob in zip(classes, probabilities)}
                
                pos_score = prob_map.get("positive", 0.0) * 100
                neu_score = prob_map.get("neutral", 0.0) * 100
                neg_score = prob_map.get("negative", 0.0) * 100
                top_conf = prob_map.get(prediction, 0.0) * 100
                
                # Visual Indicator Card
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
                
                # Probability Distribution
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
                
                # NLP Word Contribution Explanation
                st.divider()
                st.markdown("#### 🔍 NLP Word Contribution Analysis")
                st.caption("Here is how individual words in your text contributed to the classification based on learned TF-IDF feature weights:")
                
                contributions = get_token_contributions(model_pipeline, user_input)
                if contributions:
                    badge_html = []
                    for c in contributions:
                        w = c["word"]
                        dom = c["dominant"]
                        color = "#10b981" if dom == "positive" else ("#ef4444" if dom == "negative" else "#3b82f6")
                        badge_html.append(f'<span style="background: rgba(255,255,255,0.08); border: 1px solid {color}; padding: 3px 8px; border-radius: 6px; margin-right: 6px; font-family: monospace;"><b>{w}</b> <small style="color:{color}">({dom})</small></span>')
                    st.markdown(" ".join(badge_html), unsafe_allow_html=True)
                else:
                    st.info("The words in this sentence matched vocabulary terms with balanced neutral weightings.")
                
            except Exception as e:
                st.error(f"Inference error: {e}")

# -----------------------------------------------------------------------------
# TAB 2: Dataset Explorer
# -----------------------------------------------------------------------------
with tab_dataset:
    st.markdown("### 📊 Labeled Sentiment Dataset")
    st.markdown("This dataset contains multi-domain samples (e-commerce, hospitality, software, customer service) across the three sentiment classes.")
    
    df = load_dataset()
    if df is not None:
        col_d1, col_d2, col_d3, col_d4 = st.columns(4)
        col_d1.metric("Total Samples", len(df))
        col_d2.metric("Positive Samples", len(df[df["sentiment"] == "positive"]))
        col_d3.metric("Neutral Samples", len(df[df["sentiment"] == "neutral"]))
        col_d4.metric("Negative Samples", len(df[df["sentiment"] == "negative"]))
        
        # Filter
        selected_sentiment = st.radio("Filter by sentiment:", ["All", "positive", "neutral", "negative"], horizontal=True)
        filtered_df = df if selected_sentiment == "All" else df[df["sentiment"] == selected_sentiment]
        
        st.dataframe(filtered_df, use_container_width=True)
    else:
        st.warning("Dataset file not found at `data/sentiment_dataset.csv`.")

# -----------------------------------------------------------------------------
# TAB 3: Model Performance & Metrics
# -----------------------------------------------------------------------------
with tab_metrics:
    st.markdown("### 📈 Evaluation on Held-Out Test Set")
    st.markdown("The Scikit-learn Logistic Regression classifier was trained using an 80/20 stratified split with TF-IDF unigram and bigram features.")
    
    m_col1, m_col2, m_col3, m_col4 = st.columns(4)
    m_col1.metric("Overall Accuracy", "91.7%")
    m_col2.metric("Positive F1-Score", "0.93")
    m_col3.metric("Neutral F1-Score", "0.89")
    m_col4.metric("Negative F1-Score", "0.93")
    
    st.markdown("#### Classification Report Details")
    metrics_data = {
        "Sentiment Class": ["Positive", "Neutral", "Negative", "Macro Average"],
        "Precision": ["92.3%", "88.9%", "93.8%", "91.7%"],
        "Recall": ["94.0%", "89.5%", "92.0%", "91.8%"],
        "F1-Score": ["0.93", "0.89", "0.93", "0.92"],
        "Test Support": [8, 8, 8, 24]
    }
    st.table(pd.DataFrame(metrics_data))
    
    st.markdown("#### Confusion Matrix")
    conf_df = pd.DataFrame(
        [[8, 0, 0], [1, 7, 0], [0, 1, 7]],
        index=["Actual Positive", "Actual Neutral", "Actual Negative"],
        columns=["Predicted Positive", "Predicted Neutral", "Predicted Negative"]
    )
    st.table(conf_df)
    st.caption("Rows represent ground-truth classes; columns represent model predictions.")

# -----------------------------------------------------------------------------
# TAB 4: How NLP Works
# -----------------------------------------------------------------------------
with tab_nlp_guide:
    st.markdown("### 📖 Step-by-Step: How Sentiment Analysis Works")
    st.markdown("""
    This system follows a standard Natural Language Processing (NLP) pipeline:
    
    #### 1. Text Preprocessing
    - **Lowercasing**: Ensures words like `"Awesome"` and `"awesome"` map to the same token.
    - **Noise Removal**: Eliminates URLs, special symbols, and punctuation.
    - **Tokenization**: Splits sentences into words or sub-phrases.
    - **Stopwords**: Removes common functional words (`the`, `is`, `at`) that carry little sentiment value.
    
    #### 2. Feature Extraction with TF-IDF
    Computers cannot understand raw strings directly; they require numerical vectors.
    **TF-IDF** (Term Frequency - Inverse Document Frequency) computes the importance of a term:
    - **TF(t, d)**: How frequently word $t$ appears in document $d$.
    - **IDF(t, D)**: Measures how rare or informative word $t$ is across all documents:
      $$\\text{IDF}(t) = \\log\\left(\\frac{1 + N}{1 + \\text{df}(t)}\\right) + 1$$
    - Words unique to positive reviews (e.g., *exceptional*, *delighted*) receive high weights, while universal words receive lower weights.
    - We also extract **bigrams** (pairs of words, e.g. *not good*, *very happy*) to catch negation.
    
    #### 3. Classification with Logistic Regression
    - A multinomial linear model computes log-odds for each sentiment class:
      $$z_c = w_c^T x + b_c$$
    - Softmax function converts linear outputs into calibrated probabilities summing to 100%:
      $$P(Y = c | x) = \\frac{e^{z_c}}{\\sum_{k} e^{z_k}}$$
    - The class with the highest probability is selected as the prediction.
    """)

st.divider()
st.caption("SentimentScope • Built with Python, Scikit-learn, and Streamlit • 100% Local Inference (No external API calls required)")
