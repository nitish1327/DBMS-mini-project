DROP DATABASE IF EXISTS gym_db;
CREATE DATABASE gym_db;
USE gym_db;

-- =========================================
-- STEP 1: CREATE ALL TABLES
-- =========================================

CREATE TABLE GYM_Facility (
    Gym_ID INT PRIMARY KEY,
    Gym_Name VARCHAR(255) NOT NULL,
    Gym_Location VARCHAR(255) NOT NULL
);

CREATE TABLE Trainer (
    Tr_ID INT PRIMARY KEY,
    Tr_Name VARCHAR(255) NOT NULL,
    Tr_Contact VARCHAR(30),
    Tr_Email VARCHAR(255) UNIQUE,
    Gym_ID INT,
    FOREIGN KEY (Gym_ID) REFERENCES GYM_Facility(Gym_ID)
);

CREATE TABLE Staff (
    St_ID INT PRIMARY KEY,
    St_Name VARCHAR(255) NOT NULL,
    St_Contact VARCHAR(20),
    St_Email VARCHAR(255) UNIQUE,
    Gym_ID INT,
    FOREIGN KEY (Gym_ID) REFERENCES GYM_Facility(Gym_ID)
);

CREATE TABLE Equipment (
    Eq_ID INT PRIMARY KEY,
    Eq_Name VARCHAR(255) NOT NULL,
    Eq_Muscle_Type VARCHAR(100),
    Gym_ID INT,
    FOREIGN KEY (Gym_ID) REFERENCES GYM_Facility(Gym_ID)
);

CREATE TABLE Training_Schedule (
    Sess_ID INT PRIMARY KEY,
    Sess_Date DATE,
    Sess_Time TIME,
    Sess_Duration INT,
    Sess_Details TEXT,
    Slot_Number INT,
    Tr_ID INT,
    FOREIGN KEY (Tr_ID) REFERENCES Trainer(Tr_ID)
);

CREATE TABLE Member (
    Memb_ID INT PRIMARY KEY,
    Memb_Name VARCHAR(255) NOT NULL,
    Memb_Contact VARCHAR(20),
    Memb_Email VARCHAR(255) UNIQUE,
    Join_Date DATE,
    Gym_ID INT,
    Tr_ID INT,
    FOREIGN KEY (Gym_ID) REFERENCES GYM_Facility(Gym_ID),
    FOREIGN KEY (Tr_ID) REFERENCES Trainer(Tr_ID)
);

CREATE TABLE Fee (
    Fee_ID INT PRIMARY KEY,
    Fee_Amount DECIMAL(10, 2) NOT NULL,
    Fee_Date DATE NOT NULL,
    Sess_ID INT NOT NULL,
    FOREIGN KEY (Sess_ID) REFERENCES Training_Schedule(Sess_ID)
);

