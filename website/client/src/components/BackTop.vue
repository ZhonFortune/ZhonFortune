<template>
	<a-tooltip title="返回顶部">
		<Transition name="fade">
			<a-button
				v-if="visible"
				type="primary"
				class="back-to-top"
				@click="scrollToTop"
			>
				<a-flex justify="center" align="center" style="padding: 0px 8px">
					<UpCircleOutlined />
				</a-flex>
			</a-button>
		</Transition>
	</a-tooltip>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { UpCircleOutlined } from "@ant-design/icons-vue";

const visible = ref(false);

function checkScroll() {
	visible.value = window.scrollY > 200;
}

function scrollToTop() {
	window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
	window.addEventListener("scroll", checkScroll);
});

onUnmounted(() => {
	window.removeEventListener("scroll", checkScroll);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.back-to-top {
	position: fixed;
	bottom: 40px;
	right: 40px;
	z-index: 999;
	width: 48px;
	height: 48px;
	border-radius: 10px;
}
</style>
