/* eslint-env node */

import { decryptTradeInfo, verifyTradeSha } from "./crypto.js";

const { VERCEL_URL } = process.env;

function buildBaseUrl(req) {
    if (VERCEL_URL) return `https://${VERCEL_URL}`;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    return `${protocol}://${host}`;
}

export default function handler(req, res) {
    try {
        const baseUrl = buildBaseUrl(req);
        const payload = req.method === "POST" ? req.body || {} : req.query || {};
        const tradeInfo = payload.TradeInfo;
        const tradeSha = payload.TradeSha;

        if (!tradeInfo || !tradeSha) {
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        if (!verifyTradeSha(tradeInfo, tradeSha)) {
            return res.redirect(`${baseUrl}/checkout/fail`);
        }

        const decrypted = decryptTradeInfo(tradeInfo);
        const parsed = JSON.parse(decrypted);

        if (parsed.Status === "SUCCESS") {
            return res.redirect(`${baseUrl}/checkout/success`);
        }

        return res.redirect(`${baseUrl}/checkout/fail`);
    } catch (error) {
        console.error("payuni return error:", error);
        return res.redirect("/checkout/fail");
    }
}