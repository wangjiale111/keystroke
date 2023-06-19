<template>
<div class="form">
  <el-dialog title="修改标题和要求" v-model:visible="editTitleVisible" @close="editTitleVisible = false">
    <el-form ref="titleForm" :model="form" label-width="120px">
      <el-form-item label="作文标题：">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="作文要求：">
        <el-input v-model="form.description"></el-input>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button @click="editTitleVisible = false">取消</el-button>
      <el-button type="primary" @click="submitTitle">确定</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    title: String,
    editTitleVisible: Boolean
  }
})
export default class EditTitle extends Vue {
  form = {
    title: (this.$props as { title: string }).title || '',
    description: ''
  }

  submitTitle() {
    this.$emit('update:title', this.form.title);
    this.$emit('close');
  }
}
</script>
<style scoped>
.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.form{
  width: 500px;
  height: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>