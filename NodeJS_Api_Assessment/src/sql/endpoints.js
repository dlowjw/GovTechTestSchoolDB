/* =============================================================================================================
Project: NodeJS_API_Assessment
File: endpoints.js
Desc: Collection of API endpoint calls
Author: Low Jian Wei Damien

NOTE: [?] -> Search string ([] included) to quick jump to endpoint implementation

General GET full DB table Endpoints
[STUD]  1) '/api/students'      - Retrieve all students in the DB
[TEACH] 2) '/api/teachers'      - Retrieve all teachers in the DB
[ASSOC] 3) '/api/assiociations' - Retrieve all students <-> teacher associations in the DB with all their info

Filtering GET Endpoints
[COMMON] 1) '/api/commonstudents?(teacher=? params)' - Retrieve all students assigned to specific teacher(s)

POST Endpoints
[REGIS] 1) '/api/register'                  - Register student(s) to a specific teacher
[SUSP]  2) '/api/suspend'                   - Suspend a student
[NOTIF] 3) '/api/retrievefornotifications'  - Notifies mentioned or students assigned to specific teacher
                                              (NOTE: Student must NOT be suspended)

============================================================================================================= */

const express = require('express');
const router = express.Router();
const db = require("./dbInit.js");
const url = require('url');

const bp = require('body-parser');
const { json } = require('body-parser');

router.use(express.json());
router.use(express.urlencoded({extended: true}));

// === GET requests ===

// [STUD]
// Retrieve all students in the DB
router.get('/api/students', (req, res) =>
{
    const connection = db.pool;
    const queryString = 'SELECT * FROM ' + db.dbName + '.students';
    connection.query(queryString, (err, rows, fields) =>
    {
        console.log("Getting student list")

        if (err)
        {
            console.log("Failed to get student list \n Error: " + JSON.stringify(err, undefined, 2));
            res.sendStatus(500); // Internal Server Error
            return;
        }
        
        res.json(rows);
    });
}); 

// [TEACH]
// Retrieve all teachers in the DB
router.get('/api/teachers', (req, res) =>
{
    const connection = db.pool;
    const queryString = `SELECT * FROM ` + db.dbName + `.teachers`;
    connection.query(queryString, (err, rows, fields) =>
    {
        console.log("Getting teachers list")

        if (err)
        {
            console.log("Failed to get teachers list \n Error: " + JSON.stringify(err, undefined, 2));
            res.sendStatus(500); // Internal Server Error
            return;
        }
        
        res.json(rows);
    });
}); 

// [ASSOC]
// Retrieve all students <-> teacher associations in the DB with all their info
router.get('/api/associations', (req, res) =>
{
    const connection = db.pool;

    const queryString = 
        `SELECT 
            s.id        AS studentID,
            s.student,
            t.id        AS teacherID,
            t.teacher
        FROM ` + db.dbName + `.students s
        JOIN ` + db.dbName + `.associations a
            ON s.id = a.studentID
        JOIN ` + db.dbName + `.teachers t
            ON a.teacherID = t.id`;

    connection.query(queryString, (err, rows, fields) =>
    {
        console.log("Getting associations list")

        if (err)
        {
            console.log("Failed to get associations list \n Error: " + JSON.stringify(err, undefined, 2));
            res.sendStatus(500); // Internal Server Error
            return;
        }
        
        res.json(rows);
    });
}); 

// [COMMON]
// Retrieve all students assigned to specific teacher(s)
// Eg: Teacher A has Student A, C, D & Teacher B has Studen A, B, E -> return Student A (not repeating), B, C, D, E
router.get('/api/commonstudents', (req, res) =>
{
    console.log("Common Students arguements");
    console.log(req.query.teacher);             // Log teachers

    const connection = db.pool;

    const queryString = 
        `SELECT DISTINCT
            s.student
        FROM ` + db.dbName + `.teachers t, ` + db.dbName + `.associations a, ` + db.dbName + `.students s
	        WHERE t.teacher IN (?)  
	        AND t.id = a.teacherID
	        AND a.studentID = S.id
        ORDER BY s.id`;
    connection.query(queryString, [req.query.teacher], (err, rows, fields) =>
    {
        console.log("Getting student list")

        if (err)
        {
            console.log("Failed to get student list \n Error: " + JSON.stringify(err, undefined, 2));
            res.sendStatus(500); // Internal Server Error
            return;
        }

        // Re-formatting the JSON output
        var comStudArray = JSON.parse(JSON.stringify(rows));
        var jsonObj = {}
        var jsonKey = "students";
        jsonObj[jsonKey] = []
        
        // Add all values under 1 key
        for (const val of comStudArray)
        {
            jsonObj[jsonKey].push(val["student"]);
        }

        console.log(jsonObj);
    
        res.json(jsonObj);
    });
}); 

