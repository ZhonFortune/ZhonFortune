# 后端 API

## 基本说明
- 基础路径：`/api`
- 响应格式：JSON
- 认证：当前用户端接口均为公开；`/api/admin/*` 预留为后台管理接口，需 JWT（开发模式跳过），但尚未实现具体路由。
- 404：未匹配的 `/api/*` 返回 `{"error":"API not found"}`。

## 用户端

### 获取站点设置
- 方法：GET
- 路径：`/api/stack/settings`
- 返回示例：
```json
{
  "site": {
    "name": "达达",
    "icon": "https://www.helloimg.com/i/2025/12/06/6933e61c7315b.png"
  },
  "header": {
    "title": "MOETONE | 达达",
    "user": {
      "name": "@moetone",
      "avatar": "https://www.helloimg.com/i/2025/12/06/6933e61c7315b.png"
    },
    "admin": true,
    "navs": [
      { "name": "首页", "url": "/", "isExternal": false },
      { "name": "项目", "url": "/repo", "isExternal": false },
      { "name": "留言板", "url": "/message", "isExternal": false },
      { "name": "导航", "url": "/navigation", "isExternal": false },
      { "name": "关于", "url": "/social", "isExternal": false }
    ]
  },
  "footer": {
    "title": "MOETONE",
    "subtitle": "此情可待成追忆,只是当时已茫然",
    "status": true,
    "map": [
      {
        "title": "导航",
        "isExternal": false,
        "links": [
          { "name": "首页", "url": "/" },
          { "name": "关于", "url": "/about" },
          { "name": "项目", "url": "/repo" },
          { "name": "留言板", "url": "/message" },
          { "name": "导航", "url": "/navigation" },
          { "name": "社交媒体", "url": "/social" }
        ]
      },
      {
        "title": "社交媒体",
        "isExternal": true,
        "links": [
          {
            "name": "抖音",
            "url": "https://www.douyin.com/user/MS4wLjABAAAAaoSBeEJdd7rfpZTOe1FyRQ12KQZVHOOM-fgRIiGQpEAEvVUYYs_psjpijt-UsSHI?from_tab_name=main"
          },
          { "name": "Threads", "url": "https://www.threads.com/@moetones" },
          { "name": "Instagram", "url": "https://www.instagram.com/moetones/" },
          { "name": "GitHub", "url": "https://github.com/ZhonFortune" }
        ]
      }
    ],
    "copyright": "© 2025 MOETONE | 达达. All rights reserved."
  }
}
```

### 获取首页数据
- 方法：GET
- 路径：`/api/stack/home`
- 返回示例：
```json
{
  "scrollList": [
    { "name": "我的兴趣", "bg": "https://picsum.photos/3840/2160?0", "desc": "" },
    { "name": "科技探索", "bg": "https://picsum.photos/3840/2160?1", "desc": "" },
    { "name": "休闲时光", "bg": "https://picsum.photos/3840/2160?2", "desc": "" },
    { "name": "热爱运动", "bg": "https://picsum.photos/3840/2160?4", "desc": "" },
    { "name": "娱乐游戏", "bg": "https://picsum.photos/3840/2160?5", "desc": "" }
  ],
  "story": {
    "content": "有时候命运真的很巧妙。十八岁那年，我正处在最混乱、最迷茫、最封闭的阶段，整个人像背着满身负值Buff。朋友怕我在家继续崩溃，把我接去住了几天。本来打算一个人在她家等她回来的，结果她那天和家里吵架，不好意思丢下我，就把我一起带去了同学聚会。谁能想到，在那种完全不属于我的场合里，我遇见了后来照亮我好几年的小太阳。之后莫名其妙加上了联系方式，再后来又因为几句闲聊一起打了两把王者，从那之后就再也没有离开彼此的生活。那时的我连高中都快撑不住了，但他不是那种强行拯救你的人，只是默默陪着、温柔影响着，慢慢让我走出了最暗的那段日子。现在我都快大学毕业了，我们也一起走了四年半。回头看才发现，有些人出现得不声不响，却刚好在你最无助的时候，把你带向更好的地方。",
    "deliver": "ChatGPT"
  }
}
```

### 获取社交列表
- 方法：GET
- 路径：`/api/stack/social`
- 返回示例：
```json
[
  {
    "name": "GitHub",
    "desc": "查看开源项目",
    "icon": "GithubOutlined",
    "url": "https://github.com",
    "color": "#181717"
  },
  {
    "name": "Bilibili",
    "desc": "技术视频分享",
    "icon": "YoutubeOutlined",
    "url": "https://bilibili.com",
    "color": "#FB7299"
  },
  {
    "name": "Twitter",
    "desc": "日常碎碎念",
    "icon": "TwitterOutlined",
    "url": "https://twitter.com",
    "color": "#1DA1F2"
  },
  {
    "name": "Blog",
    "desc": "个人技术博客",
    "icon": "GlobalOutlined",
    "url": "https://blog.example.com",
    "color": "#4177b6"
  },
  {
    "name": "Email",
    "desc": "商务合作联系",
    "icon": "MailOutlined",
    "url": "mailto:hi@example.com",
    "color": "#faad14"
  },
  {
    "name": "WeChat",
    "desc": "加个好友吧",
    "icon": "WechatOutlined",
    "url": "#",
    "color": "#07C160"
  }
]
```
