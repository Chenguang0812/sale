
import crypto from "crypto";

const { PAYUNI_HASH_KEY, PAYUNI_HASH_IV } = process.env;

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

function getKeyBuffer() {
    return Buffer.from(PAYUNI_HASH_KEY, "utf8");
}

function getIvBuffer() {
    return Buffer.from(PAYUNI_HASH_IV, "utf8");
}

function normalizeEncryptInfo(input) {
    const source =
        input instanceof URLSearchParams
            ? Object.fromEntries(input.entries())
            : Object.entries(input || {}).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    acc[key] = String(value);
                }
                return acc;
            }, {});

    return new URLSearchParams(source).toString();
}

/**
 * 對齊 PAYUNi PHP SDK:
 * 1. http_build_query(...) => aes-256-gcm
 * 2. cipher text 轉 base64
 * 3. auth tag 轉 base64
 * 4. 用 encryptedBase64:::tagBase64 串起來
 * 5. 最後整串再轉 hex
 */
export function encryptTradeInfo(input) {
    assertCryptoConfig();

    const plainText = normalizeEncryptInfo(input);
    const cipher = crypto.createCipheriv("aes-256-gcm", getKeyBuffer(), getIvBuffer());

    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const encryptedBase64 = encrypted.toString("base64");
    const authTagBase64 = authTag.toString("base64");

    return Buffer.from(`${encryptedBase64}:::${authTagBase64}`, "utf8").toString("hex");
}

export function decryptTradeInfo(encryptInfo) {
    assertCryptoConfig();

    const decoded = Buffer.from(String(encryptInfo), "hex").toString("utf8");
    const [encryptedBase64, authTagBase64] = decoded.split(":::");

    if (!encryptedBase64 || !authTagBase64) {
        throw new Error("PAYUNI EncryptInfo format invalid");
    }

    const decipher = crypto.createDecipheriv("aes-256-gcm", getKeyBuffer(), getIvBuffer());
    decipher.setAuthTag(Buffer.from(authTagBase64, "base64"));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedBase64, "base64")),
        decipher.final(),
    ]).toString("utf8");

    return Object.fromEntries(new URLSearchParams(decrypted));
}

export function createHashInfo(encryptInfo) {
    assertCryptoConfig();

    return crypto
        .createHash("sha256")
        .update(`${PAYUNI_HASH_KEY}${encryptInfo}${PAYUNI_HASH_IV}`, "utf8")
        .digest("hex")
        .toUpperCase();
}

export function verifyHashInfo(encryptInfo, hashInfo) {
    return createHashInfo(encryptInfo) === String(hashInfo || "").toUpperCase();
}