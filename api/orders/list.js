/* eslint-env node */
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";
import { getProductConfig } from "../../lib/catalog.js";

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

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                ok: false,
                message: "Method not allowed",
            });
        }

        const body = await readJsonBody(req);
        const email = normalizeEmail(body?.email);

        if (!email) {
            return res.status(400).json({
                ok: false,
                message: "email is required",
            });
        }

        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("id, product_slug, amount, paid_at, merchant_order_no")
            .eq("email", email)
            .eq("status", "paid")
            .order("paid_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                ok: false,
                message: error.message,
            });
        }

        const downloads = (data || [])
            .map((item) => {
                const product = getProductConfig(item.product_slug);
                if (!product) return null;

                return {
                    id: item.id,
                    productSlug: item.product_slug,
                    title: product.title,
                    fileName: product.fileName,
                    paidAt: item.paid_at,
                    merchantOrderNo: item.merchant_order_no,
                };
            })
            .filter(Boolean);

        return res.status(200).json({
            ok: true,
            downloads,
        });
    } catch (error) {
        console.error("orders list error:", error);

        return res.status(500).json({
            ok: false,
            message: error.message || "List orders failed",
        });
    }
}