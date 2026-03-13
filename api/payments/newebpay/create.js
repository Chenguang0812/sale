import { newebpayConfig } from './config.js'

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            ok: false,
            message: 'Method not allowed',
        })
    }

    if (!newebpayConfig.isReady()) {
        return res.status(200).json({
            ok: false,
            mode: 'mock',
            message: 'NewebPay is not ready yet',
        })
    }

    return res.status(200).json({
        ok: true,
        mode: 'newebpay',
        message: 'NewebPay config is ready',
    })
}