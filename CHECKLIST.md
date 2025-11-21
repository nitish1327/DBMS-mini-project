# ✅ Installation Checklist

Complete this checklist to ensure everything is set up correctly.

## Pre-Installation Requirements

- [ ] MySQL is installed and running
- [ ] Node.js is installed (check: `node --version`)
- [ ] npm is installed (check: `npm --version`)
- [ ] Python 3 or Node's http-server is available (for serving frontend)
- [ ] You have the gym_db.sql file

## Database Setup

- [ ] MySQL service is running
- [ ] Created gym_db database using gym_db.sql
- [ ] Verified database exists: `SHOW DATABASES;`
- [ ] Verified tables exist: `USE gym_db; SHOW TABLES;`
- [ ] Sample data is loaded in the database

## Backend Setup

### Installation
- [ ] Navigated to `gym-management-app/backend/` folder
- [ ] Ran `npm install` successfully
- [ ] All packages installed without errors

### Configuration
- [ ] Updated `.env` file with correct database credentials:
  - [ ] DB_HOST = localhost
  - [ ] DB_USER = root (or your username)
  - [ ] DB_PASSWORD = your_password
  - [ ] DB_NAME = gym_db
  - [ ] PORT = 3000

### Starting Server
- [ ] Ran `npm start`
- [ ] See message: "✓ Database connected successfully"
- [ ] See message: "🚀 Server running on http://localhost:3000"
- [ ] No error messages in console
- [ ] Backend terminal shows it's listening on port 3000

### Testing Backend
- [ ] Open browser and go to: `http://localhost:3000/api/facilities`
- [ ] See JSON data returned (should show gym facilities)
- [ ] No CORS errors in browser console

## Frontend Setup

### Serving Frontend
- [ ] Frontend files are in `gym-management-app/frontend/` folder
- [ ] `index.html`, `assets/css/style.css`, and `assets/js/script.js` exist

**Choose one method:**

#### Method 1: Python Server
- [ ] Have Python 3 installed
- [ ] Ran: `python -m http.server 8000`
- [ ] Server started successfully

#### Method 2: Node http-server
- [ ] Installed globally: `npm install -g http-server`
- [ ] Ran: `http-server -p 8000`
- [ ] Server started successfully

#### Method 3: Browser Direct
- [ ] Opened `index.html` directly in browser
- [ ] Page loads (may have CORS issues, but basic UI visible)

### Opening Frontend
- [ ] Opened browser to `http://localhost:8000` (or your server port)
- [ ] Page loads successfully
- [ ] No major errors in browser console
- [ ] Can see the sidebar with menu items

## Application Testing

### Basic Functionality
- [ ] Dashboard loads with statistics
- [ ] Can click different menu items (Members, Trainers, etc.)
- [ ] Tables display with sample data
- [ ] Can see data from database

### CRUD Operations - Facilities
- [ ] Can view all facilities in table
- [ ] Can click "Add Facility" and see form
- [ ] Can fill form and add new facility
- [ ] New facility appears in table
- [ ] Can click "Edit" and modify facility
- [ ] Can click "Delete" and remove facility

### CRUD Operations - Members
- [ ] Can view all members in table
- [ ] Can add new member with form
- [ ] Can edit member information
- [ ] Can delete member
- [ ] Member assignments to trainers work

### CRUD Operations - Trainers
- [ ] Can view all trainers
- [ ] Can add new trainer
- [ ] Can edit trainer details
- [ ] Can delete trainer
- [ ] Trainers are associated with facilities

### CRUD Operations - Equipment
- [ ] Can view all equipment
- [ ] Can add new equipment with muscle type
- [ ] Can edit equipment
- [ ] Can delete equipment
- [ ] Equipment linked to facility

### CRUD Operations - Schedules
- [ ] Can view all training schedules
- [ ] Can add schedule with date/time
- [ ] Can edit schedule
- [ ] Can delete schedule
- [ ] Schedules linked to trainers

### CRUD Operations - Staff & Fees
- [ ] Can add/edit/delete staff
- [ ] Can add/edit/delete fees
- [ ] All sections functional

### Dashboard
- [ ] Member count matches actual count
- [ ] Trainer count matches actual count
- [ ] Equipment count matches actual count
- [ ] Facility count matches actual count
- [ ] Numbers update after adding/deleting records

## Browser Console Check

- [ ] No red error messages
- [ ] No CORS warnings (if using proper HTTP server)
- [ ] API calls show 200 status codes

## Common Ports Check

- [ ] Backend: `http://localhost:3000` ✓
- [ ] Frontend: `http://localhost:8000` ✓
- [ ] MySQL: Default port 3306 (not directly accessed)

## Final Verification

- [ ] Can perform all CRUD operations
- [ ] Data persists in MySQL database
- [ ] Dashboard statistics update in real-time
- [ ] No console errors during operations
- [ ] All table columns display correctly
- [ ] Modal forms appear and work properly
- [ ] Can add data with required fields
- [ ] Validation works (empty fields rejected)

## Ready to Use! ✨

If you've checked all boxes above, your Gym Management System is ready!

### Next Steps:
1. Explore the dashboard
2. Add test data
3. Try all CRUD operations
4. Verify data in MySQL
5. Make customizations as needed

### Stuck? 
- Check QUICKSTART.md for step-by-step guide
- Check README.md for detailed documentation
- Verify all three services are running:
  1. MySQL (database)
  2. Node backend (npm start on port 3000)
  3. HTTP server for frontend (on port 8000)

---

**Good luck with your Gym Management System! 💪**
