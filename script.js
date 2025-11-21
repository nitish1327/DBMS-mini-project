const API_BASE = 'http://localhost:3000/api';
let currentEditingId = null;
let currentEditingType = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadFacilities();
});

// ==================== NAVIGATION ====================
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');

    switch(sectionId) {
        case 'facilities': loadFacilities(); break;
        case 'members': loadMembers(); break;
        case 'trainers': loadTrainers(); break;
        case 'equipment': loadEquipment(); break;
        case 'schedules': loadSchedules(); break;
        case 'staff': loadStaff(); break;
        case 'fees': loadFees(); break;
    }
}

// ==================== SCHEDULES WITH CONFLICT DETECTION ====================
async function loadSchedules() {
    try {
        const response = await fetch(`${API_BASE}/schedules`);
        const schedules = await response.json();
        const tbody = document.getElementById('schedules-table');
        
        tbody.innerHTML = schedules.map(s => `
            <tr>
                <td>${s.Sess_ID}</td>
                <td>${formatDate(s.Sess_Date)}</td>
                <td>${s.Sess_Time}</td>
                <td>${s.Sess_Duration}</td>
                <td>${s.Sess_Details}</td>
                <td>${s.Tr_Name || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editSchedule(${s.Sess_ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteSchedule(${s.Sess_ID})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
}

function openScheduleModal(id = null) {
    currentEditingId = id;
    currentEditingType = 'schedule';
    
    const form = document.getElementById('modal-form');
    
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Schedule';
        fetchAndFillScheduleForm(id, form);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Schedule';
        fetch(`${API_BASE}/trainers`).then(r => r.json()).then(trainers => {
            form.innerHTML = `
                <div class="form-group">
                    <label>Session ID</label>
                    <input type="number" id="Sess_ID" required>
                </div>
                <div class="form-group">
                    <label>Trainer</label>
                    <select id="Tr_ID" required onchange="checkTrainerAvailability()">
                        <option value="">Select Trainer</option>
                        ${trainers.map(t => `<option value="${t.Tr_ID}">${t.Tr_Name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="Sess_Date" required onchange="checkTrainerAvailability()">
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <input type="time" id="Sess_Time" required onchange="checkTrainerAvailability()">
                </div>
                <div class="form-group">
                    <label>Duration (minutes)</label>
                    <input type="number" id="Sess_Duration" required>
                </div>
                <div class="form-group">
                    <label>Details</label>
                    <textarea id="Sess_Details" required></textarea>
                </div>
                <div id="availability-info" style="margin-top: 20px;"></div>
            `;
            addModalActions(form);
        });
    }
    
    document.getElementById('modal').style.display = 'block';
}

async function checkTrainerAvailability() {
    const trainerId = document.getElementById('Tr_ID')?.value;
    const date = document.getElementById('Sess_Date')?.value;
    const time = document.getElementById('Sess_Time')?.value;
    
    if (!trainerId || !date || !time) {
        document.getElementById('availability-info').innerHTML = '';
        return;
    }
    
    try {
        // Call the API to check booking availability
        const response = await fetch(`${API_BASE}/check-booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trainer_id: trainerId,
                session_date: date,
                session_time: time
            })
        });
        
        const result = await response.json();
        const infoDiv = document.getElementById('availability-info');
        
        if (result.is_available) {
            infoDiv.innerHTML = `
                <div style="padding: 15px; background: #d4edda; border: 2px solid #28a745; border-radius: 8px; color: #155724;">
                    <strong>✅ Available!</strong> This time slot is free for the selected trainer.
                </div>
            `;
        } else {
            // Fetch free slots and alternative trainers
            const [freeSlotsRes, altTrainersRes] = await Promise.all([
                fetch(`${API_BASE}/free-slots`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trainer_id: trainerId, session_date: date })
                }),
                fetch(`${API_BASE}/alternative-trainers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        trainer_id: trainerId,
                        session_date: date,
                        slot_number: result.requested_slot
                    })
                })
            ]);
            
            const freeSlots = await freeSlotsRes.json();
            const altTrainers = await altTrainersRes.json();
            
            infoDiv.innerHTML = `
                <div style="padding: 15px; background: #f8d7da; border: 2px solid #dc3545; border-radius: 8px; color: #721c24; margin-bottom: 15px;">
                    <strong>❌ Booking Conflict!</strong><br>
                    ${result.trainer_name} is already booked for this time slot.
                </div>
                
                <div style="background: white; border: 2px solid #007bff; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="color: #007bff; margin-bottom: 10px;">📅 Available Slots for ${result.trainer_name} on ${formatDate(date)}</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        ${freeSlots.map(slot => `
                            <div style="padding: 10px; background: ${slot.is_available ? '#d4edda' : '#f8d7da'}; 
                                        border-radius: 6px; text-align: center; cursor: ${slot.is_available ? 'pointer' : 'default'};"
                                 onclick="${slot.is_available ? `selectTimeSlot('${slot.slot_start_time}')` : ''}">
                                <strong>${slot.slot_time_range}</strong><br>
                                <span style="font-size: 12px;">${slot.is_available ? '✅ Available' : '❌ Booked'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${altTrainers.length > 0 ? `
                    <div style="background: white; border: 2px solid #28a745; border-radius: 8px; padding: 15px;">
                        <h4 style="color: #28a745; margin-bottom: 10px;">👥 Alternative Trainers Available for ${result.error_message?.includes('Slot') ? 'this' : 'the requested'} Time Slot</h4>
                        <div style="display: grid; gap: 10px;">
                            ${altTrainers.map(trainer => `
                                <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #28a745; border-radius: 4px; cursor: pointer;"
                                     onclick="selectAlternativeTrainer(${trainer.trainer_id}, '${trainer.trainer_name}')">
                                    <strong>${trainer.trainer_name}</strong><br>
                                    <small style="color: #666;">
                                        ${trainer.gym_name} - ${trainer.gym_location}<br>
                                        📧 ${trainer.trainer_email} | 📞 ${trainer.trainer_contact}
                                    </small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        document.getElementById('availability-info').innerHTML = `
            <div style="padding: 15px; background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; color: #856404;">
                <strong>⚠️ Unable to check availability.</strong> Please try again.
            </div>
        `;
    }
}

