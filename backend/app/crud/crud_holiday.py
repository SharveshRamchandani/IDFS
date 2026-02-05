from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.sales import Holiday
from app.schemas.holiday import HolidayCreate

def get_holiday_by_date_locale(db: Session, holiday_date: date, locale_name: str) -> Optional[Holiday]:
    return db.query(Holiday).filter(
        Holiday.date == holiday_date, 
        Holiday.locale_name == locale_name
    ).first()

def create_holiday(db: Session, obj_in: HolidayCreate) -> Holiday:
    db_obj = Holiday(
        date=obj_in.date,
        type=obj_in.type,
        locale=obj_in.locale,
        locale_name=obj_in.locale_name,
        description=obj_in.description,
        transferred=obj_in.transferred
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_all_holidays(db: Session) -> List[Holiday]:
    return db.query(Holiday).all()
