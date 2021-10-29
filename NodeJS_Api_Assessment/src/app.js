/* =============================================================================================================
Project: NodeJS_API_Assessment
File: app.js
Desc: Student database for teachers to perform various administrative tasks (Govtech NodeJS programming test)
Author: Low Jian Wei Damien
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
