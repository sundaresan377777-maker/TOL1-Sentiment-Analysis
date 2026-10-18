"""
=============================================================================
Quick CLI Sentiment Analysis Tester
=============================================================================
Usage:
    python test_sample.py "Your test sentence here"
Or run without arguments to execute a suite of test cases.
=============================================================================
"""

import sys
import os
import re
import joblib


def clean_text(text: str) -> str:
    """Cleans raw text for sentiment inference."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def load_model():
    """Loads the trained pipeline."""
    model_path = os.path.join(os.path.dirname(__file__), "models", "sentiment_pipeline.pkl")
    if not os.path.exists(model_path):
        print(f"[ERROR] Trained model file not found at: {model_path}")
        print("Please train the model first by running: python train_model.py")
        sys.exit(1)
    return joblib.load(model_path)


def predict_sentiment(pipeline, text: str):
    """Predicts sentiment category and class probabilities."""
    cleaned = clean_text(text)
    if not cleaned:
        return "neutral", {"positive": 0.33, "neutral": 0.34, "negative": 0.33}
    
    prediction = pipeline.predict([cleaned])[0]
    probabilities = pipeline.predict_proba([cleaned])[0]
    classes = list(pipeline.classes_)
    prob_map = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
    return prediction, prob_map


def main():
    pipeline = load_model()
    
    # If user passed a sentence via command line
    if len(sys.argv) > 1:
        sentence = " ".join(sys.argv[1:])
        prediction, probs = predict_sentiment(pipeline, sentence)
        print("\n" + "=" * 50)
        print(f"Input:       \"{sentence}\"")
        print(f"Prediction:  [{prediction.upper()}]")
        print(f"Confidence:  {probs[prediction]*100:.1f}%")
        print(f"Breakdown:   Pos: {probs.get('positive',0)*100:.1f}% | "
              f"Neu: {probs.get('neutral',0)*100:.1f}% | "
              f"Neg: {probs.get('negative',0)*100:.1f}%")
        print("=" * 50 + "\n")
        return

    # Default suite of test sentences
    print("\nRunning quick sentiment test suite across classes:")
    test_suite = [
        ("The battery lasts two full days and the camera takes breathtaking photos.", "positive"),
        ("The delivery was delayed by three weeks and the item arrived broken.", "negative"),
        ("The seminar will take place on Wednesday in room 402 at 2 PM.", "neutral"),
        ("I thought the first half was good, but the ending was deeply disappointing.", "negative"),
        ("Average product, does exactly what is written in the instruction booklet.", "neutral")
    ]
    
    for sentence, expected in test_suite:
        pred, probs = predict_sentiment(pipeline, sentence)
        icon = "✓" if pred == expected else "~"
        print(f"[{icon}] \"{sentence}\"")
        print(f"    -> Expected: {expected:<8} | Predicted: {pred:<8} (Confidence: {probs[pred]*100:.1f}%)")
    print("\nTest suite completed.")


if __name__ == "__main__":
    main()
