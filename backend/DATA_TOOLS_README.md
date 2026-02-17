# IDFS Data Generation & Live Simulation Tools

## 📊 Overview

These tools help you populate your database with realistic data and simulate live updates for project demonstrations.

## 🚀 Quick Start

### Option 1: Use the Batch Script (Windows)
```bash
cd backend
run_data_tools.bat
```

### Option 2: Run Manually

#### Step 1: Seed the Database (Run First!)
```bash
cd backend
python seed_data.py
```

#### Step 2: Start Live Simulator
```bash
python live_simulator.py
```

## 📦 What Gets Created

### `seed_data.py` - Initial Data Generation
Creates:
- **500 Products** across 8 categories (Electronics, Furniture, Home & Kitchen, Clothing, Sports, Books, Toys, Beauty)
- **50 Store Locations** across 9 regions
- **100,000 Sales Records** spanning 2 years (with future dates for forecasting)
- **~17,500 Inventory Records** (product-store combinations)
- **Holiday Calendar** for 2024-2025

**Features:**
- ✅ Realistic pricing by category
- ✅ Seasonal patterns (Christmas toys boom, summer sports spike, etc.)
- ✅ Weekend and holiday sales boosts
- ✅ Promotional events (15% normal, 70% during holidays)
- ✅ Historical + future data for ML model training

**Runtime:** ~5-10 minutes depending on your machine

---

### `live_simulator.py` - Real-Time Updates

Simulates live business activity **every 10 seconds**:

1. **New Sales Records** (30-100 per cycle)
   - Time-based patterns (more during business hours)
   - Weekend boosts
   - Holiday spikes
   - Category-specific behavior

2. **Inventory Updates** (30 items per cycle)
   - Stock depletion from sales
   - Restocking events
   - Low stock alerts
   - Random adjustments

3. **Product Trends** (3-5 products per cycle)
   - Dynamic price adjustments (±5%)
   - Simulates market fluctuations

4. **Live Statistics**
   - Total sales count
   - Today's sales
   - Inventory status
   - Low stock alerts

**Perfect for:**
- 🎥 Live project demonstrations
- 📊 Testing real-time dashboards
- 🤖 ML model continuous learning
- 👥 Showcasing to stakeholders

---

## 🎯 Usage Scenarios

### For Project Presentation
```bash
# 1. Seed the database once
python seed_data.py

# 2. Start simulator before demo
python live_simulator.py

# 3. Open frontend and show live data changes!
```

### For ML Model Training
```bash
# Just seed the data once
python seed_data.py

# Then train your model with the historical data
```

### For Testing Live Features
```bash
# Run simulator in background
python live_simulator.py

# Frontend will show real-time updates in:
# - Dashboard statistics
# - Inventory levels
# - Recent sales
# - Low stock alerts
```

---

## 📈 Data Characteristics

### Sales Patterns
- **Seasonality**: Products have seasonal demand (e.g., toys peak in Nov-Dec)
- **Day-of-Week**: Weekends have 20-80% more sales
- **Holidays**: 2-4x sales multiplier on holidays
- **Promotions**: Boost sales by 50-150%
- **Time-of-Day**: Business hours (9 AM - 9 PM) have higher activity

### Inventory Behavior
- **Stock Levels**: Vary by category (3-200 units)
- **Restocking**: Random events simulating supply chain
- **Depletion**: Realistic consumption based on sales
- **Alerts**: Low stock warnings when below threshold

### Product Categories
| Category | Products | Price Range | Typical Stock |
|----------|----------|-------------|---------------|
| Electronics | 70 items | $299-$1,999 | 5-50 units |
| Furniture | 60 items | $199-$1,499 | 3-20 units |
| Home & Kitchen | 65 items | $29-$299 | 10-100 units |
| Clothing | 70 items | $19-$149 | 20-200 units |
| Sports | 60 items | $39-$599 | 5-60 units |
| Books | 70 items | $9-$49 | 10-150 units |
| Toys | 65 items | $14-$99 | 15-120 units |
| Beauty | 60 items | $12-$89 | 20-150 units |

---

## ⚠️ Important Notes

1. **Run `seed_data.py` FIRST** before starting the simulator
2. **Clear existing data**: The seeding script clears the database before populating (disable this in code if needed)
3. **Stop simulator**: Press `Ctrl+C` to gracefully stop the live simulation
4. **Database size**: Initial seed creates ~100MB of data
5. **Performance**: Simulator uses minimal resources (< 1% CPU)

---

## 🛠️ Customization

### Adjust Number of Records
Edit `seed_data.py`:
```python
create_products(db, num_products=1000)  # Default: 500
create_stores(db, num_stores=100)       # Default: 50
create_sales_data(db, ..., num_records=200000)  # Default: 100000
```

### Change Update Frequency
Edit `live_simulator.py`:
```python
time.sleep(5)  # Update every 5 seconds (default: 10)
```

### Modify Sales Volume
Edit in `live_simulator.py`:
```python
simulator.add_new_sales(num_sales=100)  # Default: 50
simulator.update_inventory(num_updates=50)  # Default: 30
```

---

## 🎬 Demo Tips

1. **Open frontend dashboard** before starting simulator
2. **Watch real-time changes** in:
   - Total sales counter
   - Recent sales list
   - Inventory low stock alerts
   - Dashboard charts

3. **Point out features**:
   - "Data updates every 10 seconds automatically"
   - "Notice the low stock alerts appearing"
   - "Sales patterns reflect real business hours"

4. **Show ML predictions** with fresh data continuously feeding the model

---

## 🐛 Troubleshooting

### "No products or stores found"
**Solution**: Run `seed_data.py` first

### "Database connection error"
**Solution**: Ensure backend database is set up and accessible

### "Module not found"
**Solution**: Run from `/backend` directory and ensure dependencies are installed

### Simulator not updating data
**Solution**: Check database connection and ensure tables exist

---

## 📝 Example Output

### Seeding Script
```
============================================================
IDFS Data Seeding Script
============================================================

Creating 500 products...
✓ Created 500 products

Creating 50 stores...
✓ Created 50 stores

Creating holiday calendar...
✓ Created 14 holidays

Generating 100000 sales records...
  → Inserted 5000/100000 sales records...
  → Inserted 10000/100000 sales records...
  ...
✓ Created 100000 sales records

Creating inventory records...
✓ Created 17500 inventory records

============================================================
✅ DATA SEEDING COMPLETE!
============================================================
```

### Live Simulator
```
============================================================
🔴 LIVE DATA SIMULATOR - IDFS
============================================================

📊 DATABASE STATS
  📦 Total Sales Records: 100,234
  🛍️  Today's Sales: 234
  📊 Inventory Items: 17,500
  ⚠️  Low Stock Alerts: 42
============================================================

🔄 Iteration #1 - 14:23:45
  ✅ Added 67 new sales records
  📦 Inventory updates:
     • Restocked: 8 items
     • Sold: 18 items
     • Low stock warnings: 4 items
  📊 Price adjusted for 4 trending products

⏱️  Waiting 10 seconds before next update...
```

---

Happy demonstrating! 🚀
