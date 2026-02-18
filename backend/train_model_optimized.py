"""
Optimized Model Training Script with Hyperparameter Tuning
This will take longer but produce much better accuracy!
"""
import sys
import os

# Ensure app is in path
sys.path.append(os.getcwd())

from app.ml.training import train_model, save_model

if __name__ == "__main__":
    print("="*60)
    print("🚀 OPTIMIZED MODEL TRAINING")
    print("="*60)
    print("⚠️  This will take 5-10 minutes due to hyperparameter tuning")
    print("But the results will be MUCH better!")
    print("="*60 + "\n")
    
    try:
        # Train with auto-tuning enabled for better accuracy
        metrics = train_model(auto_tune=True)
        
        if metrics:
            print("\n" + "="*60)
            print("✅ TRAINING SUCCESSFUL!")
            print("="*60)
            
            # Calculate model accuracy (100 - MAPE)
            mape = metrics.get('mape', 0) * 100  # Convert to percentage
            accuracy = 100 - mape
            
            print(f"\n📊 PERFORMANCE METRICS:")
            print(f"  🎯 Model Accuracy: {accuracy:.2f}%")
            print(f"  📉 MAPE (Error):   {mape:.2f}%")
            print(f"  📏 MAE:            {metrics.get('mae', 0):.2f}")
            print(f"  📐 RMSE:           {metrics.get('rmse', 0):.2f}")
            print(f"  🎪 Coverage:       {metrics.get('coverage', 0)*100:.1f}%")
            
            print("\n" + "="*60)
            if mape < 15:
                print("⭐⭐⭐⭐⭐ EXCELLENT Model! (Error < 15%)")
            elif mape < 20:
                print("⭐⭐⭐⭐ GOOD Model! (Error < 20%)")
            elif mape < 30:
                print("⭐⭐⭐ DECENT Model (Error < 30%)")
            else:
                print("⭐⭐ Model could use more data or tuning")
            print("="*60)
            
            save_model()
            
        else:
            print("(!) Training completed but no metrics returned (Data issue?).")
            
    except Exception as e:
        print(f"\n❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
