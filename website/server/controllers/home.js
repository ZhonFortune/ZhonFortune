//const { defaultHome } = require("../utils/defaultData");
const { findOne } = require("../utils/mongodb");

async function returnHomeStack(req, res) {
	try {
		const doc = await findOne("home");
		res.status(200).json(doc || defaultHome);
	} catch (err) {
		console.error("Failed to fetch home data", err);
		res.status(500).json({ error: "获取首页数据失败" });
	}
}

module.exports = {
	returnHomeStack,
};
