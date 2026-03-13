/* eslint-env node */

import crypto from "crypto";

const {
    NEWEBPAY_HASH_KEY,
    NEWEBPAY_HASH_IV,
} = process.env;

export function encryptTradeInfo(data) {
    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        NEWEBPAY_HASH_KEY,
        NEWEBPAY_HASH_IV
    );

    cipher.setAutoPadding(true);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
}

export function decryptTradeInfo(tradeInfo) {
    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        NEWEBPAY_HASH_KEY,
        NEWEBPAY_HASH_IV
    );

    decipher.setAutoPadding(true);

    let decrypted = decipher.update(tradeInfo, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

export function createTradeSha(tradeInfo) {
    const plainText = `HashKey=${NEWEBPAY_HASH_KEY}&${tradeInfo}&HashIV=${NEWEBPAY_HASH_IV}`;
    return crypto.createHash("sha256").update(plainText).digest("hex").toUpperCase();
}

export function verifyTradeSha(tradeInfo, tradeSha) {
    return createTradeSha(tradeInfo) === String(tradeSha || "").toUpperCase();
}