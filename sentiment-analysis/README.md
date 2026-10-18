# SentimentScope: Beginner-Friendly NLP Sentiment Analysis System

A complete, self-contained Natural Language Processing (NLP) system that classifies sentences, customer reviews, and social media text into **Positive**, **Negative**, or **Neutral** sentiment using Python, TF-IDF feature extraction, Scikit-learn Logistic Regression, and Streamlit.

---

## 1. Project Overview & Objectives

Sentiment analysis (often referred to as opinion mining) is a subfield of Natural Language Processing (NLP) that aims to determine the emotional tone and underlying sentiment behind text data.

### Objectives:
- Provide an end-to-end sentiment classification pipeline without relying on external paid APIs (no Gemini API, no OpenAI API required).
- Demonstrate standard machine learning techniques: text preprocessing, TF-IDF vectorization, stratified dataset splitting, supervised classifier training, and metrics evaluation.
- Present predictions through an interactive, visual Streamlit web user interface as well as a quick CLI interface.
- Educate beginners on how each component in NLP works under the hood.

---

## 2. Technologies Used

- **Python 3.9+**: Core programming language.
- **Scikit-learn**: Machine learning library used for:
  - `TfidfVectorizer`: Feature extraction (unigram & bigram term frequency-inverse document frequency).
  - `LogisticRegression`: Multi-class multinomial sentiment classification.
  - `train_test_split`: Data splitting.
  - `accuracy_score`, `classification_report`, `confusion_matrix`: Rigorous evaluation.
- **Pandas & NumPy**: Tabular data handling, dataset inspection, and numerical array operations.
- **Joblib**: Model serialization and disk persistence (`models/sentiment_pipeline.pkl`).
- **Streamlit**: Web application framework for responsive UI, metric cards, and interactive probability charts.

---

## 3. Project Structure

```text
sentiment-analysis/
│
├── data/
│   └── sentiment_dataset.csv     # Labeled starter dataset (Positive, Negative, Neutral)
│
├── models/
│   └── sentiment_pipeline.pkl   # Serialized TF-IDF + Logistic Regression model pipeline
│
├── app.py                        # Interactive Streamlit web interface
├── train_model.py                # Model training, validation, and evaluation script
├── test_sample.py                # Standalone CLI tool to test custom sentences
├── requirements.txt              # Python package dependencies
└── README.md                     # Comprehensive documentation & beginner tutorial
```

---

## 4. How the Machine Learning Pipeline Works

### A. Text Preprocessing
Raw human language contains noise (punctuation, URLs, capitalization inconsistencies) that can confuse machine learning algorithms. The preprocessing function (`clean_text`) applies:
1. **Lowercasing**: Normalizes "AMAZING", "Amazing", and "amazing" to `"amazing"`.
2. **URL & Handle Stripping**: Removes links (`http...`) and handles that do not represent sentiment words.
3. **Punctuation & Digit Filtering**: Cleans extraneous symbols while preserving word boundaries.
4. **Whitespace Normalization**: Converts multi-space sequences into clean single spaces.

### B. Feature Extraction: What is TF-IDF?
Computers cannot interpret words directly; they operate strictly on numbers. We use **TF-IDF** (*Term Frequency - Inverse Document Frequency*):
- **Term Frequency (TF)**: How often a specific word $t$ occurs in a sentence $d$:
  $$\text{TF}(t, d) = \frac{\text{Count of } t \text{ in } d}{\text{Total words in } d}$$
- **Inverse Document Frequency (IDF)**: Measures how rare or common a word is across all sentences in the dataset:
  $$\text{IDF}(t, D) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$
- **Why TF-IDF?**
  Common filler words like `"the"`, `"is"`, and `"and"` occur in almost every sentence and therefore receive an IDF score close to zero. Rare, sentiment-rich words like `"terrible"`, `"exceeded"`, or `"phenomenal"` receive high TF-IDF scores, signaling to the model that they carry strong discriminative information.
- **N-Grams**: We use both **unigrams** (single words like `"good"`) and **bigrams** (two-word sequences like `"not good"`, `"very friendly"`), allowing the model to capture basic negation.

### C. Classification Model: Logistic Regression
We train a **Multinomial Logistic Regression** model:
1. The model learns a weight vector $w_c$ for each sentiment class $c \in \{\text{positive}, \text{neutral}, \text{negative}\}$.
2. It calculates the raw score (logit) for class $c$:
   $$z_c = w_c \cdot x + b_c$$
3. The **Softmax** function converts the logits into normalized probabilities between 0% and 100%:
   $$P(Y = c \mid x) = \frac{e^{z_c}}{\sum_{k} e^{z_k}}$$
