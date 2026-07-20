const path = require("path");
const cors = require('cors')
const dotenv = require("dotenv");

// load env vars
dotenv.config({
	path: path.resolve(__dirname, "./.env"),
});

const express = require("express");
const apiRouter = require("./routes");
const { getDb, closeDb, seedDefaultCollections } = require("./utils/mongodb");

const PORT = process.env.PORT || "4320";

const app = express();

app.use(express.json(),cors());
app.use("/api", apiRouter);	
app.use("/api/*splat", (req, res) => {
	res.status(404).json({ error: "API not found" });
});
app.use("/admin", express.static(path.join(__dirname, "./static/admin")));
app.use(express.static(path.join(__dirname, "./static")));
app.get("/admin/*splat", (req, res) => {
	res.sendFile(path.resolve(__dirname, "./static/admin", "index.html"));
});
app.get("*splat", (req, res) => {
	res.sendFile(path.resolve(__dirname, "./static", "index.html"));
});

async function start() {
	try {
		await getDb();
		console.log("MongoDB connected");
	} catch (err) {
		console.error("Failed to connect MongoDB", err);
		process.exit(1);
	}

	await seedDefaultCollections();
	console.log("Default collections ready");

	app.listen(PORT, () => {
		console.log("Server started");
		console.log("http://127.0.0.1:" + PORT);
	});
}

process.on("SIGINT", async () => {
	await closeDb();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	await closeDb();
	process.exit(0);
});

start();
