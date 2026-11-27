<template>
	<div class="parallax-container">
		<div class="cards-wrapper">
			<div
				v-for="(item, index) in props.list"
				:key="index"
				class="sticky-card"
				:style="{
					'--bg-image': `url(${item.bg})`,
					'--card-index': index,
				}"
			>
				<div class="card-bg"></div>
				<div class="card-overlay"></div>

				<div class="card-content">
					<a-flex
						gap="large"
						align="center"
						vertical
						justify="center"
						class="content-box"
					>
						<div class="text-group">
							<h2 class="card-title">{{ item.name }}</h2>

							<div v-if="item.desc" class="card-desc">
								{{ item.desc }}
							</div>
						</div>
					</a-flex>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	list: {
		type: Array,
		default: null
	}
})

</script>

<style scoped>
/* 容器设置 */
.parallax-container {
	width: 100%;
	position: relative;
	/*background-color: var(--secondary);*/
	color: #fff;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
		Arial, sans-serif;
}

.sticky-card {
	position: sticky;
	top: 0;

	height: 110vh;
	width: 100%;
	overflow: hidden;

	display: flex;
	justify-content: center;
	align-items: center;

}

.sticky-card:nth-child(1) .card-bg{
	background-image: none;
	background-color: var(--secondary);
}

.card-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	/*background-color: var(--secondary);*/
	background-image: var(--bg-image);
	background-size: cover;
	background-position: center;
	will-change: transform;
}

.card-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: var(--bg-overlay);
}

/* 文字内容层 */
.card-content {
	position: relative;
	z-index: 10;
	width: 100%;
	margin-bottom: 100px;
}

.content-box {
	padding: 3rem;
	border-radius: 20px;
	transform: translateY(0);
	transition: transform 0.3s ease;
}

.text-group {
	text-align: center;
}

.card-title {
	letter-spacing: 10px;
	font-size: 5rem;
	font-weight: 700;
	margin-bottom: 1rem;
	color: #fff;
}

.card-desc {
	font-size: 1.25rem;
	line-height: 1.6;
	color: #e0e0e0;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
	.hero-title {
		font-size: 2.5rem;
	}
	.card-title {
		font-size: 2rem;
	}
	.content-box {
		padding: 0;
		width: 100%;
	}
}
</style>