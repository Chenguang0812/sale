import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'

import HomeView from '@/views/home/HomeView.vue'
import ProductListView from '@/views/products/ProductListView.vue'
import ProductDetailView from '@/views/products/ProductDetailView.vue'
import AboutView from '@/views/about/AboutView.vue'
import FaqView from '@/views/faq/FaqView.vue'
import AccountView from '@/views/account/AccountView.vue'
import DownloadsView from '@/views/account/DownloadsView.vue'
import SuccessView from '@/views/checkout/SuccessView.vue'
import FailView from '@/views/checkout/FailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'products',
          name: 'products',
          component: ProductListView
        },
        {
          path: 'products/:slug',
          name: 'product-detail',
          component: ProductDetailView
        },
        {
          path: 'about',
          name: 'about',
          component: AboutView
        },
        {
          path: 'faq',
          name: 'faq',
          component: FaqView
        },
        {
          path: 'account',
          name: 'account',
          component: AccountView
        },
        {
          path: 'account/downloads',
          name: 'downloads',
          component: DownloadsView
        },
        {
          path: 'checkout/success',
          name: 'checkout-success',
          component: SuccessView
        },
        {
          path: 'checkout/fail',
          name: 'checkout-fail',
          component: FailView
        }
      ]
    }
  ]
})

export default router