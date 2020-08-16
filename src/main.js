import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import TreeTable from 'vue-table-with-tree-grid'

//导入图表样式
import './assets/fonts/iconfont.css'

// 导入全局样式
import './assets/css/global.css'

//导入axios
import axios from 'axios'
//配置axios的根路径
axios.defaults.baseURL="http://127.0.0.1:8888/api/private/v1/";

//为服务器请求使用请求拦截器
axios.interceptors.request.use(config => {
  //console.log(config);
  //为请求头对象添加Token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
Vue.prototype.$http = axios;

Vue.config.productionTip = false;
Vue.use(ElementUI)

//注册为全局组件
Vue.component('tree-table',TreeTable)
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
