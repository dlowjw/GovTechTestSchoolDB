/* =============================================================================================================
Project: NodeJS_API_Assessment
File: app.js
Desc: Student database for teachers to perform various administrative tasks (Govtech NodeJS programming test)
Author: Low Jian Wei Damien

Project Overview: 

TODO: 
- Use DB name in all endpoints
- POSTMAN Unit testing
- Readme update
- Security checking
- Upload to repo
- Error message for all endpoints
- Error for repeat / Invalid data

Known issues:

============================================================================================================= */

// === Inits ===
const express = require('express');
const app = express();
const morgan = require('morgan');

app.use(express.urlencoded({extended: false}));     // Body Parser
app.use(express.static('./html'));      
app.use(morgan('short'));

const router = require("./sql/endpoints.js");
app.use(router);

// === Local server (localhost:3000) ===
app.listen(3000, () =>
{
    console.log("Server listening on port 3000");
});
