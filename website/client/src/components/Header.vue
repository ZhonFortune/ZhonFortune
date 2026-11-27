<template>
	<a-flex
		v-if="props.loading"
		justify="space-between"
		align="center"
		class="header"
	>
		<a-flex>
			<a-space style="display: flex">
				<a-skeleton-avatar
					style="margin-right: 12px; display: flex"
					active
					v-if="!isMobile"
				/>
				<a-skeleton-input style="display: flex" active v-if="!isMobile" />
			</a-space>
		</a-flex>

		<a-flex>
			<a-space>
				<a-skeleton-input style="display: flex" active />
			</a-space>
		</a-flex>
	</a-flex>

	<a-flex justify="space-between" align="center" class="header" v-else>
		<div
			align="center"
			justify="center"
			v-if="isMobile"
			style="height: 32px; width: 32px"
		></div>

		<a-flex align="center">
			<a-avatar
				:src="props.setting.user.avatar"
				:style="{ marginRight: '12px' }"
			/>
			<a-text style="font-size: 1.2rem; font-weight: bold">
				{{ props.setting.title }}
			</a-text>
		</a-flex>

		<a-flex align="center" v-if="!isMobile">
			<a-menu
				mode="horizontal"
				:selectedKeys="selectedKeys"
				@select="handleSelect"
				:style="{ borderBottom: 'none' }"
			>
				<a-menu-item v-for="nav in props.setting.navs" :key="nav.url">
					{{ nav.name }}
					<icon v-if="nav.isExternal">
						<template #component>
							<svg class="icon" viewBox="0 0 1024 1024" width="12" height="12">
								<path
									d="M362.666667 85.333333a21.333333 21.333333 0 0 1 21.333333 21.333334v42.666666a21.333333 21.333333 0 0 1-21.333333 21.333334h-64c-81.216 0-125.930667 42.88-127.936 122.389333L170.666667 298.666667v448c0 74.453333 35.648 105.28 122.026666 106.624L298.666667 853.333333h426.666666c93.76 0 126.656-34.069333 127.957334-122.410666L853.333333 725.333333v-75.221333a21.333333 21.333333 0 0 1 21.333334-21.333333h42.666666a21.333333 21.333333 0 0 1 21.333334 21.333333V725.333333c0 135.616-66.304 210.794667-206.165334 213.269334L725.333333 938.666667H298.666667c-132.16 0-210.602667-62.293333-213.269334-185.472L85.333333 746.666667V298.666667c0-128.021333 80.32-210.496 206.762667-213.269334L298.666667 85.333333h64z m533.333333 0a42.666667 42.666667 0 0 1 42.56 39.466667L938.666667 128v277.333333a21.333333 21.333333 0 0 1-21.333334 21.333334h-42.666666a21.333333 21.333333 0 0 1-21.333334-21.333334v-174.336l-257.685333 257.706667a21.333333 21.333333 0 0 1-30.165333 0l-30.165334-30.186667a21.333333 21.333333 0 0 1 0-30.165333L792.96 170.666667H618.666667a21.333333 21.333333 0 0 1-21.333334-21.333334V106.666667a21.333333 21.333333 0 0 1 21.333334-21.333334h277.333333z"
									fill="#222529"
								></path>
							</svg>
						</template>
					</icon>
				</a-menu-item>
			</a-menu>

			<!-- 后台按钮 -->
			<a-tooltip title="进入管理后台">
				<a-button v-if="props.setting.admin" type="text" @click="enterAdmin">
					<icon>
						<template #component>
							<svg viewBox="0 0 1024 1024" width="16" height="16">
								<path
									d="M469.333333 170.666667v170.666666a42.666667 42.666667 0 0 1-42.666666 42.666667H170.666667a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667h256a42.666667 42.666667 0 0 1 42.666666 42.666667z m-42.666666 298.666666H170.666667a42.666667 42.666667 0 0 0-42.666667 42.666667v341.333333a42.666667 42.666667 0 0 0 42.666667 42.666667h256a42.666667 42.666667 0 0 0 42.666666-42.666667v-341.333333a42.666667 42.666667 0 0 0-42.666666-42.666667z m426.666666 170.666667h-256a42.666667 42.666667 0 0 0-42.666666 42.666667v170.666666a42.666667 42.666667 0 0 0 42.666666 42.666667h256a42.666667 42.666667 0 0 0 42.666667-42.666667v-170.666666a42.666667 42.666667 0 0 0-42.666667-42.666667z m0-512h-256a42.666667 42.666667 0 0 0-42.666666 42.666667v341.333333a42.666667 42.666667 0 0 0 42.666666 42.666667h256a42.666667 42.666667 0 0 0 42.666667-42.666667V170.666667a42.666667 42.666667 0 0 0-42.666667-42.666667z"
									fill="var(--primary)"
								></path>
							</svg>
						</template>
					</icon>
				</a-button>
			</a-tooltip>
		</a-flex>

		<a-flex align="center" justify="center" v-if="isMobile">
			<a-button
				type="text"
				@click="drawerVisible = true"
				style="
					padding: 0px;
					display: flex;
					height: 32px;
					width: 32px;
					justify-content: center;
					align-items: center;
				"
			>
				<icon>
					<template #component>
						<svg
							t="1765005178782"
							class="icon"
							viewBox="0 0 1024 1024"
							version="1.1"
							xmlns="http://www.w3.org/2000/svg"
							p-id="7661"
							width="24"
							height="24"
						>
							<path
								d="M917.333333 186.666667a5.333333 5.333333 0 0 0-5.333333-5.333334H112a5.333333 5.333333 0 0 0-5.333333 5.333334v64a5.333333 5.333333 0 0 0 5.333333 5.333333h800a5.333333 5.333333 0 0 0 5.333333-5.333333zM106.666667 773.333333v64a5.333333 5.333333 0 0 0 5.333333 5.333334h394.666667a5.333333 5.333333 0 0 0 5.333333-5.333334v-64a5.333333 5.333333 0 0 0-5.333333-5.333333H112a5.333333 5.333333 0 0 0-5.333333 5.333333zM512 474.666667H112a5.333333 5.333333 0 0 0-5.333333 5.333333v64a5.333333 5.333333 0 0 0 5.333333 5.333333h800a5.333333 5.333333 0 0 0 5.333333-5.333333V480a5.333333 5.333333 0 0 0-5.333333-5.333333z"
								p-id="7662"
							></path>
						</svg>
					</template>
				</icon>
			</a-button>
		</a-flex>

		<a-drawer
			placement="right"
			:visible="drawerVisible"
			@close="drawerVisible = false"
		>
			<a-menu mode="inline" :selectedKeys="selectedKeys" @select="mobileSelect">
				<a-menu-item v-for="nav in props.setting.navs" :key="nav.url">
					{{ nav.name }}
				</a-menu-item>
			</a-menu>
		</a-drawer>
	</a-flex>
