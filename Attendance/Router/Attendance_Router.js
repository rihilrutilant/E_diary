const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Teachers = require("../../Teachers/Models/Teacher_Model")
const Students = require("../../Students/Models/Student_Model")
const Classes = require("../../Classes/Models/Class_module")
const Attendance = require("../Model/Attendance_Model")
var jwt = require('jsonwebtoken');
const fetchTeachers = require('../../Teachers/Middleware/Teacher_Middleware');
const fetchStudents = require('../../Students/Middleware/Student_Middleware');
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;

// Router 1:- Take attendance of the students  http://localhost:5050/api/attendance/take_attendance
router.post('/take_attendance', fetchTeachers, [
    body("Class_code", "Class code should be atlist 3 characters").isLength({ min: 3 }),
    body("T_icard_Id", "Teachers id should be atlist 6 characters").isLength({ min: 6 }),
    body("Attend", "Please enter the attenddance").isArray(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { Class_code, T_icard_Id, Attend } = req.body

    const fetchTeacher = await Teachers.findById(req.teacher.id);
    if (!fetchTeacher) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    let t_icard_id = await Teachers.findOne({ T_icard_Id: req.body.T_icard_Id });
    if (!t_icard_id) {
        success = false
        return res.status(400).json({ success, error: "Sorry you cannot use this id" })
    }

    const standard = Class_code.substring(0, 2);

    let std = await Classes.findOne({ Standard: standard })
    if (!std) {
        success = false
        return res.status(400).json({ success, error: "Please Chooes correct class code" })
    }

    try {

        const ClassCode = std.ClassCode;

        if (ClassCode.includes(Class_code)) {
            const allIds = []

            Attend.forEach((attendObj) => {
                Object.keys(attendObj).forEach((key) => {
                    allIds.push(key)
                });
            });


            for (let index = 0; index < allIds.length; index++) {
                const element = allIds[index];
                let student = await Students.findOne({ S_icard_Id: element })
                if (!student) {
                    success = false
                    return res.status(400).json({ success, error: "Please Choose correct Students of the class" })
                }
            }

            let attendance = new Attendance({
                Class_code, T_icard_Id, Attend
            })

            Addattendance = await attendance.save();
            const data = {
                Addattendance: {
                    id: Addattendance.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.status(200).json({ success, authtoken });;
        } else {
            success = false
            return res.status(400).json({ error: "Class Code doesn't exist" });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 2:- fetch all attendances that taken by teachers  http://localhost:5050/api/attendance/fetch_taken_attendance
router.post('/fetch_taken_attendance', fetchTeachers, async (req, res) => {
    let success = false;

    const fetchTeacher = await Teachers.findById(req.teacher.id);
    if (!fetchTeacher) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }
    try {
        let attend = await Attendance.find({ T_icard_Id: fetchTeacher.T_icard_Id });
        if (attend.length == 0) {
            success = false
            return res.status(400).json({ success, error: "Data not found" })
        }
        res.json(attend);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 3:- fetch all attendances that taken by teachers  http://localhost:5050/api/attendance/filter_taken_attendance
router.post('/filter_taken_attendance/:id', fetchTeachers, async (req, res) => {
    let success = false;

    const fetchTeacher = await Teachers.findById(req.teacher.id);
    if (!fetchTeacher) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }
    try {
        let attend = await Attendance.findById(req.params.id);
        if (!attend) {
            success = false
            return res.status(400).json({ success, error: "Data not found" })
        }

        const data = attend.Attend

        const p = []
        const a = []

        data.forEach((attendObj) => {
            Object.keys(attendObj).forEach(async (key) => {
                const value = attendObj[key];
                if (value == "true") {
                    p.push(key)
                } else {
                    a.push(key)
                }
            });
        });

        const present = []

        for (let index = 0; index < p.length; index++) {
            const element = p[index];
            const student = await Students.findOne({ S_icard_Id: element })
            let s_name = student.S_name
            present.push({ "Name": s_name, "S_Icard_Id": element })
        }

        const absent = []

        for (let index = 0; index < a.length; index++) {
            const element = a[index];
            const student = await Students.findOne({ S_icard_Id: element })
            let s_name = student.S_name
            absent.push({ "Name": s_name, "S_Icard_Id": element })
        }

        const attendance = [
            {
                "present": present,
                "absent": absent
            }
        ]

        res.json(attendance);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 4:- fetch the attendance history of the student http://localhost:5050/api/attendance/attendance_history_of_students
router.post('/attendance_history_of_students', fetchStudents, async (req, res) => {
    let success = false;

    const fetchStudents = await Students.findById(req.student.id);
    if (!fetchStudents) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    try {

        let attend = await Attendance.find({ Class_code: fetchStudents.S_Class_code });
        if (!attend) {
            success = false
            return res.status(400).json({ success, error: "Data not found" })
        }

        // const data = attend.Attend

        const present = []
        const absent = []

        for (let index = 0; index < attend.length; index++) {
            const element = attend[index];
            let data = element.Attend
            data.forEach((attendObj) => {
                Object.keys(attendObj).forEach((key) => {
                    if (key == fetchStudents.S_icard_Id) {
                        const value = attendObj[key];
                        if (value == "true") {
                            present.push({ "S_icard_Id": key, "attend": value, "date": element.Date })
                        } else {
                            absent.push({ "S_icard_Id": key, "attend": value, "date": element.Date })
                        }
                    }
                });
            });
        }

        const attendance = [
            {
                "present": present,
                "absent": absent
            }
        ]

        res.json(attendance);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


module.exports = router