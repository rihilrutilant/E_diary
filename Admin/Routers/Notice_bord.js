const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const NoticeBord = require("../Models/Notice_bord")
const Admin = require("../Models/Admin_Model")
var jwt = require('jsonwebtoken');
require('dotenv').config()
const fetchadmin = require('../Middleware/Admin_Middleware')
const noticeAttach = require('../../Image_Middleware/notice_attachments')
const JWT_SECRET = process.env.JWT_SECRET;
const fs = require("fs")



// Router 1:- Send Notice  http://localhost:5050/api/noticeBord/send_notice
router.post('/send_notice', fetchadmin, noticeAttach.single("notice_attach"), [
    body('Notice_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Notice_description', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('Group', 'Please Chooes the group').isLength({ min: 2 }),
], async (req, res) => {
	console.log("yes");
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
        const dirname = dirPath.slice(0, -13);
        const filePath = dirname + '/Notices/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Notice_title, Notice_description, Group } = req.body;

    const fetchAdmin = await Admin.findById(req.admin.id);
    if (!fetchAdmin) {
        success = false
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -13);
        const filePath = dirname + '/Notices/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: "Sorry U should ligin first" })
    }

    try {

        let Notice_attechments = filename

        let noticeBord = new NoticeBord({
            Admin_id: req.admin.id, Notice_title, Notice_description, Notice_attechments, Group
        })

        noticeBord = await noticeBord.save();
        const data = {
            noticeBord: {
                id: noticeBord.id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({ success, authtoken });;
    } catch (error) {
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -13);
        const filePath = dirname + '/Notices/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        res.status(500).send("some error occured");
    }
})


// Router 2:- Fetch all notices http://localhost:5050/api/noticeBord/get_all_notice
router.post('/get_all_notice', fetchadmin, async (req, res) => {
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allnotice = await NoticeBord.find({ Admin_id: req.admin.id });
        res.json(allnotice.reverse());
    } catch (error) {
        res.status(500).send("some error occured");
    }
})


// Router 3:- Edit Notice  http://localhost:5050/api/noticeBord/edit_Notice/{id}
router.patch('/edit_notice/:id', fetchadmin, noticeAttach.single("notice_attach"), [
    body('Notice_title', 'Title should be atlest 6 char').isLength({ min: 6 }),
    body('Notice_description', 'Decription should be atlest 10 char').isLength({ min: 10 }),
    body('Group', 'Please Chooes the group').isLength({ min: 2 }),
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
        const dirname = dirPath.slice(0, -13);
        const filePath = dirname + '/Notices/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {

                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        return res.status(400).json({ success, error: errors.array() });
    }
    const { Notice_title, Notice_description, Group } = req.body;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -13);
            const filePath = dirname + '/Notices/' + filename;
            fs.unlink(filePath, (err) => {
                if (err) {

                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let notice = await NoticeBord.findById(req.params.id);
        if (!notice) {
            success = false;
            const dirPath = __dirname;
            const dirname = dirPath.slice(0, -13);
            const filePath = dirname + '/Notices/' + filename;
            fs.unlink(filePath, (err) => {
                if (err) {

                    success = false;
                    return res.status(404).json({ success, error: 'Error deleting file' });
                }
            });
            return res.status(404).json({ success, error: "not found" })
        }

        const nameOfFile = notice.Notice_attechments;



        const newNotice = {};
        if (Notice_title) { newNotice.Notice_title = Notice_title };
        if (Notice_description) { newNotice.Notice_description = Notice_description };
        if (filename) { newNotice.Notice_attechments = filename };
        if (Group) { newNotice.Group = Group };
        newNotice.Date = Date.now()

        const dirPath = __dirname;   //C:\Users\admin\Desktop\E_diary\Admin\Routers
        const dirname = dirPath.slice(0, -13);
        const filePath = dirname + '/Notices/' + nameOfFile;    //C:\Users\admin\Desktop\E_diary
        fs.unlink(filePath, async (err) => {
            if (err) {
                success = false;
                const dirPath = __dirname;
                const dirname = dirPath.slice(0, -13);
                const filePath = dirname + '/Notices/' + filename;
                fs.unlink(filePath, (err) => {
                    if (err) {
                        success = false;
                        return res.status(404).json({ success, error: 'Error deleting file' });
                    }
                });
                return res.status(404).json({ success, error: 'File not found' });
            }
            else {
                noticeBord = await NoticeBord.findByIdAndUpdate(req.params.id, { $set: newNotice })

                const data = {
                    noticeBord: {
                        id: noticeBord.id
                    }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                success = true;
                res.status(200).json({ success, authtoken });;
            }
        });

    } catch (error) {
        const dirPath = __dirname;
        const dirname = dirPath.slice(0, -13);
        const filePath = dirname + '/Notices/' + filename;
        fs.unlink(filePath, (err) => {
            if (err) {
                success = false;
                return res.status(404).json({ success, error: 'Error deleting file' });
            }
        });
        res.status(500).send("some error occured");
    }

})


// Router 4:- Delete Notice  http://localhost:5050/api/noticeBord/delete_notice/{id}
router.delete('/delete_notice/:id', fetchadmin, async (req, res) => {
    const { id } = req.params;
    let success = false;
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        let notice = await NoticeBord.findById(id);
        if (!notice) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const nameOfFile = notice.Notice_attechments;

        const dirPath = __dirname;   //C:\Users\admin\Desktop\E_diary\Admin\Routers
        const dirname = dirPath.slice(0, -13);
        const filePath = dirname + '/Notices/' + nameOfFile;    //C:\Users\admin\Desktop\E_diary
        fs.unlink(filePath, async (err) => {
            if (err) {
                success = false;
                return res.status(404).json({ success, error: 'Error in deleting file' });
            }
            else {
                noticeBord = await NoticeBord.findByIdAndDelete(id)

                const data = {
                    noticeBord: {
                        id: noticeBord.id
                    }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                success = true;
                res.status(200).json({ success, authtoken });;
            }
        });
    } catch (error) {
        res.status(500).send("some error occured");
    }
})


// Router 5:- Fetch latest 2 notices http://localhost:5050/api/noticeBord/get_two_notice
router.post('/get_two_notice', fetchadmin, async (req, res) => {
    try {
        const fetchAdmin = await Admin.findById(req.admin.id);
        if (!fetchAdmin) {
            success = false
            return res.status(400).json({ success, error: "Sorry U should ligin first" })
        }

        const allnotice = await NoticeBord.find({ Admin_id: req.admin.id });
        const note = allnotice.reverse()
        const latest = []

        if (allnotice.length == 0) {
            res.json("Data Not Found")
        }
        else {
            if (note.length <= 2) {
                res.json(note)
            }
            else {
                for (let index = 0; index < 2; index++) {
                    const element = note[index];
                    latest.push(element)
                }
                res.json(latest)
            }
        }
    } catch (error) {
        res.status(500).send("some error occured");
    }
})


module.exports = router
