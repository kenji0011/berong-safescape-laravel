# -------------------------------------------------------------------------
# GOOGLE COLAB SCRIPT: FINAL EXAM MODEL TRAINING
# -------------------------------------------------------------------------

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, learning_curve
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
from google.colab import files

print("Loading Data...")
# Load the dataset
try:
    df = pd.read_csv('synthetic_final_exam_data.csv')
except FileNotFoundError:
    print("ERROR: Please upload 'synthetic_final_exam_data.csv' to Colab first!")
    exit()

# Separate Features (X) and Target (y)
X = df[['age', 'gradeLevel', 'preAssessmentScore', 'module1Score', 'module2Score', 'module3Score', 'module4Score']]
y = df['finalExamDifficulty']

# Encode the target labels (Easy, Medium, Hard)
le = LabelEncoder()
y_encoded = le.fit_transform(y)
target_names = le.classes_

# Split into Training and Testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Scale the features (extremely important for SVM and helps other models)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Initialize Models
models = {
    "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42),
    "Support Vector Machine (SVM)": SVC(probability=True, random_state=42),
    "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
}

best_model_name = ""
best_model_score = 0
best_model_obj = None

print("\nTraining and Evaluating Models...\n")
print("=" * 60)

# Train and Evaluate each model
for name, model in models.items():
    # Train the model
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model: {name}")
    print(f"Accuracy: {accuracy * 100:.2f}%\n")
    
    # Print Classification Report
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=target_names))
    
    # Keep track of the best model
    if accuracy > best_model_score:
        best_model_score = accuracy
        best_model_name = name
        best_model_obj = model
        
    print("=" * 60)

print(f"\nWINNER: {best_model_name} with {best_model_score * 100:.2f}% accuracy!")

# -------------------------------------------------------------------------
# PLOT LEARNING CURVE FOR THE WINNING MODEL
# -------------------------------------------------------------------------
print(f"\nGenerating Learning Curve for {best_model_name} to check for overfitting...")

def plot_learning_curve(estimator, title, X, y, cv=5, n_jobs=-1, train_sizes=np.linspace(.1, 1.0, 5)):
    plt.figure(figsize=(8, 6))
    plt.title(title)
    plt.xlabel("Training examples")
    plt.ylabel("Accuracy Score")
    
    train_sizes, train_scores, test_scores = learning_curve(
        estimator, X, y, cv=cv, n_jobs=n_jobs, train_sizes=train_sizes, scoring='accuracy')
    
    train_scores_mean = np.mean(train_scores, axis=1)
    train_scores_std = np.std(train_scores, axis=1)
    test_scores_mean = np.mean(test_scores, axis=1)
    test_scores_std = np.std(test_scores, axis=1)
    
    plt.grid()
    plt.fill_between(train_sizes, train_scores_mean - train_scores_std,
                     train_scores_mean + train_scores_std, alpha=0.1, color="r")
    plt.fill_between(train_sizes, test_scores_mean - test_scores_std,
                     test_scores_mean + test_scores_std, alpha=0.1, color="g")
    
    plt.plot(train_sizes, train_scores_mean, 'o-', color="r", label="Training score")
    plt.plot(train_sizes, test_scores_mean, 'o-', color="g", label="Cross-validation (Test) score")
    
    plt.legend(loc="best")
    plt.show()

# We plot using the full scaled dataset so cross-validation can split it multiple times
X_scaled_full = scaler.fit_transform(X)
plot_learning_curve(best_model_obj, f"Learning Curve: {best_model_name}", X_scaled_full, y_encoded)

# -------------------------------------------------------------------------
# EXPORT MODELS
# -------------------------------------------------------------------------
# Save the best model, the scaler, and the label encoder
print("\nExporting Best Model...")
joblib.dump(best_model_obj, 'best_final_exam_model.joblib')
joblib.dump(scaler, 'final_exam_scaler.joblib')
joblib.dump(le, 'final_exam_label_encoder.joblib')

# Trigger download automatically in Colab
print("Downloading files to your computer...")
files.download('best_final_exam_model.joblib')
files.download('final_exam_scaler.joblib')
files.download('final_exam_label_encoder.joblib')

print("DONE! You can now use these files in your Laravel app.")
