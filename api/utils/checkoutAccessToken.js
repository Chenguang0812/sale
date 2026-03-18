/* eslint-env node */
import jwt from "jsonwebtoken";

const SECRET = process.env.DOWNLOAD_SECRET;

function assertSecret() {
    if (!SECRET || SECRET.length < 32) {
        throw new Error("DOWNLOAD_SECRET missing or too short");
    }
}

export function createCheckoutAccessToken(payload) {
    assertSecret();

    return jwt.sign(payload, SECRET, {
        expiresIn: "30m",
    });
}

export function verifyCheckoutAccessToken(token) {
    try {
        assertSecret();
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
}