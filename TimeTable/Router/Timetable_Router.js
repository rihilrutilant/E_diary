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
// const Subjects = require('../../Admin/Models/Subjects_Models');
const TimeTable = require("../Model/Timetable_Model")
const Timetable_Imgs = require('../../Image_Middleware/Time_Table')
require('dotenv').config()
const fs = require('fs')
const JWT_SECRET = process.env.JWT_SECRET;

// Router 1:- Make timetable  http://localhost:5050/api/timetable/make_timetable
// router.post('/make_timetable', fetchAdmin, [
//     body("Class_code", "classcode should be atlist 3 characters").isLength({ min: 3 }),
//     body("Daily_TimeTable", "Please enter the timetable").isArray(),
// ], async (req, res) => {
//     let success = false;
//     // If there are errors, return Bad request and the errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         success = false;
//         return res.status(400).json({ success, error: errors.array() });
//     }

//     const { Class_code, Daily_TimeTable } = req.body

//     const fetchadmin = await Admin.findById(req.admin.id);
//     if (!fetchadmin) {
//         success = false
//         return res.status(400).json({ success, error: "Sorry U should ligin first" })
//     }

//     const standard = Class_code.substring(0, 2);
//     let std = await Classes.findOne({ Standard: standard })
//     if (!std) {
//         success = false
//         return res.status(400).json({ success, error: "Please Chooes correct class code" })
//     }

//     const ClassCode = std.ClassCode;

//     try {
//         if (ClassCode.includes(Class_code)) {

//             let classcode2 = await TimeTable.findOne({ Class_code: Class_code })
//             if (classcode2) {
//                 success = false
//                 return res.status(400).json({ success, error: "TimeTable already exist" })
//             }


//             const subjectCode = []
//             const icardId = []

//             // Iterate over the weekdays
//             Object.values(Daily_TimeTable[0]).forEach((schedule) => {
//                 // Iterate over the schedule of each weekday
//                 Object.values(schedule).forEach((lesson) => {
//                     subjectCode.push(lesson.Subject_Code);
//                     icardId.push(lesson.T_icard_Id);
//                 });
//             });


//             for (let index = 0; index < subjectCode.length; index++) {
//                 const element = subjectCode[index];
//                 const fetchsubject = await Subjects.findOne({ Subject_Code: element });
//                 if (!fetchsubject) {
//                     success = false
//                     return res.status(400).json({ success, error: "Please Chooes correct subject code" })
//                 }
//             }

//             for (let index = 0; index < icardId.length; index++) {
//                 const element = icardId[index];
//                 const fetchicard = await Teachers.findOne({ T_icard_Id: element });
//                 if (!fetchicard) {
//                     success = false
//                     return res.status(400).json({ success, error: "Please Chooes correct teacher id" })
//                 }
//             }


//             let timeyable = new TimeTable({
//                 Class_code, Daily_TimeTable
//             })

//             Addtimeyable = await timeyable.save();
//             const data = {
//                 Addtimeyable: {
//                     id: Addtimeyable.id
//                 }
//             }

//             const authtoken = jwt.sign(data, JWT_SECRET);
//             success = true;
//             res.status(200).json({ success, authtoken });;
//         } else {
//             success = false
//             return res.status(400).json({ error: "Class Code doesn't exist" });
//         }

//     } catch (error) {

//         res.status(500).send("some error occured");
//     }
// })

