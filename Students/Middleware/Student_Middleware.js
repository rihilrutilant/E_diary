var jwt = require('jsonwebtoken');
require('dotenv').config()
const JWT_SECRET = process.env.JWT_SECRET;

const fetchStudent = (req, res, next) => {
    // Get the vendor from the jwt token and add id to req object
    const token = req.header('authToken_students');
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token " })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.student = data.students;
        next();
    } catch (err) {
        res.status(401).send({ error: "User does not exist" })
    }
}

module.exports = fetchStudent;  