const multer = require('multer');
const fs = require('fs');
const path = require("path")
const { v4: uuidv4 } = require('uuid');
console.log(path.join(__dirname,'../Attendance/uploads'));
// Create multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder where the files will be stored
        const uploadPath = path.join(__dirname, '../Attendance/uploads');
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

const Excel_Files = multer({ storage });

module.exports = Excel_Files
