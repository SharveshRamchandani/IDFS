from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.ml.training import train_model
from app.core.training_manager import training_manager

router = APIRouter()

def background_training_task(auto_tune: bool = False):
    """
    Wrapper to run training in background and update manager status.
    """
    try:
        training_manager.update_status("Training in progress...")
        metrics = train_model(auto_tune=auto_tune)
        
        if metrics:
            training_manager.complete_training(metrics)
        else:
            training_manager.fail_training("Model failed to train or evaluate.")
            
    except Exception as e:
        training_manager.fail_training(str(e))

@router.post("/train")
def trigger_training(
    background_tasks: BackgroundTasks,
    auto_tune: bool = False,
    db: Session = Depends(deps.get_db)
):
    """
    Trigger the ML Model training process in the background.
    auto_tune: If true, performs hyperparameter optimization (Long running).
    """
    if training_manager.is_training:
        raise HTTPException(status_code=409, detail="A training job is already in progress.")

    job_id = training_manager.start_training()
    background_tasks.add_task(background_training_task, auto_tune)
    
    return {
        "message": "Training job started",
        "job_id": job_id,
        "status": "Processing",
        "auto_tune": auto_tune
    }

@router.get("/status")
def get_training_status():
    """
    Check status of the current or last training job.
    """
    return {
        "is_training": training_manager.is_training,
        "status": training_manager.status,
        "job_id": training_manager.job_id,
        "start_time": training_manager.start_time,
        "result": training_manager.last_result,
        "error": training_manager.error
    }
