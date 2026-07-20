const defaultHome = {
	scrollList: [
		{ name: "我的兴趣", bg: "https://picsum.photos/3840/2160?0", desc: "关于创作、技术与生活的灵感集锦" },
		{ name: "科技探索", bg: "https://picsum.photos/3840/2160?1", desc: "前端、后端与 AI 的日常研究" },
		{ name: "休闲时光", bg: "https://picsum.photos/3840/2160?2", desc: "阅读、观影与随笔" },
		{ name: "热爱运动", bg: "https://picsum.photos/3840/2160?4", desc: "跑步、骑行与力量训练" },
		{ name: "娱乐游戏", bg: "https://picsum.photos/3840/2160?5", desc: "轻松 gaming 放松一下" },
	],
	story: {
		content:
			"有时候命运真的很巧妙。十八岁那年，我正处在最混乱、最迷茫、最封闭的阶段，整个人像背着满身负值 Buff。朋友怕我在家继续崩溃，把我接去住了几天。那天被拉去同学聚会，意外遇见了后来陪伴我很久的小太阳。再后来因为几句闲聊一起打了两把王者，从那之后就再也没有离开彼此的生活。那时的我连高中都快撑不住了，但他不是那种强行拯救你的人，只是默默陪着、温柔影响着，让我慢慢走出了最暗的那段日子。",
		deliver: "ChatGPT",
	},
};

const defaultSettings = {
	site: {
		name: "达达",
		icon: "https://www.helloimg.com/i/2025/12/06/6933e61c7315b.png",
	},
	header: {
		title: "MOETONE | 达达",
		user: {
			name: "@moetone",
			avatar: "https://www.helloimg.com/i/2025/12/06/6933e61c7315b.png",
		},
		admin: true,
		navs: [
			{ name: "首页", url: "/", isExternal: false },
			{ name: "项目", url: "/repo", isExternal: false },
			{ name: "留言板", url: "/message", isExternal: false },
			{ name: "导航", url: "/navigation", isExternal: false },
			{ name: "关于", url: "/social", isExternal: false },
		],
	},
	footer: {
		title: "MOETONE",
		subtitle: "此情可待成追忆，只是当时已惘然。",
		status: true,
		map: [
			{
				title: "导航",
				isExternal: false,
				links: [
					{ name: "首页", url: "/" },
					{ name: "关于", url: "/about" },
					{ name: "项目", url: "/repo" },
					{ name: "留言", url: "/message" },
					{ name: "导航", url: "/navigation" },
					{ name: "社交媒体", url: "/social" },
				],
			},
			{
				title: "社交媒体",
				isExternal: true,
				links: [
					{
						name: "抖音",
						url: "https://www.douyin.com/user/MS4wLjABAAAAaoSBeEJdd7rfpZTOe1FyRQ12KQZVHOOM-fgRIiGQpEAEvVUYYs_psjpijt-UsSHI?from_tab_name=main",
					},
					{ name: "Threads", url: "https://www.threads.com/@moetones" },
					{ name: "Instagram", url: "https://www.instagram.com/moetones/" },
					{ name: "GitHub", url: "https://github.com/ZhonFortune" },
				],
			},
		],
		copyright: "© 2025 MOETONE | 达达. All rights reserved.",
	},
};

const defaultSocial = [
	{
		name: "GitHub",
		desc: "查看开源项目",
		icon: "GithubOutlined",
		url: "https://github.com",
		color: "#181717",
	},
	{
		name: "Bilibili",
		desc: "技术视频分享",
		icon: "YoutubeOutlined",
		url: "https://bilibili.com",
		color: "#FB7299",
	},
	{
		name: "Twitter",
		desc: "日常碎碎念",
		icon: "TwitterOutlined",
		url: "https://twitter.com",
		color: "#1DA1F2",
	},
	{
		name: "Blog",
		desc: "个人技术博客",
		icon: "GlobalOutlined",
		url: "https://blog.example.com",
		color: "#4177b6",
	},
	{
		name: "Email",
		desc: "商务合作联系",
		icon: "MailOutlined",
		url: "mailto:hi@example.com",
		color: "#faad14",
	},
	{
		name: "WeChat",
		desc: "加个好友聊聊",
		icon: "WechatOutlined",
		url: "#",
		color: "#07C160",
	},
];

const defaultMessages = [
	{
		nickname: "访客 A",
		email: "a@example.com",
		content: "你好，这里可以留言吗？",
		created_at: "2025-12-08 10:00:00",
		status: "unread",
	},
	{
		nickname: "访客 B",
		email: "b@example.com",
		content: "请问可以提供 API 文档吗？",
		created_at: "2025-12-08 10:05:00",
		status: "read",
	},
	{
		nickname: "访客 C",
		email: "c@example.com",
		content: "喜欢新的布局，加油！",
		created_at: "2025-12-08 10:40:00",
		status: "unread",
	},
];

const defaultProjects = [
	{
		name: "HyperMyPage",
		desc: "基于 Vue + Express 的个人主页/导航站方案。",
		url: "https://github.com/ZhonFortune/HyperMyPage",
		status: "published",
		tags: ["vue", "express", "design"],
		updated_at: "2025-12-08",
	},
	{
		name: "Portfolio",
		desc: "极简风格的个人作品集落地页。",
		url: "https://example.com/portfolio",
		status: "draft",
		tags: ["landing", "ui"],
		updated_at: "2025-12-07",
	},
];

const defaultResources = [
	{
		id: "demo-cover",
		name: "Demo cover",
		url: "https://picsum.photos/1200/630?random=30",
	},
	{
		id: "avatar",
		name: "Sample avatar",
		url: "https://picsum.photos/400/400?random=31",
	},
	{
		id: "gallery-1",
		name: "Gallery image 1",
		url: "https://picsum.photos/800/600?random=32",
	},
];

const defaultSchedule = [
	{
		visitor_name: "访客 1",
		visitor_email: "a@example.com",
		date: "2025-12-10",
		time_range: "10:00 - 11:00",
		description: "想了解项目细节。",
		status: "pending",
		created_at: "2025-12-08 09:00:00",
		ics: "/mock/meeting-1.ics",
		conflict: false,
		credential: "admin",
	},
	{
		visitor_name: "访客 2",
		visitor_email: "b@example.com",
		date: "2025-12-12",
		time_range: "15:00 - 16:00",
		description: "简历交流 & 反馈。",
		status: "approved",
		created_at: "2025-12-07 18:00:00",
		ics: "/mock/meeting-2.ics",
		conflict: false,
		credential: "admin",
	},
	{
		visitor_name: "访客 3",
		visitor_email: "c@example.com",
		date: "2025-12-15",
		time_range: "14:30 - 15:00",
		description: "合作机会洽谈。",
		status: "rejected",
		created_at: "2025-12-07 15:20:00",
		ics: "/mock/meeting-3.ics",
		conflict: true,
		credential: "admin",
	},
];

const defaultScheduleCredentials = [
	{
		name: "管理员",
		token: "admin",
		created_at: new Date().toISOString(),
		notes: "默认管理员凭证",
		role: "admin",
	},
];

module.exports = {
	defaultHome,
	defaultSettings,
	defaultSocial,
	defaultMessages,
	defaultProjects,
	defaultResources,
	defaultSchedule,
	defaultScheduleCredentials,
};
