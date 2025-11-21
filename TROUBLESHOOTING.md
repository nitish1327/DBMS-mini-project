# 🔧 QUICK TROUBLESHOOTING & REFERENCE

## 🚨 Common Issues & Solutions

### Issue 1: Database Connection Failed
```
Error: Access denied for user 'root'@'localhost' (using password: NO)
```

**Solution:**
1. Open: `backend/.env`
2. Add your MySQL password:
   ```env
   DB_PASSWORD=your_mysql_password
   ```
3. Restart backend: `npm start`

---

### Issue 2: API Not Responding
```
Error: Cannot read property 'status' of undefined
```

**Solutions:**
1. Make sure backend is running (`npm start`)
2. Check backend is on port 3000
3. Check frontend is accessing correct URL
4. Verify MySQL is running

---

### Issue 3: Frontend Not Loading Data
```
Tables are empty / No data showing
```

**Solutions:**
1. Check browser console (F12)
2. Verify backend server is running
3. Check that gym_db.sql was loaded
4. Try refreshing page (Ctrl+R)

---

### Issue 4: Modal Form Not Appearing
```
Click "Add" but nothing happens
```

**Solutions:**
1. Check browser console for errors
2. Verify JavaScript is enabled
3. Try different browser
4. Clear browser cache (Ctrl+Shift+Del)

---

### Issue 5: Changes Not Saving
```
Click "Save" but data doesn't persist
```

**Solutions:**
1. Check database is running
2. Verify password in .env is correct
3. Check backend console for errors
4. Verify table structure in MySQL

---

### Issue 6: Port Already in Use
```
Error: Port 3000 already in use
```

**Solutions:**
1. Change PORT in .env to 3001
2. Or kill process on port 3000:
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

---

### Issue 7: MySQL Service Not Running
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions (Windows):**
1. Open Services (services.msc)
2. Find MySQL service
3. Right-click → Start
4. Or use Terminal:
   ```bash
   net start MySQL80
   ```

---

### Issue 8: npm install Failed
```
Error during npm install
```

**Solutions:**
1. Delete node_modules folder
2. Delete package-lock.json
3. Run: `npm install` again
4. Or use: `npm install --legacy-peer-deps`

---

## ✅ CRUD Operations Quick Reference

### All Operations Available On:
- 🏢 Facilities
- 👥 Members
- 🏋️ Trainers
- ⚙️ Equipment
- 📅 Schedules
- 👔 Staff
- 💳 Fees

### CREATE (Add New)
1. Click "+ Add [Entity]"
2. Fill form fields
3. Click "Save"

### READ (View)
- Table displays all records
- Shows related info (names, descriptions)
- Sortable by clicking headers (if enabled)

### UPDATE (Edit)
1. Click "Edit" on any row
2. Modify fields
3. Click "Save"

### DELETE (Remove)
1. Click "Delete" on any row
2. Confirm when prompted
3. Record removed

---

## 📱 Browser Check

**Open Developer Console: F12**

### Look for:
- ✅ No red errors
- ✅ Network requests success (200 status)
- ✅ No CORS warnings
- ✅ API responses showing data

### Common Console Errors to Watch For:
```javascript
// ✓ Good - data loaded
[GET] /api/members - 200 OK
{Memb_ID: 1, Memb_Name: "John", ...}

// ✗ Bad - connection failed
[GET] /api/members - Failed to fetch
TypeError: Cannot read property...

// ✗ Bad - server not responding
[GET] http://localhost:3000/api/members - ERR_CONNECTION_REFUSED
```

---

## 🔄 Quick Restart Steps

If something isn't working:

1. **Stop Backend** (in terminal: Ctrl+C)
2. **Stop Frontend** (in terminal: Ctrl+C)
3. **Verify MySQL running**:
   ```bash
   mysql -u root
   ```
4. **Restart Backend**:
   ```bash
   npm start
   ```
