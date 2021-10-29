/* =============================================================================================================
Project: NodeJS_API_Assessment
File: dbInit.js
Desc: Initialize the database (Setup mysql + create db if not on local machine)
Author: Low Jian Wei Damien

============================================================================================================= */

const mysql = require('mysql');

const pool = mysql.createPool(
    {
        host: 'localhost',
        user: 'root',
        password: '',   // Enter password
    });
    
const dbName = "schoolDB";
const queryString = "CREATE DATABASE IF NOT EXISTS " + dbName;

// Create database if its still not existing
pool.query(queryString, (err) =>
{
    if (err) throw err;
});

// teachers: id, teacher
const createTeachersString = 
    `CREATE TABLE IF NOT EXISTS ` + dbName + `.teachers (
        id INT NOT NULL AUTO_INCREMENT,
        teachers VARCHAR(45) NOT NULL,
    PRIMARY KEY (id));`;

pool.query(createTeachersString, (err, result) =>
{
    if (err) throw err;
});

// students: id, student, enrollStatus
const createStudentsString = 
    `CREATE TABLE IF NOT EXISTS ` + dbName + `.students (
        id INT NOT NULL AUTO_INCREMENT,
        students VARCHAR(45) NOT NULL,
        enrollStatus VARCHAR(45) NOT NULL DEFAULT 'Active',
    PRIMARY KEY (id));`;

pool.query(createStudentsString, (err, result) =>
{
    if (err) throw err;
});
     
// associations: id, teacherID, studentID
const createAssociationsString = 
`CREATE TABLE IF NOT EXISTS ` + dbName + `.associations (
    id INT NOT NULL AUTO_INCREMENT,
    teacherID INT NOT NULL,
    studentID INT NOT NULL,
PRIMARY KEY (id));`;

pool.query(createAssociationsString, (err, result) =>
{
    if (err) throw err;
});

module.exports = { dbName, pool };