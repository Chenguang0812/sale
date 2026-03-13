<script setup>
import SectionTitle from "@/components/common/SectionTitle.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import { getUserDownloads } from "@/services/download.service";
import { requestDownload } from "@/services/file.service";

const downloads = getUserDownloads();

async function handleDownload(item) {
  const result = await requestDownload(item.productSlug);

  if (result?.ok && result?.downloadUrl) {
    window.location.href = result.downloadUrl;
  }
}
</script>

<template>
  <section class="py-10">
    <SectionTitle
      kicker="Downloads"
      title="下載中心"
      description="付款成功後，已購買的商品會顯示在這裡。"
    />

    <div class="mt-10 max-w-4xl space-y-4">
      <div
        v-for="item in downloads"
        :key="item.id"
        class="rounded-2xl border border-white/10 bg-neutral-900 p-6"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold">
              {{ item.title }}
            </h2>
            <p class="mt-2 text-white/60">
              {{ item.fileName }}
            </p>
          </div>

          <BaseButton @click="handleDownload(item)"> Download </BaseButton>
        </div>
      </div>

      <div
        v-if="downloads.length === 0"
        class="rounded-2xl border border-dashed border-white/10 bg-neutral-900/40 p-6 text-white/45"
      >
        目前沒有可下載商品。
      </div>
    </div>
  </section>
</template>
