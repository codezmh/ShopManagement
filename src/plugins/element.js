import Vue from 'vue'
import {Button, 
        Form, 
        FormItem, 
        Input, 
        Message} from 'element-ui'
//添加弹窗对象,全局挂载
Vue.prototype.$message = Message;

Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);