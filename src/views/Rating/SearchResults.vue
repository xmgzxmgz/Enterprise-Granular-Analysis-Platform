<template></template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

type Row = {
  name: string;
  category: string;
  region: string;
  risk: string;
  origin?: "existing" | "model";
  isNew?: boolean;
  manualTags?: string[];
  modelTags?: string[];
};

const route = useRoute();
const keyword = ref(String(route.query.q || "").trim());
const router = useRouter();

onMounted(async () => {
  const q = keyword.value;
  if (q) router.push({ name: "企业详情", query: { name: q } });
  else router.push({ name: "企业基本信息" });
});

const rowClass = ({ row }: { row: Row }) => (!row.isNew ? "row-existing" : "");
</script>

<style scoped></style>
