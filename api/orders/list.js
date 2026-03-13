/* eslint-env node */

import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                ok: false,
                message: "Method not allowed",
            });
        }

        const { email } = req.body || {};

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

        const titleMap = {
            "demo-pack": "20 Viral Subtitle Animations",
            "creator-pack": "Creator Pack",
            "pro-pack": "Pro Pack",
        };

        const fileMap = {
            "demo-pack": "subtitle-pack-v1.zip",
            "creator-pack": "creator-pack.zip",
            "pro-pack": "pro-pack.zip",
        };

        const downloads = (data || []).map((item) => ({
            id: item.id,
            productSlug: item.product_slug,
            title: titleMap[item.product_slug] || item.product_slug,
            fileName: fileMap[item.product_slug] || "download.zip",
            paidAt: item.paid_at,
            merchantOrderNo: item.merchant_order_no,
        }));

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