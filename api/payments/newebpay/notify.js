/* eslint-env node */

import fs from "fs"
import path from "path"
import { createDownloadToken } from "../utils/downloadToken.js"

const ordersPath = path.join(process.cwd(), "orders.json")

function hasPurchased(productSlug) {
    if (!fs.existsSync(ordersPath)) {
        return false
    }

    const raw = fs.readFileSync(ordersPath, "utf8")
    const orders = raw ? JSON.parse(raw) : []

    return orders.some((order) => {
        return order.productSlug === productSlug && order.paid === true
    })
}

export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            ok: false,
            message: "Method not allowed",
        })
    }

    const { productSlug } = req.body || {}

    if (!productSlug) {
        return res.status(400).json({
            ok: false,
            message: "productSlug is required",
        })
    }

    if (!hasPurchased(productSlug)) {
        return res.status(403).json({
            ok: false,
            message: "Product not purchased",
        })
    }

    const token = createDownloadToken(productSlug)

    return res.status(200).json({
        ok: true,
        downloadUrl: `/api/download/file?token=${token}`,
    })
}