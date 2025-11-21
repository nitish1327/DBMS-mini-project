# 🪟 WINDOWS SETUP GUIDE (EXACT COMMANDS)

## Step-by-Step for Windows PowerShell

### Step 1: Fix Database Connection (FIX YOUR ERROR)

**Your Error:**
```
Access denied for user 'root'@'localhost' (using password: NO)
```

**Fix (Choose One):**

#### Option A: If You DON'T Have a MySQL Password
1. Open `c:\DBMS_mini_project\gym-management-app\backend\.env` with Notepad
2. Make sure it looks exactly like this:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=gym_db
   PORT=3000
   NODE_ENV=development
   ```
3. Save file (Ctrl+S)

#### Option B: If You DO Have a MySQL Password
1. Open `c:\DBMS_mini_project\gym-management-app\backend\.env` with Notepad
2. Replace `DB_PASSWORD=` with your actual password:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password_here
   DB_NAME=gym_db
   PORT=3000
   NODE_ENV=development
   ```
3. **Example** (if password is "mysql123"):
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=mysql123
   DB_NAME=gym_db
   PORT=3000
   NODE_ENV=development
   ```
4. Save file (Ctrl+S)

---

### Step 2: Test MySQL Connection

Open PowerShell and run:

**If you have NO password:**
```powershell
mysql -u root
```
If it connects, type `exit` and continue.

**If you have a password:**
```powershell
mysql -u root -p
```
Then enter password when prompted. Type `exit` to quit.

---

### Step 3: Verify Database Exists

Open PowerShell and run:

**If no password:**
```powershell
mysql -u root -e "USE gym_db; SHOW TABLES;"
```

**If password:**
```powershell
mysql -u root -p -e "USE gym_db; SHOW TABLES;"
```

You should see 8 tables listed. If not, run:

```powershell
mysql -u root < C:\DBMS_mini_project\gym_db.sql
```

Or with password:

```powershell
mysql -u root -p < C:\DBMS_mini_project\gym_db.sql
```

---

### Step 4: Start Backend Server

Open PowerShell (as Administrator recommended):

```powershell
cd C:\DBMS_mini_project\gym-management-app\backend
npm start
```

**Expected Output:**
```
✓ Database connected successfully
🚀 Server running on http://localhost:3000
```

**If ERROR appears**, go back and fix `.env` file password!

---

### Step 5: Start Frontend Server

Open a **NEW PowerShell** window:

```powershell
cd C:\DBMS_mini_project\gym-management-app\frontend
python -m http.server 8000
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)
```

---

### Step 6: Open in Browser

Open your browser and go to:

```
http://localhost:8000
```

You should see:
- 💪 GymPro logo
- Sidebar with menu
- Dashboard with statistics (Member count, Trainer count, etc.)

---

## ✅ CRUD Operations (Already Implemented!)

All pages have full CRUD functionality:

### Click These Sections in Sidebar:

1. **🏢 Facilities**
   - Click "+ Add Facility" to create
   - Click "Edit" to update
   - Click "Delete" to remove
   - Table shows all facilities

2. **👥 Members**
   - Click "+ Add Member" to create
   - Click "Edit" to update
   - Click "Delete" to remove
   - Shows member details with trainer name

3. **🏋️ Trainers**
   - Click "+ Add Trainer" to create
   - Click "Edit" to update
   - Click "Delete" to remove
   - Shows gym assignment

4. **⚙️ Equipment**
   - Click "+ Add Equipment" to create
   - Click "Edit" to update
   - Click "Delete" to remove
   - Organized by facility

5. **📅 Schedules**
   - Click "+ Add Schedule" to create
   - Click "Edit" to update
   - Click "Delete" to remove
   - Shows trainer assignment

6. **👔 Staff**
   - Click "+ Add Staff" to create
   - Click "Edit" to update
   - Click "Delete" to remove
   - Organized by facility

7. **💳 Fees**
   - Click "+ Add Fee" to create
   - Click "Edit" to update
   - Click "Delete" to remove
   - Tracks payments

8. **📊 Dashboard**
   - Shows statistics
   - Updates in real-time

---

## 🔧 Common Windows Issues & Fixes

### Issue: npm command not found

**Fix:**
1. Install Node.js from https://nodejs.org/ (LTS version)
2. Restart PowerShell after installation

### Issue: MySQL not found

**Fix:**
1. Install MySQL from https://dev.mysql.com/downloads/mysql/
2. Make sure to install MySQL as a service
3. Restart PowerShell

### Issue: Python not found

**Fix - Option A: Use Node (Recommended)**
```powershell
npm install -g http-server
cd C:\DBMS_mini_project\gym-management-app\frontend
http-server -p 8000
```

**Fix - Option B: Install Python**
1. Download from https://www.python.org/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Restart PowerShell

### Issue: Port already in use

**Fix - Kill process on port 3000:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Then restart `npm start`

**Alternative: Use different port**
1. Edit `backend/.env`
2. Change: `PORT=3001`
3. Run: `npm start`
4. Backend will be on `http://localhost:3001`

### Issue: Permission denied

**Fix:**
1. Run PowerShell as Administrator
2. Or use Command Prompt (cmd) instead

### Issue: Still can't connect to database

**Fix - Reset MySQL password:**

1. Stop MySQL service:
```powershell
net stop MySQL80
```

2. Start without password requirements:
```powershell
mysqld --skip-grant-tables
```

3. In a new PowerShell:
```powershell
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
EXIT;
```

4. Start MySQL again:
```powershell
net start MySQL80
```

---

## 🎯 Complete Setup Checklist

- [ ] MySQL installed and running
- [ ] Node.js installed
- [ ] Python installed (or http-server)
- [ ] gym_db.sql imported into MySQL
- [ ] `.env` file has correct password
- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Dashboard shows statistics
- [ ] Can create a test facility
- [ ] Can edit the test facility
- [ ] Can delete the test facility

---

## 📋 All Commands (Copy & Paste Ready)

### 1. Fix Password in .env
```
Edit: C:\DBMS_mini_project\gym-management-app\backend\.env
Add your password
```

### 2. Verify Database
```powershell
mysql -u root -e "USE gym_db; SHOW TABLES;"
```

### 3. Start Backend
```powershell
cd C:\DBMS_mini_project\gym-management-app\backend
npm start
```

### 4. Start Frontend (in NEW PowerShell)
```powershell
cd C:\DBMS_mini_project\gym-management-app\frontend
python -m http.server 8000
```

### 5. Open Browser
```
http://localhost:8000
```

---

## 🚀 You're Ready!

Once all steps are complete:

1. ✅ Backend running on port 3000
2. ✅ Frontend running on port 8000  
3. ✅ Database connected
4. ✅ All CRUD operations working
5. ✅ Real-time dashboard updating

**Start managing your gym! 💪**

---

## 📞 Still Having Issues?

1. Check: `TROUBLESHOOTING.md`
2. Check: `DATABASE_CONNECTION_FIX.md`
3. Check: `CRUD_OPERATIONS_GUIDE.md`
4. Check browser console: **F12** → Console tab for errors

---

## ✨ All Features Available

- ✅ Create members, trainers, equipment, etc.
- ✅ View all data in tables
- ✅ Edit any record
- ✅ Delete records
- ✅ Mobile responsive
- ✅ Real-time updates
- ✅ Professional UI

**Enjoy! 🎉**
