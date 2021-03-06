import Vue from 'vue'
import VueRouter from 'vue-router'
// require ('dotenv').config() // Node...
import dotEnv from 'dotenv'
dotEnv.config()

import App from '@/App.vue'
import Home from '@/pages/Home'
import MasterDetail from '@/pages/MasterDetail'
import HardocsDb from '@/pages/HardocsDb';
import DocsTrans from '@/pages/DocsTrans'
import ProjectsAdmin from '@/pages/ProjectsAdmin'
import Documentation from '@/pages/Documentation'
import About from '@/pages/About'

// tailwindcss config
import '@/main.css'

Vue.config.productionTip = false

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', component: Home, props: { appVersion: process.env.HD_APP_VERSION } },
    { path: '/master-detail', component: MasterDetail },
    { path: '/hardocs-db', component: HardocsDb },
    { path: '/master-detail', component: MasterDetail },
    { path: '/docs-trans', component: DocsTrans },
    { path: '/projects-admin', component: ProjectsAdmin },
    { path: '/documentation', component: Documentation },
    { path: '/about', component: About, props: { appVersion: process.env.HD_APP_VERSION } },
    { path: '*', redirect: '/'}
  ]
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
