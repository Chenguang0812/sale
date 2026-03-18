import { createDownloadToken } from "../utils/downloadToken.js";
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                ok: false,
                message: "Method not allowed",
            });
        }

        const { productSlug, email } = req.body || {};

        if (!productSlug || !email) {
            return res.status(400).json({
                ok: false,
                message: "productSlug and email are required",
            });
        }

        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("id, email, product_slug, status")
            .eq("email", email)
            .eq("product_slug", productSlug)
            .eq("status", "paid")
            .limit(1)
            .maybeSingle();

        if (error) {
            return res.status(500).json({
                ok: false,
                message: error.message,
            });
        }

        if (!data) {
            return res.status(403).json({
                ok: false,
                message: "Product not purchased",
            });
        }

        const token = createDownloadToken({
            email,
            productSlug,
            orderId: data.id,
        });

        return res.status(200).json({
            ok: true,
            downloadUrl: `/api/download/file?token=${token}`,
        });
    } catch (error) {
        console.error("download request error:", error);

        return res.status(500).json({
            ok: false,
            message: error.message || "Download request failed",
        });
    }
}