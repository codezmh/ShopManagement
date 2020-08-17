import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/users/Users.vue'
import Rights from './components/power/Rights.vue'
import Role from './components/power/Role.vue'
import Cate from './components/goods/Cate.vue'
import Params from './components/goods/Params.vue'
import Goods from './components/goods/Goods.vue'
import Add from './components/goods/Add.vue'
import Orders from './components/orders/Orders.vue'

Vue.use(Router);


const router = new Router({
  routes:[
    {path:'',redirect:'/login'},
    {path:'/login', component:Login},
    {
      path:'/home', 
      component:Home, 
      //home开启重定向
      redirect:'/welcome',
      children:[
      {path:'/welcome', component:Welcome},
      {path:'/users', component:Users},
      {path:'/rights', component:Rights},
      {path:'/roles', component:Role},
      {path:'/categories', component:Cate},
      {path:'/params', component:Params},
      {path:'/goods', component:Goods},
      {path:'/goods/add', component:Add},
      {path:'/orders', component:Orders},
    ]}
  ]
})

//路由导航守卫控制访问权限

//1.挂载全局导航守卫
router.beforeEach((to, from, next) => {
  //to 下一个页面;from 从哪个页面来  next:下一个页面
  //访问的登录页面,直接放行
  if(to.path ==='/login') next();
  //2.其他页面,判断是否有token
  const tokenStr = window.sessionStorage.getItem('token');
  if(!tokenStr) return next('/login');
  next();
})

export default router;