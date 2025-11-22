<template>
  <div class="home-wrap">
    <HeroAnimation />
  </div>
</template>

<script setup lang="ts">
import HeroAnimation from '@/components/HeroAnimation.vue'
</script>

<style scoped>
.home-wrap { position: relative; height: calc(100vh - 60px); }
</style>