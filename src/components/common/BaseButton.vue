<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
  },
});

const classes = computed(() => {
  if (props.variant === "secondary") {
    return "border border-white/15 text-white/80 hover:border-white/30 hover:text-white";
  }

  if (props.variant === "ghost") {
    return "text-white/70 hover:text-white";
  }

  return "bg-white text-neutral-900 hover:opacity-90";
});
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition cursor-pointer',
      classes,
    ]"
  >
    <slot />
  </button>
</template>
