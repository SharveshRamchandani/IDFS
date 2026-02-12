import sys
import os

# Ensure app is in path
sys.path.append(os.getcwd())

from app.ml.training import train_model, save_model

if __name__ == "__main__":
    print("(rocket) Running Training Script...")
    try:
        metrics = train_model()
        if metrics:
            print("(tick) Training Successful!")
            print("(chart) Metrics:", metrics)
            save_model()
        else:
            print("(!) Training completed but no metrics returned (Data issue?).")
    except Exception as e:
        print(f"(x) Error during training: {e}")
