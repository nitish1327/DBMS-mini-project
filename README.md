# 💪 Gym Management System - Web Application

A comprehensive, modern web application for managing gym facilities, memberships, trainers, schedules, equipment, and fees. Built with Node.js/Express backend and responsive frontend.

## 🚀 Features

✨ **Complete CRUD Operations** for:
- 🏢 Gym Facilities
- 👥 Members
- 🏋️ Trainers
- ⚙️ Equipment
- 📅 Training Schedules
- 👔 Staff
- 💳 Fees

✨ **Additional Features:**
- 📊 Dashboard with statistics
- 🎨 Modern, responsive UI
- 🔍 Data management with real-time updates
- 📱 Mobile-friendly design
- 🌐 RESTful API endpoints

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** (comes with Node.js)
- A modern web browser

## 🛠️ Setup Instructions

### 1. Database Setup

First, set up the MySQL database:

```bash
# Open MySQL command line or MySQL Workbench
# Run the gym_db.sql file to create the database and tables

mysql -u root -p < gym_db.sql
```

**Note:** Replace `root` with your MySQL username and password as needed.

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd gym-management-app/backend
npm install
```

**Configure Environment Variables:**

Edit the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=gym_db
PORT=3000
NODE_ENV=development
```

**Start the Backend Server:**

```bash
npm start
```

You should see: `🚀 Server running on http://localhost:3000`

### 3. Frontend Setup

The frontend doesn't require installation of dependencies - it uses vanilla JavaScript and CSS.

Simply open `frontend/index.html` in your web browser or serve it using a simple HTTP server:

**Option A: Using Python (if installed):**
```bash
cd gym-management-app/frontend
python -m http.server 8000
```

**Option B: Using Node.js http-server:**
```bash
npm install -g http-server
cd gym-management-app/frontend
http-server -p 8000
```

Then navigate to: `http://localhost:8000`

## 📊 API Endpoints

### Facilities
- `GET /api/facilities` - Get all facilities
- `GET /api/facilities/:id` - Get single facility
- `POST /api/facilities` - Create facility
- `PUT /api/facilities/:id` - Update facility
- `DELETE /api/facilities/:id` - Delete facility

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get single member
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get single trainer
- `POST /api/trainers` - Create trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

### Equipment
- `GET /api/equipment` - Get all equipment
- `GET /api/equipment/:id` - Get single equipment
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Training Schedules
- `GET /api/schedules` - Get all schedules
- `GET /api/schedules/:id` - Get single schedule
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Fees
- `GET /api/fees` - Get all fees
- `POST /api/fees` - Create fee
- `PUT /api/fees/:id` - Update fee
- `DELETE /api/fees/:id` - Delete fee

## 📂 Project Structure

```
gym-management-app/
├── backend/
│   ├── server.js          # Main Express server
│   ├── package.json       # Dependencies
│   └── .env              # Environment variables
└── frontend/
    ├── index.html         # Main HTML file
    └── assets/
        ├── css/
        │   └── style.css   # Styling
        └── js/
            └── script.js   # Frontend logic
```

## 🎨 UI Features

- **Sidebar Navigation** - Easy access to all sections
- **Dashboard** - Overview with key statistics
- **Data Tables** - Clean, organized data display
- **Modal Forms** - Add/Edit records in pop-up modals
- **Responsive Design** - Works on desktop and mobile devices
- **Modern Gradients** - Professional color scheme
- **Smooth Animations** - Enhanced user experience

## 🔧 Troubleshooting

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**Solution:** Make sure the backend server is running with `npm start`

### Database Connection Error
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:** Check your `.env` file credentials and MySQL is running

### CORS Error in Browser Console
**Solution:** Make sure both frontend and backend are running, and check that API_BASE in `script.js` is correct

### Port Already in Use
**Solution:** Change the PORT in `.env` file or kill the process using that port

## 📝 Usage Guide

### Adding a New Member
1. Click on "👥 Members" in the sidebar
2. Click "+ Add Member" button
3. Fill in the form fields
4. Select a gym and trainer (optional)
5. Click "Save"

### Editing Data
1. Navigate to the appropriate section
2. Find the record in the table
3. Click the "Edit" button
4. Modify the fields
5. Click "Save"

### Deleting Data
1. Navigate to the appropriate section
2. Find the record in the table
3. Click the "Delete" button
4. Confirm the deletion

### Viewing Dashboard
1. Click on "📊 Dashboard" in the sidebar
2. View statistics for all entities
3. Data updates in real-time

## 🔐 Security Notes

For production use:
- Add authentication/authorization
- Validate all inputs on backend
- Use HTTPS
- Implement rate limiting
- Add logging and error handling
- Use prepared statements (already implemented)

## 📚 Technologies Used

- **Backend:** Node.js, Express.js, MySQL2
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Database:** MySQL
- **API:** RESTful architecture

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📄 License

This project is open source and available for educational purposes.

## 📞 Support

For issues or questions, please check the troubleshooting section or review the error messages in the browser console and server logs.

---

**Happy Gym Management! 💪**
