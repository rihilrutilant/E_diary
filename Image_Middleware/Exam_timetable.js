const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder where the files will be stored
        const uploadPath = __dirname + '/../Exam_TimeTable_imgs/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename for each uploaded file
        const extension = file.originalname.split('.').pop();
        const filename = `${uuidv4()}.${extension}`;
        cb(null, filename);
    }
});

const Exam_Timetable_Imgs = multer({ storage });

module.exports = Exam_Timetable_Imgs