CREATE TABLE Member_Audit_Log (
    Log_ID INT AUTO_INCREMENT PRIMARY KEY,
    Memb_ID INT,
    Memb_Name VARCHAR(255),
    Action_Type VARCHAR(50),
    Action_Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Booking_Conflict_Log (
    Conflict_ID INT AUTO_INCREMENT PRIMARY KEY,
    Attempted_Trainer_ID INT,
    Attempted_Date DATE,
    Attempted_Time TIME,
    Attempted_Slot INT,
    Conflict_Message TEXT,
    Logged_At DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- STEP 2: CREATE FUNCTIONS
-- =========================================

DELIMITER //

DROP FUNCTION IF EXISTS fn_GetTimeSlot//
CREATE FUNCTION fn_GetTimeSlot(sessionTime TIME)
RETURNS INT
DETERMINISTIC
BEGIN
    IF sessionTime >= '05:00:00' AND sessionTime < '09:00:00' THEN 
        RETURN 1;
    ELSEIF sessionTime >= '09:00:00' AND sessionTime < '13:00:00' THEN 
        RETURN 2;
    ELSEIF sessionTime >= '13:00:00' AND sessionTime < '17:00:00' THEN 
        RETURN 3;
    ELSEIF sessionTime >= '17:00:00' AND sessionTime < '21:00:00' THEN 
        RETURN 4;
    ELSE 
        RETURN 0;
    END IF;
END//

DROP FUNCTION IF EXISTS fn_GetSlotTimeRange//
CREATE FUNCTION fn_GetSlotTimeRange(slotNum INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    CASE slotNum
        WHEN 1 THEN RETURN '5:00 AM - 9:00 AM';
        WHEN 2 THEN RETURN '9:00 AM - 1:00 PM';
        WHEN 3 THEN RETURN '1:00 PM - 5:00 PM';
        WHEN 4 THEN RETURN '5:00 PM - 9:00 PM';
        ELSE RETURN 'Invalid Slot';
    END CASE;
END//

DROP FUNCTION IF EXISTS fn_GetTrainerRevenue//
CREATE FUNCTION fn_GetTrainerRevenue(trainerID INT)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE totalRevenue DECIMAL(10, 2);
    SELECT SUM(F.Fee_Amount) INTO totalRevenue
    FROM Fee F
    JOIN Training_Schedule TS ON F.Sess_ID = TS.Sess_ID
    WHERE TS.Tr_ID = trainerID;
    RETURN IFNULL(totalRevenue, 0.00);
END//

DELIMITER ;

-- =========================================
-- STEP 3: CREATE TRIGGERS (Backend Only)
-- =========================================

DELIMITER //

-- Simple trigger - just prevents insert, logs conflict
DROP TRIGGER IF EXISTS trg_CheckTimeSlotConflict_INSERT//
CREATE TRIGGER trg_CheckTimeSlotConflict_INSERT
BEFORE INSERT ON Training_Schedule
FOR EACH ROW
BEGIN
    DECLARE new_slot INT;
    DECLARE slot_conflict_count INT;
    DECLARE trainer_name VARCHAR(255);

    SET new_slot = fn_GetTimeSlot(NEW.Sess_Time);

    IF new_slot = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid time slot';
    END IF;

    SET NEW.Slot_Number = new_slot;

    SELECT COUNT(*) INTO slot_conflict_count
    FROM Training_Schedule
    WHERE Tr_ID = NEW.Tr_ID
      AND Sess_Date = NEW.Sess_Date
      AND Slot_Number = new_slot;

    IF slot_conflict_count > 0 THEN
        SELECT Tr_Name INTO trainer_name FROM Trainer WHERE Tr_ID = NEW.Tr_ID;
        
        INSERT INTO Booking_Conflict_Log (Attempted_Trainer_ID, Attempted_Date, Attempted_Time, Attempted_Slot, Conflict_Message)
        VALUES (
            NEW.Tr_ID, 
            NEW.Sess_Date, 
            NEW.Sess_Time, 
            new_slot,
            CONCAT('Trainer ', trainer_name, ' already booked for ', fn_GetSlotTimeRange(new_slot))
        );
        
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Booking conflict detected';
    END IF;
END//

DROP TRIGGER IF EXISTS trg_CheckTimeSlotConflict_UPDATE//
CREATE TRIGGER trg_CheckTimeSlotConflict_UPDATE
BEFORE UPDATE ON Training_Schedule
FOR EACH ROW
BEGIN
    DECLARE new_slot INT;
    DECLARE slot_conflict_count INT;
    DECLARE trainer_name VARCHAR(255);

    IF NEW.Sess_Time != OLD.Sess_Time 
       OR NEW.Sess_Date != OLD.Sess_Date
       OR NEW.Tr_ID != OLD.Tr_ID THEN

        SET new_slot = fn_GetTimeSlot(NEW.Sess_Time);

        IF new_slot = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid time slot';
        END IF;

        SET NEW.Slot_Number = new_slot;

        SELECT COUNT(*) INTO slot_conflict_count
        FROM Training_Schedule
        WHERE Tr_ID = NEW.Tr_ID
          AND Sess_Date = NEW.Sess_Date
          AND Slot_Number = new_slot
          AND Sess_ID != OLD.Sess_ID;

        IF slot_conflict_count > 0 THEN
            SELECT Tr_Name INTO trainer_name FROM Trainer WHERE Tr_ID = NEW.Tr_ID;
            
            INSERT INTO Booking_Conflict_Log (Attempted_Trainer_ID, Attempted_Date, Attempted_Time, Attempted_Slot, Conflict_Message)
            VALUES (
                NEW.Tr_ID, 
                NEW.Sess_Date, 
                NEW.Sess_Time, 
                new_slot,
                CONCAT('UPDATE CONFLICT: Trainer ', trainer_name, ' already booked')
            );
            
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking conflict detected';
        END IF;
    END IF;
END//

DROP TRIGGER IF EXISTS trg_BeforeMemberDelete//
CREATE TRIGGER trg_BeforeMemberDelete
BEFORE DELETE ON Member
FOR EACH ROW
BEGIN
    INSERT INTO Member_Audit_Log (Memb_ID, Memb_Name, Action_Type)
    VALUES (OLD.Memb_ID, OLD.Memb_Name, 'DELETED');
END//

DELIMITER ;

-- =========================================
-- STEP 4: FRONTEND API PROCEDURES
-- =========================================

DELIMITER //

-- API 1: Check if a booking is possible (Returns JSON-like structure)
DROP PROCEDURE IF EXISTS sp_API_CheckBooking//
CREATE PROCEDURE sp_API_CheckBooking(
    IN p_Tr_ID INT,
    IN p_Sess_Date DATE,
    IN p_Sess_Time TIME
)
BEGIN
    DECLARE v_slot INT;
    DECLARE v_conflict_exists INT;
    DECLARE v_trainer_name VARCHAR(255);
    
    SET v_slot = fn_GetTimeSlot(p_Sess_Time);
    
    SELECT Tr_Name INTO v_trainer_name FROM Trainer WHERE Tr_ID = p_Tr_ID;
    
    IF v_slot = 0 THEN
        SELECT 
            FALSE AS is_available,
            'INVALID_TIME' AS error_code,
            'Session time must be between 5:00 AM and 9:00 PM' AS error_message,
            NULL AS trainer_id,
            NULL AS trainer_name,
            NULL AS requested_date,
            NULL AS requested_time,
            NULL AS requested_slot;
    ELSE
        SELECT COUNT(*) INTO v_conflict_exists
        FROM Training_Schedule
        WHERE Tr_ID = p_Tr_ID
          AND Sess_Date = p_Sess_Date
          AND Slot_Number = v_slot;
        
        SELECT 
            CASE WHEN v_conflict_exists = 0 THEN TRUE ELSE FALSE END AS is_available,
            CASE WHEN v_conflict_exists > 0 THEN 'SLOT_CONFLICT' ELSE NULL END AS error_code,
            CASE WHEN v_conflict_exists > 0 THEN 'Trainer is already booked for this time slot' ELSE NULL END AS error_message,
            p_Tr_ID AS trainer_id,
            v_trainer_name AS trainer_name,
            p_Sess_Date AS requested_date,
            p_Sess_Time AS requested_time,
            v_slot AS requested_slot;
    END IF;
END//

-- API 2: Get free slots for a trainer on a specific date
DROP PROCEDURE IF EXISTS sp_API_GetFreeSlots//
CREATE PROCEDURE sp_API_GetFreeSlots(
    IN p_Tr_ID INT,
    IN p_Sess_Date DATE
)
BEGIN
    SELECT 
        p_Tr_ID AS trainer_id,
        (SELECT Tr_Name FROM Trainer WHERE Tr_ID = p_Tr_ID) AS trainer_name,
        p_Sess_Date AS date,
        1 AS slot_number,
        '05:00:00' AS slot_start_time,
        '09:00:00' AS slot_end_time,
        '5:00 AM - 9:00 AM' AS slot_time_range,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM Training_Schedule 
                WHERE Tr_ID = p_Tr_ID 
                AND Sess_Date = p_Sess_Date 
                AND Slot_Number = 1
            ) THEN FALSE
            ELSE TRUE
        END AS is_available
    
    UNION ALL
    
    SELECT 
        p_Tr_ID,
        (SELECT Tr_Name FROM Trainer WHERE Tr_ID = p_Tr_ID),
        p_Sess_Date,
        2,
        '09:00:00',
        '13:00:00',
        '9:00 AM - 1:00 PM',
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM Training_Schedule 
                WHERE Tr_ID = p_Tr_ID 
                AND Sess_Date = p_Sess_Date 
                AND Slot_Number = 2
            ) THEN FALSE
            ELSE TRUE
        END
    
    UNION ALL
    
    SELECT 
        p_Tr_ID,
        (SELECT Tr_Name FROM Trainer WHERE Tr_ID = p_Tr_ID),
        p_Sess_Date,
        3,
        '13:00:00',
        '17:00:00',
        '1:00 PM - 5:00 PM',
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM Training_Schedule 
                WHERE Tr_ID = p_Tr_ID 
                AND Sess_Date = p_Sess_Date 
                AND Slot_Number = 3
            ) THEN FALSE
            ELSE TRUE
        END
    
    UNION ALL
    
    SELECT 
        p_Tr_ID,
        (SELECT Tr_Name FROM Trainer WHERE Tr_ID = p_Tr_ID),
        p_Sess_Date,
        4,
        '17:00:00',
        '21:00:00',
        '5:00 PM - 9:00 PM',
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM Training_Schedule 
                WHERE Tr_ID = p_Tr_ID 
                AND Sess_Date = p_Sess_Date 
                AND Slot_Number = 4
            ) THEN FALSE
            ELSE TRUE
        END
    
    ORDER BY slot_number;
