<script setup>
import BaseContainer from "@/components/common/BaseContainer.vue";
</script>

<template>
  <header class="border-b border-white/10 bg-neutral-950">
    <BaseContainer>
      <div class="flex items-center justify-between py-4">
        <div class="text-lg font-semibold">Studio Market</div>

        <nav class="flex gap-6 text-sm text-white/70">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/products">Products</RouterLink>
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/faq">FAQ</RouterLink>
          <RouterLink to="/account">Account</RouterLink>
        </nav>
      </div>
    </BaseContainer>
  </header>
</template>