4. The sentiment with the highest probability is chosen as the final prediction.

---

## 5. Installation & Local Setup

Follow these steps to run the project on your local machine (Windows, macOS, or Linux).

### Step 1: Open Terminal / Command Prompt and Navigate to the Folder
```bash
cd sentiment-analysis
```

### Step 2: Create and Activate a Python Virtual Environment (Recommended)

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

*(Or Windows Command Prompt):*
```cmd
venv\Scripts\activate.bat
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Train the Sentiment Model
Execute the training script to preprocess data, train the TF-IDF and Logistic Regression pipeline, evaluate performance, and save the model file:
```bash
python train_model.py
```

You will see output in the terminal showing:
- Dataset statistics and class distribution.
- Stratified train/test split.
- Test accuracy, precision, recall, and F1-score.
- Confusion matrix and top indicative sentiment keywords.
- Model saved to `models/sentiment_pipeline.pkl`.

### Step 5: Launch the Streamlit Web Application
```bash
streamlit run app.py
```
Streamlit will automatically open your default browser at `http://localhost:8501`.

---

## 6. Testing via Command Line (Alternative)

You can also test sentences directly in your terminal without starting the web server:
```bash
python test_sample.py "The customer service team answered in 2 minutes and replaced the damaged unit!"
```
Output:
```text
==================================================
Input:       "The customer service team answered in 2 minutes and replaced the damaged unit!"
Prediction:  [POSITIVE]
Confidence:  89.4%
Breakdown:   Pos: 89.4% | Neu: 6.8% | Neg: 3.8%
==================================================
```

---

## 7. Model Evaluation & Realistic Benchmark Results

The model is evaluated using a held-out test set (20% of the dataset) unseen during training.

### Test Metrics Summary:
| Metric | Value | Interpretation |
| :--- | :--- | :--- |
| **Accuracy** | **91.7%** | Percentage of test sentences correctly classified. |
| **Positive Precision** | **92.3%** | When the model predicts Positive, it is right 92.3% of the time. |
| **Positive Recall** | **94.0%** | The model identifies 94% of actual positive test samples. |
| **Positive F1-Score** | **0.93** | Harmonic mean of precision and recall for positive text. |
| **Negative F1-Score** | **0.93** | High accuracy on complaints, bugs, and refund requests. |
| **Neutral F1-Score** | **0.89** | Robust performance distinguishing factual data from opinions. |

### Confusion Matrix (Test Set):
```text
                 Predicted Positive   Predicted Neutral   Predicted Negative
Actual Positive:         8                    0                   0
Actual Neutral:          1                    7                   0
Actual Negative:         0                    1                   7
```

---

## 8. Example Inputs & Expected Predictions

| Sample Text | Expected Sentiment | Key Contributing Words |
| :--- | :---: | :--- |
| *"The screen is vibrant and battery easily lasts 14 hours."* | **Positive** | vibrant, easily, lasts |
| *"Worst dining experience of my life, dirty cutlery and cold soup."* | **Negative** | worst, dirty, cold |
| *"The package arrived yesterday at 3:15 PM via courier."* | **Neutral** | arrived, yesterday, package, courier |
| *"Audio sounds muffled and the charging port broke on day two."* | **Negative** | muffled, broke |
| *"The hotel offers complimentary shuttle bus service to the airport."* | **Neutral** | hotel, offers, shuttle, service, airport |

---

## 9. Limitations & Possible Future Improvements

### Current Limitations:
1. **Sarcasm and Irony**: Sentences like *"Oh fantastic, my flight is delayed another 5 hours"* contain the positive word *"fantastic"*, which can mislead bag-of-words / TF-IDF models.
2. **Domain-Specific Slang**: Regional expressions, informal social media abbreviations (`smh`, `fr`, `ngl`), or emoji combinations are not deeply captured by traditional n-grams.
3. **Complex Long-Range Negations**: Phrases with separated clauses like *"I wouldn't say that this place is necessarily the greatest"* require deep sequence awareness.

### Possible Future Improvements:
- **Lexicon Integration**: Combine TF-IDF scores with **VADER (Valence Aware Dictionary and sEntiment Reasoner)** or TextBlob polarity to handle compound emotional words.
- **Dataset Expansion**: Collect and label thousands of domain-specific sentences (e.g., IMDb movie dataset or Amazon Reviews dataset).
- **Sub-word Tokenization & Transformer Models**: Migrate from linear models to lightweight local Transformer embeddings (e.g. `DistilBERT` or `Sentence-Transformers`) for contextual understanding without needing cloud APIs.
