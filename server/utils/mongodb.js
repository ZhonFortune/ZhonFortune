// utils/mongodb.js
// Simple MongoDB helper with basic CRUD for reuse across the project.
const { MongoClient, ObjectId } = require("mongodb");
const {
	defaultHome,
	defaultSettings,
	defaultSocial,
	defaultMessages,
	defaultProjects,
	defaultResources,
	defaultSchedule,
	defaultScheduleCredentials,
} = require("./defaultData");

let client;
let db;

function getMongoConfig() {
	const url = process.env.DB_URI || process.env.DATABASE_URI;
	const dbName = process.env.DB_NAME || process.env.MONGO_DB || "hyper-my-page";
	if (!url) {
		throw new Error("Missing MongoDB connection string. Set DB_URI or DATABASE_URI.");
	}
	return { url, dbName };
}

async function getDb() {
	if (db) return db;
	const { url, dbName } = getMongoConfig();
	client = new MongoClient(url);
	await client.connect();
	db = client.db(dbName);
	return db;
}

async function closeDb() {
	if (client) {
		await client.close();
		client = undefined;
		db = undefined;
	}
}

function toObjectId(id) {
	if (!id) return id;
	if (typeof id === "string") {
		if (!ObjectId.isValid(id)) return null;
		return new ObjectId(id);
	}
	return id;
}

async function insertOne(collection, doc) {
	const database = await getDb();
	const result = await database.collection(collection).insertOne(doc);
	return { insertedId: result.insertedId };
}

async function findOne(collection, query = {}, options = {}) {
	const database = await getDb();
	return database.collection(collection).findOne(query, options);
}

async function findMany(collection, query = {}, options = {}) {
	const database = await getDb();
	const cursor = database.collection(collection).find(query, options);
	return cursor.toArray();
}

async function updateById(collection, id, updateDoc, options = {}) {
	const database = await getDb();
	const filter = { _id: toObjectId(id) };
	const result = await database.collection(collection).updateOne(filter, updateDoc, options);
	return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

async function deleteById(collection, id) {
	const database = await getDb();
	const filter = { _id: toObjectId(id) };
	const result = await database.collection(collection).deleteOne(filter);
	return { deletedCount: result.deletedCount };
}

async function seedDefaultCollections() {
	const database = await getDb();
	const seeds = [
		{ collection: "settings", docs: [defaultSettings] },
		{ collection: "home", docs: [defaultHome] },
		{ collection: "social", docs: defaultSocial },
		{ collection: "messages", docs: defaultMessages },
		{ collection: "projects", docs: defaultProjects },
		{ collection: "resources", docs: defaultResources },
		{ collection: "schedule", docs: defaultSchedule },
		{ collection: "schedule_credentials", docs: defaultScheduleCredentials },
	];

	for (const { collection, docs } of seeds) {
		const count = await database.collection(collection).estimatedDocumentCount();
		if (count === 0) {
			if (Array.isArray(docs)) {
				await database.collection(collection).insertMany(docs);
			} else {
				await database.collection(collection).insertOne(docs);
			}
		}
	}
}

module.exports = {
	getDb,
	closeDb,
	insertOne,
	findOne,
	findMany,
	updateById,
	deleteById,
	toObjectId,
	seedDefaultCollections,
};
