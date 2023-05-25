const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
require('dotenv').config()
const fetchadmin = require('../Middleware/Admin_Middleware')
const Admin = require("../Models/Admin_Model")
const JWT_SECRET = process.env.JWT_SECRET;
const Subjects = require("../Models/Subjects_Models")


// Router 1:- Create subjects  http://localhost:5050/api/subject/create_subject
router.post('/create_subject', fetchadmin, [
    body('Standard', 'Standard should be atlist 2 character').isLength({ min: 2 }),
    body('Subject_Name', 'Subject name should be atlist 2 character').isLength({ min: 2 }),
    body('Subject_Code', 'Class code should be atlist 5 character').isLength({ min: 5, max: 5 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { Standard, Subject_Name, Subject_Code } = req.body;

    const fetchAdmin = await Admin.findById(req.admin.id);
    if (!fetchAdmin) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    let sub = await Subjects.findOne({ Subject_Code: Subject_Code })
    if (sub) {
        success = false;
        return res.status(400).json({ success, error: "This subject code is already exist" })
    }

    try {

        let subjects = new Subjects({
            Standard, Subject_Name, Subject_Code
        })

        subjects = await subjects.save();
        const data = {
            subjects: {
                id: subjects.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 2:- Get all subjects class wise  http://localhost:5050/api/subject/get_all_subjects_class_wise
router.post('/get_all_subjects_class_wise', fetchadmin, [
    body('Standard', 'Standard should be atlist 2 character').isLength({ min: 2 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { Standard } = req.body;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let subjects = await Subjects.find({ Standard: Standard })
        if (subjects.length > 0) {
            res.send(subjects);
        } else {
            success = false;
            res.json({ success, error: "Please try with correct class code" });
        }
        // res.json(subjects)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


module.exports = router