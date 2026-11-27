// utils/auth.js
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ENV = (process.env.ENV || process.env.NODE_ENV || "").trim().toLowerCase();

function jwtsign(payload) {
	return jwt.sign(payload, SECRET_KEY, {
		expiresIn: "3d",
	});
}

function isDevENV() {
	return /^dev(elopment)?$/i.test(ENV);
}

function parseCookie(req) {
	if (req.cookies) return req.cookies;
	const header = req.headers?.cookie;
	if (!header) return {};
	return header.split(";").reduce((acc, pair) => {
		const [key, ...rest] = pair.split("=");
		if (!key || !rest.length) return acc;
		acc[key.trim()] = rest.join("=").trim();
		return acc;
	}, {});
}

function isAuthorized(req, res, next) {
	if (isDevENV()) return next();

	const cookies = parseCookie(req);
	const rawHeader = req.headers?.authorization;
	const bearerToken = rawHeader?.replace(/^Bearer\s+/i, "");
	const token = cookies.authorization || bearerToken;

	if (!token) {
		return res.status(401).json({ error: "未授权的请求" });
	}

	try {
		jwt.verify(token, SECRET_KEY);
		return next();
	} catch (err) {
		return res.status(401).json({ error: "未授权的请求" });
	}
}

function login(req, res) {
	const { password } = req.body || {};
	const allowDevBypass = isDevENV() && !ADMIN_PASSWORD;

	if (!SECRET_KEY) {
		return res.status(500).json({ error: "服务器错误" });
	}

	if (!password && !allowDevBypass) {
		return res.status(400).json({ error: "密码不能为空" });
	}

	if (!allowDevBypass && password !== ADMIN_PASSWORD) {
		return res.status(401).json({ error: "密码错误" });
	}

	const token = jwtsign({ role: "admin" });
	res.cookie("authorization", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: /^prod(uction)?$/i.test(ENV),
		maxAge: 3 * 24 * 60 * 60 * 1000,
	});
	return res.json({ token, expiresIn: "3d" });
}

module.exports = {
	jwtsign,
	isAuthorized,
	login,
};
