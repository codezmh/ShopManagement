import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

//导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

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
Vue.use(VueQuillEditor)

//定义全局格式化时间过滤器:过滤器名称dateFormat
Vue.filter('dateFormat',function(orginVal) {
  const dt = new Date(orginVal)

  //获取年月日
  const y = dt.getFullYear()
  //不足两位用0补齐
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  //获取时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
