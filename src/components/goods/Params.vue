<template>
  <div>
     <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
     <el-card>
       <!-- 顶部的警告 -->
       <el-alert title="注意：只允许为第三级分类设置相关参数" 
                 type="warning"
                 :closable="false"
                 show-icon>
       </el-alert>
     <!-- 分类选择 -->
     <el-row class="parmsSel">
       <el-col>
         <span>选择商品分类：</span>
         <!-- 选择商品分类的级联选择框 -->
         <el-cascader v-model="selectedCatKeys"
                      :options="catelist"
                      :props="cateProps"
                      @change="cateSelctedChange"></el-cascader>
       </el-col>
     </el-row>

     <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数页 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button size="mini" type="primary"
          :disabled="isBtnDisabled" @click="addDialogvisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" 
                        :key="i"  closable @close="removeVals(i , scope.row)">
                  {{item}}
                </el-tag>
                <!-- 动态编辑的标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
           <el-table-column type="index"></el-table-column>
           <el-table-column label="参数名称" prop="attr_name"></el-table-column>
           <el-table-column label="操作">
             <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" 
              @click="removeParamsData(scope.row.attr_id)">删除</el-button>
            </template>
           </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性页 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button size="mini" type="primary"
          :disabled="isBtnDisabled" @click="addDialogvisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" 
                        :key="i"  closable @close="removeVals(i , scope.row)">
                  {{item}}
                </el-tag>
                <!-- 动态编辑的标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
           <el-table-column type="index"></el-table-column>
           <el-table-column label="属性名称" prop="attr_name"></el-table-column>
           <el-table-column label="操作">
             <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParamsData(scope.row.attr_id)">删除</el-button>
            </template>
           </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
     </el-card>
     <!-- 添加数据的对话框 -->
     <el-dialog
                :title="'添加' + titleText "
                :visible.sync="addDialogvisible"
                width="50%"
                @close="addDialogClosed">
                <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                  <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                  </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogvisible = false">取 消</el-button>
        <el-button type="primary" @click="addParms">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
     <el-dialog
                :title="'修改' + titleText "
                :visible.sync="editDialogvisible"
                width="50%"
                @close="editDialogClosed">
                <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                  <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                  </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogvisible = false">取 消</el-button>
        <el-button type="primary" @click="editParms">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data(){
    return {
      catelist:[],
      //级联选择器的配置对象
      cateProps:{
        expandTrigger: 'hover',
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      //级联选择绑定到的数组
      selectedCatKeys:[],
      //默认显示的标签页
      activeName:'many',
      //动态参数数组
      manyTableData:[],
      // 静态属性数组
      onlyTableData:[],
      addDialogvisible: false,
      //添加数据的对象
      addForm:{
        attr_name:''
      },
    
      // 添加数据的验证规则对象
      addFormRules:{
        attr_name:[
          {required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      //控制修改对话框的显示隐藏
      editDialogvisible:false,
      //修改表单的数据对象
      editForm:{
         attr_name:''
      },
      //修改表单的验证规则对象
      editFormRules:{
        attr_name:[
          {required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
    }
  },
  created(){
    this.getCateList();
  },
  computed: {
    isBtnDisabled() {
      if(this.selectedCatKeys.length !==3 ) {
        return true
      }
        return false
    },
    //当前选中项的id
    selectedId() {
      if(this.selectedCatKeys.length === 3) {
        return this.selectedCatKeys[2]
      }
      return null
    },
    titleText() {
      if(this.activeName =="many") {
        return '动态参数'
      }else{
        return '静态属性'
      }
    }
  },
  methods: {
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.catelist = res.data
      //console.log(this.catelist);
    },
    //级联选择的改变
    async cateSelctedChange() {
      this.getParamsData()
    },
    //tab页面的改变
    handleTabClick() {
      console.log(this.activeName);
      this.getParamsData()
    },
    //获取动态参数和静态属性
    async getParamsData() {
      if(this.selectedCatKeys.length !== 3) {
        this.selectedCatKeys = []
        return 
      }
      //发起网络请求获取数据
      console.log(this.selectedCatKeys);
      //根据选中的三级分类的id和选择的面板
      const {data:res} = await this.$http.get(`categories/${this.selectedId}
      /attributes`,{
        params:{
          sel:this.activeName
        }
      })
      if(res.meta.status !== 200) {
        this.$message.error('请求参数信息失败!')
      }
      res.data.forEach(item => {//进行判断,解决attr_vals没有值的情况
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
      //添加自定义属性控制每一行文本输入框的显示隐藏以及文本框输入内容的绑定
      item.inputVisible = false,
      item.inputValue = ''
      })
     // console.log(res.data)
      //将数据挂载到不同的数组中,进行页面渲染
      if(this.activeName === "many") {
        this.manyTableData = res.data;
      }else{
        this.onlyTableData = res.data;
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    //添加参数
    addParms() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return;
        const {data: res} = await this.$http.post(`categories/${this.selectedId}/attributes`,{
          attr_name:this.addForm.attr_name,
          attr_sel:this.activeName
        }
        )
        console.log(res)
        if(res.meta.status !== 201) {
          return this.$message.error('添加参数失败!')
        }
        this.$message.success('添加参数成功!')
        this.addDialogvisible = false
        this.getParamsData()
      })
    },
    //点击显示修改参数的对话框
    async showEditDialog(attr_id) {
      //查询当前参数的信息
      const {data: res} = await this.$http.get(`categories/${this.selectedId}/attributes/${attr_id}`,
      {params:{
        attr_sel:this.activeName
      }
      })
      if(res.meta.status !== 200){
       return this.$message.error('查询参数失败!')
      }
      this.editForm = res.data
      this.editDialogvisible = true
    },
    //监听修改对话框的关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //监听修改的确定按钮
    editParms() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid)  return

        const {data: res} = await this.$http.put(`categories/${this.selectedId}/attributes/${this.editForm.attr_id}`,{
          attr_name:this.editForm.attr_name,
          attr_sel:this.activeName
        })

        if(res.meta.status !== 200) {
          this.$message.error('更新参数失败!')
        }
        this.$message.success('更新参数成功!')
        this.getParamsData()
        this.editDialogvisible = false
      })
    },
    //监听删除操作,点击按钮完成
    async removeParamsData(attr_id) {
      console.log(attr_id)
       const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => err)
      if(result !== 'confirm') {//用户取消了该操作
        return this.$message.info('用户取消了删除操作!')
      }
       // 删除的业务逻辑
      const {data: res} = await this.$http.delete(`categories/${this.selectedId}/attributes/${attr_id}`)
      console.log(res)
      if(res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.$message.success('删除参数成功!')
      this.getParamsData()
    },
    showInput(row) {
    // 监听显示文本输入框
      row.inputVisible = true
      //文本框自动获取焦点
      // $nextTick函数的作用是：当页面上的元素重新渲染完成之后
      //才会去执行回调函数
       this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    //确认之后显示tag标签,隐藏输入框
    handleInputConfirm(row) {
      //判断是否输入了非法的字符串
      if(row.inputValue.trim().length ===0 ) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      //如果没有return,执行后续操作
      //将输入的属性保存到attr_name数组中
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue =''
      row.inputVisible = false

      this.saveAttrVals(row)
    },
    //将修改的attr_vals保存到数据库
    async saveAttrVals(row) {
       const {data: res} =  await this.$http.put(`categories/${this.selectedId}/attributes/${row.attr_id}`,{
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if(res.meta.status !== 200) {
        return this.$message.error('添加属性失败!')
      }
      this.$message.success('修改参数项成功!')
    },
    //删除可选择的参数项
    removeVals(i , row) {
      row.attr_vals.splice(i ,1 );
      //提交到数据库保存
      this.saveAttrVals(row)
    }
  }
}
</script>
<style lang='less' scoped>
.parmsSel{
  margin: 15px 0;
}
.el-tag{
  margin: 0 10px;
}
.input-new-tag{
  width:150px;
}
</style>
