<template>
  <div>
     <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
    <!-- 表格区域 -->
    <tree-table  :data="cateList" 
                 :columns="columns"
                 :selection-type="false"
                 :expand-type="false"
                 :show-index="true"
                 index-text=''
                 border
                 :show-row-hover="false"
                 class="tree-table">
      <!-- 是否有效 -->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success"
           v-if="scope.row.cat_deleted === false"
           style="color:lightgreen"></i>
        <i class="el-icon-error" v-else
           style="color:red"></i>
      </template>
      <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag size="mini" 
                v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" size="mini" 
                v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="warning" size="mini" v-else>三级</el-tag>
      </template>
      <template slot="operate" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
      </template>
    </tree-table>
    <!-- 分页区域 -->
    <el-pagination  @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[3, 6, 9, 12]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFromRule"  ref="addCateFromRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options:指定数据源 -->
          <!-- props:级联选择器的配置项 -->
          <el-cascader :options="parentCateList"
                       :props="cateListProps"
                       @change="parentCateChanged"
                       v-model="selectedKeys"
                       clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="addCateDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCateFormConfirm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
         <el-form-item label="分类ID">
          <el-input v-model="editForm.cat_id" disabled></el-input>
        </el-form-item>
         <el-form-item label="分类级别">
          <el-input v-model="editForm.cat_level + 1" disabled></el-input>
        </el-form-item>
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data(){
    return {
      queryInfo:{
        type: 3,
        pagenum:1,
        pagesize:5
      },
      //商品分类数据列表
      cateList:[],
      total:0,
      //为table指定列的定义
      columns:[
        {
          label:'分类名称',
          prop:'cat_name'
        },
        {
          label:'是否有效',
          //表示是否使用模板列
          type:'template',
          //模板列插槽的名称
          template:'isok'
        },
        {
          label:'排序',
          //表示是否使用模板列
          type:'template',
          //模板列插槽的名称
          template:'order'
        },
         {
          label:'操作',
          //表示是否使用模板列
          type:'template',
          //模板列插槽的名称
          template:'operate'
        }
      ],
      //判断添加分类对话框的显示隐藏
      addCateDialogVisible:false,
      //添加分类的对象
      addCateForm:{
        //分类的名称
        cat_name:'',
        //分类的父id
        cat_pid: 0,
        //分类的层级
        cat_level: 0
      },
      //分类表单的验证规则对象
      addCateFromRule:{
        cat_name:[
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ]
      },
      parentCateList:[],
      //级联选择器的配置对象
      cateListProps:{
        checkStrictly: true,
        expandTrigger: 'hover',
        label:'cat_name',
        value:'cat_id',
        children:'children'
      },
      //选中的父级分类的id数组
      selectedKeys:[],
      editDialogVisible:false,
      editForm:{
        cat_name:''
      },
      editFormRules:{
        cat_name:[
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ]
      }
    }
  },
  created(){
    this.getCateList();
  },
  methods: {
    async getCateList() {
      //获取商品分类数据
      const {data: res} = await this.$http.get('categories', { params:this.queryInfo })
      if(res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败!')
      }
      //赋值给cateList
      this.cateList = res.data.result;
      //为总数据条数赋值
      this.total = res.data.total;
    },
    //监听每页显示的数据条数
    handleSizeChange(newSize) {
      //给数据条数赋新值
      this.queryInfo.pagesize = newSize;
      //重新获取数据
      this.getCateList();
    },
    //监听页数的改变
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum;
      this.getCateList();
    },
    //展示分类对话框
    showAddCateDialog() {
      //先获取分类列表
      this.getParentList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类列表
    async getParentList() {
      const {data: res} = await this.$http.get('categories',{params:{
        type:2
      }})
      if(res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败!')
      }
      this.parentCateList =  res.data;
      //console.log(this.parentCateList)
    },
    parentCateChanged() {
      console.log(this.selectedKeys);
      //父级分类的id
      if(this.selectedKeys.length > 0) {//说明选中了父级分类
        this. addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1];
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else {
        this.addCateForm.cat_pid =0;
        this.addCateForm.cat_level =0 ;
      }
    },
    //监听对话框的确认按钮
    addCateFormConfirm() {
      //console.log(this.addCateForm);
      //与验证
      this.$refs.addCateFromRef.validate( async valid =>{
        if(!valid) return 
        const {data: res} = await this.$http.post('categories',this.addCateForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加分类失败!')
        }
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //监听添加分类对话框的关闭,清空表单数据
    addCateDialogClosed() {
      this.$refs.addCateFromRef.resetFields();
      this.selectedKeys = [],
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editCateInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return this.$message.error('请填写必填的信息!')
        const {data: res} = await this.$http.put(`categories/${this.editForm.cat_id}`,{
          cat_name:this.editForm.cat_name
        })
        if(res.meta.status !== 200) {
          return this.$message.error('更新分类名称失败!')
        }
        this.$message.success('更新分类名称成功!')
        this.editDialogVisible =false 
        this.getCateList()
      })
    },
    async showEditDialog(cat_id) {
      const {data: res} = await this.$http.get(`categories/${cat_id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('获取分类信息失败!')
      }
      this.editForm = res.data;
      this.editDialogVisible =true
    }
  }
}
</script>
<style lang='less' scoped>
  .tree-table{
    margin-top: 15px;
  }
  .el-cascader{
    width:100%;
  }
</style>
