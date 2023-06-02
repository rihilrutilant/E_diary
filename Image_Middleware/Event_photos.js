const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Set the destination folder where the files will be stored
        const uploadPath = 'Events_photos/';
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
    },
    fileFilter: (req, file, cb) => {
        // Check the file's mimetype
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed.'));
        }
    }
});

const Events_photoes = multer({ storage });

module.exports = Events_photoes