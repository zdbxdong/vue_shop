<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable
          @clear="getUserlist">
            <el-button slot="append" icon="el-icon-search" @click="getUserlist"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisiible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户表格 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 设置按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
    title="添加用户"
    :visible.sync="addDialogVisiible"
    width="50%" @close="addDialogClosed">
      <!-- 主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 尾部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisiible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
    title="修改用户"
    :visible.sync="editDialogVisible"
    width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户: {{userInfo.username}}</p>
        <p>当前的角色: {{userInfo.role_name}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
            v-for="item in roleslist"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的邮箱'))
    }
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号'))
    }
    return {
      // 获取用户列表
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前一页显示多少数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示
      addDialogVisiible: false,
      // 对话框的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 对话框的表单数据的验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      // 修改用户信息的表单对象
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色对话框是否显示
      setRoleDialogVisible: false,
      // 当前用户的角色信息
      userInfo: {},
      // 所有可分配的角色列表
      roleslist: [],
      // 选中的角色
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserlist()
  },
  methods: {
    // 添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过，可以发起请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addDialogVisiible = false
        this.getUserlist()
      })
    },
    async getUserlist() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res && res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 监听页数大小改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserlist()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserlist()
    },
    // 监听开关状态的改变
    async changeUserState(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    // 监听用户对话框的关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 通过验证，发起请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        this.editDialogVisible = false
        this.getUserlist()
        this.$message.success('更新用户信息成功')
      })
    },
    // 根据id删除用户
    async removeUserById(id) {
      // 弹窗提示
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserlist()
    },
    // 显示分配角色的对话框
    async setRole(userinfo) {
      // 在展示对话框之前获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色失败')
      }
      this.roleslist = res.data
      this.userInfo = userinfo
      this.setRoleDialogVisible = true
    },
    // 保存分配好的角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserlist()
      this.setRoleDialogVisible = false
    },
    // 分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style>
.el-table {
  margin-top: 15px;
  font-size: 15px;
}
.el-pagination {
  margin-top: 15px;
}
</style>
