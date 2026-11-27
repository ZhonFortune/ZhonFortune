<template>
	<div class="social-container">
		<a-row v-if="isLoading" :gutter="[24, 24]">
			<a-col :xs="24" :sm="12" :md="8" v-for="n in 6" :key="n">
				<div class="social-card skeleton-card">
					<a-skeleton active :avatar="{ size: 54 }" :paragraph="{ rows: 2 }" />
				</div>
			</a-col>
		</a-row>

		<a-row v-else :gutter="[24, 24]" class="card-list">
			<a-col
				:xs="24"
				:sm="12"
				:md="8"
				v-for="item in socialLinks"
				:key="item._id || item.name"
			>
				<div class="social-card" @click="visitLink(item.url)">
					<div class="card-inner">
						<div
							class="icon-box"
							:style="{ color: item.color, backgroundColor: item.color + '15' }"
						>
							<component :is="item.icon" />
						</div>

						<div class="info-box">
							<div class="card-title">{{ item.name }}</div>
							<div class="card-desc">{{ item.desc }}</div>
						</div>

						<div class="arrow-box">
							<right-outlined />
						</div>
					</div>
				</div>
			</a-col>
		</a-row>

		<!-- 空状态 -->
		<a-empty
			v-if="!isLoading && socialLinks.length === 0"
			image="simple"
			description="暂无内容"
			style="margin-top: 60px; color: var(--text-hover)"
		/>
	</div>
</template>

<script setup lang="js">
import { message } from "ant-design-vue";
import { ref, onMounted, shallowRef } from "vue";
import {
	GithubOutlined,
	TwitterOutlined,
	YoutubeOutlined,
	GlobalOutlined,
	MailOutlined,
	WechatOutlined,
	RightOutlined,
} from "@ant-design/icons-vue";
import { fetchSocial } from "@/utils/api";

const isLoading = ref(true);
const socialLinks = ref([]);

const iconMap = {
	GithubOutlined: shallowRef(GithubOutlined),
	YoutubeOutlined: shallowRef(YoutubeOutlined),
	TwitterOutlined: shallowRef(TwitterOutlined),
	GlobalOutlined: shallowRef(GlobalOutlined),
	MailOutlined: shallowRef(MailOutlined),
	WechatOutlined: shallowRef(WechatOutlined),
};

const loadLinks = async () => {
	isLoading.value = true;
	try {
		const data = await fetchSocial();
		socialLinks.value = (data || []).map((item, index) => ({
			...item,
			icon: iconMap[item.icon] || shallowRef(GlobalOutlined),
			_id: item._id || `${item.name}-${index}`,
		}));
	} catch (error) {
		console.error("获取社交数据失败:", error);
		message.error("获取社交数据失败");
		socialLinks.value = [];
	} finally {
		isLoading.value = false;
	}
};

const visitLink = (url) => {
	if (url && url !== "#") {
		window.open(url, "_blank");
		return;
	}
	message.info("链接未配置");
};

onMounted(loadLinks);
</script>

<style scoped>
.social-container {
	width: 100%;
	height: 100%;
	box-sizing: border-box;
	overflow-y: auto;
	padding: 40px 160px;
	transition: padding 0.3s ease;
}

.social-card {
	min-height: 200px;
	background-color: var(--sub-bg);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	position: relative;
	overflow: hidden;
	border: 1px solid transparent;
}

.skeleton-card {
	padding: 24px;
	pointer-events: none;
}

.card-inner {
	display: flex;
	align-items: center;
	width: 100%;
	padding: 0 48px;
}

.social-card:hover {
	transform: translateY(-4px);
	background-color: var(--sub-bg);
}

.icon-box {
	width: 60px;
	height: 60px;
	border-radius: 16px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 30px;
	margin-right: 20px;
	flex-shrink: 0;
	transition: transform 0.3s;
}

.social-card:hover .icon-box {
	transform: scale(1.1) rotate(5deg);
}

.info-box {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.card-title {
	color: var(--text-normal);
	font-size: 18px;
	font-weight: 700;
	margin-bottom: 6px;
}

.card-desc {
	color: var(--text-hover);
	font-size: 14px;
	line-height: 1.4;
}

.arrow-box {
	color: var(--text-hover);
	opacity: 0;
	transform: translateX(-10px);
	transition: all 0.3s ease;
	font-size: 14px;
}

.social-card:hover .arrow-box {
	opacity: 1;
	transform: translateX(0);
}

@media (max-width: 768px) {
	.social-container {
		padding: 30px 40px;
	}

	.social-card {
		min-height: 150px;
	}

	.icon-box {
		width: 50px;
		height: 50px;
		font-size: 24px;
	}

	.card-title {
		font-size: 16px;
	}
}

@media (max-width: 480px) {
	.social-container {
		padding: 20px 20px;
	}
}
</style>