// === POST requests ===

// [REGIS]
// Register student(s) to a specific teacher
router.post("/api/register", (req, res) =>
{
    // Register student to student table
    // Register student-teacher associations to associations table
    console.log("Student details");

    console.log("Checking for Teacher");
    console.log(req.body.teacher);

    console.log("Students");
    console.log(req.body.students);

    // Setup the right syntax to add potentially multiple rows of students
    var studentsString = "";
    for (const val of req.body.students)
    {
        studentsString += "('" + val + "')" + ",";
    }
    studentsString = studentsString.slice(0, -1);   // Remove last comma
    console.log(studentsString);

    const connection = db.pool;

    // Search for teacher first
    const queryString1 = `SELECT id FROM ` + db.dbName + `.teachers WHERE teacher = ?`;
    connection.query(queryString1, [req.body.teacher], (err, results, fields) =>
    {
        console.log("Searching for teacher...");
        var teacherID = 0;  // store teacher ID when found

        if (err)
        {
            console.log("Failed to register student\n Error: " + JSON.stringify(err, undefined, 2));
            res.sendStatus(500); // Internal Server Error
            return;
        }

        // If teacher is found
        if (results.length)
        {            
            console.log("Teacher found!");
            var teacherRow = JSON.parse(JSON.stringify(results));
            teacherID = teacherRow[0]["id"];
            console.log(teacherID);
            const queryString2 = "INSERT INTO " + db.dbName + ".students (`student`) VALUES " + studentsString;   // Add the students
            connection.query(queryString2, (err, results, fields) =>
            {
                if (err)
                {
                    console.log("FailStudent Not Registered successfully\n Error: " + JSON.stringify(err, undefined, 2));
                }
                console.log("Student Registered successfully");
                var addedStudents = results.affectedRows;
                var firstAddedStudentID = results.insertId;
                var finalAddedStudentID = firstAddedStudentID + addedStudents - 1;
                

                var queryString3 = "INSERT INTO " + db.dbName + ".associations (`teacherID`, `studentID`) VALUES " 
                
                for (let i = firstAddedStudentID; i <= finalAddedStudentID; i++)
                {
                    queryString3 += "('" + teacherID + "', '" + i + "'),";
                }
                queryString3 = queryString3.slice(0, -1);   // Remove last comma
                console.log(queryString3);
                
                connection.query(queryString3, (err, results, fields) =>
                {
                    if (err)
                    {
                        console.log("Associations not updated successfully\n Error: " + JSON.stringify(err, undefined, 2));
                    }
                    console.log("Associations updated successfully");
                });
            });
        }  

        // If teacher not found, create teacher
        else
        {
            console.log("Teacher not found, adding teacher");
            const queryString2 = "INSERT INTO " + db.dbName + ".teachers (`teacher`) VALUES (?)";   // Add the teacher
            connection.query(queryString2, [req.body.teacher], (err, results, fields) =>
            {
                if (err)
                {
                    console.log("Teacher not added\n Error: " + JSON.stringify(err, undefined, 2));
                }
                console.log("Teacher added");

                // Update new teacher's ID
                teacherID = results.insertId;

                console.log(teacherID);
                const queryString3 = "INSERT INTO " + db.dbName + ".students (`student`) VALUES " + studentsString;   // Add the students
                connection.query(queryString3, (err, results, fields) =>
                {
                    if (err)
                    {
                        console.log("FailStudent Not Registered successfully\n Error: " + JSON.stringify(err, undefined, 2));
                    }
                    console.log("Student Registered successfully");
                    var addedStudents = results.affectedRows;
                    var firstAddedStudentID = results.insertId;
                    var finalAddedStudentID = firstAddedStudentID + addedStudents - 1;
                

                    var queryString4 = "INSERT INTO " + db.dbName + ".associations (`teacherID`, `studentID`) VALUES " 
                
                    for (let i = firstAddedStudentID; i <= finalAddedStudentID; i++)
                    {
                        queryString4 += "('" + teacherID + "', '" + i + "'),";
                    }
                    queryString4 = queryString4.slice(0, -1);   // Remove last comma
                    console.log(queryString4);
                
                    connection.query(queryString4, (err, results, fields) =>
                    {
                        if (err)
                        {
                            console.log("Associations not updated successfully\n Error: " + JSON.stringify(err, undefined, 2));
                        }
                        console.log("Associations updated successfully");
                    });
                });

            });
        }   
        res.status(204);
        res.end();
    });
});

