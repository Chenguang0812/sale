/* eslint-env node */
import { decryptTradeInfo, verifyHashInfo } from "./crypto.js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin.js";

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

    return candidates.includes("SUCCESS");
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).send("Method not allowed");
        }

        const payload = await readRequestBody(req);
        const { encryptInfo, hashInfo, status: payloadStatus } = getPayloadFields(payload);

        if (!encryptInfo || !hashInfo) {
            return res.status(400).send("Missing EncryptInfo or HashInfo");
        }

        if (!verifyHashInfo(encryptInfo, hashInfo)) {
            return res.status(400).send("Invalid HashInfo");
        }

        const decrypted = decryptTradeInfo(encryptInfo);
        const merchantOrderNo = decrypted.MerTradeNo || decrypted.MerchantOrderNo;
        const tradeNo = decrypted.TradeNo || null;
        const paid = isPaid(payloadStatus, decrypted);

        if (!merchantOrderNo) {
            return res.status(400).send("Missing MerTradeNo");
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
                console.error("payuni notify db error:", error);
                return res.status(500).send("DB update failed");
            }
        } else {
            const { error } = await supabaseAdmin
                .from("orders")
                .update({
                    status: "failed",
                })
                .eq("merchant_order_no", merchantOrderNo)
                .neq("status", "paid");

            if (error) {
                console.error("payuni notify db error:", error);
                return res.status(500).send("DB update failed");
            }
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error("payuni notify error:", error);
        return res.status(500).send("Notify failed");
    }
}