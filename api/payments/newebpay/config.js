export const newebpayConfig = {
    merchantId: process.env.NEWEBPAY_MERCHANT_ID || '',
    hashKey: process.env.NEWEBPAY_HASH_KEY || '',
    hashIv: process.env.NEWEBPAY_HASH_IV || '',
    isReady() {
        return Boolean(this.merchantId && this.hashKey && this.hashIv)
    },
}