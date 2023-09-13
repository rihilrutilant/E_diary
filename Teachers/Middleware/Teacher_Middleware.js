var jwt = require('jsonwebtoken');
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;

const fetchTeachers = (req, res, next) => {
    const token = req.header('authToken_teachers');
    if (!token) {
       return res.status(401).json({ error: "Please authenticate using a valid token" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.teacher = data.teachers;
        next();
    } catch (err) {
        return res.status(401).json({ error: "User does not exist" })
    }
}

module.exports = fetchTeachers;