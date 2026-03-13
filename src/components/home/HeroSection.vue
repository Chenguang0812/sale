<script setup>
import BaseButton from "@/components/common/BaseButton.vue";
</script>

<template>
  <section class="py-20">
    <div class="max-w-3xl">
      <p class="mb-4 text-sm uppercase tracking-[0.2em] text-white/50">
        Premiere Pro Motion Pack
      </p>

      <h1 class="text-5xl font-semibold leading-tight">
        20 個爆款文字動畫，
        <span class="text-white/60">剪輯更有效率</span>
      </h1>

      <p class="mt-6 max-w-2xl text-lg leading-8 text-white/65">
        為剪輯師、自媒體與內容創作者設計的文字特效包。
        先從最常用、最容易成交的版本開始，後續再擴充完整版本與 Pro 方案。
      </p>

      <div class="mt-8 flex gap-4">
        <RouterLink to="/products">
          <BaseButton> 查看商品 </BaseButton>
        </RouterLink>

        <RouterLink to="/about">
          <BaseButton variant="secondary"> 品牌介紹 </BaseButton>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
