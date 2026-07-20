<template>
	<a-container>
		<!-- Banner -->
		<a-flex vertical class="banner" justify="space-between">
			<a-flex class="banner-content" justify="space-between" align="center">
				<a-flex vertical class="banner-left">
					<a-title class="banner-title">Hi ，欢迎光临</a-title>

					<a-text class="banner-desc">
						这里是达达的个人网站，分享我的项目、想法和生活点滴。希望你能在这里找到有趣的内容，了解更多关于我的信息。
					</a-text>

					<a-flex class="banner-buttons">
						<a-button type="primary" @click="$router.push('/repo')">
							查看项目
						</a-button>
						<a-button @click="$router.push('/message')">留言板</a-button>
					</a-flex>
				</a-flex>
				<a-flex class="banner-right">
					<img
						class="banner-image"
						src="https://static.photos/cityscape/1200x630/98"
						alt="Illustration"
					/>
				</a-flex>
			</a-flex>

			<a-flex
				align="center"
				justify="center"
				style="margin-bottom: 40px; height: 40px"
			>
				<div class="scroll-guide-container">
					<div class="line-animation"></div>
					<a-text
						style="
							color: var(--text-normal);
							font-size: 0.75rem;
							top: 8px;
							position: relative;
						"
					>
						向下滑动
					</a-text>
				</div>
			</a-flex>
		</a-flex>

		<ScrollBoard :list="homeStack.scrollList" />

		<BookSchedule />

		<TalkToMe />

		<div class="story-section">
			<a-flex v-if="stackIsLoading" style="height: 100%; width: 100%">
				<a-skeleton active />
			</a-flex>
			<a-flex vertical align="start" class="story-left" v-else>
				<a-text class="story-title">小故事</a-text>

				<a-typography class="story-content">{{
					homeStack.story.content
				}}</a-typography>

				<a-button type="link" style="padding: 0px; margin-top: 60px">
					来自 {{ homeStack.story.deliver }} 的投稿
				</a-button>
			</a-flex>

			<a-flex class="story-right"></a-flex>
		</div>
	</a-container>
</template>

<script setup lang="js">
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";

import ScrollBoard from "@/components/Home/ScrollBoard.vue";
import TalkToMe from "@/components/Home/TalkToMe.vue";
import BookSchedule from "@/components/Home/BookSchedule.vue";
import { fetchHome } from "@/utils/api";

const homeStack = ref({
	scrollList: [],
	story: {
		content: "",
		deliver: "",
	},
});
const stackIsLoading = ref(false);

const loadHomeStack = async () => {
	stackIsLoading.value = true;
	try {
		homeStack.value = await fetchHome();
	} catch (error) {
		console.error("获取首页数据失败:", error);
		message.error("获取首页数据失败");
	} finally {
		stackIsLoading.value = false;
	}
};

onMounted(loadHomeStack);
</script>

<style scoped>
.banner {
	height: calc(100vh - 100px);
	width: 100%;
	padding: 80px 160px;
}

.scroll-guide-container {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	margin-top: 20px;
}

.line-animation {
	width: 2px;
	height: 20px;
	background-color: var(--primary);
	transform-origin: top;
	animation: lineJump 1.5s linear infinite;
	border-radius: 1px;
}

@keyframes lineJump {
	0% {
		transform: scaleY(0.1);
		opacity: 1;
	}
	85% {
		transform: scaleY(1);
		opacity: 1;
	}
	86% {
		transform: scaleY(1);
		opacity: 1;
	}
	100% {
		transform: scaleY(1);
		opacity: 0.3;
	}
}

.banner-content {
	width: 100%;
	gap: 50px;
	flex-wrap: wrap;
	display: flex;
}

.banner-left {
	flex: 1;
	max-width: 650px;
}

.banner-right {
	flex: 1;
	max-width: 650px;
}

.banner-image {
	border-radius: 15px;
	width: 100%;
	height: auto;
}

.banner-title {
	font-weight: bold;
	margin-bottom: 24px;
	font-size: 3rem;
}

.banner-desc {
	font-size: 18px;
	color: var(--text-normal);
	line-height: 1.6;
}

.banner-buttons {
	margin-top: 32px;
	gap: 16px;
	display: flex;
}

.story-section {
	background-color: var(--secondary);
	min-height: 100vh;
	width: 100%;
	padding: 0 160px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.story-left {
	width: 60%;
	margin-right: 30px;
	padding: 100px 0px;
}

.story-title {
	font-weight: bold;
	color: var(--sub-bg);
	font-size: 3rem;
}

.story-content {
	color: var(--bg);
	margin-top: 30px;
	text-indent: 2em;
	margin-left: 30px;
	letter-spacing: 1px;
}

.story-right {
	width: 40%;
	height: 100%;
}

@media screen and (max-width: 768px) {
	.banner {
		padding: 40px 40px;
		height: calc(100vh - 100px);
	}

	.banner-content {
		flex-direction: column-reverse;
		gap: 24px;
	}

	.banner-title {
		font-size: 2rem;
	}

	.banner-desc {
		font-size: 16px;
	}

	.banner-buttons {
		justify-content: center;
		flex-wrap: wrap;
	}

	.banner-right {
		max-width: 100%;
	}

	.scroll-guide-container {
		margin-top: 60px;
	}

	.story-section {
		padding: 150px 40px;
		height: auto;
	}

	.story-left {
		width: 100%;
		margin-right: 0;
		padding: 40px 0;
	}

	.story-title {
		font-size: 2rem;
	}

	.story-content {
		margin-left: 0;
		font-size: 15px;
	}

	.story-right {
		max-height: 0px;
		display: none;
	}
}
</style>
