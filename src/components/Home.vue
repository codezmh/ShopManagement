<template>
  </div>
  <el-container class="home-container">
    <!-- 头部区域 -->
  <el-header>
    <div>
      <img src="../assets/image/common/logo.png" alt="">
      <span>电商后台管理系统</span>
    </div>
    <el-button type="info" @click="loginOut">退出</el-button>
  </el-header>
  <el-container>
    <!-- 左侧侧边栏 -->
    <el-aside :width="isCollapse ? '64px': '200px'">
      <div class="toggleButton" @click="toggleMenu">|||</div>
      <el-menu
        background-color="#333744"
        text-color="#fff"
        active-text-color="#409EFF" unique-opened :collapse="isCollapse"
        :collapse-transition="false"
        router
        :default-active="activePath">
        <!-- 一级菜单 -->
        <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
          <!-- 一级菜单的模板 -->
          <template slot="title">
            <i :class="iconList[item.id]"></i>
            <span>{{item.authName}}</span>
          </template>
          <!-- 二次菜单:循环遍历item里面的children -->
          <el-menu-item :index="'/' + subItem.path + '' " 
          v-for="subItem in item.children" :key="subItem.id"
          @click="subMenuClcik('/' + subItem.path)"> 
            <!-- 二级菜单的模板区域 -->
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </template>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!-- 右侧主题区 -->
    <el-main>
      <!-- 路由占位符 -->
      <router-view/>
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  name: 'Home',
  data(){
    return {
      menulist:[],
      iconList:{
        '125':'iconfont icon-users',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao'
      },
      //是否折叠
      isCollapse:false,
      //当前激活菜单
      activePath:''
    }
  },
  created () {
    this.getMenuList();
    //刷新home组件时给activePath赋值
    this.activePath = window.sessionStorage.getItem('activepath');
  },
  methods: {
    loginOut() {
      //清除token
      window.sessionStorage.clear();
      //2.重新回到登录页面
      this.$router.push('/login');
    },
    //折叠菜单点击事件
     toggleMenu() {
      return this.isCollapse = !this.isCollapse;
    },
    //获取所有的菜单
    async getMenuList() {
      const res = await this.$http.get('menus');
      if(res.status !== 200) return this.$message.error(res.data.meta.msg);
      this.menulist = res.data.data;
    },
    //当前激活菜单点击
    subMenuClcik(activepath) {
      window.sessionStorage.setItem('activepath',activepath);
      //点击二级菜单项时给activePath赋值
      this.activePath = activepath;
    }
  }
}
</script>
<style lang='less' scoped>
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #373d41;
     display: flex;
    justify-content: space-between;
    align-items: center;
      >div{
        padding: 15px 8px;
        display: flex;
        align-items: center;
        font-size: 18px;
        color: #fff;
        img{
          height: 50px;
          width: 50px;
        }
        span{
          margin-left: 10px;
        }
      }
  }
  .el-aside{
    background-color:#333744;
    .el-menu{
      border-right: none;
    }
  }
  .el-main{
    background-color: #eaedfe;
  }
  .iconfont{
    margin-right: 10px;
  }
  .toggleButton{
    background-color: #4A5064;
    line-height: 24px;
    font-size: 14px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2rem;
    cursor: pointer;
  }
</style>
