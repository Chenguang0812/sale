/* eslint-env node */
import { encryptTradeInfo, createHashInfo } from "./crypto.js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin.js";
import { getProductConfig } from "../../../lib/catalog.js";

const { PAYUNI_MERCHANT_ID, PAYUNI_API_URL, PAYUNI_TYPE, VERCEL_URL } = process.env;

const PAYUNI_VERSION = "1.0";

function buildBaseUrl(req) {
    if (VERCEL_URL) return `https://${VERCEL_URL}`;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    return `${protocol}://${host}`;
}

function getPayuniUrl() {
    if (PAYUNI_API_URL) return PAYUNI_API_URL;
    return PAYUNI_TYPE === "t"
        ? "https://sandbox-api.payuni.com.tw/api/upp"
        : "https://api.payuni.com.tw/api/upp";
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function createMerchantOrderNo(productId) {
    const safeProductId = String(productId || "product")
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .slice(0, 14);
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`.slice(-13);
    return `${safeProductId}_${suffix}`.slice(0, 30);
}

async function readJsonBody(req) {
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
        return req.body;
    }
    if (typeof req.body === "string") {
        return JSON.parse(req.body || "{}");
    }
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ ok: false, message: "Method not allowed" });
        }

        if (!PAYUNI_MERCHANT_ID) {
            return res.status(500).json({ ok: false, message: "PAYUNI_MERCHANT_ID missing" });
        }

        const body = await readJsonBody(req);
        const productId = String(body?.productId || "").trim();
        const email = normalizeEmail(body?.email);

        if (!productId) {
            return res.status(400).json({ ok: false, message: "productId is required" });
        }
        if (!email) {
            return res.status(400).json({ ok: false, message: "email is required" });
        }

        const product = getProductConfig(productId);
        if (!product) {
            return res.status(400).json({ ok: false, message: "Unknown productId" });
        }

        const merchantOrderNo = createMerchantOrderNo(productId);
        const baseUrl = buildBaseUrl(req);

        const { error: insertError } = await supabaseAdmin.from("orders").insert({
            merchant_order_no: merchantOrderNo,
            email,
            product_slug: product.slug,
            amount: product.price,
            status: "pending",
        });

        if (insertError) {
            return res.status(500).json({
                ok: false,
                message: insertError.message || "Insert order failed",
            });
        }

        const encryptPayload = {
            MerID: PAYUNI_MERCHANT_ID,
            MerTradeNo: merchantOrderNo,
            TradeAmt: String(product.price),
            Timestamp: String(Math.floor(Date.now() / 1000)),
            // ✅ 帶上 order 參數，讓 return handler 知道是哪筆訂單
            ReturnURL: `${baseUrl}/api/payments/payuni/return?order=${encodeURIComponent(merchantOrderNo)}`,
            NotifyURL: `${baseUrl}/api/payments/payuni/notify`,
        };

        const encryptInfo = encryptTradeInfo(encryptPayload);
        const hashInfo = createHashInfo(encryptInfo);

        return res.status(200).json({
            ok: true,
            merId: PAYUNI_MERCHANT_ID,
            version: PAYUNI_VERSION,
            encryptInfo,
            hashInfo,
            payUrl: getPayuniUrl(),
            merchantOrderNo,
        });
    } catch (error) {
        console.error("payuni create error:", error);
        return res.status(500).json({
            ok: false,
            message: error.message || "Create payment failed",
        });
    }
}