END//

-- API 3: Get alternative trainers for a specific slot
DROP PROCEDURE IF EXISTS sp_API_GetAlternativeTrainers//
CREATE PROCEDURE sp_API_GetAlternativeTrainers(
    IN p_Original_Tr_ID INT,
    IN p_Sess_Date DATE,
    IN p_Slot_Number INT
)
BEGIN
    SELECT 
        T.Tr_ID AS trainer_id,
        T.Tr_Name AS trainer_name,
        T.Tr_Contact AS trainer_contact,
        T.Tr_Email AS trainer_email,
        G.Gym_ID AS gym_id,
        G.Gym_Name AS gym_name,
        G.Gym_Location AS gym_location,
        p_Slot_Number AS slot_number,
        fn_GetSlotTimeRange(p_Slot_Number) AS slot_time_range,
        TRUE AS is_available
    FROM Trainer T
    JOIN GYM_Facility G ON T.Gym_ID = G.Gym_ID
    WHERE T.Tr_ID != p_Original_Tr_ID
      AND NOT EXISTS (
          SELECT 1 
          FROM Training_Schedule TS
          WHERE TS.Tr_ID = T.Tr_ID
            AND TS.Sess_Date = p_Sess_Date
            AND TS.Slot_Number = p_Slot_Number
      )
    ORDER BY G.Gym_ID, T.Tr_Name;