router.post('/make_timetable', fetchAdmin, Timetable_Imgs.single('tt_img'), [
    body("Class_code", "classcode should be atlist 3 characters").isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    if (!req.file || !req.file.filename) {
        success = false;
        return res.status(400).json({ success, error: "Please provide file" })
    }

    const { filename } = req.file;

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;

        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });

        return res.status(400).json({ success, error: errors.array() });
    }

    const { Class_code } = req.body

    const fetchadmin = await Admin.findById(req.admin.id);
    if (!fetchadmin) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {
                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const standard = Class_code.substring(0, 2);
    let std = await Classes.findOne({ Standard: standard })
    if (!std) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {
                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Please Chooes correct class code" })
    }

    const ClassCode = std.ClassCode;

    try {
        if (ClassCode.includes(Class_code)) {

            let classcode2 = await TimeTable.findOne({ Class_code: Class_code })
            if (classcode2) {
                success = false
                const dirPath = __dirname;
                const dirname = dirPath.slice(0, -17);
                const filePath = dirname + '/TimeTable_imgs/' + filename;
                fs.unlink(filePath, (err) => {
                    if (err) {

                        success = false;
                        return res.status(404).json({ success, error: 'Error deleting file' });
                    }
                });
                return res.status(400).json({ success, error: "TimeTable already exist" })
            }

            let Daily_TimeTable = filename

            let timeyable = new TimeTable({
                Class_code, Daily_TimeTable
            })

            Addtimeyable = await timeyable.save();
            const data = {
                Addtimeyable: {
                    id: Addtimeyable.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.status(200).json({ success, authtoken });;
        } else {
            success = false
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -17);
            const filePath = dirname + '/TimeTable_imgs/' + filename;
            fs.unlink(filePath, (err) => {
                if (err) {
                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
            return res.status(400).json({ error: "Class Code doesn't exist" });
        }

    } catch (error) {
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        res.status(500).send("some error occured");
    }
})


// Router 2:- fetch all time tables http://localhost:5050/api/timetable/fetch_all_timetable_by_classes
router.post('/fetch_all_timetable_by_classes', fetchAdmin, [
    body("Class_code", "classcode should be atlist 3 characters").isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { Class_code } = req.body

    const fetchadmin = await Admin.findById(req.admin.id);
    if (!fetchadmin) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const standard = Class_code.substring(0, 2);
    let std = await Classes.findOne({ Standard: standard })
    if (!std) {
        success = false
        return res.status(400).json({ success, error: "Please Chooes correct class code" })
    }

    try {

        let timetable = await TimeTable.findOne({ Class_code: Class_code })
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).send("some error occured");
    }
})


// Router 3:- Update timetable  http://localhost:5050/api/timetable/edit_timetable/:{id}
router.patch('/edit_timetable/:id', fetchAdmin, Timetable_Imgs.single('tt_img'), async (req, res) => {
    let success = false;
    if (!req.file || !req.file.filename) {
        success = false;
        return res.status(400).json({ success, error: "Please provide file" })
    }

    const { filename } = req.file;

    const fetchadmin = await Admin.findById(req.admin.id);
    if (!fetchadmin) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    let timetable = await TimeTable.findById(req.params.id)
    if (!timetable) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "TimeTable does not exist" })
    }

    try {
        const newTimeTable = {};
        if (filename) { newTimeTable.Daily_TimeTable = filename };

        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + timetable.Daily_TimeTable;
        fs.unlink(filePath, async (err) => {
            if (err) {
                success = false;
                const dirPath = __dirname;
                const dirname = dirPath.slice(0, -17);
                const filePath = dirname + '/TimeTable_imgs/' + filename;
                fs.unlink(filePath, (err) => {
                    if (err) {

                        success = false;
                        return res.status(404).json({ success, error: 'Error deleting file' });
                    }
                });
                return res.status(404).json({ success, error: 'Error deleting file' });
            } else {
                AddtimeTable = await TimeTable.findByIdAndUpdate(req.params.id, { $set: newTimeTable })
                const data = {
                    AddtimeTable: {
                        id: AddtimeTable.id
                    }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                success = true;
                res.status(200).json({ success, authtoken });
            }
        });

    } catch (error) {
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -17);
        const filePath = dirname + '/TimeTable_imgs/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        res.status(500).send("some error occured");
    }
})


// Router 4:- fetch timetables for the students http://localhost:5050/api/timetable/fetch_timetable_for_students
router.post('/fetch_timetable_for_students', fetchStudents, async (req, res) => {
    const fetchsrudent = await Students.findById(req.student.id);
    if (!fetchsrudent) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    try {

        let timetable = await TimeTable.findOne({ Class_code: fetchsrudent.S_Class_code })
        res.status(200).json(timetable);

    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 5:- Fetch all lectures of the teacher http://localhost:5050/api/timetable/fetch_all_lectures_of_the_teachers
// router.post('/fetch_all_lectures_of_the_teachers', fetchTeachers, async (req, res) => {
//     let success = false;

//     const fetchteacher = await Teachers.findById(req.teacher.id);
//     if (!fetchteacher) {
//         success = false
//         return res.status(400).json({ success, error: "Sorry U should ligin first" })
//     }

//     try {

//         let timetable = await TimeTable.find()
//         if (!timetable) {
//             success = false
//             return res.status(400).json({ success, error: "not found" })
//         }

//         const teacher_timetable = []

//         for (let index = 0; index < timetable.length; index++) {
//             const element = timetable[index];
//             const class02A = timetable.find((classObj) => classObj.Class_code === element.Class_code);
//             const dailyTimetable = class02A.Daily_TimeTable[0];

//             for (const day in dailyTimetable) {
//                 const subjects = dailyTimetable[day];
//                 // Iterate over each subject for the current day
//                 for (const subjectKey in subjects) {
//                     const subject = subjects[subjectKey];
//                     const teacherId = subject.T_icard_Id;

//                     if (teacherId == fetchteacher.T_icard_Id) {
//                         const subjectCode = subject.Subject_Code;
//                         const timeFrom = subject.Time_From;
//                         const timeTo = subject.TIme_TO;
//                         const datas = {
//                             weekday: day,
//                             class_code: element.Class_code,
//                             subject_code: subjectCode,
//                             teacher_id: teacherId,
//                             time_from: timeFrom,
//                             time_to: timeTo
//                         }

//                         teacher_timetable.push(datas)
//                     }
//                 }
//             }

//         }


//         res.status(200).json(teacher_timetable)

//     } catch (error) {

//         res.status(500).send("some error occured");
//     }
// })

router.post('/fetch_all_lectures_of_the_teachers', fetchTeachers, [
    body("Class_code", "classcode should be atlist 3 characters").isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { Class_code } = req.body

    const fetchteacher = await Teachers.findById(req.teacher.id);
    if (!fetchteacher) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const standard = Class_code.substring(0, 2);
    let std = await Classes.findOne({ Standard: standard })
    if (!std) {
        success = false
        return res.status(400).json({ success, error: "Please Chooes correct class code" })
    }

    try {
        let timetable = await TimeTable.findOne({ Class_code: Class_code })
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).send("some error occured");
    }
})


module.exports = router