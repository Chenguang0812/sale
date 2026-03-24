<script setup>
import BaseContainer from "@/components/common/BaseContainer.vue";
</script>

<template>
  <footer class="border-t border-white/10 bg-neutral-950">
    <BaseContainer>
      <div class="flex items-center justify-between py-4 text-sm text-white/60">
        <div>© 2026 Studio Market. All rights reserved.</div>
        <div>客服信箱：cgstduio0812@gmail.com</div>

        <div class="flex gap-4">
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/faq">FAQ</RouterLink>
        </div>
      </div>
    </BaseContainer>
  </footer>
</template>
