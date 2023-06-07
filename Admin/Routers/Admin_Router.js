const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require("../Models/Admin_Model")
const Teachers = require("../../Teachers/Models/Teacher_Model")
const Students = require("../../Students/Models/Student_Model")
var jwt = require('jsonwebtoken');
const fetchadmin = require('../Middleware/Admin_Middleware');
require('dotenv').config()
const Student_complain_box = require("../../Students/Models/Student_complain_box")
const Teacher_complain_box = require("../../Teachers/Models/Teacher_complain_box")
const Events = require('../Models/Events_Model')
const Holidays = require("../Models/Holiday_Model")
const Fees_set = require("../Models/Fees_Set_Model")
const Homework = require("../../Teachers/Models/Homework_Model")
const Classes = require("../../Classes/Models/Class_module")
const Material = require("../../Teachers/Models/Materials_Model")
const Events_photoes = require("../../Image_Middleware/Event_photos")
const EventPhotos = require("../Models/Upload_Event_Photos")
const JWT_SECRET = process.env.JWT_SECRET;
const fs = require("fs")
const Admin_complain_box = require("../Models/Admin_complainBox")



// Router 1 :- Admin Login http://localhost:5050/api/admin/admin_login
router.post('/admin_login', [
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('Password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { Mobile_no, Password } = req.body;
    try {

        let admin = await Admin.findOne({ Mobile_no });
        if (!admin) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" });
        }

        if (Password !== admin.Password) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            admin: {
                id: admin._id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({ success, authtoken })

    } catch (error) {

        res.status(500).send("Internal Server Error");
    }
});


// Router 2:- Fetch all Teachers http://localhost:5050/api/admin/fetch_all_teachers
router.post('/fetch_all_teachers', fetchadmin, async (req, res) => {
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allTeachers = await Teachers.find()
        if (allTeachers.length == 0) {
            return res.json("Teachers Not Found")
        }
        res.json(allTeachers);

    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 3:- Fetch all Students http://localhost:5050/api/admin/fetch_all_Students
router.post('/fetch_all_Students', fetchadmin, [
    body('S_Class_code', 'Enter a valid classcode').isLength({ min: 2 }),
], async (req, res) => {
    let success = false;
    const { S_Class_code } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
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
                return res.json("Student Not Found")
            }
            res.json(allStudents);
        } else {
            success = false
            return res.status(400).json({ error: "Class Code doesn't exist" });
        }
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 4:- Fetch all complains from Students http://localhost:5050/api/admin/fetch_all_complains_of_students
router.post('/fetch_all_complains_of_students', fetchadmin, async (req, res) => {
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allComplains = await Student_complain_box.find()

        res.json(allComplains);

    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 5:- Fetch all complains from Students http://localhost:5050/api/admin/fetch_all_complains_of_teachers
router.post('/fetch_all_complains_of_teachers', fetchadmin, async (req, res) => {
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allComplains = await Teacher_complain_box.find()

        res.json(allComplains);

    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 6:- Create Events http://localhost:5050/api/admin/send_event
router.post('/send_event', fetchadmin, [
    body('Event_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Event_description', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('Event_Start', 'Please Chooes the starting time').isDate(), // format should br yyyy-mm-dd
    body('Event_End', 'Please Chooes the ending time').isDate(),  // format should br yyyy-mm-dd
    body('Groups', 'Please Chooes the group').isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Event_title, Event_description, Event_Start, Event_End, Groups } = req.body;

    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let events = new Events({
            Event_title, Event_description, Event_Start, Event_End, Groups
        })

        events = await events.save();
        const data = {
            events: {
                id: events.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 7:- Fetch all events http://localhost:5050/api/admin/get_all_eventes
router.post('/get_all_eventes', fetchadmin, async (req, res) => {
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allevents = await Events.find();
        res.json(allevents.reverse());
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 8:- Edit Events  http://localhost:5050/api/admin/edit_Events/{id}
router.patch('/edit_Events/:id', fetchadmin, [
    body('Event_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Event_description', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('Event_Start', 'Please Chooes the starting time').isDate(),
    body('Event_End', 'Please Chooes the ending time').isDate(),
    body('Groups', 'Please Chooes the group').isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Event_title, Event_description, Event_Start, Event_End, Groups } = req.body;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let events = await Events.findById(req.params.id);
        if (!events) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const newEvents = {};
        if (Event_title) { newEvents.Event_title = Event_title };
        if (Event_description) { newEvents.Event_description = Event_description };
        if (Event_Start) { newEvents.Event_Start = Event_Start };
        if (Event_End) { newEvents.Event_End = Event_End };
        if (Groups) { newEvents.Groups = Groups };
        newEvents.Date = Date.now()

        events = await Events.findByIdAndUpdate(req.params.id, { $set: newEvents })

        const data = {
            events: {
                id: events.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {

        res.status(500).send("some error occured");
    }

})


// Router 9:- Delete Events  http://localhost:5050/api/admin/delete_events/{id}
router.delete('/delete_events/:id', fetchadmin, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let events = await Events.findById(id);
        if (!events) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        delEvents = await Events.findByIdAndDelete(id)

        const data = {
            delEvents: {
                id: delEvents.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 10:- Create Holiday http://localhost:5050/api/admin/send_holiday
router.post('/send_holiday', fetchadmin, [
    body('Holiday_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Holiday_description', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('Holiday_Start', 'Please Chooes the starting time').isDate(), // format should br yyyy-mm-dd
    body('Holiday_End', 'Please Chooes the ending time').isDate(),  // format should br yyyy-mm-dd
    body('Groups', 'Please Chooes the group').isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Holiday_title, Holiday_description, Holiday_Start, Holiday_End, Groups } = req.body;

    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let holidays = new Holidays({
            Holiday_title, Holiday_description, Holiday_Start, Holiday_End, Groups
        })

        holidays = await holidays.save();
        const data = {
            holidays: {
                id: holidays.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 11:- Fetch all holidays http://localhost:5050/api/admin/get_all_holidays
router.post('/get_all_holidays', fetchadmin, async (req, res) => {
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allholidays = await Holidays.find();
        res.json(allholidays.reverse());
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 12:- Edit Holidays  http://localhost:5050/api/admin/edit_holidays/{id}
router.patch('/edit_holidays/:id', fetchadmin, [
    body('Holiday_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Holiday_description', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('Holiday_Start', 'Please Chooes the starting time').isDate(), // format should be yyyy-mm-dd
    body('Holiday_End', 'Please Chooes the ending time').isDate(),  // format should be yyyy-mm-dd
    body('Groups', 'Please Chooes the group').isLength({ min: 3 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Holiday_title, Holiday_description, Holiday_Start, Holiday_End, Groups } = req.body;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let holidays = await Holidays.findById(req.params.id);
        if (!holidays) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const newHolidays = {};
        if (Holiday_title) { newHolidays.Holiday_title = Holiday_title };
        if (Holiday_description) { newHolidays.Holiday_description = Holiday_description };
        if (Holiday_Start) { newHolidays.Holiday_Start = Holiday_Start };
        if (Holiday_End) { newHolidays.Holiday_End = Holiday_End };
        if (Groups) { newHolidays.Groups = Groups };
        newHolidays.Date = Date.now()

        holidays = await Holidays.findByIdAndUpdate(req.params.id, { $set: newHolidays })

        const data = {
            holidays: {
                id: holidays.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {

        res.status(500).send("some error occured");
    }

})


// Router 13:- Delete Events  http://localhost:5050/api/admin/delete_holidays/{id}
router.delete('/delete_holidays/:id', fetchadmin, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let holidays = await Holidays.findById(id);
        if (!holidays) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        delHolidays = await Holidays.findByIdAndDelete(id)

        const data = {
            delHolidays: {
                id: delHolidays.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {

        res.status(500).send("some error occured");
    }
})



// Router 14:- Set fees using standards http://localhost:5050/api/admin/set_fees
// router.post('/set_fees', fetchadmin, [
//     body('Standard', 'please enter a standard').isLength({ min: 2, max: 2 }),
//     body('Fees_Amount', 'please enter a amount').isLength({ min: 2 }),
// ], async (req, res) => {
//     let success = false;
//     // If there are errors, return Bad request and the errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     const { Standard, Fees_Amount } = req.body;

//     try {
//         const fetchAdmin = await Admin.findById(req.admin.id);
//         if (!fetchAdmin) {
//             success = false
//             return res.status(400).json({ success, error: "Sorry U should ligin first" })
//         }

//         let fetchStandard = await Classes.findOne({ Standard: Standard })
//         if(!fetchStandard){
//             success = false
//             return res.status(400).json({ success, error: "Please try to use valid standard" })
//         }

//         let standard = await Fees_set.findOne({ Standard: Standard })
//         if (standard) {
//             success = false
//             return res.status(400).json({ success, error: "Fees price is already added" })
//         }

//         let fees_set = new Fees_set({
//             Standard, Fees_Amount
//         })

//         fees = await fees_set.save();
//         const data = {
//             fees: {
//                 id: fees.id
//             }
//         }

//         const authtoken = jwt.sign(data, JWT_SECRET);
//         success = true;
//         res.json({ success, authtoken });
//     } catch (error) {
//         
//         res.status(500).send("some error occured");
//     }
// })



// Router 15:- Fetch all standard's fees http://localhost:5050/api/admin/get_all_holidays
router.post('/get_all_standard_fees', fetchadmin, async (req, res) => {
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allfees = await Fees_set.find();
        res.json(allfees);
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 16:- Edit fees of standard  http://localhost:5050/api/admin/edit_fees_of_standard/{id}
router.patch('/edit_fees_of_standard/:id', fetchadmin, [
    body('Fees_Amount', 'please enter a amount').isLength({ min: 2 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });;
    }
    const { Fees_Amount } = req.body;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let feesSet = await Fees_set.findById(req.params.id);
        if (!feesSet) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const newFees = {};
        if (Fees_Amount) { newFees.Fees_Amount = Fees_Amount };

        fees = await Fees_set.findByIdAndUpdate(req.params.id, { $set: newFees })

        const data = {
            fees: {
                id: fees.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {

        res.status(500).send("some error occured");
    }

})


// Router 17:- Fetch all materials http://localhost:5050/api/admin/fetch_all_materials
router.post('/fetch_all_materials', fetchadmin, [
    body('T_icard_Id', 'ID should be atlest 6 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    try {
        let fetchAdmin = await Admin.findById(req.admin.id)
        if (!fetchAdmin) {
            success = false
            return res.status(500).json({ success, error: "You should login first" })
        }

        let t_icard_id = await Teachers.findOne({ T_icard_Id: req.body.T_icard_Id });
        if (!t_icard_id) {
            success = false
            return res.status(400).json({ success, error: "Sorry you cannot use this id" })
        }

        let materials = await Material.find({ T_icard_Id: req.body.T_icard_Id })
        res.json(materials)
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 18:- Fetch all homeworks of the subjects http://localhost:5050/api/admin/fetch_all_homeworks_of_the_subject
router.post('/fetch_all_homeworks_of_the_subject', fetchadmin, [
    body('T_icard_Id', 'ID should be atlest 6 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    try {
        let fetchAdmin = await Admin.findById(req.admin.id)
        if (!fetchAdmin) {
            success = false
            return res.status(500).json({ success, error: "You should login first" })
        }

        let t_icard_id = await Teachers.findOne({ T_icard_Id: req.body.T_icard_Id });
        if (!t_icard_id) {
            success = false
            return res.status(400).json({ success, error: "Sorry you cannot use this id" })
        }

        let homework = await Homework.find({ T_icard_Id: req.body.T_icard_Id })
        res.json(homework)
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 19:- Fetch the count of the Students http://localhost:5050/api/admin/fetch_count_of_the_Students
router.post('/fetch_count_of_the_Students', fetchadmin, async (req, res) => {
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allStudents = await Students.find()
        res.json({ count: allStudents.length });
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 20:- Fetch the count of the teachers http://localhost:5050/api/admin/fetch_count_of_the_teachers
router.post('/fetch_count_of_the_teachers', fetchadmin, async (req, res) => {
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allTeachers = await Teachers.find()
        res.json({ count: allTeachers.length });
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 20:- Fetch the count of the classes http://localhost:5050/api/admin/fetch_count_of_the_classes
router.post('/fetch_count_of_the_classes', fetchadmin, async (req, res) => {
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }
        const allClasses = await Classes.find()
        const data = []
        for (let i = 0; i < allClasses.length; i++) {
            const element = allClasses[i];
            data.push(element.ClassCode)
        }

        let total = 0;
        data.forEach(arr => {
            arr.forEach(() => {
                total = total + 1;
            });
        });
        res.json({ count: total });
    } catch (error) {

        res.status(500).send("some error occured");
    }
})


// Router 21:- upload event photoes http://localhost:5050/api/admin/upload_event_photos
router.post('/upload_event_photos', fetchadmin, Events_photoes.array("events_files"), [
    body('Event_title', 'Please choose the event title').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    const { Event_title } = req.body

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const files = req.files.map(file => {
        return {
            filename: file.filename
        };
    });
    const filenames = files.map(file => file.filename);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files were uploaded' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        for (let index = 0; index < filenames.length; index++) {
            const element = filenames[index];
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -14);
            const filePath = dirname + '/Events_photos/' + element;
            fs.unlink(filePath, (err) => {
                if (err) {
                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
        }
        return res.status(400).json({ success, error: errors.array() });
    }


    const title = await Events.findOne({ Event_title: Event_title })
    if (!title) {
        success = false;
        for (let index = 0; index < filenames.length; index++) {
            const element = filenames[index];
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -14);
            const filePath = dirname + '/Events_photos/' + element;
            fs.unlink(filePath, (err) => {
                if (err) {
                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
        }
        return res.status(400).json({ success, error: "PLease Enter valide title" })
    }

    try {
        const Event_Photos = filenames
        const e_photos = new EventPhotos({
            Event_title, Event_Photos
        })

        photos = await e_photos.save();
        const data = {
            photos: {
                id: photos.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (e) {
        success = false;
        for (let index = 0; index < filenames.length; index++) {
            const element = filenames[index];
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -14);
            const filePath = dirname + '/Events_photos/' + element;
            fs.unlink(filePath, (err) => {
                if (err) {
                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
        }
        res.status(500).send("some error occured");
    }
})


// Router 22:- Delete event photoes http://localhost:5050/api/admin/delete_evente_photoes/:{id}
router.delete('/delete_evente_photoes/:id', fetchadmin, async (req, res) => {
    let success = false

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    const event = await EventPhotos.findById(req.params.id)
    if (!event) {
        success = false
        return res.status(400).json({ success, error: "Data Not found" })
    }

    const filenames = event.Event_Photos

    const deleteFiles = (filenames) => {
        filenames.forEach((filename) => {
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -14);
            const filePath = `${dirname}/Events_photos/${filename}`;

            // Check if the file exists
            if (fs.existsSync(filePath)) {
                // Delete the file
                fs.unlink(filePath, (error) => {
                    if (error) {
                        console.error(`Error deleting file: ${filePath}`, error);
                    }
                });
            } else {
                console.log(`File not found: ${filePath}`);
            }
        });
    };

    try {
        deleteFiles(filenames);

        const photos = await EventPhotos.findByIdAndDelete(req.params.id)
        const data = {
            photos: {
                id: photos.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;

        res.json({ success, authtoken });
    } catch (e) {
        success = false;
        res.status(500).send("some error occured");
    }
})


// Router 23:- fetch all event images http://localhost:5050/api/admin/fetch_all_events_photoes
router.post('/fetch_all_events_photoes', fetchadmin, async (req, res) => {
    let success = false

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    try {
        const e_photos = await EventPhotos.find()
        if (e_photos.length == 0) {
            return res.json("No Event Photos Found")
        }
        else {
            res.json(e_photos)
        }
    } catch (e) {
        success = false;
        res.status(500).send("some error occured");
    }
})


// Router 24:- fetch event images by ids http://localhost:5050/api/admin/fetch_events_photoes/{id}
router.post('/fetch_events_photoes/:id', fetchadmin, async (req, res) => {
    let success = false

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
        success = false
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    try {
        const e_photos = await EventPhotos.findById(req.params.id)
        if (!e_photos) {
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


// Router 25:- Send complains to the teachers or students  http://localhost:5050/api/admin/send_complain_t&s
router.post('/send_complain_t&s', fetchadmin, [
    body('Complain_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Complain_description', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('User_Id', 'I-Card Id should be atlest 6 char').isLength({ min: 6 }),
    body('User_name', 'Name should be atlest 2 char').isLength({ min: 2 }),
    body('Groups', 'groups name should be atlest 6 char').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { Complain_title, Complain_description, User_Id, User_name, Groups } = req.body;

    try {

        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let userId = await Students.findOne({ S_icard_Id: User_Id })
        if (!userId) {
            let userId2 = await Teachers.findOne({ T_icard_Id: User_Id })
            if (!userId2) {
                success = false
                return res.status(400).json({ success, error: "Sorry You can't send complain on this Id" })
            } else {
                if (userId2.T_name != User_name) {
                    success = false
                    return res.status(400).json({ success, error: "PLease choose correct name of Teacher" })
                }
            }
        } else {
            if (userId.S_name != User_name) {
                success = false
                return res.status(400).json({ success, error: "PLease choose correct name of students" })
            }
        }

        let admin_complain_box = new Admin_complain_box({
            Complain_title, Complain_description, User_Id, User_name, Groups
        })

        admin_complain_box = await admin_complain_box.save();
        const data = {
            admin_complain_box: {
                id: admin_complain_box.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        res.status(500).send("some error occured");
    }
})


// Router 26:- Edit the admin complain http://localhost:5050/api/admin/edit_complain/:{id}
router.patch('/edit_complain/:id', fetchadmin, [
    body('Complain_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Complain_description', 'Decription should be atlest 10 char').isLength({ min: 10 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Complain_title, Complain_description } = req.body;

    try {
        let complain = await Admin_complain_box.findById(req.params.id);
        if (!complain) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }


        const newComplain = {};
        if (Complain_title) { newComplain.Complain_title = Complain_title };
        if (Complain_description) { newComplain.Complain_description = Complain_description };
        newComplain.Date = Date.now()

        complain = await Admin_complain_box.findByIdAndUpdate(req.params.id, { $set: newComplain })

        const data = {
            complain: {
                id: complain.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        res.status(500).send("some error occured");
    }

})


// Router 27:- Delete the complain http://localhost:5050/api/admin/delete_complain/:{id}
router.delete('/delete_complain/:id', fetchadmin, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        let complain = await Admin_complain_box.findById(req.params.id);
        if (!complain) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const complainBox = await Admin_complain_box.findByIdAndDelete(id)

        const data = {
            complainBox: {
                id: complainBox.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        res.status(500).send("some error occured");
    }
})


// Router 28:- fetch all the complains Group wise http://localhost:5050/api/admin/fetch_all_complains
router.post('/fetch_all_complains', fetchadmin, [
    body('Groups', 'groups name should be atlest 6 char').isLength({ min: 6 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        success = false;
        return res.status(400).json({ success, error: errors.array() });
    }

    const { Groups } = req.body;
    try {
        const admin = await Admin.findById(req.admin.id);
        if (!admin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should login first" })
        }

        const complains = await Admin_complain_box.find({ Groups: Groups })
        res.json(complains)
    }
    catch (error) {

        res.status(500).send("some error occured");
    }
})



module.exports = router