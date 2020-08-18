<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容"
          v-model="queryInfo.query"
          clearable
          @clear="getGoodsList">
          <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="toAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表table区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="145px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column> 
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
            @click="removeByID(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
       <el-pagination @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                      :current-page="queryInfo.pagenum"
                      :page-sizes="[5, 10, 15, 20]"
                      :page-size="queryInfo.pagesize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="total" background>
    </el-pagination>
     <!-- 编辑商品的对话框 -->
      <el-dialog title="编辑商品" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="价格" prop="goods_price">
            <el-input v-model="editForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="数量" prop="goods_number">
            <el-input v-model="editForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="重量" prop="goods_weight">
            <el-input v-model="editForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品参数">
            <el-tag
              v-for="(item, index) in editForm.attrs"
              :key="item.attr_id">
              {{item.attr_vals}}
            </el-tag>
          </el-form-item>
          <el-form-item label="商品介绍" prop="goods_introduce">
            <quill-editor v-model="editForm.goods_introduce"></quill-editor>
          </el-form-item>
          <el-form-item label="商品图片">
            <div class="block" v-for="(item, index) in editForm.pics" :key="item.pics_id">
              <el-image
                style="width: 100px; height: 100px"
                :src="item.pics_sma"
                fit="contain"></el-image>
            </div>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Goods',
  data(){
    return {
      //查询参数对象
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      //商品列表数据对象
      goodslist:[],
      //数组总条数
      total:0,
      editForm:{
      },
      editFormRules:{
        goods_name:[
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price:[
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_number:[
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_weight:[
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
      },
      editDialogVisible:false
    }
  },
  created(){
    this.getGoodsList()
  },
  methods: {
    //请求商品数据
    async getGoodsList() {
      const {data: res} = await this.$http.get('goods',{ params: this.queryInfo})
      //判断
      if(res.meta.status !== 200) {
        return this.$message.error('请求商品数据失败!')
      }
      this.goodslist = res.data.goods;
      this.total = res.data.total;
      //console.log(this.goodslist, this.total);
    },
    //每页显示条数的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //页码的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage 
      this.getGoodsList()
    },
    //监听删除按钮
    async removeByID(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => err)
      if(confirmRes !=='confirm') {
        return this.$message.info('用户取消了删除操作!')
      }
      const {data: res} = await this.$http.delete(`goods/${id}`)
      if(res.meta.status !== 200) {
       return this.$message.error('删除商品失败!')
      }
      this.$message.success('删除商品成功!')
      this.getGoodsList()
    },
    //跳转到添加商品页面
    toAddPage() {
      this.$router.push('goods/add')
    },
    async showEditDialog(goods_id) {
      const {data: res} = await this.$http.get(`goods/${goods_id}`)
      console.log(res)
      if(res.meta.status !== 200 ) {
        return this.$message.error('请求商品信息失败!')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editGoodsInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put(`goods/${this.editForm.goods_id}`,this.editForm)
        console.log(res)
        if(res.meta.status !== 200) {
          return this.$message.error('修改商品参数失败!')
        }
        this.$message.success('修改商品参数成功!')
        this.editDialogVisible = false 
        this.getGoodsList()
      })
    }
  }
}
</script>
<style lang='less' scoped>
.el-tag{
  margin: 0 8px !important;
}
</style>
