import pandas as pd
import numpy as np
import random

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Number of synthetic students
NUM_SAMPLES = 5000

print(f"Generating {NUM_SAMPLES} synthetic records for Final Exam Adaptive Model...")

data = []

for _ in range(NUM_SAMPLES):
    # 1. Randomly pick the target difficulty first (Guarantees perfect 33/33/33 balance)
    difficulty = random.choice(['Easy', 'Medium', 'Hard'])
    
    # 2. Generate features that make sense for that difficulty
    if difficulty == 'Easy':
        # Young students or struggling students
        age = random.randint(5, 10)
        gradeLevel = max(1, age - random.randint(4, 6))
        preAssessmentScore = random.randint(0, 8)
        
        mod1_score = random.randint(0, 3)
        mod2_score = random.randint(0, 3)
        mod3_score = random.randint(0, 3)
        mod4_score = random.randint(0, 3)
        
    elif difficulty == 'Medium':
        # Average students
        age = random.randint(8, 14)
        gradeLevel = max(1, age - random.randint(4, 6))
        preAssessmentScore = random.randint(6, 12)
        
        mod1_score = random.randint(2, 4)
        mod2_score = random.randint(2, 4)
        mod3_score = random.randint(2, 4)
        mod4_score = random.randint(2, 4)
        
    elif difficulty == 'Hard':
        # Older or high performing students
        age = random.randint(12, 18)
        gradeLevel = max(1, age - random.randint(4, 6))
        preAssessmentScore = random.randint(11, 15)
        
        mod1_score = random.randint(4, 5)
        mod2_score = random.randint(4, 5)
        mod3_score = random.randint(4, 5)
        mod4_score = random.randint(4, 5)
        
    # Introduce ~5% noise (Randomly change a few scores to confuse the model slightly)
    if random.random() < 0.05:
        age = random.randint(5, 18)
        gradeLevel = max(1, age - random.randint(4, 6))
        preAssessmentScore = random.randint(0, 15)
        mod1_score = random.randint(0, 5)
        mod2_score = random.randint(0, 5)
        
    data.append([age, gradeLevel, preAssessmentScore, mod1_score, mod2_score, mod3_score, mod4_score, difficulty])

# Create DataFrame
df = pd.DataFrame(data, columns=[
    'age',
    'gradeLevel',
    'preAssessmentScore',
    'module1Score',
    'module2Score', 
    'module3Score', 
    'module4Score', 
    'finalExamDifficulty'
])

# Save to CSV
csv_filename = 'synthetic_final_exam_data.csv'
df.to_csv(csv_filename, index=False)

print(f" Successfully generated {csv_filename}!")
print("\nSample Data:")
print(df.head(10))
print("\nDifficulty Distribution:")
print(df['finalExamDifficulty'].value_counts())
