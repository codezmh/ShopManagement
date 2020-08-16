<template>
  <div>
     <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加角色 -->
    <el-row>
      <el-col>
         <el-button type="primary">添加角色</el-button>
      </el-col>
    </el-row>

    <!-- 角色列表 -->
    <el-table :data="roleList" border stripe>
       <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag  closable @close="removeRightByID(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
               <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2 == 0 ? '' :'bdtop','vcenter']">
                 <el-col :span="6">
                  <el-tag type="success" 
                  closable 
                  @close="removeRightByID(scope.row, item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                 </el-col>
                 <el-col :span="12">
                   <el-tag v-for="(item3, i3) in item2.children" :key="item3.id" type="warning" 
                   closable @close="removeRightByID(scope.row, item3.id)">{{item3.authName}}</el-tag>
                 </el-col>
               </el-row>
              </el-col>
            </el-row>

            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
      <!--索引列 -->
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="300px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">
            编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">
            删除</el-button>
          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetDialog(scope.row)">
            分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 获取权限对话框 -->
    <el-dialog
              title="分配权限"
              :visible.sync="setdialogVisible"
              width="50%"
              @close="setdialogClosed">
      <el-tree :data="rightsList" 
               :props="treeProps"
               show-checkbox
               node-key="id"
               default-expand-all
               :default-checked-keys="defKeys"
               ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
      <el-button @click="setdialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="setRightsToID">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Role',
  data(){
    return {
      //所有的角色列表
      roleList:[],
      //控制设置权限对话框的显示与隐藏
      setdialogVisible: false,
      //保存所有权限信息
      rightsList:[],
      //自定义树组件展示对象
      treeProps:{
        children: 'children',
        label: 'authName'
      },
       //保存默认已有的权限数据
      defKeys:[],
      roleId:''
    }
  },
  created(){
    this.getRolesList();
  },
  methods: {
   async getRolesList() {
     //获取角色列表信息
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.roleList = res.data;
    },
    //根据ID删除对应的权限
    async removeRightByID(role, rightId) {
       const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        
        if(confirmResult !== 'confirm') {
         return this.$message.info('用户取消了该操作!')
        }
        //需要角色id和权限id
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200) {
          return this.$message.error('删除角色权限失败!')
        }
        //重新为角色的权限赋值
        role.children = res.data;
    },
    async showSetDialog(role) {
      this.roleId = role.id;
      //请求所有的权限数据
      const {data: res} = await this.$http.get('rights/tree')
      if(res.meta.status !==200) {
        return this.$message.error('获取权限列表失败');
      }

      //保存所有的权限信息

      this.rightsList = res.data;
      //保存默认节点
      this.getDefKeys(role, this.defKeys);
      //点击按钮显示对话框
      this.setdialogVisible = true;
    },
    //递归获取所有默认三级权限的id,并保存到defKeys数组中
    getDefKeys(node, Arr) {
      //判断该节点是否是三级节点
      if(!node.children) {
        return Arr.push(node.id);
      }
      //循环该节点中的children
      node.children.forEach(item => 
        this.getDefKeys(item, Arr)
      )
    },
    //关闭分配权限对话框,给节点数组重新赋值
    setdialogClosed() {
      this.defKeys = [];
    },
    //为角色分配权限
    async setRightsToID() {
      //1.获取树状组件中选中和半选中的节点的key
      const keysArr = [
        ...this.$refs.treeRef.
        getCheckedKeys(),
        ...this.$refs.treeRef.
        getHalfCheckedKeys()
      ]
      console.log(keysArr);
      //将该数组以逗号分隔拼接字符串
      const ndStr = keysArr.join(',');
      //发起分配权限的网络请求
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:ndStr});
      if(res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setdialogVisible = false;
    }
  }
}
</script>
<style lang='less' scoped>
  .el-col{
    margin: 7px;
  }
  .bdtop{
    border-top:1px solid #eee;
  }
  .bdbottom{
    border-bottom:1px solid #eee;
  }
  .el-tag{
    margin:7px;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>
