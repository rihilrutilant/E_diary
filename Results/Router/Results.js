const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require("../../Admin/Models/Admin_Model")
const fetchadmin = require('../../Admin/Middleware/Admin_Middleware')
const Results_data = require("../../Image_Middleware/Results")
var jwt = require('jsonwebtoken');
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;
const fs = require("fs")

router.post("/", async (req, res) => {
    res.send("Hii this is me")
})

module.exports = router