function main(config) {
	const nodeMap = {
		"魔法节点 (R)": "🇸🇴 智能",
		"香港 优选(R)": "🇭🇰 香港",
		"新加坡 优选(R)": "🇸🇬 新加坡",
		"台湾 优选(R)": "🇹🇼 台湾",
		"美国 优选(R)": "🇺🇸 美国",
	};

	config.proxies = (config.proxies || [])
		.filter((proxy) => nodeMap[proxy.name])
		.map((proxy) => ({
			...proxy,
			name: nodeMap[proxy.name],
		}));

	const proxyNames = Object.values(nodeMap).filter((name) =>
		config.proxies.some((proxy) => proxy.name === name),
	);

	Object.assign(config, {
		port: 7890,
		"socks-port": 7891,
		"allow-lan": false,
		mode: "rule",
		"log-level": "info",
		"geodata-mode": true,
		"geo-auto-update": true,
		"geodata-loader": "standard",
		"geo-update-interval": 24,
		"geox-url": {
			geoip:
				"https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
			geosite:
				"https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
			mmdb:
				"https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
			asn:
				"https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb",
		},
	});

	config.dns = {
		enable: true,
		ipv6: true,
		"respect-rules": true,
		"enhanced-mode": "fake-ip",
		nameserver: [
			"https://120.53.53.53/dns-query",
			"https://223.5.5.5/dns-query",
		],
		"proxy-server-nameserver": [
			"https://120.53.53.53/dns-query",
			"https://223.5.5.5/dns-query",
		],
		"nameserver-policy": {
			"geosite:cn,private": [
				"https://120.53.53.53/dns-query",
				"https://223.5.5.5/dns-query",
			],
			"geosite:geolocation-!cn": [
				"https://dns.cloudflare.com/dns-query",
				"https://dns.google/dns-query",
			],
		},
	};

	config["rule-providers"] = {
		"category-ai-!cn": {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/category-ai-!cn.mrs",
			path: "./ruleset/category-ai-!cn.mrs",
			interval: 86400,
		},
		youtube: {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/youtube.mrs",
			path: "./ruleset/youtube.mrs",
			interval: 86400,
		},
		google: {
			type: "http",
			format: "mrs",
			behavior: "ipcidr",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/google.mrs",
			path: "./ruleset/google.mrs",
			interval: 86400,
		},
		"geolocation-cn": {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/geolocation-cn.mrs",
			path: "./ruleset/geolocation-cn.mrs",
			interval: 86400,
		},
		cn: {
			type: "http",
			format: "mrs",
			behavior: "ipcidr",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/cn.mrs",
			path: "./ruleset/cn.mrs",
			interval: 86400,
		},
		github: {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/github.mrs",
			path: "./ruleset/github.mrs",
			interval: 86400,
		},
		gitlab: {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/gitlab.mrs",
			path: "./ruleset/gitlab.mrs",
			interval: 86400,
		},
		"geolocation-!cn": {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geosite/geolocation-!cn.mrs",
			path: "./ruleset/geolocation-!cn.mrs",
			interval: 86400,
		},
		private: {
			type: "http",
			format: "mrs",
			behavior: "ipcidr",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/private.mrs",
			path: "./ruleset/private.mrs",
			interval: 86400,
		},
		telegram: {
			type: "http",
			format: "mrs",
			behavior: "ipcidr",
			url:
				"https://gh-proxy.com/https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/geoip/telegram.mrs",
			path: "./ruleset/telegram.mrs",
			interval: 86400,
		},
		"steam-cn": {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/steam@cn.mrs",
			path: "./ruleset/steam-cn.mrs",
			interval: 86400,
		},
		"steam-download": {
			type: "http",
			format: "mrs",
			behavior: "domain",
			url:
				"https://raw.githubusercontent.com/Lanlan13-14/Rules/refs/heads/main/rules/Domain/Steam-domain.mrs",
			path: "./ruleset/steam-download.mrs",
			interval: 86400,
		},
	};

	config["proxy-groups"] = [
		{
			name: "YinYun.ltd",
			type: "select",
			proxies: proxyNames,
		},
	];

	config.rules = [
		"DOMAIN-SUFFIX,steamcontent.com,DIRECT",
		"DOMAIN-SUFFIX,steamstatic.com,DIRECT",
		"RULE-SET,steam-download,DIRECT",
		"RULE-SET,steam-cn,DIRECT",

		"DOMAIN-SUFFIX,steamusercontent.com,YinYun.ltd",
		"DOMAIN-SUFFIX,store.steampowered.com,YinYun.ltd",
		"DOMAIN-SUFFIX,steampowered.com,YinYun.ltd",
		"DOMAIN-SUFFIX,steamcommunity.com,YinYun.ltd",
		"DOMAIN-SUFFIX,steamgames.com,YinYun.ltd",

		"RULE-SET,category-ai-!cn,YinYun.ltd",
		"RULE-SET,youtube,YinYun.ltd",
		"RULE-SET,google,YinYun.ltd",
		"RULE-SET,github,YinYun.ltd",
		"RULE-SET,gitlab,YinYun.ltd",
		"RULE-SET,telegram,YinYun.ltd,no-resolve",

		"RULE-SET,private,DIRECT,no-resolve",
		"RULE-SET,cn,DIRECT,no-resolve",
		"RULE-SET,geolocation-cn,DIRECT",
		"RULE-SET,geolocation-!cn,YinYun.ltd",

		"MATCH,YinYun.ltd",
	];

	return config;
}
