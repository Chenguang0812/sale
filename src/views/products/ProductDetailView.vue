<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { createPaymentSession } from "@/services/payment.service";
import { getProductBySlug } from "@/services/product.service";
import BaseButton from "@/components/common/BaseButton.vue";

const route = useRoute();
const router = useRouter();

const slug = computed(() => route.params.slug);

const product = computed(() => getProductBySlug(slug.value));

async function handleCheckout() {
  const result = await createPaymentSession(slug.value);

  if (result?.ok && result?.redirectUrl) {
    router.push(result.redirectUrl);
  }
}
</script>

<template>
  <section class="py-10">
    <div class="grid gap-10 lg:grid-cols-2">
      <div class="rounded-3xl border border-white/10 bg-neutral-900 p-8">
        <div
          class="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-neutral-800 text-white/40"
        >
          Product Preview
        </div>
      </div>

      <div>
        <p class="text-sm uppercase tracking-[0.2em] text-white/50">Product Detail</p>

        <h1 class="mt-3 text-4xl font-semibold">
          {{ product.title }}
        </h1>

        <p class="mt-5 leading-8 text-white/65">
          {{ product.description }}
        </p>

        <div class="mt-8 text-3xl font-semibold">NT$ {{ product.price }}</div>

        <div class="relative z-50 mt-8 flex gap-4">
          <BaseButton @click="handleCheckout"> 立即購買 </BaseButton>

          <RouterLink to="/products">
            <BaseButton variant="secondary"> 返回商品列表 </BaseButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
