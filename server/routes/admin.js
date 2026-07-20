const express = require("express");
const {
	getMessages,
	markMessagesRead,
	deleteMessages,
} = require("../controllers/admin/messages");
const {
	getScheduleList,
	getScheduleDetail,
	approveSchedule,
	rejectSchedule,
	getScheduleConfig,
	getCredentials,
	createCredential,
	deleteCredential,
} = require("../controllers/admin/schedule");
const {
	updateSetting,
	updateHome,
	updateSocial,
} = require("../controllers/admin/stack");
const { uploadResource } = require("../controllers/admin/resource");
const { getProjects, updateProjects } = require("../controllers/admin/projects");

const router = express.Router();

// messages
router.get("/messages", getMessages);
router.post("/messages/mark-read", markMessagesRead);
router.post("/messages/delete", deleteMessages);

// schedule
router.get("/schedule/config", getScheduleConfig);
router.get("/schedule/credentials", getCredentials);
router.post("/schedule/credentials", createCredential);
router.post("/schedule/credentials/:token/delete", deleteCredential);
router.get("/schedule", getScheduleList);
router.get("/schedule/:id", getScheduleDetail);
router.post("/schedule/approve", approveSchedule);
router.post("/schedule/reject", rejectSchedule);

// stack updates
router.post("/stack/settings", updateSetting);
router.post("/stack/home", updateHome);
router.post("/stack/social", updateSocial);

// resource upload (placeholder)
router.post("/resource/upload", uploadResource);

// projects
router.get("/projects", getProjects);
router.post("/projects", updateProjects);

module.exports = router;
