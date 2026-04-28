/* eslint-env node */
import { supabaseAdmin } from "../../../lib/supabaseAdmin.js";
import { createCheckoutAccessToken } from "../../utils/checkoutAccessToken.js";

const { VERCEL_URL } = process.env;

function buildBaseUrl(req) {
    if (process.env.SITE_URL) return process.env.SITE_URL;
    if (VERCEL_URL) return `https://${VERCEL_URL}`;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    return `${protocol}://${host}`;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollOrderStatus(orderNo, maxWaitMs = 6000, intervalMs = 1000) {
    const start = Date.now();

    while (Date.now() - start < maxWaitMs) {
        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("status, merchant_order_no")
            .eq("merchant_order_no", orderNo)
            .maybeSingle();

        console.log("poll status:", data?.status, "elapsed:", Date.now() - start, "ms");

        if (error) return { data: null, error };
        if (!data) return { data: null, error: new Error("order not found") };

        // 有明確結果就直接回傳
        if (data.status === "paid" || data.status === "failed") {
            return { data, error: null };
        }

        // 還是 pending，等一下再查
        await sleep(intervalMs);
    }

    // 超時，最後再查一次
    const { data, error } = await supabaseAdmin
        .from("orders")
        .select("status, merchant_order_no")
        .eq("merchant_order_no", orderNo)
        .maybeSingle();

    return { data, error };
}

export default async function handler(req, res) {
    const baseUrl = buildBaseUrl(req);

    console.log("=== PAYUNi return handler start ===");
    console.log("method:", req.method);
    console.log("query:", JSON.stringify(req.query));

    try {
        const orderNo = String(req.query?.order || "").trim();

        console.log("orderNo from query:", orderNo);

        if (!orderNo) {
            console.log("FAIL: missing order in query");
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        // 輪詢等 notify 寫入（最多 6 秒）
        const { data, error } = await pollOrderStatus(orderNo);

        console.log("final db data:", JSON.stringify(data));
        console.log("final db error:", error?.message);

        if (error || !data) {
            console.log("FAIL: order not found or db error");
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        if (data.status === "paid") {
            console.log("SUCCESS: order is paid");
            const access = createCheckoutAccessToken({ merchantOrderNo: orderNo });
            return res.redirect(
                `${baseUrl}/checkout/success?order=${encodeURIComponent(orderNo)}&access=${encodeURIComponent(access)}`
            );
        }

        console.log("FAIL: order status is", data.status);
        return res.redirect(`${baseUrl}/checkout/fail`);
    } catch (error) {
        console.error("payuni return error:", error);
        return res.redirect(`${baseUrl}/checkout/fail`);
    }
}