/* eslint-env node */

import crypto from "crypto";

const {
    PAYUNI_HASH_KEY,
    PAYUNI_HASH_IV,
} = process.env;

console.log("PAYUNI_HASH_KEY length:", PAYUNI_HASH_KEY?.length);
console.log("PAYUNI_HASH_IV length:", PAYUNI_HASH_IV?.length);

function assertCryptoConfig() {
    if (!PAYUNI_HASH_KEY || !PAYUNI_HASH_IV) {
        throw new Error("PAYUNI crypto env missing");
    }

    if (PAYUNI_HASH_KEY.length !== 32) {
        throw new Error(`PAYUNI_HASH_KEY length must be 32, got ${PAYUNI_HASH_KEY.length}`);
    }

    if (PAYUNI_HASH_IV.length !== 16) {
        throw new Error(`PAYUNI_HASH_IV length must be 16, got ${PAYUNI_HASH_IV.length}`);
    }
}

export function encryptTradeInfo(data) {
    assertCryptoConfig();

    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        PAYUNI_HASH_KEY,
        PAYUNI_HASH_IV
    );

    cipher.setAutoPadding(true);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted;
}

export function decryptTradeInfo(tradeInfo) {
    assertCryptoConfig();

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        PAYUNI_HASH_KEY,
        PAYUNI_HASH_IV
    );

    decipher.setAutoPadding(true);

    let decrypted = decipher.update(tradeInfo, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
}

export function createTradeSha(tradeInfo) {
    assertCryptoConfig();

    const plainText = `HashKey=${PAYUNI_HASH_KEY}&${tradeInfo}&HashIV=${PAYUNI_HASH_IV}`;
    return crypto.createHash("sha256").update(plainText).digest("hex").toUpperCase();
}

export function verifyTradeSha(tradeInfo, tradeSha) {
    return createTradeSha(tradeInfo) === String(tradeSha || "").toUpperCase();
}