</template>

<script setup>
import Icon from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useRoute } from "vue-router";
import router from "@/router";
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
	setting: {
		type: Object,
		default: null,
	},
	loading: {
		type: Object,
		default: false,
	},
});

// 路由选中
const route = useRoute();
const selectedKeys = ref([]);

watch(
	[() => route.path, () => props.setting.navs],
	([newPath, navs]) => {
		if (!navs || !navs.length) return;
		const match = navs.find((nav) => !nav.isExternal && nav.url === newPath);
		selectedKeys.value = match ? [match.url] : [];
	},
	{ immediate: true }
);

const enterAdmin = () => {
	window.location.href = '/admin';
};

// 处理菜单点击
const handleSelect = ({ key }) => {
	const nav = props.setting.navs.find((nav) => nav.url === key);
	if (!nav) return;

	if (nav.isExternal) {
		window.open(nav.url, "_blank");
	} else {
		router.push(nav.url);
		selectedKeys.value = [nav.url];
	}
};

const drawerVisible = ref(false);
const mobileSelect = ({ key }) => {
	handleSelect({ key });
	drawerVisible.value = false;
};

const isMobile = ref(false);
const checkMobile = () => {
	isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
	checkMobile();
	window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
	window.removeEventListener("resize", checkMobile);
});
</script>

<style scoped>
.header {
	width: 100%;
	padding: 0 160px;
}

@media screen and (max-width: 768px) {
	.header {
		padding: 0 40px;
	}
}
</style>
