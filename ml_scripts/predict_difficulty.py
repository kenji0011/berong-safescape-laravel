import sys
import json
import joblib
import pandas as pd
import warnings
import os

# Suppress sklearn warnings about feature names
warnings.filterwarnings("ignore", category=UserWarning)

def main():
    try:
        # Read the JSON argument passed from Laravel
        input_data = json.loads(sys.argv[1])
        model_type = input_data.get('model_type')
        
        # Absolute path based on standard Laravel structure (or relative if called from project root)
        # We will assume this is called from the root of the laravel project where artisan lives
        base_path = 'ml_scripts/'
        
        if model_type == 'pre_assessment':
            model = joblib.load(base_path + 'best_pre_assessment_model.joblib')
            scaler = joblib.load(base_path + 'pre_assessment_scaler.joblib')
            encoder = joblib.load(base_path + 'pre_assessment_label_encoder.joblib')
            
            # The order must match: Age, Grade Level, Pre-Assessment Score
            features = pd.DataFrame([{
                'Age': float(input_data.get('age', 10)),
                'Grade Level': float(input_data.get('grade', 5)),
                'Pre-Assessment Score': float(input_data.get('pre_assessment_score', 0))
            }])
            
            # .values bypasses strict column name checking if they slightly differed in training
            scaled_features = scaler.transform(features.values)
            prediction_encoded = model.predict(scaled_features)
            prediction = encoder.inverse_transform(prediction_encoded)[0]
            
        elif model_type == 'final_exam':
            model = joblib.load(base_path + 'best_final_exam_model.joblib')
            scaler = joblib.load(base_path + 'final_exam_scaler.joblib')
            encoder = joblib.load(base_path + 'final_exam_label_encoder.joblib')
            
            # The order must match: Module 1, 2, 3, 4 scores
            features = pd.DataFrame([{
                'Module 1': float(input_data.get('module_1', 0)),
                'Module 2': float(input_data.get('module_2', 0)),
                'Module 3': float(input_data.get('module_3', 0)),
                'Module 4': float(input_data.get('module_4', 0))
            }])
            
            scaled_features = scaler.transform(features.values)
            prediction_encoded = model.predict(scaled_features)
            prediction = encoder.inverse_transform(prediction_encoded)[0]
            
        else:
            raise ValueError("Unknown model_type")
            
        # Return cleanly formatted JSON for PHP to parse
        print(json.dumps({"success": True, "difficulty": str(prediction)}))
        
    except Exception as e:
        # If anything fails (missing model, bad input), safely fallback to Easy
        print(json.dumps({"success": False, "error": str(e), "difficulty": "Easy"}))

if __name__ == "__main__":
    main()
