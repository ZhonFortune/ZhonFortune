const express = require("express");
const router = express.Router();

const pubickStack = require("./stack");
const authRouter = require("./auth");
const { isAuthorized } = require("../utils/auth");

router.use("/stack", pubickStack);
router.use("/auth", authRouter);
router.use("/admin", isAuthorized);

module.exports = router;
