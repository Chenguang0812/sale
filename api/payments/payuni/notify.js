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

    console.log("isPaid candidates:", candidates);

    return candidates.includes("SUCCESS") || candidates.includes("1");
}

export default async function handler(req, res) {
    try {
        console.log("=== PAYUNi notify handler start ===");
        console.log("method:", req.method);
        console.log("headers:", JSON.stringify(req.headers));

        if (req.method !== "POST") {
            return res.status(405).send("Method not allowed");
        }

        const payload = await readRequestBody(req);
        console.log("notify raw payload:", JSON.stringify(payload));

        const { encryptInfo, hashInfo, status: payloadStatus } = getPayloadFields(payload);
        console.log("encryptInfo exists:", !!encryptInfo);
        console.log("hashInfo exists:", !!hashInfo);

        if (!encryptInfo || !hashInfo) {
            console.log("FAIL: missing encryptInfo or hashInfo");
            return res.status(400).send("Missing EncryptInfo or HashInfo");
        }

        const hashValid = verifyHashInfo(encryptInfo, hashInfo);
        console.log("hashValid:", hashValid);

        if (!hashValid) {
            return res.status(400).send("Invalid HashInfo");
        }

        const decrypted = decryptTradeInfo(encryptInfo);
        console.log("decrypted:", JSON.stringify(decrypted));

        const merchantOrderNo = decrypted.MerTradeNo || decrypted.MerchantOrderNo;
        const tradeNo = decrypted.TradeNo || null;
        const paid = isPaid(payloadStatus, decrypted);

        console.log("notify merchantOrderNo:", merchantOrderNo);
        console.log("notify paid:", paid);

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

            console.log("SUCCESS: order marked as paid");
        } else {
            const { error } = await supabaseAdmin
                .from("orders")
                .update({ status: "failed" })
                .eq("merchant_order_no", merchantOrderNo)
                .neq("status", "paid");

            if (error) {
                console.error("payuni notify db error:", error);
                return res.status(500).send("DB update failed");
            }

            console.log("order marked as failed");
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error("payuni notify error:", error);
        return res.status(500).send("Notify failed");
    }
}