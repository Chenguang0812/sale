<script setup>
import SectionTitle from "@/components/common/SectionTitle.vue";
</script>

<template>
  <section class="py-10">
    <SectionTitle
      kicker="FAQ"
      title="常見問題"
      description="如果你對模板下載、使用方式或未來更新有疑問，可以先查看這裡。"
    />

    <div class="mt-10 space-y-6 max-w-3xl">
      <div class="rounded-2xl border border-white/10 bg-neutral-900 p-6">
        <h2 class="text-xl font-semibold">購買後怎麼下載？</h2>
        <p class="mt-3 leading-7 text-white/65">
          付款成功後，商品會出現在會員中心的下載頁面，之後可從那裡取得下載權限。
        </p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-neutral-900 p-6">
        <h2 class="text-xl font-semibold">支援哪些版本？</h2>
        <p class="mt-3 leading-7 text-white/65">
          目前主要針對 Premiere Pro 製作，後續會再補充更完整的版本說明與相容資訊。
        </p>
      </div>

      <div class="rounded-2xl border border-white/10 bg-neutral-900 p-6">
        <h2 class="text-xl font-semibold">之後會有更多商品嗎？</h2>
        <p class="mt-3 leading-7 text-white/65">
          會，後續會加入剪輯後製教學等商品，希望對剪輯市場有所幫助。
        </p>
      </div>
    </div>
  </section>
</template>
