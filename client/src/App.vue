<template>
	<a-config-provider
		:theme="{
			token: {
				colorPrimary: '#4177b6',
			},
		}"
		:locale="zhCN"
	>
		<BackTop />

		<a-space direction="vertical" :style="{ width: '100%', height: '100vh' }">
			<a-layout>
				<a-layout-header
					style="
						background-color: var(--sub-bg);
						display: flex;
						align-items: center;
						height: 80px;
						padding: 0px;
					"
				>
					<Header :setting="settings.header" :loading="isSettingsLoading"  />
				</a-layout-header>
				<a-layout-content
					style="padding: 24px 0px; background-color: var(--bg)"
				>
					<RouterView />
				</a-layout-content>
				<a-layout-footer style="padding: 0; background-color: var(--bg)">
					<Footer :data="settings.footer" />
				</a-layout-footer>
			</a-layout>
		</a-space>
	</a-config-provider>
</template>

<script setup lang="js">
import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

import { ref, onMounted } from "vue";
import { RouterView } from "vue-router";
import { message } from "ant-design-vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import BackTop from "./components/BackTop.vue";
import { fetchSettings } from "./utils/api";

const settings = ref({
	site: {},
	header: { user: {}, navs: [] },
	footer: { map: [] },
});

const isSettingsLoading = ref(true);

const applyMetaFromSettings = (site) => {
	if (site?.name) {
		document.title = site.name;
	} else {
		document.title = "个人导航页 | Github@ZhonFortune";
	}

	if (site?.icon) {
		let link = document.querySelector("link[rel~='icon']");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.getElementsByTagName("head")[0].appendChild(link);
		}
		link.href = site.icon;
	}
};

onMounted(async () => {
	isSettingsLoading.value = true;
	try {
		const data = await fetchSettings();
		settings.value = data;
		applyMetaFromSettings(data.site);
	} catch (error) {
		console.error("获取站点设置失败:", error);
		message.error("获取站点设置失败");
		applyMetaFromSettings();
	} finally {
		isSettingsLoading.value = false;
	}
});
</script>

<style scoped lang="css">
html {
	transition: background 0.3s, color 0.3s;
}
</style>
