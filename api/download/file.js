import fs from "fs"
import path from "path"
import { verifyDownloadToken } from "../utils/downloadToken.js"

export default function handler(req, res) {
    const { token } = req.query

    if (!token) {
        return res.status(403).end()
    }

    const payload = verifyDownloadToken(token)

    if (!payload) {
        return res.status(403).end()
    }

    const files = {
        "demo-pack": "subtitle-pack-v1.zip",
    }

    const fileName = files[payload.productSlug]

    if (!fileName) {
        return res.status(404).end()
    }

    const filePath = path.join(process.cwd(), "private-files", fileName)

    if (!fs.existsSync(filePath)) {
        return res.status(404).end()
    }

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
    )

    const stream = fs.createReadStream(filePath)
    stream.pipe(res)
}