END//

-- API 4: Get all trainers with availability status
DROP PROCEDURE IF EXISTS sp_API_GetAllTrainersAvailability//
CREATE PROCEDURE sp_API_GetAllTrainersAvailability(
    IN p_Sess_Date DATE,
    IN p_Sess_Time TIME
)
BEGIN
    DECLARE v_slot INT;
    SET v_slot = fn_GetTimeSlot(p_Sess_Time);
    
    SELECT 
        T.Tr_ID AS trainer_id,
        T.Tr_Name AS trainer_name,
        T.Tr_Contact AS trainer_contact,
        T.Tr_Email AS trainer_email,
        G.Gym_ID AS gym_id,
        G.Gym_Name AS gym_name,
        G.Gym_Location AS gym_location,
        v_slot AS requested_slot,
        fn_GetSlotTimeRange(v_slot) AS slot_time_range,
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM Training_Schedule TS
                WHERE TS.Tr_ID = T.Tr_ID
                  AND TS.Sess_Date = p_Sess_Date
                  AND TS.Slot_Number = v_slot
            ) THEN FALSE
            ELSE TRUE
        END AS is_available
    FROM Trainer T
    JOIN GYM_Facility G ON T.Gym_ID = G.Gym_ID
    ORDER BY is_available DESC, G.Gym_ID, T.Tr_Name;
END//

