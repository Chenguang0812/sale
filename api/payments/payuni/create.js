/* eslint-env node */
import {
    assertCryptoConfig,
    createHashInfo,
    encryptTradeInfo,
} from "./crypto.js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin.js";

const { PAYUNI_MERCHANT_ID, PAYUNI_API_URL, PAYUNI_TYPE, VERCEL_URL } = process.env;

const PAYUNI_VERSION = "1.0";

const PRODUCTS = {
    "demo-pack": {
        amount: 299,
        title: "20 Viral Subtitle Animations",
    },
    "creator-pack": {
        amount: 499,
        title: "Creator Pack",
    },
    "pro-pack": {
        amount: 899,
        title: "Pro Pack",
    },
};

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

function createMerTradeNo(productId) {
    const safe = String(productId || "product")
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .slice(0, 18);

    const stamp = Date.now().toString().slice(-11);
    return `${safe}_${stamp}`.slice(0, 30);
}

function parseRawBody(raw, contentType = "") {
    if (!raw) return {};

    if (String(contentType).includes("application/json")) {
        return JSON.parse(raw);
    }

    return Object.fromEntries(new URLSearchParams(raw));
}

async function readRequestBody(req) {
    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
        return req.body;
    }

    if (typeof req.body === "string") {
        return parseRawBody(req.body, req.headers["content-type"]);
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return parseRawBody(Buffer.concat(chunks).toString("utf8"), req.headers["content-type"]);
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ ok: false, message: "Method not allowed" });
        }

        if (!PAYUNI_MERCHANT_ID) {
            return res.status(500).json({ ok: false, message: "PAYUNI_MERCHANT_ID missing" });
        }

        assertCryptoConfig();

        const body = await readRequestBody(req);
        const productId = String(body?.productId || "").trim();
        const email = String(body?.email || "").trim().toLowerCase();

        if (!productId) {
            return res.status(400).json({ ok: false, message: "productId is required" });
        }

        if (!email) {
            return res.status(400).json({ ok: false, message: "email is required" });
        }

        const product = PRODUCTS[productId];
        if (!product) {
            return res.status(400).json({ ok: false, message: "Unknown productId" });
        }

        const merchantOrderNo = createMerTradeNo(productId);
        const baseUrl = buildBaseUrl(req);

        const { error: insertError } = await supabaseAdmin.from("orders").insert({
            merchant_order_no: merchantOrderNo,
            email,
            product_slug: productId,
            amount: product.amount,
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
            TradeAmt: String(product.amount),
            Timestamp: String(Math.floor(Date.now() / 1000)),
            ReturnURL: `${baseUrl}/api/payments/payuni/return`,
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