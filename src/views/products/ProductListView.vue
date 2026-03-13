<script setup>
import ProductCard from "@/components/product/ProductCard.vue";
import { getAllProducts } from "@/services/product.service";
import SectionTitle from "@/components/common/SectionTitle.vue";

const products = getAllProducts();
</script>

<template>
  <section class="py-10">
    <div class="mb-10">
      <SectionTitle
        kicker="Products"
        title="商品列表"
        description="先上架最容易成交的動畫包，後續再擴充完整版、Pro 版與剪輯教學。"
      />
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :title="product.title"
        :price="product.price"
        :slug="product.slug"
      />
    </div>
  </section>
</template>
