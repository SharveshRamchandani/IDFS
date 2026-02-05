from typing import List, Optional
from datetime import date
from pydantic import BaseModel

class HolidayBase(BaseModel):
    date: date
    type: str 
    locale: str
    locale_name: str
    description: str
    transferred: bool = False

class HolidayCreate(HolidayBase):
    pass

class Holiday(HolidayBase):
    id: int

    class Config:
        from_attributes = True
