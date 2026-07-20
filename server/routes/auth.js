const express = require("express");
const { login } = require("../utils/auth");

const router = express.Router();

router.post("/login", login);

module.exports = router;
