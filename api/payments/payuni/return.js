/* eslint-env node */
import { decryptTradeInfo, verifyHashInfo } from "./crypto.js";
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

function getPayloadFields(payload) {
    return {
        encryptInfo: payload?.EncryptInfo || payload?.encryptInfo || "",
        hashInfo: payload?.HashInfo || payload?.hashInfo || "",
        status: payload?.Status || payload?.status || "",
    };
}

function isPaid(payloadStatus, decrypted) {
    const candidates = [
        payloadStatus,
        decrypted?.Status,
        decrypted?.PayStatus,
        decrypted?.TradeStatus,
    ]
        .filter(Boolean)
        .map((value) => String(value).toUpperCase());

    // PAYUNi 成功狀態：Status="1" 或 "SUCCESS"
    return candidates.includes("SUCCESS") || candidates.includes("1");
}

export default async function handler(req, res) {
    const baseUrl = buildBaseUrl(req);

    try {
        const payload = req.method === "GET" ? req.query || {} : await readRequestBody(req);
        const { encryptInfo, hashInfo, status: payloadStatus } = getPayloadFields(payload);

        if (!encryptInfo || !hashInfo) {
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        if (!verifyHashInfo(encryptInfo, hashInfo)) {
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        const decrypted = decryptTradeInfo(encryptInfo);
        const merchantOrderNo = decrypted.MerTradeNo || decrypted.MerchantOrderNo;
        const tradeNo = decrypted.TradeNo || null;
        const paid = isPaid(payloadStatus, decrypted);

        if (!merchantOrderNo) {
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        if (paid) {
            const { error } = await supabaseAdmin
                .from("orders")
                .update({
                    status: "paid",
                    trade_no: tradeNo,
                    paid_at: new Date().toISOString(),
                })
                .eq("merchant_order_no", merchantOrderNo);

            if (error) {
                console.error("payuni return db error:", error);
                return res.redirect(`${baseUrl}/checkout/fail`);
            }

            const access = createCheckoutAccessToken({
                merchantOrderNo,
            });

            return res.redirect(
                `${baseUrl}/checkout/success?order=${encodeURIComponent(
                    merchantOrderNo
                )}&access=${encodeURIComponent(access)}`
            );
        }

        await supabaseAdmin
            .from("orders")
            .update({
                status: "failed",
            })
            .eq("merchant_order_no", merchantOrderNo)
            .neq("status", "paid");

        return res.redirect(`${baseUrl}/checkout/fail`);
    } catch (error) {
        console.error("payuni return error:", error);
        return res.redirect(`${baseUrl}/checkout/fail`);
    }
}