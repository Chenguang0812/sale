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

export default async function handler(req, res) {
    const baseUrl = buildBaseUrl(req);

    console.log("=== PAYUNi return handler start ===");
    console.log("method:", req.method);
    console.log("query:", JSON.stringify(req.query));

    try {
        // PAYUNi 只是把使用者 redirect 回來，不帶 EncryptInfo
        // merchantOrderNo 由我們自己放在 ReturnURL query 裡
        const orderNo = String(req.query?.order || "").trim();

        console.log("orderNo from query:", orderNo);

        if (!orderNo) {
            console.log("FAIL: missing order in query");
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        // 查 DB，notify 應已在此之前更新狀態
        const { data, error } = await supabaseAdmin
            .from("orders")
            .select("status, merchant_order_no")
            .eq("merchant_order_no", orderNo)
            .maybeSingle();

        console.log("db data:", JSON.stringify(data));
        console.log("db error:", error?.message);

        if (error || !data) {
            console.log("FAIL: order not found or db error");
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        if (data.status === "paid") {
            console.log("SUCCESS: order is paid, redirecting to success");
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