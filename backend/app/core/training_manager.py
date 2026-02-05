from datetime import datetime
from typing import Optional, Dict, Any

class TrainingManager:
    _instance = None
    
    def __init__(self):
        self.is_training = False
        self.start_time = None
        self.status = "Idle"
        self.job_id = None
        self.last_result = None
        self.error = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = TrainingManager()
        return cls._instance

    def start_training(self):
        self.is_training = True
        self.start_time = datetime.now()
        self.status = "Training Started"
        self.job_id = f"job_{int(self.start_time.timestamp())}"
        self.error = None
        self.last_result = None
        return self.job_id

    def update_status(self, status: str):
        self.status = status

    def complete_training(self, result: Dict[str, Any]):
        self.is_training = False
        self.status = "Completed"
        self.last_result = result

    def fail_training(self, error: str):
        self.is_training = False
        self.status = "Failed"
        self.error = error

training_manager = TrainingManager.get_instance()
