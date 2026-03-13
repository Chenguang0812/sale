export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            ok: false,
            message: 'Method not allowed',
        })
    }

    const { productId } = req.body || {}

    if (!productId) {
        return res.status(400).json({
            ok: false,
            message: 'productId is required',
        })
    }

    return res.status(200).json({
        ok: true,
        mode: 'mock',
        productId,
        redirectUrl: '/checkout/success',
    })
}