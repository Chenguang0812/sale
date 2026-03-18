<script setup>
import BaseContainer from "@/components/common/BaseContainer.vue";
</script>

<template>
  <header class="border-b border-white/10 bg-neutral-950">
    <BaseContainer>
      <div class="flex items-center justify-between py-4">
        <a href="/" class="text-lg font-semibold">CG Studio</a>

        <nav class="flex gap-6 text-sm text-white/70">
          <RouterLink to="/">首頁</RouterLink>
          <RouterLink to="/products">商品</RouterLink>
          <RouterLink to="/about">關於</RouterLink>
          <RouterLink to="/faq">FAQ</RouterLink>
          <RouterLink to="/account">帳號</RouterLink>
        </nav>
      </div>
    </BaseContainer>
  </header>
</template>
