<template>
  <section class="py-10">
    <div class="max-w-3xl">
      <p class="text-sm uppercase tracking-[0.2em] text-white/50">Checkout Failed</p>

      <h1 class="mt-3 text-4xl font-semibold">付款未完成</h1>

      <p class="mt-6 leading-8 text-white/65">
        目前這是前端測試用的失敗頁。之後接上藍新金流後，如果交易失敗、取消或付款未完成，
        會導回這裡並提示使用者重新操作。
      </p>

      <div class="mt-8 flex gap-4">
        <RouterLink
          to="/products/demo-pack"
          class="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-neutral-900"
        >
          返回商品頁
        </RouterLink>

        <RouterLink
          to="/products"
          class="rounded-2xl border border-white/15 px-6 py-3 text-sm text-white/80"
        >
          查看其他商品
        </RouterLink>
      </div>
    </div>
  </section>
</template>
