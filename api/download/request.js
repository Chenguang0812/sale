import { createDownloadToken } from "../utils/downloadToken.js";

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            message: "Method not allowed",
        });
    }

    const { productSlug } = req.body || {};

    if (!productSlug) {
        return res.status(400).json({
            ok: false,
            message: "productSlug is required",
        });
    }

    const token = createDownloadToken(productSlug);

    return res.status(200).json({
        ok: true,
        downloadUrl: `/api/download/file?token=${token}`,
    });
}