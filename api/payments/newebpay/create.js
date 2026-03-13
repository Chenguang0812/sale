/* eslint-env node */

import crypto from "crypto"

const {
    NEWEBPAY_MERCHANT_ID,
    NEWEBPAY_HASH_KEY,
    NEWEBPAY_HASH_IV,
} = process.env

console.log("MERCHANT_ID exists:", Boolean(NEWEBPAY_MERCHANT_ID))
console.log("HASH_KEY exists:", Boolean(NEWEBPAY_HASH_KEY))
console.log("HASH_IV exists:", Boolean(NEWEBPAY_HASH_IV))
console.log("cwd:", process.cwd())

function createMpgAesEncrypt(data) {
    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        NEWEBPAY_HASH_KEY,
        NEWEBPAY_HASH_IV
    )

    cipher.setAutoPadding(true)

    let encrypted = cipher.update(data, "utf8", "hex")
    encrypted += cipher.final("hex")

    return encrypted
}

function createMpgShaEncrypt(tradeInfo) {
    const sha = crypto.createHash("sha256")
    const plainText = `HashKey=${NEWEBPAY_HASH_KEY}&${tradeInfo}&HashIV=${NEWEBPAY_HASH_IV}`

    return sha.update(plainText).digest("hex").toUpperCase()
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            message: "Method not allowed",
        })
    }

    if (!NEWEBPAY_MERCHANT_ID || !NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) {
        return res.status(500).json({
            ok: false,
            message: "NewebPay env missing",
        })
    }

    const { productId } = req.body || {}

    if (!productId) {
        return res.status(400).json({
            ok: false,
            message: "productId is required",
        })
    }

    const amountMap = {
        "demo-pack": 299,
        "creator-pack": 499,
        "pro-pack": 899,
    }

    const nameMap = {
        "demo-pack": "20 Viral Subtitle Animations",
        "creator-pack": "Creator Pack",
        "pro-pack": "Pro Pack",
    }

    const amt = amountMap[productId] || 299
    const itemDesc = nameMap[productId] || "Premiere Product"

    const safeProductId = String(productId).replace(/-/g, "_")
    const merchantOrderNo = `${safeProductId}_${Date.now()}`.slice(0, 20)

    const tradeData = {
        MerchantID: NEWEBPAY_MERCHANT_ID,
        RespondType: "JSON",
        TimeStamp: Math.floor(Date.now() / 1000).toString(),
        Version: "2.0",
        MerchantOrderNo: merchantOrderNo,
        Amt: amt.toString(),
        ItemDesc: itemDesc,
        ReturnURL: "https://sale-jade.vercel.app/api/payments/newebpay/return",
        NotifyURL: "https://sale-jade.vercel.app/api/payments/newebpay/notify",
        ClientBackURL: "https://sale-jade.vercel.app/products",
        Email: "test@example.com",
        CREDIT: "1",
    }

    const query = new URLSearchParams(tradeData).toString()
    const TradeInfo = createMpgAesEncrypt(query)
    const TradeSha = createMpgShaEncrypt(TradeInfo)

    return res.status(200).json({
        ok: true,
        merchantId: NEWEBPAY_MERCHANT_ID,
        version: "2.0",
        tradeInfo: TradeInfo,
        tradeSha: TradeSha,
        mpgUrl: "https://core.newebpay.com/MPG/mpg_gateway",
    })
}