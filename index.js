const ConnectToMongodb = require("./db");
const express = require("express");
var cors = require("cors");
const app = express();
const dotenv = require("dotenv");

dotenv.config();
const port = process.env.PORT || 5050;

ConnectToMongodb();
app.use(cors());
app.use(express.json());

app.get('/',(req, res) => {
  res.send("Hello")
})

// Admin
app.use("/api/admin", require("./Admin/Routers/Admin_Router"));
app.use("/api/noticeBord", require("./Admin/Routers/Notice_bord"));
app.use("/api/subject", require("./Admin/Routers/Subject_Router"));

// student
app.use("/api/teachers", require("./Teachers/Router/Teacher_Router"));

// Teacher
app.use("/api/students", require("./Students/Router/Student_Router"));

// ClassCode
app.use("/api/classcode", require("./Classes/Routers/Class_routert"));

// Attendance
app.use("/api/attendance", require("./Attendance/Router/Attendance_Router"));

// TimeTable
app.use("/api/timetable", require("./TimeTable/Router/Timetable_Router"));

// Exam TimeTable
app.use(
  "/api/examtimetable",
  require("./Exam_TimeTable/Router/Exam_TimeTable_Router")
);

// Results
app.use("/api/results", require("./Results/Router/Results"));

// Images folders
app.use("/notices", express.static("./Notices"));
app.use("/materials", express.static("./Material"));
app.use("/event_photos", express.static("./Events_photos"));
app.use("/result_data", express.static("./Result_data"));
app.use("/teacher_img", express.static("./Teachers_imgs"));
app.use("/student_img", express.static("./Students_imgs"));
app.use("/time_table", express.static("./TimeTable_imgs"));
app.use("/exam_time_table", express.static("./Exam_TimeTable_imgs"));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
