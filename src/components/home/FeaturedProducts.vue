<script setup>
import ProductCard from "@/components/product/ProductCard.vue";
import { getAllProducts } from "@/services/product.service";

const products = getAllProducts();
</script>

<template>
  <section class="py-20">
    <h2 class="mb-10 text-3xl font-semibold">Featured Products</h2>

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
