const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection().then(() => {
    console.log('✓ Database connected successfully');
}).catch(err => {
    console.error('✗ Database connection failed:', err.message);
});

// ==================== GYM FACILITY ROUTES ====================

// Get all facilities
app.get('/api/facilities', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [facilities] = await connection.query('SELECT * FROM GYM_Facility');
        connection.release();
        res.json(facilities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single facility
app.get('/api/facilities/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [facility] = await connection.query('SELECT * FROM GYM_Facility WHERE Gym_ID = ?', [req.params.id]);
        connection.release();
        res.json(facility[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create facility
app.post('/api/facilities', async (req, res) => {
    try {
        const { Gym_ID, Gym_Name, Gym_Location } = req.body;
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO GYM_Facility (Gym_ID, Gym_Name, Gym_Location) VALUES (?, ?, ?)', 
            [Gym_ID, Gym_Name, Gym_Location]);
        connection.release();
        res.json({ message: 'Facility created successfully', id: Gym_ID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update facility
app.put('/api/facilities/:id', async (req, res) => {
    try {
        const { Gym_Name, Gym_Location } = req.body;
        const connection = await pool.getConnection();
        await connection.query('UPDATE GYM_Facility SET Gym_Name = ?, Gym_Location = ? WHERE Gym_ID = ?', 
            [Gym_Name, Gym_Location, req.params.id]);
        connection.release();
        res.json({ message: 'Facility updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete facility
app.delete('/api/facilities/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM GYM_Facility WHERE Gym_ID = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Facility deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TRAINER ROUTES ====================

// Get all trainers
app.get('/api/trainers', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [trainers] = await connection.query(`
            SELECT t.*, g.Gym_Name 
            FROM Trainer t 
            LEFT JOIN GYM_Facility g ON t.Gym_ID = g.Gym_ID
        `);
        connection.release();
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single trainer
app.get('/api/trainers/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [trainer] = await connection.query(`
            SELECT t.*, g.Gym_Name 
            FROM Trainer t 
            LEFT JOIN GYM_Facility g ON t.Gym_ID = g.Gym_ID
            WHERE t.Tr_ID = ?
        `, [req.params.id]);
        connection.release();
        res.json(trainer[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create trainer
app.post('/api/trainers', async (req, res) => {
    try {
        const { Tr_ID, Tr_Name, Tr_Contact, Tr_Email, Gym_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO Trainer (Tr_ID, Tr_Name, Tr_Contact, Tr_Email, Gym_ID) VALUES (?, ?, ?, ?, ?)', 
            [Tr_ID, Tr_Name, Tr_Contact, Tr_Email, Gym_ID]);
        connection.release();
        res.json({ message: 'Trainer created successfully', id: Tr_ID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update trainer
app.put('/api/trainers/:id', async (req, res) => {
    try {
        const { Tr_Name, Tr_Contact, Tr_Email, Gym_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('UPDATE Trainer SET Tr_Name = ?, Tr_Contact = ?, Tr_Email = ?, Gym_ID = ? WHERE Tr_ID = ?', 
            [Tr_Name, Tr_Contact, Tr_Email, Gym_ID, req.params.id]);
        connection.release();
        res.json({ message: 'Trainer updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete trainer
app.delete('/api/trainers/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Trainer WHERE Tr_ID = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Trainer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== MEMBER ROUTES ====================

// Get all members
app.get('/api/members', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [members] = await connection.query(`
            SELECT m.*, g.Gym_Name, t.Tr_Name 
            FROM Member m 
            LEFT JOIN GYM_Facility g ON m.Gym_ID = g.Gym_ID
            LEFT JOIN Trainer t ON m.Tr_ID = t.Tr_ID
        `);
        connection.release();
        res.json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single member
app.get('/api/members/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [member] = await connection.query(`
            SELECT m.*, g.Gym_Name, t.Tr_Name 
            FROM Member m 
            LEFT JOIN GYM_Facility g ON m.Gym_ID = g.Gym_ID
            LEFT JOIN Trainer t ON m.Tr_ID = t.Tr_ID
            WHERE m.Memb_ID = ?
        `, [req.params.id]);
        connection.release();
        res.json(member[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create member
app.post('/api/members', async (req, res) => {
    try {
        const { Memb_ID, Memb_Name, Memb_Contact, Memb_Email, Gym_ID, Tr_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO Member (Memb_ID, Memb_Name, Memb_Contact, Memb_Email, Gym_ID, Tr_ID) VALUES (?, ?, ?, ?, ?, ?)', 
            [Memb_ID, Memb_Name, Memb_Contact, Memb_Email, Gym_ID, Tr_ID || null]);
        connection.release();
        res.json({ message: 'Member created successfully', id: Memb_ID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update member
app.put('/api/members/:id', async (req, res) => {
    try {
        const { Memb_Name, Memb_Contact, Memb_Email, Gym_ID, Tr_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('UPDATE Member SET Memb_Name = ?, Memb_Contact = ?, Memb_Email = ?, Gym_ID = ?, Tr_ID = ? WHERE Memb_ID = ?', 
            [Memb_Name, Memb_Contact, Memb_Email, Gym_ID, Tr_ID || null, req.params.id]);
        connection.release();
        res.json({ message: 'Member updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete member
app.delete('/api/members/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Member WHERE Memb_ID = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== EQUIPMENT ROUTES ====================

// Get all equipment
app.get('/api/equipment', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [equipment] = await connection.query(`
            SELECT e.*, g.Gym_Name 
            FROM Equipment e 
            LEFT JOIN GYM_Facility g ON e.Gym_ID = g.Gym_ID
        `);
        connection.release();
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single equipment
app.get('/api/equipment/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [equip] = await connection.query(`
            SELECT e.*, g.Gym_Name 
            FROM Equipment e 
            LEFT JOIN GYM_Facility g ON e.Gym_ID = g.Gym_ID
            WHERE e.Eq_ID = ?
        `, [req.params.id]);
        connection.release();
        res.json(equip[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create equipment
app.post('/api/equipment', async (req, res) => {
    try {
        const { Eq_ID, Eq_Name, Eq_Muscle_Type, Gym_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO Equipment (Eq_ID, Eq_Name, Eq_Muscle_Type, Gym_ID) VALUES (?, ?, ?, ?)', 
            [Eq_ID, Eq_Name, Eq_Muscle_Type, Gym_ID]);
        connection.release();
        res.json({ message: 'Equipment created successfully', id: Eq_ID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update equipment
app.put('/api/equipment/:id', async (req, res) => {
    try {
        const { Eq_Name, Eq_Muscle_Type, Gym_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('UPDATE Equipment SET Eq_Name = ?, Eq_Muscle_Type = ?, Gym_ID = ? WHERE Eq_ID = ?', 
            [Eq_Name, Eq_Muscle_Type, Gym_ID, req.params.id]);
        connection.release();
        res.json({ message: 'Equipment updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete equipment
app.delete('/api/equipment/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Equipment WHERE Eq_ID = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TRAINING SCHEDULE ROUTES ====================

// Get all schedules
app.get('/api/schedules', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [schedules] = await connection.query(`
            SELECT s.*, t.Tr_Name 
            FROM Training_Schedule s 
            LEFT JOIN Trainer t ON s.Tr_ID = t.Tr_ID
            ORDER BY s.Sess_Date DESC, s.Sess_Time DESC
        `);
        connection.release();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single schedule
app.get('/api/schedules/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [schedule] = await connection.query(`
            SELECT s.*, t.Tr_Name 
            FROM Training_Schedule s 
            LEFT JOIN Trainer t ON s.Tr_ID = t.Tr_ID
            WHERE s.Sess_ID = ?
        `, [req.params.id]);
        connection.release();
        res.json(schedule[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create schedule
app.post('/api/schedules', async (req, res) => {
    try {
        const { Sess_ID, Sess_Date, Sess_Time, Sess_Duration, Sess_Details, Tr_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO Training_Schedule (Sess_ID, Sess_Date, Sess_Time, Sess_Duration, Sess_Details, Tr_ID) VALUES (?, ?, ?, ?, ?, ?)', 
            [Sess_ID, Sess_Date, Sess_Time, Sess_Duration, Sess_Details, Tr_ID]);
        connection.release();
        res.json({ message: 'Schedule created successfully', id: Sess_ID });
    } catch (error) {
        // Check if it's a slot conflict error
        if (error.message && error.message.includes('SLOT_CONFLICT')) {
            // Extract trainer ID and date from error message
            const match = error.message.match(/Trainer ID (\d+).*?(\d{4}-\d{2}-\d{2})/);
            if (match) {
                const trainerId = match[1];
                const sessionDate = match[2];
                try {
                    const connection = await pool.getConnection();
                    const [freeSlots] = await connection.query(
                        'CALL sp_GetFreeSlots(?, ?)',
                        [trainerId, sessionDate]
                    );
                    connection.release();
                    return res.status(409).json({ 
                        error: error.message,
                        availableSlots: freeSlots
                    });
                } catch (slotError) {
                    console.error('Error fetching free slots:', slotError);
                    return res.status(409).json({ error: error.message });
                }
            }
        }
        res.status(500).json({ error: error.message });
    }
});

// Get trainer's free slots
app.get('/api/schedules/free-slots/:trainerId/:date', async (req, res) => {
    try {
        const { trainerId, date } = req.params;
        const connection = await pool.getConnection();
        const [freeSlots] = await connection.query(
            'CALL sp_GetFreeSlots(?, ?)',
            [trainerId, date]
        );
        connection.release();
        res.json(freeSlots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update schedule
app.put('/api/schedules/:id', async (req, res) => {
    try {
        const { Sess_Date, Sess_Time, Sess_Duration, Sess_Details, Tr_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('UPDATE Training_Schedule SET Sess_Date = ?, Sess_Time = ?, Sess_Duration = ?, Sess_Details = ?, Tr_ID = ? WHERE Sess_ID = ?', 
            [Sess_Date, Sess_Time, Sess_Duration, Sess_Details, Tr_ID, req.params.id]);
        connection.release();
        res.json({ message: 'Schedule updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete schedule
app.delete('/api/schedules/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Training_Schedule WHERE Sess_ID = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== STAFF ROUTES ====================

// Get all staff
app.get('/api/staff', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [staff] = await connection.query(`
            SELECT s.*, g.Gym_Name 
            FROM Staff s 
            LEFT JOIN GYM_Facility g ON s.Gym_ID = g.Gym_ID
        `);
        connection.release();
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create staff
app.post('/api/staff', async (req, res) => {
    try {
        const { St_ID, St_Name, St_Contact, St_Email, Gym_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO Staff (St_ID, St_Name, St_Contact, St_Email, Gym_ID) VALUES (?, ?, ?, ?, ?)', 
            [St_ID, St_Name, St_Contact, St_Email, Gym_ID]);
        connection.release();
        res.json({ message: 'Staff created successfully', id: St_ID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update staff
app.put('/api/staff/:id', async (req, res) => {
    try {
        const { St_Name, St_Contact, St_Email, Gym_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('UPDATE Staff SET St_Name = ?, St_Contact = ?, St_Email = ?, Gym_ID = ? WHERE St_ID = ?', 
            [St_Name, St_Contact, St_Email, Gym_ID, req.params.id]);
        connection.release();
        res.json({ message: 'Staff updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete staff
app.delete('/api/staff/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Staff WHERE St_ID = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== FEE ROUTES ====================

// Get all fees
app.get('/api/fees', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [fees] = await connection.query(`
            SELECT f.*, ts.Sess_Details 
            FROM Fee f 
            LEFT JOIN Training_Schedule ts ON f.Sess_ID = ts.Sess_ID
        `);
        connection.release();
        res.json(fees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create fee
app.post('/api/fees', async (req, res) => {
    try {
        const { Fee_ID, Fee_Amount, Fee_Date, Sess_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('INSERT INTO Fee (Fee_ID, Fee_Amount, Fee_Date, Sess_ID) VALUES (?, ?, ?, ?)', 
            [Fee_ID, Fee_Amount, Fee_Date, Sess_ID]);
        connection.release();
        res.json({ message: 'Fee created successfully', id: Fee_ID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update fee
app.put('/api/fees/:id', async (req, res) => {
    try {
        const { Fee_Amount, Fee_Date, Sess_ID } = req.body;
        const connection = await pool.getConnection();
        await connection.query('UPDATE Fee SET Fee_Amount = ?, Fee_Date = ?, Sess_ID = ? WHERE Fee_ID = ?', 
            [Fee_Amount, Fee_Date, Sess_ID, req.params.id]);
        connection.release();
        res.json({ message: 'Fee updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete fee
app.delete('/api/fees/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM Fee WHERE Fee_ID = ?', [req.params.id]);
        connection.release();
        res.json({ message: 'Fee deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