// [SUSP]
// Suspend a student
router.post("/api/suspend", (req, res) =>
{
    // Search student table, set enrollment status to suspended
    // Switch ID to email
    const connection = db.pool;

    console.log(req.body.student);

    const queryString = "UPDATE " + db.dbName + ".students SET `enrollStatus` = 'Suspended' WHERE (`student` = ?)";
    connection.query(queryString, [req.body.student], (err, results, fields) =>
    {
        console.log("Suspending Student...")

        if (err)
        {
            console.log("Failed to suspend student \n Error: " + JSON.stringify(err, undefined, 2));
            res.sendStatus(500); // Internal Server Error
            return;
        }
        
        console.log("Student suspended successfully")
    });

    res.status(204);
    res.end();
});

// [NOTIF]
// Notifies mentioned or students assigned to specific teacher (NOTE: Student must NOT be suspended)
router.post('/api/retrievefornotifications', (req, res) =>
{
    console.log(req.body.teacher);
    console.log(req.body.notification.length);
    var mentionedStudents = "(";   // Store all @mentioned students in a string

    // Look for the first @mention
    for (let i = 0; i < req.body.notification.length; i++)
    {   
        // Found the @
        if (req.body.notification[i] == "@")
        {
            // Find the end of the @ mention
            for (let j = i+1; j < req.body.notification.length; j++)
            {
                // If the end is found or its the end of the notification
                if (req.body.notification[j] == " " || j >= req.body.notification.length - 1)
                {
                    if (j == req.body.notification.length - 1)
                    {
                        // Slice off the @ as well, take the final character in end of notification
                        mentionedStudents += "'" + req.body.notification.slice(i+1, j+1) + "',";
                    }
                    else
                    {
                        // Slice off the @ as well
                        mentionedStudents += "'" + req.body.notification.slice(i+1, j) + "',";
                    }
                    
                    // Search for the next @ after the space
                    i = j;
                    break;
                }
            }
        }
    }

    mentionedStudents = mentionedStudents.slice(0, -1);   // Remove last comma
    mentionedStudents += ")";
    console.log(mentionedStudents);

    const connection = db.pool;

    const queryString = 
        `SELECT DISTINCT
            s.student
        FROM ` + db.dbName + `.teachers t, ` + db.dbName + `.associations a, ` + db.dbName + `.students s
            WHERE t.teacher = "` + req.body.teacher + `"
            AND t.id = a.teacherID
            AND a.studentID = S.id
            AND s.enrollStatus = 'Active'
            OR s.student IN ` + mentionedStudents + ` 
            AND s.enrollStatus = 'Active'
        ORDER BY s.id`;
    connection.query(queryString, (err, rows, fields) =>
    {
        console.log("Getting student list")

        if (err)
        {
            console.log("Failed to get student list \n Error: " + JSON.stringify(err, undefined, 2));
            res.sendStatus(500); // Internal Server Error
            return;
        }
        
         // Re-formatting the JSON output
         var comStudArray = JSON.parse(JSON.stringify(rows));
         var jsonObj = {}
         var jsonKey = "recipients";
         jsonObj[jsonKey] = []
         
         // Add all values under 1 key
         for (const val of comStudArray)
         {
             jsonObj[jsonKey].push(val["student"]);
         }
 
         console.log(jsonObj);
     
         res.json(jsonObj);
    });
});


module.exports = router;