function selectTimeSlot(time) {
    document.getElementById('Sess_Time').value = time;
    checkTrainerAvailability();
}

function selectAlternativeTrainer(trainerId, trainerName) {
    if (confirm(`Switch to trainer: ${trainerName}?`)) {
        document.getElementById('Tr_ID').value = trainerId;
        checkTrainerAvailability();
    }
}

async function editSchedule(id) {
    openScheduleModal(id);
}

async function deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this schedule?')) {
        try {
            await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
            loadSchedules();
        } catch (error) {
            alert('Error deleting schedule: ' + error.message);
        }
    }
}

// ==================== OTHER SECTIONS (UNCHANGED) ====================
async function loadFacilities() {
    try {
        const response = await fetch(`${API_BASE}/facilities`);
        const facilities = await response.json();
        const tbody = document.getElementById('facilities-table');
        
        tbody.innerHTML = facilities.map(f => `
            <tr>
                <td>${f.Gym_ID}</td>
                <td>${f.Gym_Name}</td>
                <td>${f.Gym_Location}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editFacility(${f.Gym_ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteFacility(${f.Gym_ID})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading facilities:', error);
    }
}

function openFacilityModal(id = null) {
    currentEditingId = id;
    currentEditingType = 'facility';
    
    const form = document.getElementById('modal-form');
    form.innerHTML = '';
    
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Facility';
        fetchAndFillForm(`${API_BASE}/facilities/${id}`, form, ['Gym_Name', 'Gym_Location']);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Facility';
        form.innerHTML = `
            <div class="form-group">
                <label>Gym ID</label>
                <input type="number" id="Gym_ID" required>
            </div>
            <div class="form-group">
                <label>Gym Name</label>
                <input type="text" id="Gym_Name" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" id="Gym_Location" required>
            </div>
        `;
        addModalActions(form);
    }
    
    document.getElementById('modal').style.display = 'block';
}

async function editFacility(id) {
    openFacilityModal(id);
}

async function deleteFacility(id) {
    if (confirm('Are you sure you want to delete this facility?')) {
        try {
            await fetch(`${API_BASE}/facilities/${id}`, { method: 'DELETE' });
            loadFacilities();
        } catch (error) {
            alert('Error deleting facility: ' + error.message);
        }
    }
}

// ==================== MEMBERS ====================
async function loadMembers() {
    try {
        const response = await fetch(`${API_BASE}/members`);
        const members = await response.json();
        const tbody = document.getElementById('members-table');
        
        tbody.innerHTML = members.map(m => `
            <tr>
                <td>${m.Memb_ID}</td>
                <td>${m.Memb_Name}</td>
                <td>${m.Memb_Email}</td>
                <td>${m.Memb_Contact}</td>
                <td>${m.Gym_Name || 'N/A'}</td>
                <td>${m.Tr_Name || 'Unassigned'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editMember(${m.Memb_ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteMember(${m.Memb_ID})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

function openMemberModal(id = null) {
    currentEditingId = id;
    currentEditingType = 'member';
    
    const form = document.getElementById('modal-form');
    
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Member';
        fetchAndFillFormWithSelects(`${API_BASE}/members/${id}`, form, ['Memb_Name', 'Memb_Contact', 'Memb_Email', 'Gym_ID', 'Tr_ID']);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Member';
        loadFacilitiesAndTrainers().then(([facilities, trainers]) => {
            form.innerHTML = `
                <div class="form-group">
                    <label>Member ID</label>
                    <input type="number" id="Memb_ID" required>
                </div>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="Memb_Name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="Memb_Email" required>
                </div>
                <div class="form-group">
                    <label>Contact</label>
                    <input type="tel" id="Memb_Contact" required>
                </div>
                <div class="form-group">
                    <label>Gym</label>
                    <select id="Gym_ID" required>
                        <option value="">Select Gym</option>
                        ${facilities.map(f => `<option value="${f.Gym_ID}">${f.Gym_Name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Trainer (Optional)</label>
                    <select id="Tr_ID">
                        <option value="">Select Trainer</option>
                        ${trainers.map(t => `<option value="${t.Tr_ID}">${t.Tr_Name}</option>`).join('')}
                    </select>
                </div>
            `;
            addModalActions(form);
        });
    }
    
    document.getElementById('modal').style.display = 'block';
}

async function editMember(id) {
    openMemberModal(id);
}

async function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            await fetch(`${API_BASE}/members/${id}`, { method: 'DELETE' });
            loadMembers();
        } catch (error) {
            alert('Error deleting member: ' + error.message);
        }
    }
}

// ==================== TRAINERS ====================
async function loadTrainers() {
    try {
        const response = await fetch(`${API_BASE}/trainers`);
        const trainers = await response.json();
        const tbody = document.getElementById('trainers-table');
        
        tbody.innerHTML = trainers.map(t => `
            <tr>
                <td>
                    <button class="expand-btn" onclick="toggleTrainerDetails(this, ${t.Tr_ID})">▼</button>
                </td>
                <td>${t.Tr_ID}</td>
                <td>${t.Tr_Name}</td>
                <td>${t.Tr_Email}</td>
                <td>${t.Tr_Contact}</td>
                <td>${t.Gym_Name || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editTrainer(${t.Tr_ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteTrainer(${t.Tr_ID})">Delete</button>
                    </div>
                </td>
            </tr>
            <tr class="details-row" id="details-${t.Tr_ID}">
                <td colspan="7">
                    <div class="details-cell">
                        <div class="trainer-details">
                            <div class="members-section">
                                <h4>👥 Members Under This Trainer</h4>
                                <ul class="members-list" id="members-list-${t.Tr_ID}">
                                    <li class="no-data">Loading...</li>
                                </ul>
                            </div>
                            <div class="sessions-section">
                                <h4>📅 Booked Sessions</h4>
                                <ul class="sessions-list" id="sessions-list-${t.Tr_ID}">
                                    <li class="no-data">Loading...</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading trainers:', error);
    }
}

async function toggleTrainerDetails(button, trainerId) {
    const detailsRow = document.getElementById(`details-${trainerId}`);
    button.classList.toggle('expanded');
    detailsRow.classList.toggle('show');
    
    if (detailsRow.classList.contains('show') && !detailsRow.dataset.loaded) {
        await loadTrainerDetails(trainerId);
        detailsRow.dataset.loaded = 'true';
    }
}

async function loadTrainerDetails(trainerId) {
    try {
        const membersResponse = await fetch(`${API_BASE}/members`);
        const allMembers = await membersResponse.json();
        const trainerMembers = allMembers.filter(m => m.Tr_ID === trainerId);
        
        const schedulesResponse = await fetch(`${API_BASE}/schedules`);
        const allSchedules = await schedulesResponse.json();
        const trainerSchedules = allSchedules.filter(s => s.Tr_ID === trainerId);
        
        const membersList = document.getElementById(`members-list-${trainerId}`);
        if (trainerMembers.length > 0) {
            membersList.innerHTML = trainerMembers.map(m => `
                <li>
                    <strong>${m.Memb_Name}</strong>
                    <div style="font-size: 12px; color: #666;">Email: ${m.Memb_Email}</div>
                </li>
            `).join('');
        } else {
            membersList.innerHTML = '<li class="no-data">No members assigned yet</li>';
        }
        
        const sessionsList = document.getElementById(`sessions-list-${trainerId}`);
        if (trainerSchedules.length > 0) {
            sessionsList.innerHTML = trainerSchedules.map(s => `
                <li>
                    <strong>${s.Sess_Details}</strong>
                    <span class="session-info">
                        📅 ${s.Sess_Date} | 🕐 ${s.Sess_Time} | ⏱️ ${s.Sess_Duration} min
                    </span>
                </li>
            `).join('');
        } else {
            sessionsList.innerHTML = '<li class="no-data">No sessions scheduled yet</li>';
        }
    } catch (error) {
        console.error('Error loading trainer details:', error);
        document.getElementById(`members-list-${trainerId}`).innerHTML = '<li class="no-data">Error loading data</li>';
        document.getElementById(`sessions-list-${trainerId}`).innerHTML = '<li class="no-data">Error loading data</li>';
    }
}

function openTrainerModal(id = null) {
    currentEditingId = id;
    currentEditingType = 'trainer';
    
    const form = document.getElementById('modal-form');
    
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Trainer';
        fetchAndFillFormWithSelects(`${API_BASE}/trainers/${id}`, form, ['Tr_Name', 'Tr_Contact', 'Tr_Email', 'Gym_ID']);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Trainer';
        fetch(`${API_BASE}/facilities`).then(r => r.json()).then(facilities => {
            form.innerHTML = `
                <div class="form-group">
                    <label>Trainer ID</label>
                    <input type="number" id="Tr_ID" required>
                </div>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="Tr_Name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="Tr_Email" required>
                </div>
                <div class="form-group">
                    <label>Contact</label>
                    <input type="tel" id="Tr_Contact" required>
                </div>
                <div class="form-group">
                    <label>Gym</label>
                    <select id="Gym_ID" required>
                        <option value="">Select Gym</option>
                        ${facilities.map(f => `<option value="${f.Gym_ID}">${f.Gym_Name}</option>`).join('')}
                    </select>
                </div>
            `;
            addModalActions(form);
        });
    }
    
    document.getElementById('modal').style.display = 'block';
}

async function editTrainer(id) {
    openTrainerModal(id);
}

async function deleteTrainer(id) {
    if (confirm('Are you sure you want to delete this trainer?')) {
        try {
            await fetch(`${API_BASE}/trainers/${id}`, { method: 'DELETE' });
            loadTrainers();
        } catch (error) {
            alert('Error deleting trainer: ' + error.message);
        }
    }
}

// ==================== EQUIPMENT ====================
async function loadEquipment() {
    try {
        const response = await fetch(`${API_BASE}/equipment`);
        const equipment = await response.json();
        const tbody = document.getElementById('equipment-table');
        
        tbody.innerHTML = equipment.map(e => `
            <tr>
                <td>${e.Eq_ID}</td>
                <td>${e.Eq_Name}</td>
                <td>${e.Eq_Muscle_Type}</td>
                <td>${e.Gym_Name || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editEquipment(${e.Eq_ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteEquipment(${e.Eq_ID})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading equipment:', error);
    }
}

function openEquipmentModal(id = null) {
    currentEditingId = id;
    currentEditingType = 'equipment';
    
    const form = document.getElementById('modal-form');
    
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Equipment';
        fetchAndFillFormWithSelects(`${API_BASE}/equipment/${id}`, form, ['Eq_Name', 'Eq_Muscle_Type', 'Gym_ID']);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Equipment';
        fetch(`${API_BASE}/facilities`).then(r => r.json()).then(facilities => {
            form.innerHTML = `
                <div class="form-group">
                    <label>Equipment ID</label>
                    <input type="number" id="Eq_ID" required>
                </div>
                <div class="form-group">
                    <label>Equipment Name</label>
                    <input type="text" id="Eq_Name" required>
                </div>
                <div class="form-group">
                    <label>Muscle Type</label>
                    <input type="text" id="Eq_Muscle_Type" placeholder="e.g., Cardio, Legs, Arms" required>
                </div>
                <div class="form-group">
                    <label>Gym</label>
                    <select id="Gym_ID" required>
                        <option value="">Select Gym</option>
                        ${facilities.map(f => `<option value="${f.Gym_ID}">${f.Gym_Name}</option>`).join('')}
                    </select>
                </div>
            `;
            addModalActions(form);
        });
    }
    
    document.getElementById('modal').style.display = 'block';
}

async function editEquipment(id) {
    openEquipmentModal(id);
}

async function deleteEquipment(id) {
    if (confirm('Are you sure you want to delete this equipment?')) {
        try {
            await fetch(`${API_BASE}/equipment/${id}`, { method: 'DELETE' });
            loadEquipment();
        } catch (error) {
            alert('Error deleting equipment: ' + error.message);
        }
    }
}

// ==================== STAFF ====================
async function loadStaff() {
    try {
        const response = await fetch(`${API_BASE}/staff`);
        const staff = await response.json();
        const tbody = document.getElementById('staff-table');
        
        tbody.innerHTML = staff.map(s => `
            <tr>
                <td>${s.St_ID}</td>
                <td>${s.St_Name}</td>
                <td>${s.St_Email}</td>
                <td>${s.St_Contact}</td>
                <td>${s.Gym_Name || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editStaff(${s.St_ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteStaff(${s.St_ID})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

function openStaffModal(id = null) {
    currentEditingId = id;
    currentEditingType = 'staff';
    
    const form = document.getElementById('modal-form');
    
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Staff';
        fetchAndFillFormWithSelects(`${API_BASE}/staff/${id}`, form, ['St_Name', 'St_Contact', 'St_Email', 'Gym_ID']);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Staff';
        fetch(`${API_BASE}/facilities`).then(r => r.json()).then(facilities => {
            form.innerHTML = `
                <div class="form-group">
                    <label>Staff ID</label>
                    <input type="number" id="St_ID" required>
                </div>
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="St_Name" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="St_Email" required>
                </div>
                <div class="form-group">
                    <label>Contact</label>
                    <input type="tel" id="St_Contact" required>
                </div>
                <div class="form-group">
                    <label>Gym</label>
                    <select id="Gym_ID" required>
                        <option value="">Select Gym</option>
                        ${facilities.map(f => `<option value="${f.Gym_ID}">${f.Gym_Name}</option>`).join('')}
                    </select>
                </div>
            `;
            addModalActions(form);
        });
    }
    
    document.getElementById('modal').style.display = 'block';
}

async function editStaff(id) {
    openStaffModal(id);
}

async function deleteStaff(id) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        try {
            await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
            loadStaff();
        } catch (error) {
            alert('Error deleting staff: ' + error.message);
        }
    }
}

// ==================== FEES ====================
async function loadFees() {
    try {
        const response = await fetch(`${API_BASE}/fees`);
        const fees = await response.json();
        const tbody = document.getElementById('fees-table');
        
        tbody.innerHTML = fees.map(f => `
            <tr>
                <td>${f.Fee_ID}</td>
                <td>${f.Fee_Amount}</td>
                <td>${formatDate(f.Fee_Date)}</td>
                <td>${f.Sess_Details || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="editFee(${f.Fee_ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteFee(${f.Fee_ID})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading fees:', error);
    }
}

function openFeeModal(id = null) {
    currentEditingId = id;
    currentEditingType = 'fee';
    
    const form = document.getElementById('modal-form');
    
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Fee';
        fetchAndFillFormWithSelects(`${API_BASE}/fees/${id}`, form, ['Fee_Amount', 'Fee_Date', 'Sess_ID']);
    } else {
        document.getElementById('modal-title').textContent = 'Add New Fee';
        fetch(`${API_BASE}/schedules`).then(r => r.json()).then(schedules => {
            form.innerHTML = `
                <div class="form-group">
                    <label>Fee ID</label>
                    <input type="number" id="Fee_ID" required>
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input type="number" id="Fee_Amount" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="Fee_Date" required>
                </div>
                <div class="form-group">
                    <label>Session</label>
                    <select id="Sess_ID" required>
                        <option value="">Select Session</option>
                        ${schedules.map(s => `<option value="${s.Sess_ID}">Session ${s.Sess_ID} - ${s.Sess_Details}</option>`).join('')}
                    </select>
                </div>
            `;
            addModalActions(form);
        });
    }
    
    document.getElementById('modal').style.display = 'block';
}

async function editFee(id) {
    openFeeModal(id);
}

async function deleteFee(id) {
    if (confirm('Are you sure you want to delete this fee?')) {
        try {
            await fetch(`${API_BASE}/fees/${id}`, { method: 'DELETE' });
            loadFees();
        } catch (error) {
            alert('Error deleting fee: ' + error.message);
        }
    }
}

// ==================== FORM SUBMISSION ====================
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('modal-form');
    const inputs = form.querySelectorAll('input, select, textarea');
    const submitData = {};
    
    inputs.forEach(input => {
        if (input.id) {
            submitData[input.id] = input.value || null;
        }
    });

    try {
        let method = 'POST';
        let url = `${API_BASE}`;
        
        if (currentEditingType === 'facility') {
            url += '/facilities';
            if (currentEditingId) {
                method = 'PUT';
                url += `/${currentEditingId}`;
            }
        } else if (currentEditingType === 'member') {
            url += '/members';
            if (currentEditingId) {
                method = 'PUT';
                url += `/${currentEditingId}`;
            }
        } else if (currentEditingType === 'trainer') {
            url += '/trainers';
            if (currentEditingId) {
                method = 'PUT';
                url += `/${currentEditingId}`;
            }
        } else if (currentEditingType === 'equipment') {
            url += '/equipment';
            if (currentEditingId) {
                method = 'PUT';
                url += `/${currentEditingId}`;
            }
        } else if (currentEditingType === 'schedule') {
            url += '/schedules';
            if (currentEditingId) {
                method = 'PUT';
                url += `/${currentEditingId}`;
            }
        } else if (currentEditingType === 'staff') {
            url += '/staff';
            if (currentEditingId) {
                method = 'PUT';
                url += `/${currentEditingId}`;
            }
        } else if (currentEditingType === 'fee') {
            url += '/fees';
            if (currentEditingId) {
                method = 'PUT';
                url += `/${currentEditingId}`;
            }
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
        });

        if (response.ok) {
            alert(currentEditingId ? 'Record updated successfully!' : 'Record created successfully!');
            closeModal();
            
            if (currentEditingType === 'facility') loadFacilities();
            else if (currentEditingType === 'member') loadMembers();
            else if (currentEditingType === 'trainer') loadTrainers();
            else if (currentEditingType === 'equipment') loadEquipment();
            else if (currentEditingType === 'schedule') loadSchedules();
            else if (currentEditingType === 'staff') loadStaff();
            else if (currentEditingType === 'fee') loadFees();
        } else {
            const errorData = await response.json();
            alert('Error: ' + (errorData.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ==================== HELPER FUNCTIONS ====================
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentEditingId = null;
    currentEditingType = null;
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

async function fetchAndFillForm(url, form, fields) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        form.innerHTML = '';
        fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'form-group';
            div.innerHTML = `
                <label>${field}</label>
                <input type="text" id="${field}" value="${data[field] || ''}" required>
            `;
            form.appendChild(div);
        });
        addModalActions(form);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchAndFillScheduleForm(id, form) {
    try {
        const response = await fetch(`${API_BASE}/schedules/${id}`);
        const data = await response.json();
        
        const trainers = await fetch(`${API_BASE}/trainers`).then(r => r.json());
        
        form.innerHTML = `
            <div class="form-group">
                <label>Trainer</label>
                <select id="Tr_ID" required onchange="checkTrainerAvailability()">
                    <option value="">Select Trainer</option>
                    ${trainers.map(t => `<option value="${t.Tr_ID}" ${data.Tr_ID == t.Tr_ID ? 'selected' : ''}>${t.Tr_Name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="Sess_Date" value="${data.Sess_Date}" required onchange="checkTrainerAvailability()">
            </div>
            <div class="form-group">
                <label>Time</label>
                <input type="time" id="Sess_Time" value="${data.Sess_Time}" required onchange="checkTrainerAvailability()">
            </div>
            <div class="form-group">
                <label>Duration (minutes)</label>
                <input type="number" id="Sess_Duration" value="${data.Sess_Duration}" required>
            </div>
            <div class="form-group">
                <label>Details</label>
                <textarea id="Sess_Details" required>${data.Sess_Details}</textarea>
            </div>
            <div id="availability-info" style="margin-top: 20px;"></div>
        `;
        addModalActions(form);
    } catch (error) {
        console.error('Error fetching schedule data:', error);
    }
}

async function fetchAndFillFormWithSelects(url, form, fields) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const facilities = await fetch(`${API_BASE}/facilities`).then(r => r.json());
        const trainers = await fetch(`${API_BASE}/trainers`).then(r => r.json());
        
        form.innerHTML = '';
        fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'form-group';
            
            if (field === 'Gym_ID') {
                div.innerHTML = `
                    <label>Gym</label>
                    <select id="${field}" required>
                        <option value="">Select Gym</option>
                        ${facilities.map(f => `<option value="${f.Gym_ID}" ${data[field] == f.Gym_ID ? 'selected' : ''}>${f.Gym_Name}</option>`).join('')}
                    </select>
                `;
            } else if (field === 'Tr_ID') {
                div.innerHTML = `
                    <label>Trainer</label>
                    <select id="${field}">
                        <option value="">Select Trainer</option>
                        ${trainers.map(t => `<option value="${t.Tr_ID}" ${data[field] == t.Tr_ID ? 'selected' : ''}>${t.Tr_Name}</option>`).join('')}
                    </select>
                `;
            } else if (field === 'Sess_Details') {
                div.innerHTML = `
                    <label>${field}</label>
                    <textarea id="${field}" required>${data[field] || ''}</textarea>
                `;
            } else {
                div.innerHTML = `
                    <label>${field}</label>
                    <input type="text" id="${field}" value="${data[field] || ''}" required>
                `;
            }
            form.appendChild(div);
        });
        addModalActions(form);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function addModalActions(form) {
    if (!form.querySelector('.modal-actions')) {
        form.insertAdjacentHTML('beforeend', `
            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        `);
    }
}

async function loadFacilitiesAndTrainers() {
    const [facilities, trainers] = await Promise.all([
        fetch(`${API_BASE}/facilities`).then(r => r.json()),
        fetch(`${API_BASE}/trainers`).then(r => r.json())
    ]);
    return [facilities, trainers];
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}