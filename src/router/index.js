import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cart from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/home/welcome',
    children: [
      {
        path: 'welcome',
        component: Welcome
      },
      {
        path: 'users',
        component: User
      },
      {
        path: 'rights',
        component: Rights
      },
      {
        path: 'roles',
        component: Roles
      },
      {
        path: 'categories',
        component: Cart
      },
      {
        path: 'params',
        component: Params
      }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // 检查是否是登录页面，如果请求的是登录页面，直接跳转
  if (to.path === '/login') return next()
  // 否则进行验证是否有token，如果没有，跳转到登录页面
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
