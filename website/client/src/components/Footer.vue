<template>
	<a-flex
		vertical
		justify="space-between"
		class="footer"
	>
		<a-flex horizontal justify="space-between" :style="{ padding: '24px 0' }" class="desc">
			<a-flex vertical>
				<a-text
					:style="{
						fontSize: '1.5rem',
						marginBottom: '12px',
						fontWeight: 'bold',
					}"
				>
					{{ setting.data.title }}
				</a-text>
				<a-text :style="{ fontSize: '0.9rem' }">
					{{ setting.data.subtitle }}
				</a-text>
			</a-flex>

			<a-flex horizontal justify="end" class="map">
				<a-flex
					vertical
					v-for="section in setting.data.map"
					:key="section.title"
					:style="{ marginLeft: '140px' }"
				>
					<a-flex horizontal align="center" style="margin-bottom: 12px;">
						<a-text
							strong
							:style="{
								fontSize: '16px',
								fontWeight: 'bold',
                                marginRight: '6px',
							}"
						>
							{{ section.title }}
						</a-text>
						<icon v-if="section.isExternal">
							<template #component>
								<svg
									t="1764935795534"
									class="icon"
									viewBox="0 0 1024 1024"
									version="1.1"
									xmlns="http://www.w3.org/2000/svg"
									p-id="7897"
									width="14"
									height="14"
								>
									<path
										d="M362.666667 85.333333a21.333333 21.333333 0 0 1 21.333333 21.333334v42.666666a21.333333 21.333333 0 0 1-21.333333 21.333334h-64c-81.216 0-125.930667 42.88-127.936 122.389333L170.666667 298.666667v448c0 74.453333 35.648 105.28 122.026666 106.624L298.666667 853.333333h426.666666c93.76 0 126.656-34.069333 127.957334-122.410666L853.333333 725.333333v-75.221333a21.333333 21.333333 0 0 1 21.333334-21.333333h42.666666a21.333333 21.333333 0 0 1 21.333334 21.333333V725.333333c0 135.616-66.304 210.794667-206.165334 213.269334L725.333333 938.666667H298.666667c-132.16 0-210.602667-62.293333-213.269334-185.472L85.333333 746.666667V298.666667c0-128.021333 80.32-210.496 206.762667-213.269334L298.666667 85.333333h64z m533.333333 0a42.666667 42.666667 0 0 1 42.56 39.466667L938.666667 128v277.333333a21.333333 21.333333 0 0 1-21.333334 21.333334h-42.666666a21.333333 21.333333 0 0 1-21.333334-21.333334v-174.336l-257.685333 257.706667a21.333333 21.333333 0 0 1-30.165333 0l-30.165334-30.186667a21.333333 21.333333 0 0 1 0-30.165333L792.96 170.666667H618.666667a21.333333 21.333333 0 0 1-21.333334-21.333334V106.666667a21.333333 21.333333 0 0 1 21.333334-21.333334h277.333333z"
										fill="#222529"
										p-id="7898"
									></path>
								</svg>
							</template>
						</icon>
					</a-flex>

					<a-space direction="vertical">
						<a-text
							class="map-link"
							@click="handleMapLinkClick(section, link)"
							v-for="link in section.links"
							:key="link.url"
							:href="link.url"
							:target="section.isExternal ? '_blank' : ''"
						>
							{{ link.name }}
						</a-text>
					</a-space>
				</a-flex>
			</a-flex>
		</a-flex>

		<a-flex
			justify="space-between"
			:style="{
				borderTop: '1px solid var(--light-border)',
				padding: '12px 0',
				marginTop: '40px',
			}"
            class="copyright"
		>
			<a-text>{{ setting.data.copyright }}</a-text>
            <a-flex horizontal align="center">
                <a-text style="margin-right: 4px;">Powered by</a-text>
                <a style="margin-right: 32px; font-weight: bold;" href="https://github.com/ZhonFortune" target="_blank">Moetone</a>
                
                <a-flex horizontal align="center" v-if="setting.data.status" style="cursor: pointer;">
					<!-- 
					 	Normal: #9aff90;
						warning: #fab700;
						error: #ff410a
					-->
                    <div style="height: 8px; width: 8px; border-radius: 8px; background-color: #fab700"></div>
                    <a-tooltip title="服务状态"><a-text style="margin-left: 6px;">未完善</a-text></a-tooltip>
                    
                </a-flex>
            </a-flex>
		</a-flex>
	</a-flex>
</template>

<script setup lang="js">
import Icon from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
const router = useRouter();

// 获取全局设置
const setting = defineProps({
    data: {
        type: Object,
        required: true
    }
});

// 处理地图链接点击
const handleMapLinkClick = (section, link) => {
    if (!section.isExternal) {
        router.push(link.url);
    }else {
        window.open(link.url, '_blank');
    }
};
</script>

<style scoped lang="css">
.footer{
	width: '100%';
	padding: 40px 160px;
}
.map-link {
	cursor: pointer;
	color: var(--text-normal);
}
.map-link:hover {
	color: var(--text-hover);
	text-decoration: underline;
}

@media screen and (max-width: 1200px) {
	.footer{
		padding: 40px 40px;
	}
    .desc,.map{
        display: none;
    }
    .copyright{
        flex-direction: column;
        justify-content: center !important;
        gap: 16px;
    }
}
</style>
