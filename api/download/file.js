/* eslint-env node */

import fs from "fs";
import path from "path";
import { verifyDownloadToken } from "../utils/downloadToken.js";

export default function handler(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({
            ok: false,
            message: "missing token",
        });
    }

    const payload = verifyDownloadToken(token);

    if (!payload) {
        return res.status(401).json({
            ok: false,
            message: "invalid token",
        });
    }

    const files = {
        "demo-pack": "subtitle-pack-v1.zip",
        "creator-pack": "creator-pack.zip",
        "pro-pack": "pro-pack.zip",
    };

    const fileName = files[payload.productSlug];

    if (!fileName) {
        return res.status(404).json({
            ok: false,
            message: "file name not mapped",
        });
    }

    const filePath = path.join(process.cwd(), "private-files", fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            ok: false,
            message: `file not found: ${filePath}`,
        });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
}