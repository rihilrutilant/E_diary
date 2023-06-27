const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Teachers = require("../../Teachers/Models/Teacher_Model")
const Students = require("../../Students/Models/Student_Model")
const Admin = require("../../Admin/Models/Admin_Model")
const Classes = require("../../Classes/Models/Class_module")
var jwt = require('jsonwebtoken');
const fetchTeachers = require('../../Teachers/Middleware/Teacher_Middleware');
const fetchStudents = require('../../Students/Middleware/Student_Middleware');
const fetchAdmin = require("../../Admin/Middleware/Admin_Middleware");
const ExamTimeTable = require("../Model/Exam_TimeTable_Model")
const Exam_Timetable_Imgs = require("../../Image_Middleware/Exam_timetable")
const fs = require('fs')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;




// Router :- 1  set exam timetable  http://localhost:5050/api/examtimetable/set_examtimetable
router.post('/set_examtimetable', fetchAdmin, Exam_Timetable_Imgs.single('exam_tt_img'), [
    body("Standard", "Standard should be atlist 2 characters").isLength({ min: 2, max: 2 }),
    body("Exam_Type", "Exam_Type should be atlist 3 characters").isLength({ min: 3 }),
], async (req, res) => {
    let success = false;

    if (!req.file || !req.file.filename) {
        success = false;
        return res.status(400).json({ success, error: "Please provide file" })
    }
    const { filename } = req.file

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;

        const dirPath = __dirname;  //C:\Users\admin\Desktop\E_diary\Exam_TimeTable\Router
        const dirname = dirPath.slice(0, -22);
        const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });

        return res.status(400).json({ success, error: errors.array() });
    }
    const { Standard, Exam_Type } = req.body
    try {

        const fetchadmin = await Admin.findById(req.admin.id);
        if (!fetchadmin) {
            success = false
            const dirPath = __dirname;  //C:\Users\admin\Desktop\E_diary\Exam_TimeTable\Router
            const dirname = dirPath.slice(0, -22);
            const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
            fs.unlink(filePath, (err) => {
                if (err) {

                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const standard = await Classes.findOne({ Standard: Standard })
        if (!standard) {
            success = false
            const dirPath = __dirname;  //C:\Users\admin\Desktop\E_diary\Exam_TimeTable\Router
            const dirname = dirPath.slice(0, -22);
            const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
            fs.unlink(filePath, (err) => {
                if (err) {

                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
            return res.status(400).json({ success, error: "Sorry this standard does not exist" })
        }


        const Exam_TimeTable = filename

        let examtimetable = new ExamTimeTable({
            Standard, Exam_Type, Exam_TimeTable
        })

        examtimetable = await examtimetable.save();
        const data = {
            examtimetable: {
                id: examtimetable.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({ success, authtoken });
    } catch (err) {
        const dirPath = __dirname;  //C:\Users\admin\Desktop\E_diary\Exam_TimeTable\Router
        const dirname = dirPath.slice(0, -22);
        const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(500).json({ message: "Internal server error" });
    }
})


// Router 2:- fetch all exam timetable standerd wise http://localhost:5050/api/examtimetable/fetch_all_examtimetable
router.post('/fetch_all_examtimetable', fetchAdmin, [
    body("Standard", "Standard should be atlist 2 characters").isLength({ min: 2, max: 2 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Standard } = req.body
    try {
        const fetchadmin = await Admin.findById(req.admin.id);
        if (!fetchadmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const examtimetable = await ExamTimeTable.find({ Standard });
        if (!examtimetable) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        res.json(examtimetable);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }

})


// Router 3:- edit exam timtable http://localhost:5050/api/examtimetable/edit_examtimetable
router.patch('/edit_examtimetable/:id', fetchAdmin, Exam_Timetable_Imgs.single('exam_tt_img'), [
], async (req, res) => {
    let success = false;

    if (!req.file || !req.file.filename) {
        success = false;
        return res.status(400).json({ success, error: "Please provide file" })
    }
    const { filename } = req.file

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        const dirPath = __dirname;  //C:\Users\admin\Desktop\E_diary\Exam_TimeTable\Router
        const dirname = dirPath.slice(0, -22);
        const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: errors.array() });
    }

    const fetchadmin = await Admin.findById(req.admin.id);
    if (!fetchadmin) {
        success = false
        const dirPath = __dirname;  //C:\Users\admin\Desktop\E_diary\Exam_TimeTable\Router
        const dirname = dirPath.slice(0, -22);
        const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    let examtimetable = await ExamTimeTable.findById(req.params.id)
    if (!examtimetable) {
        success = false
        const dirPath = __dirname;  //C:\Users\admin\Desktop\E_diary\Exam_TimeTable\Router
        const dirname = dirPath.slice(0, -22);
        const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Exam TimeTable does not exist" })
    }

    try {


        const newExamTimeTable = {};
        if (filename) { newExamTimeTable.Exam_TimeTable = filename };

        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -22);
        const filePath = dirname + '/Exam_TimeTable_imgs/' + examtimetable.Exam_TimeTable;
        fs.unlink(filePath, async (err) => {
            if (err) {
                success = false;
                const dirPath = __dirname;
                const dirname = dirPath.slice(0, -22);
                const filePath = dirname + '/Exam_TimeTable_imgs/' + filename;
                fs.unlink(filePath, (err) => {
                    if (err) {

                        success = false;
                        return res.status(404).json({ success, error: 'Error deleting file' });
                    }
                });
                return res.status(404).json({ success, error: 'Error deleting file' });
            } else {
                AddExamtimeTable = await ExamTimeTable.findByIdAndUpdate(req.params.id, { $set: newExamTimeTable })
                const data = {
                    AddExamtimeTable: {
                        id: AddExamtimeTable.id
                    }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                success = true;
                res.status(200).json({ success, authtoken });
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 4:- fetch all exam timetable standerd wise http://localhost:5050/api/examtimetable/fetch_all_examtimetable_for_teachers
router.post('/fetch_all_examtimetable_for_teachers', fetchTeachers, [
    body("Standard", "Standard should be atlist 2 characters").isLength({ min: 2, max: 2 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Standard } = req.body
    try {
        const fetchteacher = await Teachers.findById(req.teacher.id);
        if (!fetchteacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const examtimetable = await ExamTimeTable.find({ Standard });
        res.json(examtimetable);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }

})


// Router 5:- fetch all exam timetable for students http://localhost:5050/api/examtimetable/fetch_all_examtimetable_for_students
router.post('/fetch_all_examtimetable_for_students', fetchStudents, async (req, res) => {
    try {
        const fetchstudent = await Students.findById(req.student.id);
        if (!fetchstudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const examtimetable = await ExamTimeTable.find({ Standard: fetchstudent.S_standard });
        res.json(examtimetable);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }

})


// Router 6:- delete exam timetabe http://localhost:5050/api/examtimetable/delete_exam_timetable/:{id}
router.delete('/delete_exam_timetable/:id', fetchAdmin, async (req, res) => {
    try {
        const fetchadmin = await Admin.findById(req.admin.id);
        if (!fetchadmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const examtimetable = await ExamTimeTable.findById(req.params.id);
        if (!examtimetable) {
            success = false
            return res.status(400).json({ success, error: "exam timetable does not exist" })
        }


        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -22);
        const filePath = dirname + '/Exam_TimeTable_imgs/' + examtimetable.Exam_TimeTable;
        fs.unlink(filePath, async (err) => {
            if (err) {
                return res.status(404).json({ success, error: 'Error deleting file' });
            } else {
                AddExamtimeTable = await ExamTimeTable.findByIdAndDelete(req.params.id)
                const data = {
                    AddExamtimeTable: {
                        id: AddExamtimeTable.id
                    }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                success = true;
                res.status(200).json({ success, authtoken });
            }
        })
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
})


module.exports = router