"""
=============================================================================
Sentiment Analysis Model Training Script
=============================================================================
Author: Natural Language Processing (NLP) Tutorial Project
Description:
    This script loads a labeled sentiment dataset (positive, negative, neutral),
    performs text preprocessing, extracts features using TF-IDF (Term Frequency -
    Inverse Document Frequency), trains a Logistic Regression classifier using
    Scikit-learn, evaluates model performance (Accuracy, Precision, Recall, F1),
    and saves the trained pipeline into the `models/` directory for production use.
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
    """
    Cleans raw text for NLP processing.
    
    Steps performed:
    1. Lowercase all characters so 'Great' and 'great' are treated identically.
    2. Remove URLs, handles, and excessive special symbols.
    3. Normalize whitespace.
    
    Args:
        text (str): The raw input sentence.
        
    Returns:
        str: The normalized, cleaned sentence.
    """
    if not isinstance(text, str):
        return ""
    
    # 1. Convert to lowercase
    text = text.lower()
    
    # 2. Remove web URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    
    # 3. Remove email addresses
    text = re.sub(r"\S+@\S+", " ", text)
    
    # 4. Remove special characters and digits while keeping letters and basic spacing
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    
    # 5. Remove multiple consecutive spaces
    text = re.sub(r"\s+", " ", text).strip()
    
    return text


def load_and_preprocess_data(dataset_path: str):
    """
    Loads dataset from CSV, inspects class distribution, and cleans the text column.
    
    Args:
        dataset_path (str): Path to CSV file containing 'text' and 'sentiment' columns.
        
    Returns:
        tuple: (X_cleaned, y, df)
    """
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset file not found at: {dataset_path}")
    
    df = pd.read_csv(dataset_path)
    
    if "text" not in df.columns or "sentiment" not in df.columns:
        raise ValueError("Dataset CSV must contain 'text' and 'sentiment' columns.")
    
    # Drop empty or missing values
    df = df.dropna(subset=["text", "sentiment"]).copy()
    
    # Standardize sentiment labels to lowercase
    df["sentiment"] = df["sentiment"].astype(str).str.strip().str.lower()
    
    # Apply text cleaning
    df["cleaned_text"] = df["text"].apply(clean_text)
    
    # Remove rows where cleaned text became empty
    df = df[df["cleaned_text"].str.len() > 0].copy()
    
    print("\n--------------------------------------------------")
    print(f" Loaded {len(df)} samples from {dataset_path}")
    print(" Class distribution:")
    for label, count in df["sentiment"].value_counts().items():
        print(f"   - {label.capitalize():<10}: {count} samples ({count/len(df)*100:.1f}%)")
    print("--------------------------------------------------\n")
    
    return df["cleaned_text"], df["sentiment"], df


def train_sentiment_model(X, y):
    """
    Splits data, constructs TF-IDF + Logistic Regression pipeline, and trains the model.
    
    Args:
        X: Iterable of cleaned text strings.
        y: Iterable of sentiment target labels.
        
    Returns:
        tuple: (trained_pipeline, X_test, y_test, y_pred, accuracy, report, conf_matrix)
    """
    # 1. Stratified Train / Test split (80% training, 20% testing)
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )
    
    print(f"Training split: {len(X_train)} samples | Testing split: {len(X_test)} samples")
    
    # 2. Build Pipeline: TF-IDF Vectorizer + Multinomial Logistic Regression
    # - ngram_range=(1, 2) captures unigrams ('good') and bigrams ('not good', 'very happy')
    # - stop_words='english' filters out common filler words ('the', 'is', 'at')
    # - sublinear_tf=True dampens the effect of very frequent words using log scaling
    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                stop_words="english",
                sublinear_tf=True,
                max_features=3000
            )
        ),
        (
            "classifier",
            LogisticRegression(
                C=1.5,
                max_iter=1000,
                random_state=42,
                class_weight="balanced"
            )
        )
    ])
    
    print("Training Logistic Regression with TF-IDF features...")
    pipeline.fit(X_train, y_train)
    print("Training complete!\n")
    
    # 3. Model Evaluation on Held-Out Test Set
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred, labels=["positive", "neutral", "negative"])
    
    return pipeline, X_test, y_test, y_pred, accuracy, report, conf_matrix


def display_top_words_per_class(pipeline, num_words=6):
    """
    Inspects model coefficients to reveal top indicators for each sentiment.
    """
    vectorizer = pipeline.named_steps["tfidf"]
    classifier = pipeline.named_steps["classifier"]
    
    feature_names = np.array(vectorizer.get_feature_names_out())
    classes = classifier.classes_
    
    print("Top Indicative Words Learned by Logistic Regression:")
    for idx, class_name in enumerate(classes):
        # Coefficients for class idx
        coefs = classifier.coef_[idx]
        top_indices = np.argsort(coefs)[::-1][:num_words]
        top_features = feature_names[top_indices]
        print(f"  [{class_name.upper()}]: {', '.join(top_features)}")
    print("--------------------------------------------------\n")


def save_model(pipeline, output_path: str = "models/sentiment_pipeline.pkl"):
    """
    Serializes and saves the trained pipeline to disk using joblib.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump(pipeline, output_path)
    print(f"Model saved successfully to: {output_path}")


