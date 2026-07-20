//const { defaultSettings } = require("../utils/defaultData");
const { findOne } = require("../utils/mongodb");

async function returnSettingFunc(req, res) {
	try {
		const doc = await findOne("settings");
		if(doc === null){
			res.status(200).json({
				code: '403',
				message: '无数据'
			});
		}else {
			res.status(200).json(doc)
		}
	} catch (err) {
		console.error("Failed to fetch settings data", err);
		res.status(500).json({ error: "获取站点设置失败" });
	}
}

module.exports = {
	returnSettingFunc,
};
