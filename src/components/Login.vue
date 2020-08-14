<template>
  <div class='Login_container'>
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/image/common/advater.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="LoginForm" :rules="rules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="LoginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="LoginForm.password" prefix-icon="iconfont icon-3702mima"
          type="password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="loginClick">登录</el-button>
          <el-button type="info" @click="resetClick">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data(){
    return {
      LoginForm:{
        username:"admin",
        password:"123456"
      },
      //表单验证规则对象
      rules:{
        //验证用户名
         username:[
            { required: true, message: '请输入用户名称', trigger: 'blur' },
            { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
         ],
         //验证密码
         password:[
           { required: true, message: '请输入用户密码', trigger: 'blur' },
           { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
         ]
      }
    }
  },
  methods: {
    //重置按钮
    resetClick() {
      this.$refs.loginFormRef.resetFields();
    },
    //登录校验
    loginClick() {
      //使用await需要将它前面那个函数写成异步函数
       this.$refs.loginFormRef.validate(async valid => {
         if(!valid) return;
         //对象解构,取出服务器返回参数
         const {data: res} = await this.$http.post('login',this.LoginForm);
         if(res.meta.status !==200)  {
           this.$message({
           message:"登陆失败！",
           type:"error"
          })
        }else{
          this.$message({
          message:"登陆成功！",
          type:'success'
          })
          //保存登录成功之后服务器返回的token值:1.因为其他的页面需要登录成功之后,才能正常访问,所以需要记录token;
                                            // 2.会话级的访问将token值存储在会话级保存中
          window.sessionStorage.setItem('token',res.data.token);
          //路由跳转到home页,路由地址/home
          this.$router.push('/home');
        }
      })
    }
  }
}
</script>
<style lang='less' scoped>
.Login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 25px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
