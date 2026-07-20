<template>
	<a-flex class="container" horizontal justify="space-between" align="center">
		<a-flex vertical class="info">
			<a-text class="info-title">约我一下?</a-text>
			<a-text class="info-desc"
				>如果您是我的好友或者允许访问我日程的访客，那么您应该拥有凭证，输入凭证即可一键添加预约至我的日程，我将会在IPhone上看到你预定的日程</a-text
			>
			<a-collapse class="info-collapse" :bordered="false">
				<a-collapse-panel>
					<template #header>
						<a-text>了解详细</a-text>
					</template>
					<a-text
						>每位被信任的访问者都会获得唯一凭证/密码，在提交预约请求时，该凭证会由服务器进行校验以确认访问者的身份合法性。只有通过校验的请求才会被允许写入日程系统。IPhone中iCalendar可以直接订阅通过API返回的.ics日程，从而实现无需手动更新的日程推送体验。</a-text
					>
				</a-collapse-panel>
			</a-collapse>
		</a-flex>
		<a-flex vertical class="form" align="center">
			<a-flex class="input-box" vertical>
				<a-date-picker
					v-model:value="form.date"
					class="date-input"
					placeholder="日期"
					:disabled-date="disabledDate"
				/>

				<a-select
					v-model:value="form.time"
					placeholder="时间"
					class="time-input"
				>
					<a-select-option value="06:00-08:00">06:00 - 08:00</a-select-option>
					<a-select-option value="09:00-11:00">09:00 - 11:00</a-select-option>
					<a-select-option value="11:00-13:00">12:00 - 15:00</a-select-option>
					<a-select-option value="13:00-17:00">15:00 - 17:00</a-select-option>
					<a-select-option value="17:00-19:00">17:00 - 19:00</a-select-option>
					<a-select-option value="19:00-21:00">19:00 - 21:00</a-select-option>
					<a-select-option value="21:00-24:00">21:00 - 24:00</a-select-option>
				</a-select>

				<a-input
					v-model:value="form.token"
					placeholder="凭证/密码"
					class="token-input"
				>
				</a-input>

				<a-input
					v-model:value="form.incident"
					placeholder="事件描述"
					class="incident-input"
				>
				</a-input>

				<a-flex align="flex-end" class="submit-btn" vertical>
					<a-button type="primary" @click="submit" size="large"
						>立即预约</a-button
					>
					<a-flex horizontal align="center" class="submit-desc">
						<a-text
							style="
								margin-right: 5px;
								font-size: 0.8rem;
								color: var(--text-hover);
							"
							>无需等待审批</a-text
						>
					</a-flex>
				</a-flex>
			</a-flex>
		</a-flex>
	</a-flex>
</template>

<script setup lang="js">
import { reactive } from 'vue'
import dayjs from 'dayjs';

const disabledDate = (current) => {
  return current && current < dayjs().startOf('day');
};

const form = reactive({
    date: null,
    time: null,
    token: null,
	incident: null,
})
</script>

<style scoped lang="css">
.container {
	height: 100vh;
	width: 100%;
	padding: 0px 160px;
}

.info {
	width: 50%;
	padding-right: 30px;
}
.info-title {
	font-size: 4rem;
	font-weight: bold;
	color: var(--text-normal);
}

.info-desc {
	font-size: 1rem;
	margin-top: 15px;
	color: var(--text-hover);
}

.info-collapse {
	margin-top: 120px;
	background-color: var(--bg);
}

.info-collapse :deep(.ant-collapse) {
	background: transparent !important;
}

.info-collapse :deep(.ant-collapse-header) {
	padding: 0 !important;
	padding-left: 0 !important;
	min-height: auto !important;
}

.info-collapse :deep(.ant-collapse-content-box) {
	margin-top: 15px;
	padding: 0 !important;
}

.form {
	width: 40%;
}

.input-box {
	width: 350px;
	gap: 24px;
}

.date-input,
.time-input,
.token-input {
	height: 48px;
}

.time-input :deep(.ant-select-selector) {
	height: 48px !important;
	display: flex;
	align-items: center;
	padding: 0 12px !important;
	border: none !important;
	box-shadow: none !important;
}

.date-input :deep(.ant-picker-input > input) {
	height: 48px !important;
}

.date-input :deep(.ant-picker) {
	height: 48px !important;
	padding: 0 12px !important;
	display: flex;
	align-items: center;
	border: none !important;
	box-shadow: none !important;
}

.token-input {
	height: 48px !important;
	border: none !important;
	padding: 0 12px !important;
	display: flex;
	align-items: center;
}

.incident-input {
	height: 48px !important;
	border: none !important;
	padding: 0 12px !important;
	display: flex;
	align-items: center;
}
.submit-btn {
	margin-top: 80px;
	width: 100%;
}

.submit-desc {
	margin-top: 10px;
}

@media screen and (max-width: 768px) {
	.container {
		height: auto;
		padding: 160px 40px;
		display: flex;
		flex-direction: column;
	}

	.info {
		width: 100%;
		margin-bottom: 80px;
		padding: 0 40px;
	}

	.info-collapse {
		margin-top: 20px;
	}

	.input-box {
		width: 100%;
		padding: 0 40px;
	}

	.form {
		width: 100%;
	}
	.submit-btn {
		align-items: flex-start;
	}
}
</style>
