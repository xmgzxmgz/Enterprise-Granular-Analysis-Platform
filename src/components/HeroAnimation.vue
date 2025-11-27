<template>
  <div v-if="visible" class="hero" @animationend="onEnd">
    <svg class="edges" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M2,2 H98 V98 H2 Z" class="edge-path" />
    </svg>
    <svg class="egap" viewBox="0 0 800 200">
      <path :d="path" class="egap-path" />
      <circle :cx="pen.x" :cy="pen.y" r="8" class="pen" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const visible = ref(true);
const path =
  "M20,150 C120,10 190,10 280,150 M300,150 C360,10 430,10 520,150 M540,150 L720,150 M740,150 L780,150";
const pen = ref({ x: 20, y: 150 });
onMounted(() => {
  if (sessionStorage.getItem("egap_hero_seen")) {
    visible.value = false;
    return;
  }
  setTimeout(() => sessionStorage.setItem("egap_hero_seen", "1"), 2200);
  let t = 0;
  const timer = setInterval(() => {
    t += 0.02;
    pen.value.x = 20 + 760 * Math.min(t, 1);
    pen.value.y = 150;
    if (t >= 1) clearInterval(timer);
  }, 16);
});
const onEnd = () => {
  visible.value = false;
};
</script>

<style scoped>
.hero {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.edges {
  position: absolute;
  inset: 24px;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
}
.edge-path {
  fill: none;
  stroke: rgba(59, 130, 246, 0.35);
  stroke-width: 0.6;
  stroke-dasharray: 400;
  animation: draw 2s ease forwards;
}
.egap {
  width: 60%;
  height: auto;
  filter: drop-shadow(0 6px 18px rgba(59, 130, 246, 0.25));
}
.egap-path {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1500;
  stroke-dashoffset: 1500;
  animation: write 2s ease forwards;
}
.pen {
  fill: #0ea5e9;
  animation: fade 2s ease forwards;
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes write {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes fade {
  to {
    opacity: 0;
  }
}
</style>
