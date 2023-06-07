const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const fetchadmin = require('../../Admin/Middleware/Admin_Middleware')
const fetchTeachers = require('../Middleware/Teacher_Middleware')
const Teachers = require('../Models/Teacher_Model')
const Students = require('../../Students/Models/Student_Model')
const Notice = require('../../Admin/Models/Notice_bord')
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;
const Student_complain_box = require('../../Students/Models/Student_complain_box')
const Teacher_complain_box = require('../Models/Teacher_complain_box')
const Admin = require("../../Admin/Models/Admin_Model")
const Classes = require("../../Classes/Models/Class_module")
const Events = require("../../Admin/Models/Events_Model")
const fs = require("fs");
const Holidays = require('../../Admin/Models/Holiday_Model');
const Material_Files = require("../../Image_Middleware/Material_Files")
const Material = require("../Models/Materials_Model")
const Subjects = require("../../Admin/Models/Subjects_Models")
const Homework = require("../Models/Homework_Model")
const EventPhotos = require("../../Admin/Models/Upload_Event_Photos")
const Result = require("../../Results/Model/Results")
const Admin_complain_box = require("../../Admin/Models/Admin_complainBox")


// Router 1:- Create teacher  http://localhost:5050/api/teachers/create_teacher
router.post('/create_teacher', fetchadmin, [
    body('T_icard_Id', 'icard-Id should be atlest 6 char').isLength({ min: 6 }),
    body('T_name', 'Name should be atlest 2 char').isLength({ min: 2 }),
    body('T_mobile_no', 'Mobile No. should be atlest 10 char').isLength({ min: 10, max: 10 }),
    body('T_address', 'Address should be atlest 10 char').isLength({ min: 10 }),
    body('Subject_code', 'Subject code should be atlest 4 char').isLength({ min: 4 }),
    body('T_Class_code', 'Classs code should be atlest 3 char').isLength({ min: 3 }),
    body('T_Password', 'Password should be atlest 6 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { T_icard_Id, T_name, T_mobile_no, T_address, Subject_code, T_Class_code, T_Password } = req.body;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let t_mob = await Teachers.findOne({ T_mobile_no: req.body.T_mobile_no });
        if (t_mob) {
            success = false
            return res.status(400).json({ success, error: "Sorry teachers with this Mobile num already exists" })
        }

        let t_icard_id = await Teachers.findOne({ T_icard_Id: req.body.T_icard_Id });
        if (t_icard_id) {
            success = false
            return res.status(400).json({ success, error: "Sorry a teachers with this icard-Id already exists" })
        }

        let subjectCode = await Subjects.findOne({ Subject_Code: Subject_code })
        if (!subjectCode) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct subject code" })
        }

        const standard = T_Class_code.substring(0, 2);

        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }
        const ClassCode = std.ClassCode;

        if (ClassCode.includes(T_Class_code)) {

            let teachers = new Teachers({
                Admin_id: req.admin.id, T_icard_Id, T_name, T_mobile_no, T_address, Subject_code, T_Class_code, T_Password
            })

            teachers = await teachers.save();
            const data = {
                teachers: {
                    id: teachers.id
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


// Router 2:- Teachers Login  http://localhost:5050/api/teachers/teachers_login
router.post('/teachers_login', [
    body('T_icard_Id', 'icard-Id should be atlest 6 char').isLength({ min: 6 }),
    body('T_Password', 'Password should be atlest 6 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { T_icard_Id, T_Password } = req.body;
    try {

        let t_icard_id = await Teachers.findOne({ T_icard_Id: T_icard_Id });
        if (!t_icard_id) {
            success = false
            return res.status(400).json({ success, error: "Sorry a Teachers with this icard-id doesn't exsist" })
        }

        if (t_icard_id.T_Password == T_Password) {
            const data = {
                teachers: {
                    id: t_icard_id.id
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


// Router 3:- Fetch all notices for Teavchers http://localhost:5050/api/teachers/get_all_notice_of_teachers
router.post('/get_all_notice_of_teachers', fetchTeachers, async (req, res) => {
    let success = false;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allNotices = await Notice.find()

        const noticeList = []
        const mapAllNotices = allNotices.map((items) => {
            noticeList.push(items)
        })

        const finalList = []

        for (let index = 0; index < noticeList.length; index++) {
            const element = noticeList[index].Group;
            if (element == 'Teacher' || element == 'All') {
                finalList.push(noticeList[index])
            }
        }
        res.json(finalList);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 4:- Fetch all Students class wise http://localhost:5050/api/teachers/fetch_all_students
router.post('/fetch_all_students', fetchTeachers, [
    body('S_Class_code', 'Classs code should be atlest 3 char').isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { S_Class_code } = req.body
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const standard = S_Class_code.substring(0, 2);

        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }
        const ClassCode = std.ClassCode;

        if (ClassCode.includes(S_Class_code)) {
            const allStudents = await Students.find({ S_Class_code: S_Class_code })
            if (allStudents.length == 0) {
                success = false
                return res.status(400).json({ success, error: "Please Enter valid classcode" })
            }
            res.json(allStudents);
        } else {
            success = false
            return res.status(400).json({ error: "Class Code doesn't exist" });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 5:- Fetch all complains from Students http://localhost:5050/api/teachers/fetch_all_complains
router.post('/fetch_all_complains', fetchTeachers, async (req, res) => {
    let success = false;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allComplains = await Student_complain_box.find({ T_icard_Id: fetchTeacher.T_icard_Id })

        res.json(allComplains);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 6:- send Complain to the student and admin http://localhost:5050/api/teachers/send_complain_to_teacher
router.post('/send_complain_to_teacher', fetchTeachers, [
    body('Complain_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Complain_descriptio', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('S_icard_Id', 'Student I-Card Id should be atlest 6 char').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Complain_title, Complain_descriptio, S_icard_Id } = req.body;

    try {

        let teacher = await Teachers.findById(req.teacher.id)
        if (!teacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let student_icard_id = await Students.findOne({ S_icard_Id: S_icard_Id })
        if (!student_icard_id) {
            success = false
            return res.status(400).json({ success, error: "student i-card id does not exist" })
        }

        const T_icard_Id = teacher.T_icard_Id
        let teacher_icard_id = await Teachers.findOne({ T_icard_Id: T_icard_Id })
        if (!teacher_icard_id) {
            success = false
            return res.status(400).json({ success, error: "You cannot send complain to the students" })
        }

        let teacher_complain_box = new Teacher_complain_box({
            S_icard_Id, Complain_title, Complain_descriptio, T_icard_Id
        })

        teacher_complain_box = await teacher_complain_box.save();
        const data = {
            teacher_complain_box: {
                id: teacher_complain_box.id
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


// Router 7:- Fetch complains of Students http://localhost:5050/api/teachers/fetch_complains_of_teacher
router.post('/fetch_complains_of_teacher', fetchTeachers, async (req, res) => {
    let success = false;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allcomplains = await Teacher_complain_box.find({ T_icard_Id: fetchTeacher.T_icard_Id })
        res.json(allcomplains);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 8:- Edite the complain http://localhost:5050/api/teachers/edit_complain/:{id}
router.patch('/edit_complain/:id', fetchTeachers, [
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
        let complain = await Teacher_complain_box.findById(req.params.id);
        if (!complain) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let teacher = await Teachers.findById(req.teacher.id)
        if (!teacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const T_icard_Id = teacher.T_icard_Id
        const S_icard_Id = complain.S_icard_Id

        if (complain.T_icard_Id !== teacher.T_icard_Id) {
            success = false
            return res.status(400).json({ success, error: "you can not edit this complain" })
        }


        const newComplain = {};
        if (T_icard_Id) { newComplain.T_icard_Id = T_icard_Id };
        if (Complain_title) { newComplain.Complain_title = Complain_title };
        if (Complain_descriptio) { newComplain.Complain_descriptio = Complain_descriptio };
        if (S_icard_Id) { newComplain.S_icard_Id = S_icard_Id };
        newComplain.Date = Date.now()

        complain = await Teacher_complain_box.findByIdAndUpdate(req.params.id, { $set: newComplain })

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


// Router 9:- Delete the complain http://localhost:5050/api/teachers/delete_complain/:{id}
router.delete('/delete_complain/:id', fetchTeachers, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        let complain = await Teacher_complain_box.findById(id);
        if (!complain) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let teacher = await Teachers.findById(req.teacher.id)
        if (!teacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        if (complain.T_icard_Id == teacher.T_icard_Id) {
            const complainBox = await Teacher_complain_box.findByIdAndDelete(id)

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


// Router:-10  Update Teacher Details http://localhost:5050/api/teachers/update_teacher_details/:{id}
router.patch('/update_teacher_details/:id', fetchadmin, [
    body('T_icard_Id', 'icard-Id should be atlest 6 char').isLength({ min: 6 }),
    body('T_name', 'Name should be atlest 2 char').isLength({ min: 2 }),
    body('T_mobile_no', 'Mobile No. should be atlest 10 char').isLength({ min: 10, max: 10 }),
    body('T_address', 'Address should be atlest 10 char').isLength({ min: 10 }),
    body('Subject_code', 'Subject code should be atlest 4 char').isLength({ min: 4 }),
    body('T_Class_code', 'Classs code should be atlest 3 char').isLength({ min: 3 }),
    body('T_Password', 'Password should be atlest 6 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { T_icard_Id, T_name, T_mobile_no, T_address, Subject_code, T_Class_code, T_Password } = req.body;

    try {
        let teacher = await Teachers.findById(req.params.id);
        if (!teacher) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let admin = await Admin.findById(req.admin.id)
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "U can't update the details" })
        }

        const loggedInUserId = req.params.id;

        const users = await Teachers.find({ _id: { $ne: loggedInUserId } });

        for (let index = 0; index < users.length; index++) {
            const element = users[index];
            if (element.T_mobile_no == T_mobile_no) {
                success = false
                return res.status(400).json({ success, error: "Sorry teacher with this Mobile num already exists" })
            }
        }

        let subjectCode = await Subjects.findOne({ Subject_Code: Subject_code })
        if (!subjectCode) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct subject code" })
        }
        const standard = T_Class_code.substring(0, 2);

        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }
        const ClassCode = std.ClassCode;

        if (ClassCode.includes(T_Class_code)) {
            const newTeacher = {};
            if (T_icard_Id) { newTeacher.T_icard_Id = T_icard_Id };
            if (T_name) { newTeacher.T_name = T_name };
            if (T_mobile_no) { newTeacher.T_mobile_no = T_mobile_no };
            if (T_address) { newTeacher.T_address = T_address };
            if (Subject_code) { newTeacher.Subject_code = Subject_code };
            if (T_Class_code) { newTeacher.T_Class_code = T_Class_code };
            if (T_Password) { newTeacher.T_Password = T_Password };

            teacher = await Teachers.findByIdAndUpdate(req.params.id, { $set: newTeacher })

            const data = {
                teacher: {
                    id: teacher.id
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


// Router 11:- Delete the teachers http://localhost:5050/api/teachers/delete_teachers_info/:{id}
router.delete('/delete_teachers_info/:id', fetchadmin, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        let teacher = await Teachers.findById(id);
        if (!teacher) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        let admin = await Admin.findById(req.admin.id)
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U cannot delete the student" })
        }


        const deleteTeachers = await Teachers.findByIdAndDelete(id)

        const data = {
            deleteTeachers: {
                id: deleteTeachers.id
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


// Router 12:- Fetch all events for teachers http://localhost:5050/api/teachers/get_all_events_of_teachers
router.post('/get_all_events_of_teachers', fetchTeachers, async (req, res) => {
    let success = false;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
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
            if (element == 'Teachers' || element == 'All') {
                finalList.push(eventList[index])
            }
        }

        res.json(finalList);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 13:- Fetch all holidays for teachers http://localhost:5050/api/teachers/get_all_holidays_of_teachers
router.post('/get_all_holidays_of_teachers', fetchTeachers, async (req, res) => {
    let success = false;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
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
            if (element == 'Teachers' || element == 'All') {
                finalList.push(holidayList[index])
            }
        }

        res.json(finalList);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 14:- Add Subject materials http://localhost:5050/api/teachers/add_material
router.post('/add_material', fetchTeachers, Material_Files.single("material_file"), [
    body('T_icard_Id', 'ID should be atlest 6 char').isLength({ min: 6 }),
    body('Subject_code', 'Please enter currect subjectr code').isLength({ min: 5, max: 5 }),
    body('Class_code', 'Please enter currect class code').isLength({ min: 3, max: 3 }),
    body('Material_title', 'Please enter apt title').isLength({ min: 3 }),
    body('Material_description', 'Please enter apt description').isLength({ min: 3 }),
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
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: errors.array() });
    }
    const { T_icard_Id, Subject_code, Class_code, Material_title, Material_description } = req.body;

    const fetchTeacher = await Teachers.findById(req.teacher.id);
    if (!fetchTeacher) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    let t_icard_id = await Teachers.findOne({ T_icard_Id: req.body.T_icard_Id });
    if (!t_icard_id) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry you cannot use this id" })
    }

    let subjectCode = await Subjects.findOne({ Subject_Code: Subject_code })
    if (!subjectCode) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Please Chooes correct subject code" })
    }

    const standard = subjectCode.Standard
    let std = await Classes.findOne({ Standard: standard })
    if (!std) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Please Chooes correct class code" })
    }

    const ClassCode = std.ClassCode;

    if (ClassCode.includes(Class_code)) {

        try {

            const Material_files = filename

            let material = new Material({
                T_icard_Id, Subject_code, Class_code, Material_title, Material_description, Material_files
            })

            material = await material.save();
            const data = {
                material: {
                    id: material.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken });
        } catch (error) {
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -16);
            const filePath = dirname + '/Material/' + filename;
            fs.unlink(filePath, (err) => {
                if (err) {

                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
            res.status(500).send("some error occured");
        }

    } else {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ error: "Class Code doesn't exist" });
    }
})


// Router 15:- Edit Subject materials http://localhost:5050/api/teachers/edit_material/:{id}
router.patch('/edit_material/:id', fetchTeachers, Material_Files.single("material_file"), [
    body('T_icard_Id', 'ID should be atlest 6 char').isLength({ min: 6 }),
    body('Subject_code', 'Please enter currect subjectr code').isLength({ min: 5, max: 5 }),
    body('Class_code', 'Please enter currect class code').isLength({ min: 3, max: 3 }),
    body('Material_title', 'Please enter apt title').isLength({ min: 3 }),
    body('Material_description', 'Please enter apt description').isLength({ min: 3 }),
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
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: errors.array() });
    }

    const { T_icard_Id, Subject_code, Class_code, Material_title, Material_description } = req.body;
    const fetchTeacher = await Teachers.findById(req.teacher.id);
    if (!fetchTeacher) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    let material = await Material.findById(req.params.id);
    if (!material) {
        success = false;
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(404).json({ success, error: "not found" })
    }

    let t_icard_id = await Teachers.findOne({ T_icard_Id: req.body.T_icard_Id });
    if (!t_icard_id) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry you cannot use this id" })
    }

    let subjectCode = await Subjects.findOne({ Subject_Code: Subject_code })
    if (!subjectCode) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Please Chooes correct subject code" })
    }


    const standard = subjectCode.Standard
    let std = await Classes.findOne({ Standard: standard })
    if (!std) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Please Chooes correct class code" })
    }

    const ClassCode = std.ClassCode;

    if (ClassCode.includes(Class_code)) {
        try {
            const nameOfFile = material.Material_files;

            const newMaterial = {};
            if (T_icard_Id) { newMaterial.T_icard_Id = T_icard_Id };
            if (Subject_code) { newMaterial.Subject_code = Subject_code };
            if (Class_code) { newMaterial.Class_code = Class_code };
            if (Material_title) { newMaterial.Material_title = Material_title };
            if (Material_description) { newMaterial.Material_description = Material_description };
            if (filename) { newMaterial.Material_files = filename };
            newMaterial.Date = Date.now()

            const dirPath = __dirname;  // C: \Users\admin\Desktop\E_diary\Teachers\Router
            const dirname = dirPath.slice(0, -16);
            const filePath = dirname + '/Material/' + nameOfFile;  // C: \Users\admin\Desktop\E_diary
            fs.unlink(filePath, async (err) => {
                if (err) {
                    success = false;
                    const dirPath = __dirname;
                    const dirname = dirPath.slice(0, -16);
                    const filePath = dirname + '/Material/' + filename;
                    fs.unlink(filePath, (err) => {
                        if (err) {

                            success = false;
                            return res.status(404).json({ success, error: 'Error deleting file' });
                        }
                    });
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
                else {
                    editMaterial = await Material.findByIdAndUpdate(req.params.id, { $set: newMaterial })

                    const data = {
                        editMaterial: {
                            id: editMaterial.id
                        }
                    }

                    const authtoken = jwt.sign(data, JWT_SECRET);
                    success = true;
                    res.json({ success, authtoken });
                }
            });

        } catch (error) {
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -16);
            const filePath = dirname + '/Material/' + filename;
            fs.unlink(filePath, (err) => {
                if (err) {

                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
            res.status(500).send("some error occured");
        }
    } else {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ error: "Class Code doesn't exist" });
    }

})


// Router 16:- Delete Subject materials http://localhost:5050/api/teachers/delete_material/:{id}
router.delete('/delete_material/:id', fetchTeachers, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let material = await Material.findById(req.params.id);
        if (!material) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const nameOfFile = material.Material_files;

        const dirPath = __dirname;  // C: \Users\admin\Desktop\E_diary\Teachers\Router
        const dirname = dirPath.slice(0, -16);
        const filePath = dirname + '/Material/' + nameOfFile;  // C: \Users\admin\Desktop\E_diary
        fs.unlink(filePath, async (err) => {
            if (err) {

                success = false;
                res.status(404).json({ success, error: 'Error deleting file' });
            } else {
                delMaterial = await Material.findByIdAndDelete(id)

                const data = {
                    delMaterial: {
                        id: delMaterial.id
                    }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                success = true;
                res.json({ success, authtoken });
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 17:- Fetch all materials of the teachers http://localhost:5050/api/teachers/fetch_all_materials
router.post('/fetch_all_materials', fetchTeachers, [
    body('Class_code', 'Please enter correct class code').isLength({ min: 3, max: 3 }),
], async (req, res) => {
    let success = false
    const { Class_code } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, error: errors.array() });
    }
    try {
        let fetchTeacher = await Teachers.findById(req.teacher.id)
        if (!fetchTeacher) {
            success = false
            return res.send(500).json({ success, error: "Youy should login first" })
        }

        const standard = Class_code.substring(0, 2);

        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }

        const material = []

        const ClassCode = std.ClassCode;

        if (ClassCode.includes(Class_code)) {

            let materials = await Material.find({ T_icard_Id: fetchTeacher.T_icard_Id })

            for (let index = 0; index < materials.length; index++) {
                const element = materials[index].Class_code;
                if (element === Class_code) {
                    material.push(materials[index])
                }
            }
        } else {
            success = false
            return res.status(400).json({ success, error: "Class Code doesn't exist" });
        }

        const data = material.reverse();
        if (data.length == 0) {
            success = false
            return res.status(400).json({ success, error: "Data Doesn't Exist" });
        }
        res.json({ data })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 18:- Send homework http://localhost:5050/api/teachers/send_homework
router.post('/send_homework', fetchTeachers, [
    body('T_icard_Id', 'ID should be atlest 6 char').isLength({ min: 6 }),
    body('Subject_code', 'Please enter currect subjectr code').isLength({ min: 5, max: 5 }),
    body('Class_code', 'Please enter currect class code').isLength({ min: 3, max: 3 }),
    body('Homework_title', 'Please enter apt title').isLength({ min: 3 }),
    body('Homework_description', 'Please enter apt description').isLength({ min: 3 }),
    body('Homework_given_date', 'Please enter apt homework given date').isDate(),
    body('Homework_due_date', 'Please enter apt homework due date').isDate(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { T_icard_Id, Subject_code, Class_code, Homework_title, Homework_description, Homework_given_date, Homework_due_date } = req.body;

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

    let subjectCode = await Subjects.findOne({ Subject_Code: Subject_code })
    if (!subjectCode) {
        success = false
        return res.status(400).json({ success, error: "Please Chooes correct subject code" })
    }
    const standard = subjectCode.Standard
    let std = await Classes.findOne({ Standard: standard })
    if (!std) {
        success = false
        return res.status(400).json({ success, error: "Please Chooes correct class code" })
    }

    const ClassCode = std.ClassCode;

    if (ClassCode.includes(Class_code)) {
        try {
            let homework = new Homework({
                T_icard_Id, Subject_code, Class_code, Homework_title, Homework_description, Homework_given_date, Homework_due_date
            })

            homework = await homework.save();
            const data = {
                homework: {
                    id: homework.id
                }
            }

            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("some error occured");
        }
    } else {
        success = false
        return res.status(400).json({ error: "Class Code doesn't exist" });
    }
})


// Router 19:- Edit Homework http://localhost:5050/api/teachers/edit_homework/:{id}
router.patch('/edit_homework/:id', fetchTeachers, [
    body('T_icard_Id', 'ID should be atlest 6 char').isLength({ min: 6 }),
    body('Subject_code', 'Please enter currect subjectr code').isLength({ min: 5, max: 5 }),
    body('Class_code', 'Please enter currect class code').isLength({ min: 3, max: 3 }),
    body('Homework_title', 'Please enter apt title').isLength({ min: 3 }),
    body('Homework_description', 'Please enter apt description').isLength({ min: 3 }),
    body('Homework_given_date', 'Please enter apt homework given date').isDate(),
    body('Homework_due_date', 'Please enter apt homework due date').isDate(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { T_icard_Id, Subject_code, Class_code, Homework_title, Homework_description, Homework_given_date, Homework_due_date } = req.body;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let homework = await Homework.findById(req.params.id)
        if (!homework) {
            success = false
            return res.status(400).json({ success, error: "Not found" })
        }

        let t_icard_id = await Teachers.findOne({ T_icard_Id: req.body.T_icard_Id });
        if (!t_icard_id) {
            success = false
            return res.status(400).json({ success, error: "Sorry you cannot use this id" })
        }

        let subjectCode = await Subjects.findOne({ Subject_Code: Subject_code })
        if (!subjectCode) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct subject code" })
        }

        const standard = subjectCode.Standard
        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }

        const ClassCode = std.ClassCode;

        if (ClassCode.includes(Class_code)) {
            const newHomework = {};
            if (T_icard_Id) { newHomework.T_icard_Id = T_icard_Id };
            if (Subject_code) { newHomework.Subject_code = Subject_code };
            if (Class_code) { newHomework.Class_code = Class_code };
            if (Homework_title) { newHomework.Homework_title = Homework_title };
            if (Homework_description) { newHomework.Homework_description = Homework_description };
            if (Homework_given_date) { newHomework.Homework_given_date = Homework_given_date };
            if (Homework_due_date) { newHomework.Homework_due_date = Homework_due_date };
            newHomework.Date = Date.now();

            editHomework = await Homework.findByIdAndUpdate(req.params.id, { $set: newHomework })

            const data = {
                editHomework: {
                    id: editHomework.id
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


// Router 20:- Delete homework http://localhost:5050/api/teachers/delete_homework/:{id}
router.delete('/delete_homework/:id', fetchTeachers, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        const fetchTeacher = await Teachers.findById(req.teacher.id);
        if (!fetchTeacher) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let homework = await Homework.findById(req.params.id);
        if (!homework) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }


        delhomework = await Homework.findByIdAndDelete(id)

        const data = {
            delhomework: {
                id: delhomework.id
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


// Router 21:- Fetch all homeworks of the teachers http://localhost:5050/api/teachers/fetch_all_homeworks
router.post('/fetch_all_homeworks', fetchTeachers, [
    body('Class_code', 'Please enter currect class code').isLength({ min: 3, max: 3 }),
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Class_code } = req.body;
    try {
        let fetchTeacher = await Teachers.findById(req.teacher.id)
        if (!fetchTeacher) {
            success = false
            res.send(500).json({ success, error: "Youy should login first" })
        }

        const standard = Class_code.substring(0, 2);
        let std = await Classes.findOne({ Standard: standard })
        if (!std) {
            success = false
            return res.status(400).json({ success, error: "Please Chooes correct class code" })
        }

        const ClassCode = std.ClassCode;

        const allHomeWork = []

        if (ClassCode.includes(Class_code)) {
            let homework = await Homework.find({ T_icard_Id: fetchTeacher.T_icard_Id })
            if (homework.length > 0) {
                for (let index = 0; index < homework.length; index++) {
                    const element = homework[index];
                    if (element.Class_code === Class_code) {
                        allHomeWork.push(element)
                    }
                }
                res.json(allHomeWork)
            }
            else {
                success = false
                res.json({ success, error: "No homework found" })
            }
        } else {
            success = false
            return res.status(400).json({ error: "Class Code doesn't exist" });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 22:- Fetch all details of the login students http://localhost:5050/api/teachers/fetch_all_details_of_login_teacher
router.post('/fetch_all_details_of_login_teacher', fetchTeachers, async (req, res) => {
    let success = false
    try {
        let teacher = await Teachers.findById(req.teacher.id)
        if (!teacher) {
            success = false
            res.send(500).json({ success, error: "Youy should login first" })
        }
        res.json(teacher)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})


// Router 23:- Get all subjects class wise  http://localhost:5050/api/teachers/get_all_subjects_class_wise
router.post('/get_all_subjects_class_wise', fetchTeachers, [
    body('Standard', 'Standard should be atlist 2 character').isLength({ min: 2 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Standard } = req.body;
    try {
        let teacher = await Teachers.findById(req.teacher.id)
        if (!teacher) {
            success = false
            res.send(500).json({ success, error: "Youy should login first" })
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


// Router:24 Get ClassCode for teachers http://localhost:5050/api/teachers/get_all_classes
router.post('/get_all_classes', fetchTeachers, async (req, res) => {
    let success = false;
    try {
        let teacher = await Teachers.findById(req.teacher.id)
        if (!teacher) {
            success = false
            res.send(500).json({ success, error: "Youy should login first" })
        }

        const classes = await Classes.find()
        if (!classes) {
            success = false
            return res.status(400).json({ error: "This class code is already exist" });
        }

        res.json(classes);


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// Router 29:- fetch all event images http://localhost:5050/api/teachers/fetch_all_events_photoes
router.post('/fetch_all_events_photoes', fetchTeachers, async (req, res) => {
    let success = false

    let teacher = await Teachers.findById(req.teacher.id)
    if (!teacher) {
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
            res.json(e_photos)
        }
    } catch (e) {
        success = false;
        res.status(500).send("some error occured");
    }
})



// Router 30:- fetch results  http://localhost:5050/api/teachers/fetch_results_of_student
router.post('/fetch_results_of_student', fetchTeachers, [
    body('S_icard_Id', 'Id should be atlist 6 characher').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { S_icard_Id } = req.body;

    let teacher = await Teachers.findById(req.teacher.id)
    if (!teacher) {
        success = false
        res.send(500).json({ success, error: "Youy should login first" })
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

// Router 31:- fetch all the complains Group wise http://localhost:5050/api/teachers/fetch_all_complains_of_admin
router.post('/fetch_all_complains_of_admin', fetchTeachers, async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    try {
        let teacher = await Teachers.findById(req.teacher.id)
        if (!teacher) {
            success = false
            return res.status(500).json({ success, error: "Youy should login first" })
        }

        const complains = await Admin_complain_box.find({ User_Id: teacher.T_icard_Id })
        if (complains.length == 0) {
            success = false
            return res.json("No Complain Found")
        }
        else {
            res.json(complains)
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

module.exports = router