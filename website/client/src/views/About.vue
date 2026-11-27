<template>
    <a-flex justify="center" align="center" style="height: 100%; padding: 60px 0;">
        <a-result status="404" title="404" sub-title="达达很懒，这个页面还没写">
            <template #extra>
                <a-button type="primary" @click="backHome">回到首页</a-button>
            </template>
        </a-result>
    </a-flex>
</template>

<script setup lang='js'>
import { useRouter } from 'vue-router'
const router = useRouter()
const backHome = () => {
    router.push({
        name: 'home'
    })
}
</script>