<template>
	<a-flex
		align="center"
		justify="center"
		style="height: 100vh; background-color: var(--secondary); width: 100%"
	>
		<a-text
			style="
				letter-spacing: 10px;
				font-size: 5rem;
				font-weight: 700;
				margin-bottom: 1rem;
				color: #fff;
			"
			>留言</a-text
		>
	</a-flex>
	<a-flex
		style="width: 100%; height: 110vh"
		justify="center"
		align="center"
	>
		<div class="feedback-container">
			<a-form
				:model="form"
				:rules="rules"
				layout="vertical"
				@finish="handleSubmit"
				class="feedback-form"
			>
				<div class="row">
					<a-form-item name="name" class="half">
						<template #label>
							<a-text class="input-label">你的称呼</a-text>
						</template>
						<a-input
							v-model:value="form.name"
							placeholder="例如：小李 / Michael"
							class="input-clean"
						/>
					</a-form-item>

					<a-form-item name="email" class="half">
						<template #label>
							<a-text class="input-label">联系邮箱</a-text>
						</template>
						<a-input
							v-model:value="form.email"
							placeholder="example@mail.com"
							class="input-clean"
						/>
					</a-form-item>
				</div>

				<a-form-item name="message" class="text-box">
					<template #label>
							<a-text class="input-label">留言</a-text>
						</template>
					<a-textarea
						v-model:value="form.message"
						placeholder="写下你想对我说的内容..."
						class="input-clean textarea"
						:rows="6"
						:requrie="false"
					/>
				</a-form-item>

				<a-button type="primary" html-type="submit" class="submit-btn">
					提交
				</a-button>
			</a-form>
		</div>
	</a-flex>
</template>

<script setup>
import { reactive } from "vue";

const form = reactive({
	name: "",
	email: "",
	message: "",
});

const rules = {
	name: [{ required: false, message: "请输入称呼" }],
	email: [
		{ required: false, message: "请输入邮箱" },
		{ type: "email", message: "邮箱格式不正确" },
	],
	message: [{ required: false, message: "请输入留言内容" }],
};

const handleSubmit = () => {
	console.log("提交内容:", form);
};
</script>

<style scoped>
.feedback-container {
	width: 100%;
    padding: 100px 160px; 
}

.feedback-title {
	font-size: 42px;
	font-weight: 700;
	margin-bottom: 40px;
	letter-spacing: 0.5px;
}

.row {
	display: flex;
	gap: 120px;
	width: 100%;
}

.half {
	flex: 1;
}

.text-box{
    margin-top: 40px;
}

.input-clean {
	height: 48px !important;
	border: none !important;
	padding: 0 12px !important;
	box-shadow: none !important;
	background: var(--sub-bg);
	transition: all 0.25s ease;
}

.input-label {
	font-size: 0.9rem;
	letter-spacing: 1px;
	margin-bottom: 5px;
	color: var(--primary);
}

.textarea {
	resize: none;
	height: 180px !important;
	border: none !important;
	padding: 12px 12px !important;
}

.submit-btn {
	margin: 100px 0px;
	height: 42px;
	padding: 0 26px;
	border-radius: 8px;
	font-size: 15px;
	font-weight: 500;
}

@media screen and (max-width: 768px) {
    .feedback-container{
        padding: 0 40px;
    }

    .row{
        flex-direction: column;
        gap: 0px;
    }

    .text-box{
        margin-top: 0px;
    }
	
	.submit-btn{
		margin: 50px 0px;
	}
}
</style>
