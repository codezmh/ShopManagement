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
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
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
      total:0
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
      console.log(this.goodslist, this.total);
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
    }
  }
}
</script>
<style lang='less' scoped>
</style>
