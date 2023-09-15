var jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const fetchadmin = (req, res, next) => {
  const token = req.header("authToken_admin");
  console.log("🚀 ~ file: Admin_Middleware.js:7 ~ fetchadmin ~ token:", token)
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token " });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.admin = data.admin;
    next();
  } catch (err) {
    res.status(401).send({ error: "User does not exist" });
  }
};

module.exports = fetchadmin;
