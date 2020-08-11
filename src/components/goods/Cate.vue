<template>
  <div>
    <!-- 面包屑导航区域 -->
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
        <div style="clear:both"></div>
        <!-- 表格区域 -->
        <tree-table :data="catelist" :columns="columns"
        :selection-type="false" :expand-type="false"
        show-index index-text="#" class="treeTable"
        border :show-row-hover="false">
        <!-- 是否有效的模板 -->
          <template slot="isok" slot-scope="scope">
            <div>
              <i class="el-icon-success"
              v-if="scope.row.cat_deleted === false"
              style="color: lightgreen"></i>
              <i class="el-icon-error" v-else
              style="color: red"></i>
            </div>
          </template>
          <!-- 排序的模板 -->
          <template slot="order" slot-scope="scope">
            <div>
              <el-tag size="mini"
              v-if="scope.row.cat_level === 0">一级</el-tag>
              <el-tag type="success" size="mini"
              v-else-if="scope.row.cat_level === 1">二级</el-tag>
              <el-tag type="warning" size="mini"
              v-else>三级</el-tag>
            </div>
          </template>
          <!-- 操作的模板 -->
          <template slot="opt">
            <div>
              <el-button type="primary" size="mini"
              icon="el-icon-edit">编辑</el-button>
              <el-button type="danger" size="mini"
              icon="el-icon-delete">删除</el-button>
            </div>
          </template>
        </tree-table>
        <!-- 分页区域 -->
         <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
      </el-row>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
    title="添加分类" @close="addCartDialogClosed"
    :visible.sync="addCateDialogVisible"
    width="50%">
      <el-form :model="addCateForm" :rules="addCateFormRules"
      ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader size="middle"
            v-model="selectedKeys" :props="cascaderProps"
            :options="parentCatelist" clearable
            @change="parentCateChanged"></el-cascader>
          </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表
      catelist: [],
      // 商品分类总数
      total: 0,
      // 树形表格的行设置对象
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前列使用的模板名称
          template: 'opt'
        }
      ],
      // 添加分类对话框是否显示
      addCateDialogVisible: false,
      // 添加分类表单数据
      addCateForm: {
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0
      },
      // 添加分类规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCatelist: [],
      // 指定连选选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCatelist()
  },
  methods: {
    // 获取商品分类数据
    async getCatelist() {
      const { data: res } = await this.$http.get('categories',
        { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('请求商品分类失败')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatelist()
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatelist()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      this.getParentCatelist()
      this.addCateDialogVisible = true
    },
    // 获取前2级的分类
    async getParentCatelist() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级数据失败')
      }
      this.parentCatelist = res.data
      console.log(this.parentCatelist)
    },
    // 选择项发生变化触发的函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果数组中的length大于0，说明有父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid =
        this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 提交添加分类请求
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await
        this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCatelist()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCartDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
  // float: left;
}
.el-cascader {
  width: 100%;
}
</style>
