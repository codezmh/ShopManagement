<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card>
      <el-alert
          title="添加商品信息"
          type="info"
          center
          show-icon
          :closable="false">
      </el-alert>
      <!-- 顶部的步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <!-- 左边的标签页:让步骤条和标签页共用一个activeIndex,实现数据联动 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
             <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
             <el-form-item label="商品分类" prop="goods_cat">
               <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateprops"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="(item, index) in manyTable" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="name" v-for="(name, i) in item.attr_vals" :key="i"  border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item, index) in onlyTable" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action:上传图片的后台API地址 -->
            <!-- 因为图片上传没有使用我们定义的axios请求,所以它内部token值无效,需要手动绑定一个请求头对象 -->
            <el-upload :action="upLoadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers="imgHeaders"
              :on-success="upLoadSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <!-- 图片预览窗口 -->
            <el-dialog
              title="图片预览"
              :visible.sync=" previewDialogVisible"
              width="50%">
              <img :src="imgPath" alt="" class="img">
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn" @click="btnClick">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Add',
  data(){
    return {
      activeIndex:'0',
      //addForm添加数据的表单对象
      addForm:{
        goods_name:'',
        goods_price:0,
        goods_weight:0,
        goods_number:0,
        //商品所属的分类数组
        goods_cat:[],
        //图片临时存储对象
        pics:[],
        //商品介绍信息
        goods_introduce:'',
        attrs:[]
      },
      //addFormRules:添加数据的表单验证规则对象
      addFormRules:{
         goods_name:[
            {required: true, message: '请输入商品名称', trigger: 'blur' },
         ],
         goods_price:[
            {required: true, message: '请输入商品价格', trigger: 'blur' },
         ],
         goods_weight:[
            {required: true, message: '请输入商品重量', trigger: 'blur' },
         ],
         goods_number:[
            {required: true, message: '请输入商品数量', trigger: 'blur' },
         ],
         goods_cat:[
           {required: true, message: '请选择商品分类', trigger: 'blur' },
         ]
      },
      //商品分类
      catelist:[],
      //商品分类配置项
      cateprops:{
        checkStrictly: true,
        expandTrigger: 'hover',
        label:'cat_name',
        value:'cat_id',
        children:'children'
      },
      //动态参数列表数据
      manyTable:[],
      //静态属性列表数据
      onlyTable:[],
      //上传图片的API地址
      upLoadURL:'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传的请求头headers对象
      imgHeaders:{
        Authorization:window.sessionStorage.getItem('token')
      },
      //图片预览路径
      imgPath:'',
      //previewDialogVisible:控制图片预览窗口的显示隐藏
      previewDialogVisible:false
    }
  },
  created(){
    this.getGoodsLsit()
  },
  computed: {
    cateId() {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    async getGoodsLsit() {
      const {data: res} = await this.$http.get('categories')
      //console.log(res);
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.catelist = res.data
      //console.log(this.catelist);
    },
    //级联选择器的选中项变化时,会触发该函数
    handleChange() {
      if(this.addForm.goods_cat.length !== 3){
        this.addForm.goods_cat = []
      }
       console.log(this.addForm.goods_cat);
    },
    beforeTabLeave(activeName, oldactivename) {
      // console.log('即将离开的标签页:', oldactivename);
      // console.log('即将进入的标签页:', activeName);
      if(oldactivename === '0' && this.addForm.goods_cat.length !==3) {
        this.$message.error('请先选择商品分类!')
        return false
      }
    },
    //tab页点击时触发
    async tabClicked() {
      //console.log(this.activeIndex);
      if(this.activeIndex === '1') {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
          params:{
            sel:'many'
          }
        })
        if(res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败!')
        }
        res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length ===0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTable = res.data
        console.log(this.manyTable)
      }else if( this.activeIndex === '2') {
         const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
          params:{
            sel:'only'
          }
        })
        if(res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败!')
        }
        this.onlyTable = res.data
        console.log(this.onlyTable)
      }
    },
    //预览图片触发的事件
    handlePreview(file) {
      //console.log(file)
      //1.获取图片的访问路径
      this.imgPath = file.response.data.url

      this.previewDialogVisible = true
    },
    //移除图片触发的事件
    handleRemove(file) {
      //console.log(file)
      //1.找出删除图片的临时路径
      const tempPath = file.response.data.tmp_path
      //2.从添加商品的数据对象pics中找到与该路径对应的pic对象
      const index = this.addForm.pics.findIndex(item => item.pic === tempPath)
      //3.从pics数组中删除该图片信息
      this.addForm.pics.splice(index, 1)
    },
    //监听图片上传成功的事件
    upLoadSuccess(response) {
      //console.log(response)
      //1.拼接一个图片信息对象
      const picInfo = { pic : response.data.tmp_path}
      //2.将该对象添加到addForm的pics中
      this.addForm.pics.push(picInfo)
    },
    btnClick() {
      //console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) {
          return this.$message.error('请填写的必要的信息!')
        }
        //完成表单预验证,处理addForm数据
        //因为级联选择器需要绑定到数组上,所以为了请求数据需要将数组转化为字符串,需要进行深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //处理manyTable数组
        this.manyTable.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            //动态参数数组转化为字符串
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        //处理onlyTable数组
         this.onlyTable.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        
        //发起请求,添加商品
        //商品的名称必须是唯一的
        const {data: res} = await this.$http.post('goods', form)
        console.log(res)
        if(res.meta.status !== 201) {
          return this.$message.error('添加商品失败!')
        }
        this.$message.success('添加商品成功!')
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style lang='less' scoped>
.el-checkbox{
  margin: 0 10px 0 0 !important;
}
.img{
  width: 100%;
}
.btn{
  margin-top: 15px;
}
</style>
