<script setup>
import { RouterLink } from "vue-router";
import SectionTitle from "@/components/common/SectionTitle.vue";
import BaseButton from "@/components/common/BaseButton.vue";
</script>

<template>
  <section class="py-10">
    <SectionTitle
      kicker="Account"
      title="會員中心"
      description="這裡之後會顯示你的帳號資訊、已購買商品、下載權限與升級方案。"
    />

    <div class="mt-8">
      <RouterLink to="/account/downloads">
        <BaseButton> 前往下載中心 </BaseButton>
      </RouterLink>
    </div>
  </section>
</template>
