const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require("../../Admin/Models/Admin_Model")
const Students = require("../../Students/Models/Student_Model")
const fetchadmin = require('../../Admin/Middleware/Admin_Middleware')
const Result = require('../Model/Results')
const Results_data = require("../../Image_Middleware/Results")
var jwt = require('jsonwebtoken');
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;
const fs = require("fs")


// Router 1:- Add results  http://localhost:5050/api/results/upload_results
router.post('/upload_results', fetchadmin, Results_data.single("result_photos"), [
    body('S_icard_Id', 'Id should be atlist 6 characher').isLength({ min: 6 }),
    body('Result_Title', 'Result title should be atlist 5 characher').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    if (!req.file || !req.file.filename) {
        success = false;
        return res.status(400).json({ success, error: "Please provide file" })
    }

    const { filename } = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -14);
        const filePath = dirname + '/Result_data/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {
                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: errors.array() });
    }

    const { S_icard_Id, Result_Title } = req.body;

    const fetchAdmin = await Admin.findById(req.admin.id);
    if (!fetchAdmin) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -14);
        const filePath = dirname + '/Result_data/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {
                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const fetchstudent = await Students.findOne({ S_icard_Id: S_icard_Id });
    if (!fetchstudent) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -14);
        const filePath = dirname + '/Result_data/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {
                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Please enter valide student i-card id" })
    }

    try {

        let Result_copy = filename;

        let results = new Result({
            S_icard_Id, Result_Title, Result_copy
        })


        results = await results.save();

        const data = {
            results: {
                id: results.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -14);
        const filePath = dirname + '/Result_data/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        res.status(500).send("some error occured");
    }
})


// Router 2:- fetch results  http://localhost:5050/api/results/fetch_results_of_student
router.post('/fetch_results_of_student', fetchadmin, [
    body('S_icard_Id', 'Id should be atlist 6 characher').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { S_icard_Id } = req.body;

    const fetchAdmin = await Admin.findById(req.admin.id);
    if (!fetchAdmin) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const fetchstudent = await Students.findOne({ S_icard_Id: S_icard_Id });
    if (!fetchstudent) {
        success = false
        return res.status(400).json({ success, error: "Please enter valide student i-card id" })
    }

    try {
        const results = await Result.find({ S_icard_Id: S_icard_Id })
        if (results.length == 0) {
            success = false
            return res.json("No Result Found")
        }
        else {
            res.json(results);
        }

    } catch (error) {
        res.status(500).send("some error occured");
    }

})


// Router 3:- Delete results http://localhost:5050/api/results/delete_results/{id}
router.delete('/delete_results/:id', fetchadmin, async (req, res) => {
    const fetchAdmin = await Admin.findById(req.admin.id);
    if (!fetchAdmin) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const data = await Result.findById(req.params.id);
    if (!data) {
        success = false
        return res.status(400).json({ success, error: "Data not found" })
    }
    const { id } = req.params
    const nameOfFile = data.Result_copy;

    const dirPath = __dirname;
    const dirname = dirPath.slice(0, -14);
    const filePath = dirname + '/Result_data/' + nameOfFile;
    fs.unlink(filePath, async (err) => {
        if (err) {
            success = false;
            return res.status(404).json({ success, error: 'Error in deleting file' });
        }
        else {
            results = await Result.findByIdAndDelete(id)

            const data = {
                results: {
                    id: results.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken });
        }
    });
})

module.exports = router