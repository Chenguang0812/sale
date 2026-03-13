/* eslint-env node */

import jwt from "jsonwebtoken";

const SECRET = process.env.DOWNLOAD_SECRET;

export function createDownloadToken(data) {
    return jwt.sign(data, SECRET, {
        expiresIn: "5m",
    });
}

export function verifyDownloadToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
}