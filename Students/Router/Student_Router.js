const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const fetchadmin = require('../../Admin/Middleware/Admin_Middleware')
const fetchStudent = require('../Middleware/Student_Middleware')
const Students = require('../Models/Student_Model')
const Notice = require('../../Admin/Models/Notice_bord')
const Teachers = require('../../Teachers/Models/Teacher_Model')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;
const Student_complain_box = require('../Models/Student_complain_box')
const Teacher_complain_box = require('../../Teachers/Models/Teacher_complain_box')
const Admin = require("../../Admin/Models/Admin_Model")
const Classes = require("../../Classes/Models/Class_module")
const Events = require("../../Admin/Models/Events_Model")
const Fees_set = require("../../Admin/Models/Fees_Set_Model")
const fs = require("fs");
const Holidays = require('../../Admin/Models/Holiday_Model');
const Material = require("../../Teachers/Models/Materials_Model")
const Subjects = require("../../Admin/Models/Subjects_Models")
const Homework = require("../../Teachers/Models/Homework_Model")
const EventPhotos = require("../../Admin/Models/Upload_Event_Photos")



// Router 1:- Create Students  http://localhost:5050/api/students/create_students
router.post('/create_students', fetchadmin, [
    body('S_icard_Id', 'Icard-id should be atlest 6 char').isLength({ min: 6 }),
    body('S_name', 'Name should be atlest 2 char').isLength({ min: 2 }),
    body('S_mobile_no', 'Mobile Number should be atlest 10 char').isLength({ min: 10, max: 10 }),
    body('S_address', 'Address should be atlest 10 char').isLength({ min: 10 }),
    body('S_standard', 'Standard should be atlest 2 char').isLength({ min: 2 }),
    body('S_Class_code', 'Class code should be atlest 10 char').isLength({ min: 2 }),
    body('S_Password', 'Password should be atlest 10 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { S_icard_Id, S_name, S_mobile_no, S_address, S_standard, S_Class_code, S_Password } = req.body;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let s_mob = await Students.findOne({ S_mobile_no: req.body.S_mobile_no });
        if (s_mob) {
            success = false
            return res.status(400).json({ success, error: "Sorry students with this Mobile num already exists" })
        }

        let s_icard_id = await Students.findOne({ S_icard_Id: req.body.S_icard_Id });
        if (s_icard_id) {
            success = false
            return res.status(400).json({ success, error: "Sorry a students with this icard-Id already exists" })
        }

        const standard = S_Class_code.substring(0, 2);

        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }
        const ClassCode = std.ClassCode;

        if (ClassCode.includes(S_Class_code)) {

            let students = new Students({
                Admin_id: req.admin.id, S_icard_Id, S_name, S_mobile_no, S_address, S_standard, S_Class_code, S_Password
            })

            students = await students.save();
            const data = {
                students: {
                    id: students.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken });
        } else {
            success = false
            return res.status(400).json({ error: "Class Code doesn't exist" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 2:- Student Login  http://localhost:5050/api/students/student_login
router.post('/student_login', [
    body('S_icard_Id', 'Icard-id should be atlest 6 char').isLength({ min: 6 }),
    body('S_Password', 'Password should be atlest 10 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { S_icard_Id, S_Password } = req.body;
    try {

        let s_icard_id = await Students.findOne({ S_icard_Id: S_icard_Id });
        if (!s_icard_id) {
            success = false
            return res.status(400).json({ success, error: "Sorry a students with this icard-Id doesn't exsist" })
        }

        if (s_icard_id.S_Password == S_Password) {
            const data = {
                students: {
                    id: s_icard_id.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken });
        }
        else {
            success = false;
            message = "please enter valide password"
            res.json({ success, message });
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 3:- Fetch all notices for Students http://localhost:5050/api/students/get_all_notice_of_students
router.post('/get_all_notice_of_students', fetchStudent, async (req, res) => {
    let success = false;
    try {
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allNotices = await Notice.find()

        const noticeList = []
        allNotices.map((items) => {
            noticeList.push(items)
        })

        const finalList = []

        for (let index = 0; index < noticeList.length; index++) {
            const element = noticeList[index].Group;
            if (element == 'Student' || element == 'All') {
                finalList.push(noticeList[index])
            }
        }

        res.json(finalList);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 4:- Fetch all teachers http://localhost:5050/api/students/fetch_all_teachers
router.post('/fetch_all_teachers', fetchStudent, async (req, res) => {
    let success = false;
    try {
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allTeachers = await Teachers.find()
        res.json(allTeachers);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 5:- send Complain to the teacher and admin http://localhost:5050/api/students/send_complain_to_teacher
router.post('/send_complain_to_teacher', fetchStudent, [
    body('Complain_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Complain_descriptio', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('T_icard_Id', 'Teacher I-Card Id should be atlest 6 char').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { Complain_title, Complain_descriptio, T_icard_Id } = req.body;

    try {

        let student = await Students.findById(req.student.id)
        if (!student) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let S_icard_Id = student.S_icard_Id
        let student_icard_id = await Students.findOne({ S_icard_Id: S_icard_Id })
        if (!student_icard_id) {
            success = false
            return res.status(400).json({ success, error: "You cannot send complain to the teachers" })
        }

        let teacher = await Teachers.findOne({ T_icard_Id: T_icard_Id })
        if (!teacher) {
            success = false
            return res.status(400).json({ success, error: "Teacher i-card id does not exist" })
        }

        let student_complain_box = new Student_complain_box({
            S_icard_Id, Complain_title, Complain_descriptio, T_icard_Id
        })

        student_complain_box = await student_complain_box.save();
        const data = {
            student_complain_box: {
                id: student_complain_box.id
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


// Router 6:- Fetch all complains from teachers http://localhost:5050/api/students/fetch_all_complains
router.post('/fetch_all_complains', fetchStudent, async (req, res) => {
    let success = false;
    try {
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allComplains = await Teacher_complain_box.find({ S_icard_Id: fetchStudent.S_icard_Id })

        res.json(allComplains);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 7:- Fetch complains of Students http://localhost:5050/api/students/fetch_complains_of_student
router.post('/fetch_complains_of_student', fetchStudent, async (req, res) => {
    let success = false;
    try {
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allcomplains = await Student_complain_box.find({ S_icard_Id: fetchStudent.S_icard_Id })
        res.json(allcomplains);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 8:- Edite the complain http://localhost:5050/api/students/edit_complain/:{id}
router.patch('/edit_complain/:id', fetchStudent, [
    body('Complain_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Complain_descriptio', 'Decription should be atlest 10 char').isLength({ min: 10 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Complain_title, Complain_descriptio } = req.body;

    try {
        let complain = await Student_complain_box.findById(req.params.id);
        if (!complain) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let student = await Students.findById(req.student.id)
        if (!student) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const S_icard_Id = student.S_icard_Id
        const T_icard_Id = complain.T_icard_Id

        if (complain.S_icard_Id !== student.S_icard_Id) {
            success = false
            return res.status(400).json({ success, error: "you can not edit this complain" })
        }


        const newComplain = {};
        if (S_icard_Id) { newComplain.S_icard_Id = S_icard_Id };
        if (Complain_title) { newComplain.Complain_title = Complain_title };
        if (Complain_descriptio) { newComplain.Complain_descriptio = Complain_descriptio };
        if (T_icard_Id) { newComplain.T_icard_Id = T_icard_Id };
        newComplain.Date = Date.now()

        complain = await Student_complain_box.findByIdAndUpdate(req.params.id, { $set: newComplain })

        const data = {
            complain: {
                id: complain.id
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


// Router 9:- Delete the complain http://localhost:5050/api/students/delete_complain/:{id}
router.delete('/delete_complain/:id', fetchStudent, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        let complain = await Student_complain_box.findById(id);
        if (!complain) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let student = await Students.findById(req.student.id)
        if (!student) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        if (complain.S_icard_Id == student.S_icard_Id) {
            const complainBox = await Student_complain_box.findByIdAndDelete(id)

            const data = {
                complainBox: {
                    id: complainBox.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken });

        }
        else {
            success = false
            return res.status(400).json({ success, error: "You can not delete this complain" })
        }


    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router:-10  Update Student Details http://localhost:5050/api/students/update_student_details/:{id}
router.patch('/update_student_details/:id', fetchadmin, [
    body('S_icard_Id', 'Icard-id should be atlest 6 char').isLength({ min: 6 }),
    body('S_name', 'Name should be atlest 2 char').isLength({ min: 2 }),
    body('S_mobile_no', 'Mobile Number should be atlest 10 char').isLength({ min: 10, max: 10 }),
    body('S_address', 'Address should be atlest 10 char').isLength({ min: 10 }),
    body('S_standard', 'Standard should be atlest 2 char').isLength({ min: 2 }),
    body('S_Class_code', 'Class code should be atlest 10 char').isLength({ min: 2 }),
    body('S_Password', 'Password should be atlest 10 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { S_icard_Id, S_name, S_mobile_no, S_address, S_standard, S_Class_code, S_Password } = req.body;

    try {
        let student = await Students.findById(req.params.id);
        if (!student) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let admin = await Admin.findById(req.admin.id)
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "U can't update the details" })
        }

        const loggedInUserId = req.params.id;

        const users = await Students.find({ _id: { $ne: loggedInUserId } });

        for (let index = 0; index < users.length; index++) {
            const element = users[index];
            if (element.S_mobile_no == S_mobile_no) {
                success = false
                return res.status(400).json({ success, error: "Sorry students with this Mobile num already exists" })
            }
        }

        const standard = S_Class_code.substring(0, 2);

        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }
        const ClassCode = std.ClassCode;

        if (ClassCode.includes(S_Class_code)) {
            const newStudents = {};
            if (S_icard_Id) { newStudents.S_icard_Id = S_icard_Id };
            if (S_name) { newStudents.S_name = S_name };
            if (S_mobile_no) { newStudents.S_mobile_no = S_mobile_no };
            if (S_address) { newStudents.S_address = S_address };
            if (S_standard) { newStudents.S_standard = S_standard };
            if (S_Class_code) { newStudents.S_Class_code = S_Class_code };
            if (S_Password) { newStudents.S_Password = S_Password };

            student = await Students.findByIdAndUpdate(req.params.id, { $set: newStudents })

            const data = {
                student: {
                    id: student.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken });
        } else {
            success = false
            return res.status(400).json({ error: "Class Code doesn't exist" });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }

})


// Router 11:- Delete the Students http://localhost:5050/api/students/delete_students_info/:{id}
router.delete('/delete_students_info/:id', fetchadmin, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        let student = await Students.findById(id);
        if (!student) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let admin = await Admin.findById(req.admin.id)
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U cannot delete the student" })
        }


        const deleteStudents = await Students.findByIdAndDelete(id)

        const data = {
            deleteStudents: {
                id: deleteStudents.id
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


// Router 12:- Fetch all events for Students http://localhost:5050/api/students/get_all_events_of_students
router.post('/get_all_events_of_students', fetchStudent, async (req, res) => {
    let success = false;
    try {
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allEvent = await Events.find()

        const eventList = []
        allEvent.map((items) => {
            eventList.push(items)
        })

        const finalList = []

        for (let index = 0; index < eventList.length; index++) {
            const element = eventList[index].Groups;
            if (element == 'Students' || element == 'All') {
                finalList.push(eventList[index])
            }
        }

        res.json(finalList);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 13:- Fetch all holidays for Students http://localhost:5050/api/students/get_all_holidays_of_students
router.post('/get_all_holidays_of_students', fetchStudent, async (req, res) => {
    let success = false;
    try {
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allHoliday = await Holidays.find()

        const holidayList = []
        allHoliday.map((items) => {
            holidayList.push(items)
        })

        const finalList = []

        for (let index = 0; index < holidayList.length; index++) {
            const element = holidayList[index].Groups;
            if (element == 'Students' || element == 'All') {
                finalList.push(holidayList[index])
            }
        }

        res.json(finalList);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 14:- Fetch fees of student http://localhost:5050/api/students/fetch_fees
router.post('/fetch_fees', fetchStudent, [
    body('Standard', 'please enter a standard').isLength({ min: 2, max: 2 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    try {
        const { Standard } = req.body;
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allfees = await Fees_set.findOne({ Standard: Standard });
        if (allfees) {
            res.json(allfees);
        }
        else {
            success = false
            res.json({ success, error: "Sorry U should ligin first" })
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

// Router 15:- Fetch all materials of the subject http://localhost:5050/api/students/fetch_all_materials_of_the_subjects
router.post('/fetch_all_materials_of_the_subjects', fetchStudent, [
    body('Subject_code', 'please enter a valide subject code').isLength({ min: 5, max: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    let success = false
    try {
        const fetchStudent = await Students.findById(req.student.id);
        if (!fetchStudent) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let sub = await Subjects.findOne({ Subject_Code: req.body.Subject_code })
        if (!sub) {
            success = false
            return res.status(400).json({ success, error: "Please try to use correct subject code" })
        }

        let materials = await Material.find({ Subject_code: req.body.Subject_code })
        if (materials.length == 0) {
            success = false
            return res.status(400).json({ success, error: "Data Not found" })
        }
        else {
            res.json(materials)
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 16:- Fetch all homeworks of the subjects http://localhost:5050/api/students/fetch_all_homeworks_of_the_subject
router.post('/fetch_all_homeworks_of_the_subject', fetchStudent, async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let fetchstudent = await Students.findById(req.student.id)
        if (!fetchstudent) {
            success = false
            res.send(500).json({ success, error: "Youy should login first" })
        }

        let homework = await Homework.find({ Class_code: fetchstudent.S_Class_code })
        res.json(homework)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 17:- Fetch all details of the login students http://localhost:5050/api/students/fetch_all_details_of_login_students
router.post('/fetch_all_details_of_login_students', fetchStudent, async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let student = await Students.findById(req.student.id)
        if (!student) {
            success = false
            res.send(500).json({ success, error: "Youy should login first" })
        }
        res.json(student)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 18:- Get all subjects class wise  http://localhost:5050/api/students/get_all_subjects_class_wise
router.post('/get_all_subjects_class_wise', fetchStudent, async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    try {
        let student = await Students.findById(req.student.id)
        if (!student) {
            success = false
            res.send(500).json({ success, error: "Youy should login first" })
        }

        let subjects = await Subjects.find({ Standard: student.S_standard })
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


// Router 29:- fetch all event images http://localhost:5050/api/students/fetch_all_events_photoes
router.post('/fetch_all_events_photoes', fetchStudent, async (req, res) => {
    let success = false

    let student = await Students.findById(req.student.id)
    if (!student) {
        success = false
        res.send(500).json({ success, error: "Youy should login first" })
    }

    try {
        const e_photos = await EventPhotos.find()
        if (e_photos.length == 0) {
            success = false
            return res.status(400).json({ success, error: "No Event Photos Found" })
        }
        else {
            res.json({ e_photos })
        }
    } catch (e) {
        success = false;
        res.status(500).send("some error occured");
    }
})


module.exports = router
