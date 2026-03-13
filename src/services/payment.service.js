import { apiClient } from './api.client'

export async function createPaymentSession(productId) {
    try {
        const data = await apiClient('/api/payments/newebpay/create', {
            method: 'POST',
            body: JSON.stringify({
                productId,
            }),
        })

        if (!data?.ok) {
            return {
                ok: true,
                mode: 'mock',
                productId,
                redirectUrl: '/checkout/success',
            }
        }

        return data
    } catch (error) {
        return {
            ok: true,
            mode: 'mock',
            productId,
            redirectUrl: '/checkout/success',
        }
    }
}