def main():
    print("=" * 60)
    print("   SENTIMENT ANALYSIS SYSTEM - MODEL TRAINING PIPELINE    ")
    print("=" * 60)
    
    dataset_path = os.path.join(os.path.dirname(__file__), "data", "sentiment_dataset.csv")
    model_output_path = os.path.join(os.path.dirname(__file__), "models", "sentiment_pipeline.pkl")
    
    # Step 1: Load & Preprocess
    X, y, df = load_and_preprocess_data(dataset_path)
    
    # Step 2: Train & Evaluate
    pipeline, X_test, y_test, y_pred, accuracy, report, conf_matrix = train_sentiment_model(X, y)
    
    # Step 3: Print Evaluation Metrics
    print("================ MODEL EVALUATION METRICS ================")
    print(f"Overall Test Accuracy: {accuracy * 100:.2f}%\n")
    print(f"{'Class':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<10}")
    print("-" * 58)
    for label in ["positive", "neutral", "negative"]:
        if label in report:
            p = report[label]["precision"]
            r = report[label]["recall"]
            f1 = report[label]["f1-score"]
            sup = report[label]["support"]
            print(f"{label.capitalize():<12} {p*100:>8.2f}%    {r*100:>8.2f}%    {f1*100:>8.2f}%    {sup:>6}")
    print("-" * 58)
    print(f"Macro Average  {report['macro avg']['precision']*100:>8.2f}%    {report['macro avg']['recall']*100:>8.2f}%    {report['macro avg']['f1-score']*100:>8.2f}%")
    print("=" * 58)
    
    # Print Confusion Matrix
    print("\nConfusion Matrix (Rows: Actual, Columns: Predicted):")
    print("                Pred Positive  Pred Neutral  Pred Negative")
    print(f"Actual Positive:     {conf_matrix[0][0]:<14}{conf_matrix[0][1]:<14}{conf_matrix[0][2]}")
    print(f"Actual Neutral:      {conf_matrix[1][0]:<14}{conf_matrix[1][1]:<14}{conf_matrix[1][2]}")
    print(f"Actual Negative:     {conf_matrix[2][0]:<14}{conf_matrix[2][1]:<14}{conf_matrix[2][2]}")
    print("--------------------------------------------------\n")
    
    # Step 4: Top words
    display_top_words_per_class(pipeline)
    
    # Step 5: Save Model
    save_model(pipeline, model_output_path)
    
    # Step 6: Test on Sample Sentences
    sample_tests = [
        "This product is outstanding, exceeding every single expectation!",
        "Customer service was rude, delayed, and utterly unhelpful.",
        "The conference presentation begins at 10 AM in lecture hall 3.",
        "The battery lasts quite long, but the camera picture is slightly blurry.",
    ]
    
    print("\nVerifying Pipeline with Sample Sentences:")
    for sample in sample_tests:
        cleaned_sample = clean_text(sample)
        prediction = pipeline.predict([cleaned_sample])[0]
        probabilities = pipeline.predict_proba([cleaned_sample])[0]
        class_probs = {cls: prob for cls, prob in zip(pipeline.classes_, probabilities)}
        conf = class_probs[prediction] * 100
        print(f"\n- Text: \"{sample}\"")
        print(f"  -> Predicted Sentiment: [{prediction.upper()}] (Confidence: {conf:.1f}%)")
        print(f"     Probabilities: Pos: {class_probs.get('positive', 0)*100:.1f}% | "
              f"Neu: {class_probs.get('neutral', 0)*100:.1f}% | "
              f"Neg: {class_probs.get('negative', 0)*100:.1f}%")
        
    print("\n" + "=" * 60)
    print(" Training finished! You can now run: streamlit run app.py")
    print("=" * 60)


if __name__ == "__main__":
    main()
