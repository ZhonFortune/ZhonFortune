//const { defaultSocial } = require("../utils/defaultData");
const { findMany } = require("../utils/mongodb");

async function returnSocialList(req, res) {
	try {
		const docs = await findMany("social");
		res.status(200).json(docs?.length ? docs : defaultSocial);
	} catch (err) {
		console.error("Failed to fetch social data", err);
		res.status(500).json({ error: "获取社交数据失败" });
	}
}

module.exports = {
	returnSocialList,
};
