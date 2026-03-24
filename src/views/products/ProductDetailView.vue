<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import BaseButton from "@/components/common/BaseButton.vue";
import { getProductBySlug } from "@/services/product.service";
import { createPaymentSession } from "@/services/payment.service";

const route = useRoute();

const slug = computed(() => String(route.params.slug || ""));
const product = computed(() => getProductBySlug(slug.value));
const email = ref("");

async function handleCheckout() {
  if (!slug.value) {
    alert("找不到商品 slug");
    return;
  }

  if (!email.value) {
    alert("請先輸入 email");
    return;
  }

  const result = await createPaymentSession(slug.value, email.value);

  if (!result?.ok) {
    alert(result?.message || "付款建立失敗");
    return;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = result.payUrl;

  const fields = {
    MerID: result.merId,
    EncryptInfo: result.encryptInfo,
    HashInfo: result.hashInfo,
    Version: result.version,
  };

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
</script>

<template>
  <section class="py-10">
    <div class="grid gap-10 lg:grid-cols-2">
      <div class="rounded-3xl border border-white/10 bg-neutral-900 p-8">
        <div
          class="rounded-2xl border border-white/10 bg-neutral-800 overflow-hidden aspect-video"
        >
          <img
            src="D:\code\販賣網站\sale\src\assets\images\666.png"
            alt="Product Preview"
            class="w-full h-full object-cover"
          />
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

        <div class="mt-6">
          <label class="mb-2 block text-sm text-white/70">購買 Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none"
          />
        </div>

        <div class="relative z-50 mt-8 flex gap-4">
          <BaseButton @click="handleCheckout">立即購買</BaseButton>

          <RouterLink to="/products">
            <BaseButton variant="secondary">返回商品列表</BaseButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