5. **Restart Frontend**:
   ```bash
   python -m http.server 8000
   ```
6. **Refresh Browser** (Ctrl+R or Cmd+R)

---

## 📊 Verification Checklist

Before using the system:

- [ ] MySQL is running
- [ ] Database `gym_db` exists (check with `USE gym_db;`)
- [ ] `.env` file has correct password
- [ ] Backend running on port 3000 (`npm start`)
- [ ] Frontend accessible on port 8000
- [ ] Browser console has no errors (F12)
- [ ] Can see sample data in tables
- [ ] Dashboard shows statistics > 0

---

## 🎯 Test CRUD Operations

### Quick 2-Minute Test

1. **Create**: 
   - Go to Facilities
   - Click "+ Add Facility"
   - Enter: ID=999, Name="Test", Location="Test"
   - Click Save → Should appear in table ✓

2. **Read**: 
   - See table with all facilities ✓

3. **Update**: 
   - Click Edit on your test facility
   - Change name to "Test Updated"
   - Click Save → Table updates ✓

4. **Delete**: 
   - Click Delete on test facility
   - Confirm → Removed from table ✓

---

## 🌐 URL Reference

| Component | URL | Port |
|-----------|-----|------|
| Backend API | http://localhost:3000 | 3000 |
| Frontend | http://localhost:8000 | 8000 |
| MySQL | localhost | 3306 |

---

## 📝 File Locations

```
c:\DBMS_mini_project\
├── gym_db.sql (Run this first)
└── gym-management-app\
    ├── backend/
    │  ├── server.js (Main API)
    │  ├── package.json (Dependencies)
    │  └── .env (YOUR PASSWORD HERE)
    └── frontend/
       ├── index.html
       └── assets/
          ├── css/style.css
          └── js/script.js
```

---

## 🔑 Important Files to Know

| File | Purpose | Edit? |
|------|---------|-------|
| `.env` | Database credentials | ✅ YES - Add password |
| `server.js` | API server | ❌ No (unless customizing) |
| `index.html` | UI structure | ✅ Yes (if adding features) |
| `script.js` | Frontend logic | ✅ Yes (if modifying) |
| `style.css` | Styling | ✅ Yes (if customizing design) |

---

## 💡 Pro Tips

1. **Check API directly**: Open `http://localhost:3000/api/members` in browser
   - Should show JSON data if backend is working

2. **Check database**: Open terminal and run:
   ```bash
   mysql -u root -p
   USE gym_db;
   SELECT * FROM Member;
   EXIT;
   ```

3. **Check errors in detail**: Open `backend/server.js` and look for error messages

4. **Use incognito mode**: If data seems cached, try private/incognito browsing

5. **Clear cache**: Ctrl+Shift+Del in browser to clear cache

---

## 📞 Help Resources

| Issue | Check |
|-------|-------|
| No data showing | README.md or CRUD_OPERATIONS_GUIDE.md |
| Setup problems | QUICKSTART.md or DATABASE_CONNECTION_FIX.md |
| How to use | FEATURES_GUIDE.md |
| System design | ARCHITECTURE.md |
| All files | FILE_INDEX.md |

---

## ✅ When It's Working

You'll see:

1. **Backend Terminal**:
   ```
   ✓ Database connected successfully
   🚀 Server running on http://localhost:3000
   ```

2. **Frontend Load**:
   - Logo "💪 GymPro" visible
   - Sidebar with menu items visible
   - Dashboard showing numbers (members, trainers, etc.)

3. **No Errors**:
   - Browser console (F12) shows no red errors
   - Network tab shows 200/201 status codes

4. **CRUD Works**:
   - Can create, read, update, delete records
   - Tables update in real-time
   - Dashboard numbers change

---

## 🎉 Ready to Go!

Once everything is working:
1. You have full CRUD on all 7 entities
2. Real-time dashboard updates
3. Mobile-responsive interface
4. Professional system ready to use

**Enjoy managing your gym! 💪**
