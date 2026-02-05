from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales, crud_holiday
from app.schemas.sales import ProductCreate, StoreCreate, SalesDataCreate
from app.schemas.holiday import HolidayCreate
import pandas as pd
import io

router = APIRouter()

@router.post("/upload/holidays")
async def upload_holidays(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed for holidays.")
        
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading CSV: {e}")
        
    # Validation
    required_cols = ['date', 'type', 'locale', 'locale_name', 'description', 'transferred']
    if not all(col in df.columns for col in required_cols):
        raise HTTPException(status_code=400, detail=f"Missing columns: {required_cols}")
        
    results = {"added": 0, "errors": []}
    
    for index, row in df.iterrows():
        try:
            d = pd.to_datetime(row['date']).date()
            
            # Check duplicate
            exists = crud_holiday.get_holiday_by_date_locale(db, d, str(row['locale_name']))
            if exists:
                continue
                
            obj_in = HolidayCreate(
                date=d,
                type=str(row['type']),
                locale=str(row['locale']),
                locale_name=str(row['locale_name']),
                description=str(row['description']),
                transferred=bool(row['transferred'])
            )
            crud_holiday.create_holiday(db, obj_in)
            results["added"] += 1
        except Exception as e:
            results["errors"].append(f"Row {index}: {e}")
            
    return results

@router.post("/upload")
async def upload_sales_data(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db)
):
    if file.filename.endswith('.csv'):
        contents = await file.read()
        try:
             df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        except Exception as e:
             raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")
    elif file.filename.endswith(('.xls', '.xlsx')):
        contents = await file.read()
        try:
             df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
             raise HTTPException(status_code=400, detail=f"Error reading Excel file: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV or Excel file.")

    if df.empty:
         raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    # Basic validation of columns
    required_columns = ['date', 'sku', 'store_id', 'quantity']
    if not all(col in df.columns for col in required_columns):
         raise HTTPException(status_code=400, detail=f"Missing required columns: {required_columns}")

    results = {"added_rows": 0, "skipped_rows": 0, "errors": []}
    
    for index, row in df.iterrows():
        try:
            # Data Type Validation
            try:
                qty = int(row['quantity'])
                if qty < 0: raise ValueError
            except (ValueError, TypeError):
                 results["errors"].append(f"Row {index}: Invalid quantity '{row.get('quantity')}'")
                 continue
            
            try:
                row_date = pd.to_datetime(row['date']).date()
            except Exception:
                 results["errors"].append(f"Row {index}: Invalid date format '{row.get('date')}'")
                 continue

            # 1. Handle Product
            product = crud_sales.get_product_by_sku(db, sku=str(row['sku']))
            if not product:
                # Handle possible NaN for optional fields
                category = row.get('category')
                if pd.isna(category): category = None
                
                price = row.get('price')
                if pd.isna(price): 
                    price = None
                else:
                    try:
                         price = float(price)
                         if price < 0: raise ValueError
                    except:
                         price = None # Default to None if invalid

                product_in = ProductCreate(
                    sku=str(row['sku']),
                    category=category,
                    price=price
                )
                product = crud_sales.create_product(db, product_in)
            
            # 2. Handle Store
            store = crud_sales.get_store_by_store_id(db, store_id=str(row['store_id']))
            if not store:
                region = row.get('region')
                if pd.isna(region): region = None
                
                store_in = StoreCreate(
                    store_id=str(row['store_id']),
                    region=region
                )
                store = crud_sales.create_store(db, store_in)
            
            # 3. Handle Sales Data (Check for duplicates)
            existing_sale = crud_sales.get_sales_data_detail(db, date=row_date, sku_id=product.id, store_id=store.id)
            if existing_sale:
                results["skipped_rows"] += 1
                continue

            # Handle promotion column safely
            on_promo = False
            if 'onpromotion' in row:
                try:
                    # Handle various truthy values (1, 'True', 'true', '1')
                    val = str(row['onpromotion']).lower()
                    on_promo = val in ['1', 'true', 'yes', '1.0']
                except:
                    on_promo = False

            sales_in = SalesDataCreate(
                date=row_date,
                quantity=qty,
                sku=str(row['sku']),
                store_id=str(row['store_id']),
                onpromotion=on_promo
            )
            crud_sales.create_sales_data(db, sales_in, product.id, store.id)
            results["added_rows"] += 1
            
        except Exception as e:
            results["errors"].append(f"Row {index}: Unexpected error: {str(e)}")
            continue

    return results
