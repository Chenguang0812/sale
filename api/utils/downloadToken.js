import jwt from "jsonwebtoken"

const SECRET = process.env.DOWNLOAD_SECRET || "download-secret"

export function createDownloadToken(productSlug) {
    return jwt.sign(
        {
            productSlug,
        },
        SECRET,
        {
            expiresIn: "30s",
        }
    )
}

export function verifyDownloadToken(token) {
    try {
        return jwt.verify(token, SECRET)
    } catch {
        return null
    }
}