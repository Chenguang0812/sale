<script setup>
defineProps({
  kicker: String,
  title: String,
  description: String,
});
</script>

<template>
  <div class="max-w-3xl">
    <p v-if="kicker" class="text-sm uppercase tracking-[0.2em] text-white/50">
      {{ kicker }}
    </p>

    <h2 v-if="title" class="mt-3 text-4xl font-semibold">
      {{ title }}
    </h2>

    <p v-if="description" class="mt-4 leading-8 text-white/65">
      {{ description }}
    </p>
  </div>
</template>