-- API 5: Get trainer schedule for a specific date
DROP PROCEDURE IF EXISTS sp_API_GetTrainerSchedule//
CREATE PROCEDURE sp_API_GetTrainerSchedule(
    IN p_Tr_ID INT,
    IN p_Sess_Date DATE
)
BEGIN
    SELECT 
        TS.Sess_ID AS session_id,
        TS.Tr_ID AS trainer_id,
        T.Tr_Name AS trainer_name,
        TS.Sess_Date AS session_date,
        TS.Sess_Time AS session_time,
        TS.Sess_Duration AS duration_minutes,
        TS.Sess_Details AS session_details,
        TS.Slot_Number AS slot_number,
        fn_GetSlotTimeRange(TS.Slot_Number) AS slot_time_range
    FROM Training_Schedule TS
    JOIN Trainer T ON TS.Tr_ID = T.Tr_ID
    WHERE TS.Tr_ID = p_Tr_ID
      AND TS.Sess_Date = p_Sess_Date
    ORDER BY TS.Sess_Time;
END//

-- API 6: Get all trainers list
DROP PROCEDURE IF EXISTS sp_API_GetAllTrainers//
CREATE PROCEDURE sp_API_GetAllTrainers()
BEGIN
    SELECT 
        T.Tr_ID AS trainer_id,
        T.Tr_Name AS trainer_name,
        T.Tr_Contact AS trainer_contact,
        T.Tr_Email AS trainer_email,
        G.Gym_ID AS gym_id,
        G.Gym_Name AS gym_name,
        G.Gym_Location AS gym_location
    FROM Trainer T
    JOIN GYM_Facility G ON T.Gym_ID = G.Gym_ID
    ORDER BY T.Tr_ID;
END//

-- API 7: Attempt to book session (Returns success/failure)
DROP PROCEDURE IF EXISTS sp_API_BookSession//
CREATE PROCEDURE sp_API_BookSession(
    IN p_Sess_ID INT,
    IN p_Sess_Date DATE,
    IN p_Sess_Time TIME,
    IN p_Sess_Duration INT,
    IN p_Sess_Details TEXT,
    IN p_Tr_ID INT
)
BEGIN
    DECLARE v_error_occurred INT DEFAULT 0;
    DECLARE v_error_message VARCHAR(255);
    DECLARE v_slot INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_message = MESSAGE_TEXT;
        
        SELECT 
            FALSE AS success,
            'BOOKING_FAILED' AS error_code,
            v_error_message AS error_message,
            p_Tr_ID AS trainer_id,
            p_Sess_Date AS requested_date,
            p_Sess_Time AS requested_time,
            fn_GetTimeSlot(p_Sess_Time) AS requested_slot;
        
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    SET v_slot = fn_GetTimeSlot(p_Sess_Time);
    
    INSERT INTO Training_Schedule (Sess_ID, Sess_Date, Sess_Time, Sess_Duration, Sess_Details, Tr_ID)
    VALUES (p_Sess_ID, p_Sess_Date, p_Sess_Time, p_Sess_Duration, p_Sess_Details, p_Tr_ID);
    
    COMMIT;
    
    SELECT 
        TRUE AS success,
        NULL AS error_code,
        NULL AS error_message,
        p_Sess_ID AS session_id,
        p_Tr_ID AS trainer_id,
        (SELECT Tr_Name FROM Trainer WHERE Tr_ID = p_Tr_ID) AS trainer_name,
        p_Sess_Date AS session_date,
        p_Sess_Time AS session_time,
        v_slot AS slot_number,
        fn_GetSlotTimeRange(v_slot) AS slot_time_range;
END//

DELIMITER ;

-- =========================================
-- STEP 5: CREATE VIEWS
-- =========================================

CREATE VIEW vw_AllTrainerSchedules AS
SELECT 
    T.Tr_ID AS trainer_id,
    T.Tr_Name AS trainer_name,
    G.Gym_Name AS gym_name,
    TS.Sess_Date AS session_date,
    TS.Sess_Time AS session_time,
    fn_GetSlotTimeRange(TS.Slot_Number) AS slot_time_range,
    TS.Slot_Number AS slot_number,
    TS.Sess_Duration AS duration_minutes,
    TS.Sess_Details AS session_details,
    TS.Sess_ID AS session_id
