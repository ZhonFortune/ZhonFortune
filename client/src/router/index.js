// Router 
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    // 用户界面
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/Home.vue')
    },{
        path: '/about',
        name: 'about',
        component: () => import('@/views/About.vue')
    },{
        path: '/social',
        name: 'social',
        component: () => import('@/views/Social.vue')
    },{
        path: '/message',
        name: 'message',
        component: () => import('@/views/Message.vue')
    },{
        path: '/repo',
        name: 'repo',
        component: () => import('@/views/Repo.vue')
    },{
        path: '/navigation',
        name: 'navigation',
        component: () => import('@/views/Navigation.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;