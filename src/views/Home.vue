<template>
  <div class="home-wrap">
    <el-card class="home-card">
      <div class="title">欢迎使用 EGAP 企业颗粒度分析平台</div>
      <div class="desc">请从左侧菜单选择功能模块开始使用。</div>
    </el-card>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.home-wrap {
  height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.home-card {
  width: 880px;
  text-align: center;
}
.title {
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 26px;
}
.desc {
  color: var(--text-secondary);
  font-size: 16px;
}
</style>