FROM Training_Schedule TS
JOIN Trainer T ON TS.Tr_ID = T.Tr_ID
JOIN GYM_Facility G ON T.Gym_ID = G.Gym_ID
ORDER BY TS.Sess_Date, TS.Sess_Time;

CREATE VIEW Member_Trainer_Assignments AS
SELECT
    M.Memb_Name,
    T.Tr_Name AS Trainer_Name,
    G.Gym_Name
FROM Member M
JOIN Trainer T ON M.Tr_ID = T.Tr_ID
JOIN GYM_Facility G ON M.Gym_ID = G.Gym_ID;

-- =========================================
-- STEP 6: INSERT SAMPLE DATA
-- =========================================

INSERT INTO GYM_Facility (Gym_ID, Gym_Name, Gym_Location) VALUES
(101, 'Fitness Hub Central', 'Downtown'),
(102, 'Iron Paradise', 'Uptown'),
(103, 'Peak Performance', 'Suburb');

INSERT INTO Trainer (Tr_ID, Tr_Name, Tr_Contact, Tr_Email, Gym_ID) VALUES
(201, 'John Doe', '123-456-7890', 'john.doe@email.com', 101),
(202, 'Jane Smith', '098-765-4321', 'jane.smith@email.com', 102),
(203, 'Mike Ross', '555-555-5555', 'mike.ross@email.com', 101),
(204, 'Sarah Connor', '222-999-8888', 'sarah.connor@email.com', 102),
(205, 'Kyle Reese', '333-111-2222', 'kyle.reese@email.com', 103),
(206, 'Victor Stone', '777-777-7777', 'victor.stone@email.com', 102);

INSERT INTO Staff (St_ID, St_Name, St_Contact, St_Email, Gym_ID) VALUES
(301, 'Emily White', '111-222-3333', 'emily.white@email.com', 101),
(302, 'David Green', '444-555-6666', 'david.green@email.com', 102),
(303, 'Jessica Jones', '777-666-5555', 'jessica.jones@email.com', 101),
(304, 'Luke Cage', '888-777-6666', 'luke.cage@email.com', 103);

INSERT INTO Equipment (Eq_ID, Eq_Name, Eq_Muscle_Type, Gym_ID) VALUES
(401, 'Treadmill', 'Cardio', 101),
(402, 'Dumbbell Rack', 'Full Body', 101),
(403, 'Leg Press Machine', 'Legs', 102),
(404, 'Rowing Machine', 'Cardio/Back', 101),
(405, 'Smith Machine', 'Full Body', 102),
(406, 'Cable Crossover', 'Chest/Arms', 102),
(407, 'Stationary Bike', 'Cardio', 103),
(408, 'Squat Rack', 'Legs', 101);

INSERT INTO Training_Schedule (Sess_ID, Sess_Date, Sess_Time, Sess_Duration, Sess_Details, Tr_ID) VALUES
(501, '2025-11-20', '09:00:00', 60, 'Full body workout session', 201),
(502, '2025-11-21', '17:30:00', 45, 'Intense cardio session', 202),
(503, '2025-11-22', '10:00:00', 60, 'Strength Training', 203),
(504, '2025-11-22', '11:00:00', 30, 'Quick Abs', 201),
(505, '2025-11-23', '09:00:00', 75, 'Endurance Run', 201),
(506, '2025-11-23', '18:00:00', 60, 'Yoga Flow', 204),
(507, '2025-11-24', '17:30:00', 45, 'HIIT Session', 202),
(508, '2025-11-25', '08:00:00', 60, 'Introduction to Weights', 205);

