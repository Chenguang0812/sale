<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import BaseButton from "@/components/common/BaseButton.vue";
import { requestCheckoutDownload } from "@/services/file.service";

const route = useRoute();

const order = computed(() => String(route.query.order || ""));
const access = computed(() => String(route.query.access || ""));

const loading = ref(false);
const errorMessage = ref("");
const hasTriggeredAutoDownload = ref(false);

async function handleDownloadNow() {
  if (!order.value || !access.value) {
    errorMessage.value = "這筆訂單缺少下載授權資訊，請改到下載中心領取。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const result = await requestCheckoutDownload(order.value, access.value);

    if (!result?.ok || !result?.downloadUrl) {
      errorMessage.value = result?.message || "下載連結建立失敗";
      return;
    }

    window.location.href = result.downloadUrl;
  } catch (error) {
    errorMessage.value = error.message || "下載發生錯誤";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (order.value && access.value && !hasTriggeredAutoDownload.value) {
    hasTriggeredAutoDownload.value = true;
    await handleDownloadNow();
  }
});
</script>

<template>
  <section class="py-10">
    <div class="max-w-3xl">
      <p class="text-sm uppercase tracking-[0.2em] text-white/50">Checkout Success</p>
      <h1 class="mt-3 text-4xl font-semibold">付款成功</h1>

      <p class="mt-6 leading-8 text-white/65">
        你的付款已完成。系統會嘗試直接提供下載；若瀏覽器沒有自動開始下載，
        可以按下方按鈕重新取得一次下載連結。
      </p>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-300">
        {{ errorMessage }}
      </p>

      <div class="mt-8 flex flex-wrap gap-4">
        <BaseButton :disabled="loading" @click="handleDownloadNow">
          {{ loading ? "準備中..." : "立即下載商品" }}
        </BaseButton>

        <RouterLink
          to="/account/downloads"
          class="rounded-2xl border border-white/15 px-6 py-3 text-sm text-white/80"
        >
          前往下載中心
        </RouterLink>

        <RouterLink
          to="/products"
          class="rounded-2xl border border-white/15 px-6 py-3 text-sm text-white/80"
        >
          返回商品列表
        </RouterLink>
      </div>
    </div>
  </section>
</template>
