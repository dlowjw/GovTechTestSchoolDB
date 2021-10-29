# GovTechSchoolDB

## Node JS API Assessment for Software Engineering Role @ GovTech - LifeSG

### Project Overview

Creating a set of API calls to get / post data to a student database

### Instructions to run

1) Input password in src/dbinit.js if required to access in local machine
2) Run Terminal (or equivalent) in src folder
3) Run program with "node app.js" OR "nodemon app.js" (Added nodemon for quicker testing, re-runs program when I save)
4) Make approriate API calls to the program (Implemented ones listed below)

### Columns for each Database tables created

students        - id, student (student's email), enrollStatus (Active or Suspended)
teachers        - id, teacher (teacher's email)
associations    - id, teacherID, studentID

### API Calls

General GET full DB table Endpoints (Not part of Assessment, added to check the database)
1) '/api/students'      - Retrieve all students in the DB
2) '/api/teachers'      - Retrieve all teachers in the DB
3) '/api/assiociations' - Retrieve all students <-> teacher associations in the DB with all their info

Filtering GET Endpoints
1) '/api/commonstudents?(teacher=? params)' - Retrieve all students assigned to specific teacher(s)

JSON Body Example 1:
```
{
    "students" :
    [
        "commonstudent1@gmail.com",
        "commonstudent2@gmail.com",
        "student_only_under_teacher_ken@gmail.com"
    ]
}
```

JSON Body Example 2:
```
{
    "students" :
    [
        "commonstudent1@gmail.com",
        "commonstudent2@gmail.com"
    ]
}
```
POST Endpoints
1) '/api/register' - Register student(s) to a specific teacher (Implementation adds the teacher to DB if not already present)

JSON Body Example:
```
{
    "teacher": "teacherken@gmail.com"
    "students":
    [
        "studentjon@example.com",
        "studenthon@example.com"
    ]
}
```

2) '/api/suspend'                   - Suspend a student

JSON Body Example:
```
{
    "student" : "studentmary@gmail.com"
}
```
3) '/api/retrievefornotifications'  - Notifies mentioned or students assigned to specific teacher  (NOTE: Student must NOT be suspended)

JSON Body Example:
```
{
    "teacher": "teacherken@example.com",
    "notification": "Hello students! @studentagnes@example.com @studentmiche@example.com"
}
```
Success Body for Example (studentbob@example.com registed under teacherken@example.com):
```
{
    "recipients":
    [
        "studentbob@example.com",
        "studentagnes@example.com",
        "studentmiche@example.com"
    ]
}
```
### TODO / Known Issues

- In the registration api call, we add to all 3 tables (teachers -> students -> associations) and there might be cases where we should reject 
    every inputs but because of the nested queries sometimes the call might add to teachers and / or students and fail at a later call.
    Unfortunately, due to time constraints I have not found a better way to implement it yet. I implemented 3 different tables this way because
    it was mentioned that teachers can register to multiple students and vice versa and I could not find a better way around it as of now. 
- Check & Return appropriate errors for bad inputs
- More testing & Cleanup
