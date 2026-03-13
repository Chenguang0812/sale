<template>
  <section class="py-10">
    <div class="max-w-3xl">
      <p class="text-sm uppercase tracking-[0.2em] text-white/50">Checkout Success</p>

      <h1 class="mt-3 text-4xl font-semibold">付款流程已完成</h1>

      <p class="mt-6 leading-8 text-white/65">
        目前這是前端測試流程頁。之後接上藍新金流後，付款成功會導回這裡，
        並同步更新會員中心的下載權限。
      </p>

      <div class="mt-8 flex gap-4">
        <RouterLink
          to="/account/downloads"
          class="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-neutral-900"
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
