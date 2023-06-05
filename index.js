const ConnectToMongodb = require('./db')
const express = require('express')
var cors = require('cors')
const app = express()
const dotenv = require('dotenv')

dotenv.config()
const port = process.env.PORT || 5050;

ConnectToMongodb();
app.use(cors())
app.use(express.json());

// Admin
app.use("/api/admin", require("./Admin/Routers/Admin_Router"))
app.use("/api/noticeBord", require("./Admin/Routers/Notice_bord"))
app.use("/api/subject", require("./Admin/Routers/Subject_Router"))

// student
app.use("/api/teachers", require("./Teachers/Router/Teacher_Router"))


// Teacher
app.use("/api/students", require("./Students/Router/Student_Router"))


// ClassCode
app.use("/api/classcode", require("./Classes/Routers/Class_routert"))


// Attendance
app.use("/api/attendance", require("./Attendance/Router/Attendance_Router"))


// TimeTable
app.use("/api/timetable", require("./TimeTable/Router/Timetable_Router"))


// Exam TimeTable
app.use('/api/examtimetable', require("./Exam_TimeTable/Router/Exam_TimeTable_Router"))



// Images folders
app.use("/notices", express.static("./Notices"));
app.use("/materials", express.static("./Material"));
app.use("/event_photos", express.static("./Events_photos"));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})