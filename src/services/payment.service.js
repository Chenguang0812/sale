import { apiClient } from './api.client'

export async function createPaymentSession(productId) {
    console.log('createPaymentSession productId:', productId)

    if (!productId) {
        return {
            ok: false,
            message: 'productId is required',
        }
    }

    try {
        const result = await apiClient('/api/payments/newebpay/create', {
            method: 'POST',
            body: JSON.stringify({
                productId,
            }),
        })

        console.log('createPaymentSession result:', result)
        return result
    } catch (error) {
        console.error('createPaymentSession error:', error)

        return {
            ok: false,
            message: error.message || 'Create payment session failed',
        }
    }
}