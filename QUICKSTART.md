# 🚀 Quick Start Guide

## Step 1: Database Setup (Do this first!)

1. Open MySQL Command Line or MySQL Workbench
2. Run the SQL file to create the database:
   ```bash
   mysql -u root -p < path/to/gym_db.sql
   ```
   
   Or copy-paste the contents of `gym_db.sql` into MySQL

3. Verify the database was created:
   ```sql
   SHOW DATABASES;
   USE gym_db;
   SHOW TABLES;
   ```

## Step 2: Start the Backend Server

1. Open PowerShell/Command Prompt
2. Navigate to the backend folder:
   ```powershell
   cd path\to\gym-management-app\backend
   ```

3. Install dependencies (first time only):
   ```powershell
   npm install
   ```

4. Update the `.env` file with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=gym_db
   PORT=3000
   ```

5. Start the server:
   ```powershell
   npm start
   ```

   Expected output:
   ```
   ✓ Database connected successfully
   🚀 Server running on http://localhost:3000
   ```

## Step 3: Open the Frontend

**Option A: Direct File Open**
1. Navigate to `gym-management-app/frontend/`
2. Right-click on `index.html`
3. Select "Open with" → Your favorite browser
4. The app will load but may have CORS issues

**Option B: Using Python Server (Recommended)**
1. Open another PowerShell window
2. Navigate to the frontend folder:
   ```powershell
   cd path\to\gym-management-app\frontend
   ```

3. If you have Python 3.x installed:
   ```powershell
   python -m http.server 8000
   ```

4. Open browser and go to: `http://localhost:8000`

**Option C: Using Node.js (if already installed)**
1. Install http-server globally:
   ```powershell
   npm install -g http-server
   ```

2. Navigate to frontend folder and run:
   ```powershell
   http-server -p 8000
   ```

3. Open browser and go to: `http://localhost:8000`

## Step 4: Use the Application

1. You should see the Gym Management Dashboard
2. Click on any section in the left sidebar to view/manage data
3. Use "+ Add" buttons to create new records
4. Use "Edit" and "Delete" buttons for existing records

## 📊 Dashboard Overview

The dashboard shows:
- **Total Members** - Number of active members
- **Total Trainers** - Number of trainers
- **Total Equipment** - Number of equipment pieces
- **Total Facilities** - Number of gym facilities

## ⚡ Common Tasks

### Add a New Member
1. Click "👥 Members"
2. Click "+ Add Member"
3. Fill in all fields
4. Select a Gym and Trainer (optional)
5. Click "Save"

### Add a New Trainer
1. Click "🏋️ Trainers"
2. Click "+ Add Trainer"
3. Enter trainer details
4. Select a Gym
5. Click "Save"

### Add Equipment
1. Click "⚙️ Equipment"
2. Click "+ Add Equipment"
3. Enter equipment name and muscle type
4. Select a Gym
5. Click "Save"

### Add Training Schedule
1. Click "📅 Schedules"
2. Click "+ Add Schedule"
3. Fill in date, time, duration, details
4. Select a trainer
5. Click "Save"

### View All Data
Simply click on any section (Members, Trainers, Facilities, etc.) to see all records in a table format

## 🔍 Troubleshooting

### Backend won't start?
```
Error: connect ECONNREFUSED
```
- Make sure MySQL is running
- Check your `.env` file credentials
- Restart the MySQL service

### Can't see data in frontend?
- Check browser console (F12 → Console tab) for errors
- Make sure backend is running (`npm start`)
- Try refreshing the page (Ctrl+R or Cmd+R)
- Check if you're using the correct port (3000 for backend, 8000 for frontend)

### Getting CORS errors?
- Serve the frontend through an HTTP server (don't use file://)
- Make sure backend is running on http://localhost:3000
- Frontend should be on http://localhost:8000 (or similar)

### Database says "Access denied"?
- Check MySQL is running
- Verify username and password in `.env`
- Make sure gym_db database exists: `SHOW DATABASES;`

## 🎯 Next Steps

1. **Explore the Interface** - Click through different sections
2. **Add Test Data** - Create members, trainers, equipment
3. **Test CRUD Operations** - Try editing and deleting records
4. **View Dashboard** - Check statistics update in real-time

## 📱 Features to Try

- ✅ Add/Edit/Delete Members
- ✅ Add/Edit/Delete Trainers  
- ✅ Manage Equipment by Facility
- ✅ Schedule Training Sessions
- ✅ Track Staff
- ✅ Manage Fees
- ✅ View Real-time Dashboard Statistics

---

**All set! Your Gym Management System is ready to use! 💪**

Need help? Check the full README.md for detailed information!
