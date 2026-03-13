/* eslint-env node */

import { decryptTradeInfo, verifyTradeSha } from "./crypto.js";
import { supabaseAdmin } from "../../../lib/supabaseAdmin.js";

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).send("Method not allowed");
        }

        const payload = req.body || {};
        const tradeInfo = payload.TradeInfo;
        const tradeSha = payload.TradeSha;
        const status = payload.Status;

        if (!tradeInfo || !tradeSha) {
            return res.status(400).send("Missing TradeInfo or TradeSha");
        }

        if (!verifyTradeSha(tradeInfo, tradeSha)) {
            return res.status(400).send("Invalid TradeSha");
        }

        const decrypted = decryptTradeInfo(tradeInfo);
        const parsed = JSON.parse(decrypted);

        const result = parsed.Result || {};
        const merchantOrderNo = result.MerchantOrderNo;
        const tradeNo = result.TradeNo;

        if (!merchantOrderNo) {
            return res.status(400).send("Missing MerchantOrderNo");
        }

        if (parsed.Status === "SUCCESS" && status === "SUCCESS") {
            const { error } = await supabaseAdmin
                .from("orders")
                .update({
                    status: "paid",
                    trade_no: tradeNo || null,
                    paid_at: new Date().toISOString(),
                    raw_notify: parsed,
                })
                .eq("merchant_order_no", merchantOrderNo);

            if (error) {
                console.error("notify update error:", error);
                return res.status(500).send("DB update failed");
            }
        } else {
            await supabaseAdmin
                .from("orders")
                .update({
                    status: "failed",
                    raw_notify: parsed,
                })
                .eq("merchant_order_no", merchantOrderNo);
        }

        return res.status(200).send("OK");
    } catch (error) {
        console.error("notify error:", error);
        return res.status(500).send("Notify failed");
    }
}