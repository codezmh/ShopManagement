<template>
  <div class=''>
    <!-- 登录退出 -->
      <el-button type="info" @click="loginOut">退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data(){
    return {}
  },
  methods: {
    loginOut() {
      //清除token
      window.sessionStorage.clear();
      //2.重新回到登录页面
      this.$router.push('/login');
    }
  }
}
</script>
<style lang='less' scoped>
</style>
