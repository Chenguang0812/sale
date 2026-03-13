<script setup>
import { ref } from "vue";
import SectionTitle from "@/components/common/SectionTitle.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { fetchMyDownloads } from "@/services/order.service";
import { requestDownload } from "@/services/file.service";

const email = ref("");
const downloads = ref([]);
const loadingList = ref(false);
const loadingDownloadId = ref(null);

async function handleLoadDownloads() {
  if (!email.value) {
    alert("請先輸入 email");
    return;
  }

  loadingList.value = true;

  try {
    const result = await fetchMyDownloads(email.value);
    downloads.value = result?.downloads || [];
  } catch (error) {
    alert("讀取下載列表失敗");
  } finally {
    loadingList.value = false;
  }
}

async function handleDownload(item) {
  loadingDownloadId.value = item.id;

  try {
    const result = await requestDownload(item.productSlug, email.value);

    if (result?.ok && result?.downloadUrl) {
      window.location.href = result.downloadUrl;
      return;
    }

    alert(result?.message || "下載失敗");
  } catch (error) {
    alert("下載發生錯誤");
  } finally {
    loadingDownloadId.value = null;
  }
}
</script>

<template>
  <section class="py-10">
    <SectionTitle
      kicker="Downloads"
      title="下載中心"
      description="輸入付款時使用的 Email，查詢已購買商品。"
    />

    <div class="mt-8 max-w-3xl">
      <label class="mb-2 block text-sm text-white/70">付款 Email</label>
      <div class="flex gap-3">
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          class="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none"
        />
        <BaseButton :disabled="loadingList" @click="handleLoadDownloads">
          {{ loadingList ? "Loading..." : "查詢訂單" }}
        </BaseButton>
      </div>
    </div>

    <div class="mt-10 max-w-4xl space-y-4">
      <div
        v-for="item in downloads"
        :key="item.id"
        class="rounded-2xl border border-white/10 bg-neutral-900 p-6"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold">{{ item.title }}</h2>
            <p class="mt-2 text-white/60">{{ item.fileName }}</p>
            <p class="mt-2 text-xs text-white/40">Paid at: {{ item.paidAt }}</p>
          </div>

          <BaseButton
            :disabled="loadingDownloadId === item.id"
            @click="handleDownload(item)"
          >
            {{ loadingDownloadId === item.id ? "Preparing..." : "Download" }}
          </BaseButton>
        </div>
      </div>

      <div
        v-if="!loadingList && downloads.length === 0"
        class="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-6 text-white/45"
      >
        目前沒有可下載商品。
      </div>
    </div>
  </section>
</template>
