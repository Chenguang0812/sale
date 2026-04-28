/* eslint-env node */
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";
import { getProductConfig } from "../../lib/catalog.js";
import { verifyCheckoutAccessToken } from "../utils/checkoutAccessToken.js";

const PRIVATE_BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || "digital-products";

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

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

async function findPaidOrderByEmail(productSlug, email) {
    const { data, error } = await supabaseAdmin
        .from("orders")
        .select("id, email, product_slug, status, merchant_order_no")
        .eq("email", email)
        .eq("product_slug", productSlug)
        .eq("status", "paid")
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

async function findPaidOrderByMerchantOrderNo(merchantOrderNo) {
    const { data, error } = await supabaseAdmin
        .from("orders")
        .select("id, email, product_slug, status, merchant_order_no")
        .eq("merchant_order_no", merchantOrderNo)
        .eq("status", "paid")
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                ok: false,
                message: "Method not allowed",
            });
        }

        const body = await readJsonBody(req);
        const order = String(body?.order || "").trim();
        const access = String(body?.access || "").trim();
        const productSlug = String(body?.productSlug || "").trim();
        const email = normalizeEmail(body?.email);

        let paidOrder = null;

        if (order && access) {
            const payload = verifyCheckoutAccessToken(access);

            if (!payload || payload.merchantOrderNo !== order) {
                return res.status(401).json({
                    ok: false,
                    message: "Invalid checkout access",
                });
            }

            paidOrder = await findPaidOrderByMerchantOrderNo(order);
        } else {
            if (!productSlug || !email) {
                return res.status(400).json({
                    ok: false,
                    message: "productSlug and email are required",
                });
            }

            paidOrder = await findPaidOrderByEmail(productSlug, email);
        }

        if (!paidOrder) {
            return res.status(403).json({
                ok: false,
                message: "Product not purchased",
            });
        }

        const product = getProductConfig(paidOrder.product_slug);

        if (!product) {
            return res.status(404).json({
                ok: false,
                message: "Product config not found",
            });
        }

        const { data, error } = await supabaseAdmin.storage
            .from(PRIVATE_BUCKET)
            .createSignedUrl(product.storagePath, 60, {
                download: product.fileName,
            });

        if (error || !data?.signedUrl) {
            return res.status(500).json({
                ok: false,
                message: error?.message || "Create signed url failed",
            });
        }

        return res.status(200).json({
            ok: true,
            downloadUrl: data.signedUrl,
            fileName: product.fileName,
            expiresIn: 60,
        });
    } catch (error) {
        console.error("download request error:", error);

        return res.status(500).json({
            ok: false,
            message: error.message || "Download request failed",
        });
    }
}

console.log("paidOrder.product_slug:", paidOrder.product_slug);
console.log("product:", JSON.stringify(product));
console.log("storagePath:", product?.storagePath);