INSERT INTO Member (Memb_ID, Memb_Name, Memb_Contact, Memb_Email, Gym_ID, Tr_ID, Join_Date) VALUES
(601, 'Alice Johnson', '777-888-9999', 'alice.j@email.com', 101, 201, '2025-01-15'),
(602, 'Bob Williams', '333-444-5555', 'bob.w@email.com', 102, 202, '2025-02-20'),
(603, 'Charlie Brown', '222-333-4444', 'charlie.b@email.com', 101, NULL, '2025-03-10'),
(604, 'Diana Prince', '123-123-1234', 'diana.p@email.com', 101, 203, '2025-04-05'),
(605, 'Bruce Wayne', '456-456-4567', 'bruce.w@email.com', 101, 201, '2025-05-12'),
(606, 'Clark Kent', '789-789-7890', 'clark.k@email.com', 102, 204, '2025-06-18'),
(607, 'Barry Allen', '111-333-5555', 'barry.a@email.com', 102, NULL, '2025-07-22'),
(608, 'Hal Jordan', '222-444-6666', 'hal.j@email.com', 103, 205, '2025-08-30');

INSERT INTO Fee (Fee_ID, Fee_Amount, Fee_Date, Sess_ID) VALUES
(701, 50.00, '2025-11-20', 501),
(702, 45.00, '2025-11-21', 502),
(703, 60.00, '2025-11-22', 503),
(704, 30.00, '2025-11-22', 504),
(705, 65.00, '2025-11-23', 505),
(706, 55.00, '2025-11-23', 506),
(707, 45.00, '2025-11-24', 507),
(708, 50.00, '2025-11-25', 508);

-- =========================================
-- FRONTEND INTEGRATION GUIDE
-- =========================================

/*
===========================================
FRONTEND API WORKFLOW
===========================================

SCENARIO 1: User wants to book a session
-------------------------------------------

STEP 1: Get all available trainers
CALL sp_API_GetAllTrainers();

STEP 2: User selects trainer, date, and time
Then check if booking is possible:
CALL sp_API_CheckBooking(201, '2025-11-23', '10:00:00');

Response:
{
  is_available: false,
  error_code: "SLOT_CONFLICT",
  error_message: "Trainer is already booked for this time slot",
  trainer_id: 201,
  trainer_name: "John Doe",
  requested_date: "2025-11-23",
  requested_time: "10:00:00",
  requested_slot: 2
}

STEP 3a: If conflict (is_available = false), frontend calls:
CALL sp_API_GetFreeSlots(201, '2025-11-23');
-- Returns all 4 slots with availability status

STEP 3b: Also get alternative trainers:
CALL sp_API_GetAlternativeTrainers(201, '2025-11-23', 2);
-- Returns other trainers available for the same slot

STEP 4: User selects an available option, then book:
CALL sp_API_BookSession(999, '2025-11-23', '14:00:00', 60, 'Workout', 201);

Response if success:
{
  success: true,
  session_id: 999,
  trainer_id: 201,
  trainer_name: "John Doe"
  ...
}

Response if failure:
{
  success: false,
  error_code: "BOOKING_FAILED",
  error_message: "Booking conflict detected"
  ...
}

===========================================
FRONTEND USAGE EXAMPLES
===========================================
*/

-- Example 1: Check if John Doe is available at 10 AM on Nov 23
CALL sp_API_CheckBooking(201, '2025-11-23', '10:00:00');

-- Example 2: Get John Doe's free slots on Nov 23
CALL sp_API_GetFreeSlots(201, '2025-11-23');

-- Example 3: Get alternative trainers for Slot 2 (9am-1pm) on Nov 23
CALL sp_API_GetAlternativeTrainers(201, '2025-11-23', 2);

-- Example 4: Get all trainers and their availability for a specific time
CALL sp_API_GetAllTrainersAvailability('2025-11-23', '10:00:00');

-- Example 5: Try to book (will fail due to conflict)
CALL sp_API_BookSession(999, '2025-11-23', '10:00:00', 60, 'Test Workout', 201);

-- Example 6: Book in an available slot (will succeed)
CALL sp_API_BookSession(999, '2025-11-23', '14:00:00', 60, 'Afternoon Workout', 201);

-- Example 7: Get trainer's schedule for a specific date
CALL sp_API_GetTrainerSchedule(201, '2025-11-23');

-- Example 8: View all schedules
SELECT * FROM vw_AllTrainerSchedules;

-- Example 9: View conflict log
SELECT * FROM Booking_Conflict_Log ORDER BY Conflict_ID DESC;