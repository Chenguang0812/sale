<script setup>
import BaseButton from "@/components/common/BaseButton.vue";

defineProps({
  title: String,
  price: Number,
  slug: String,
});
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-neutral-900 p-6">
    <h3 class="text-xl font-semibold">{{ title }}</h3>

    <p class="mt-2 text-white/60">Premiere Pro Motion Pack</p>

    <div class="mt-4 text-2xl font-semibold">NT$ {{ price }}</div>

    <div class="mt-6">
      <RouterLink :to="`/products/${slug}`">
        <BaseButton> 查看 </BaseButton>
      </RouterLink>
    </div>
  </div>
</template>
