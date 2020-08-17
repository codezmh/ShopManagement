<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
       <el-row>
        <!-- 搜索框 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容"
          v-model="queryInfo.query"
          clearable>
          <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
       </el-row>
       <!-- 订单列表表格区域 -->
       <el-table :data="orderslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editClcik"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
       </el-table>
       <!-- 分页区域 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>

        <!-- 展示修改地址的对话框 -->
        <el-dialog
          title="修改地址"
          :visible.sync="adressVisible"
          width="50%"
          @close="addressDialogClosed">
          <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
              <el-cascader
                v-model="addressForm.address1"
                :options="CityData"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
              <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="adressVisible = false">取 消</el-button>
            <el-button type="primary" @click="adressVisible = false">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 物流进度对话框 -->
        <el-dialog
          title="物流进度"
          :visible.sync="progressVisible"
          width="50%">
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in progressInfo"
              :key="index"
              :timestamp="activity.time">
              {{activity.context}}
            </el-timeline-item>
          </el-timeline>
        </el-dialog>
    </el-card>
  </div>
</template>

<script>
import CityData from './citydata.js'
export default {
  name: 'Orders',
  data(){
    return {
      queryInfo:{
        query:'',
        pagenum: 1,
        pagesize: 10
      },
      //总记录条数
      total:0,
      //订单列表
      orderslist:[],
      adressVisible: false,

      addressForm:{
        address1:[],
        address2:''
      },
      addressFormRules:{
        address1:[
          {required: true, message: '请选择省市区县地址', trigger: 'blur' },
        ],
        address2:[
          {required: true, message: '请填写详细地址', trigger: 'blur'}
        ]
      },
      //省市区县数据
      CityData,
      progressVisible: false,
      progressInfo:[]
    }
  },
  created(){
    this.getOrdersList()
  },
  methods: {
    async getOrdersList() {
      const {data: res} = await this.$http.get('orders', {params: this.queryInfo})
      if(res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败!')
      }
      this.total = res.data.total
      this.orderslist = res.data.goods
      console.log(this.total, this.orderslist);
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    //显示修改地址的对话框
    editClcik() {
      this.adressVisible = true
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    //显示物流进度对话框
    async showProgressBox() {
     const { data: res } = await this.$http.get('/kuaidi/804909574412544580')

      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }

      this.progressInfo = res.data

      this.progressVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>
<style lang='less' scoped>
.el-cascader{
  width:100%;
}
</style>
