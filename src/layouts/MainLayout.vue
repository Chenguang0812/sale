<script setup>
import AppHeader from "@/components/common/AppHeader.vue";
import AppFooter from "@/components/common/AppFooter.vue";
import BaseContainer from "@/components/common/BaseContainer.vue";
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-white">
    <AppHeader />

    <main class="py-10">
      <BaseContainer>
        <router-view />
      </BaseContainer>
    </main>

    <AppFooter />
  </div>
</template>
