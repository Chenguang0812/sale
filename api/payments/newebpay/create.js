/* eslint-env node */

import { encryptTradeInfo, createTradeSha } from "./crypto.js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin.js";

const {
    NEWEBPAY_MERCHANT_ID,
    NEWEBPAY_HASH_KEY,
    NEWEBPAY_HASH_IV,
    VERCEL_URL,
} = process.env;

function buildBaseUrl(req) {
    if (VERCEL_URL) return `https://${VERCEL_URL}`;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    return `${protocol}://${host}`;
}

function createMerchantOrderNo(productId) {
    const safeProductId = String(productId).replace(/-/g, "_");
    const stamp = Date.now().toString().slice(-10);
    return `${safeProductId}_${stamp}`.slice(0, 30);
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                ok: false,
                message: "Method not allowed",
            });
        }

        if (!NEWEBPAY_MERCHANT_ID || !NEWEBPAY_HASH_KEY || !NEWEBPAY_HASH_IV) {
            return res.status(500).json({
                ok: false,
                message: "NewebPay env missing",
            });
        }

        const { productId, email } = req.body || {};

        if (!productId) {
            return res.status(400).json({
                ok: false,
                message: "productId is required",
            });
        }

        if (!email) {
            return res.status(400).json({
                ok: false,
                message: "email is required",
            });
        }

        const amountMap = {
            "demo-pack": 299,
            "creator-pack": 499,
            "pro-pack": 899,
        };

        const nameMap = {
            "demo-pack": "20 Viral Subtitle Animations",
            "creator-pack": "Creator Pack",
            "pro-pack": "Pro Pack",
        };

        const amt = amountMap[productId] || 299;
        const itemDesc = nameMap[productId] || "Premiere Product";
        const merchantOrderNo = createMerchantOrderNo(productId);
        const baseUrl = buildBaseUrl(req);

        const { error: insertError } = await supabaseAdmin
            .from("orders")
            .insert({
                merchant_order_no: merchantOrderNo,
                email,
                product_slug: productId,
                amount: amt,
                status: "pending",
            });

        if (insertError) {
            return res.status(500).json({
                ok: false,
                message: insertError.message,
            });
        }

        const tradeData = {
            MerchantID: NEWEBPAY_MERCHANT_ID,
            RespondType: "JSON",
            TimeStamp: Math.floor(Date.now() / 1000).toString(),
            Version: "2.0",
            MerchantOrderNo: merchantOrderNo,
            Amt: amt.toString(),
            ItemDesc: itemDesc,
            ReturnURL: `${baseUrl}/api/payments/newebpay/return`,
            NotifyURL: `${baseUrl}/api/payments/newebpay/notify`,
            ClientBackURL: `${baseUrl}/products/${productId}`,
            Email: email,
            CREDIT: "1",
        };

        const query = new URLSearchParams(tradeData).toString();
        const tradeInfo = encryptTradeInfo(query);
        const tradeSha = createTradeSha(tradeInfo);

        return res.status(200).json({
            ok: true,
            merchantId: NEWEBPAY_MERCHANT_ID,
            version: "2.0",
            tradeInfo,
            tradeSha,
            mpgUrl: "https://core.newebpay.com/MPG/mpg_gateway",
            merchantOrderNo,
        });
    } catch (error) {
        console.error("create payment error:", error);

        return res.status(500).json({
            ok: false,
            message: error.message || "Create payment failed",
        });
    }
}