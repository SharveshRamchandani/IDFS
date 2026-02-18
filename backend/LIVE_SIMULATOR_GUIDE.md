# 🔴 LIVE SIMULATOR - NOW INTEGRATED!

## ✅ What Changed

The live data simulator is now **BUILT INTO** `main.py` and runs automatically when you start the backend!

### Before (Annoying):
```bash
# Terminal 1
python main.py

# Terminal 2 (had to run this separately - ANNOYING!)
python live_simulator.py
```

### Now (Easy):
```bash
# Just ONE command!
python main.py
```

That's it! The simulator starts automatically in the background! 🎉

---

## 🎛️ Control Options

### Enable/Disable Simulator

**In `.env` file:**
```bash
ENABLE_LIVE_SIMULATOR=true   # Simulator ON (default)
ENABLE_LIVE_SIMULATOR=false  # Simulator OFF
```

### When It Runs:
- ✅ Starts automatically 5 seconds after backend launches
- ✅ Runs in background (doesn't block API)
- ✅ Updates every 5-15 seconds (random intervals)
- ✅ Logs progress every 10 iterations

---

## 📊 What You'll See

### When Backend Starts:
```
🛠️ Initializing Database Tables...
Checking ML model status...

============================================================
🔴 STARTING LIVE DATA SIMULATOR
============================================================
Simulator will update data at random intervals (5-15s)
To disable: Set ENABLE_LIVE_SIMULATOR=false in .env
============================================================

✅ Live Simulator initialized with 500 products and 50 stores
INFO:     Application startup complete.
```

### Every 10 Updates:
```
📊 Simulator #10: +67 sales | Total: 100,234 | Today: 234
📊 Simulator #20: +54 sales | Total: 100,788 | Today: 788
📊 Simulator #30: +82 sales | Total: 101,370 | Today: 1,370
```

---

## 🚀 Quick Start Guide

### 1. First Time Setup (Seed Data)
```bash
cd backend
python seed_data.py
```
This creates 100,000+ records (run once)

### 2. Start Backend (Simulator Auto-Starts!)
```bash
python main.py
```
That's it! Simulator is running in background!

### 3. Open Frontend
```bash
cd frontend
npm run dev
```

### 4. Watch Live Updates! 📈
- Dashboard sales counter updates
- Inventory levels change
- Low stock alerts appear
- All happening automatically!

---

## ⚙️ Technical Details

### What It Does:
- **Sales**: Adds 30-80 new sales records per cycle
  - More during business hours (9 AM - 9 PM)
  - Random products/stores
  - 20% chance of promotion
  
- **Inventory**: Updates 20-50 items per cycle
  - Restocking (30% chance)
  - Stock depletion (60% chance)
  - Adjustments (10% chance)
  
- **Pricing**: Adjusts 3-5 product prices per cycle
  - ±5% price fluctuation
  - Simulates market dynamics

### Performance:
- Minimal CPU usage (< 1%)
- Non-blocking (runs async)
- Auto-recovers from errors
- Won't crash your backend

---

## 🛑 Disable/Enable On The Fly

### Disable:
Edit `.env`:
```bash
ENABLE_LIVE_SIMULATOR=false
```
Then restart backend.

### Re-enable:
Edit `.env`:
```bash
ENABLE_LIVE_SIMULATOR=true
```
Then restart backend.

---

## 🎬 Perfect for Demos!

### Before Demo:
1. Run `python seed_data.py` (if not done already)
2. Set `ENABLE_LIVE_SIMULATOR=true` in `.env`
3. Start backend: `python main.py`
4. Wait 10-30 seconds for some fresh data
5. Start frontend: `npm run dev`

### During Demo:
- Point out the terminal showing live updates
- Show frontend dashboard updating in real-time
- Highlight "random timing just like real life!"
- Demonstrate low stock alerts appearing

### After Demo:
- Set `ENABLE_LIVE_SIMULATOR=false` if you want to stop generating data

---

## 🐛 Troubleshooting

### "Live Simulator: No products/stores found"
**Solution**: Run `python seed_data.py` first

### Simulator not appearing in logs
**Check**: Is `ENABLE_LIVE_SIMULATOR=true` in `.env`?

### Want more/less frequent updates?
**Edit**: `app/main.py` line with `wait_time = random.randint(5, 15)`
- Change to `(2, 8)` for faster updates
- Change to `(10, 30)` for slower updates

### Want more/less sales per update?
**Edit**: `app/main.py` line with `num_sales = random.randint(30, 80)`
- Increase range for more activity

---

## 📁 Files Modified

✅ **`backend/app/main.py`** - Added `run_live_simulator()` background task
✅ **`backend/.env`** - Added `ENABLE_LIVE_SIMULATOR=true`

---

## 🎉 Benefits

### Single Command:
- No more managing multiple terminal windows!
- No more "oops I forgot to run the simulator!"

### Auto-Starts:
- Runs immediately when backend starts
- Perfect for demos (one less thing to remember)

### Controllable:
- Easy on/off switch via .env
- No code changes needed

### Production-Ready:
- Won't interfere with real deployments
- Just set `ENABLE_LIVE_SIMULATOR=false` in production

---

**That's it! Your live simulator is now fully integrated and ready to rock! 🚀**
