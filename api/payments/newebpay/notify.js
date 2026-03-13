export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed')
    }

    console.log('NewebPay notify payload:', req.body)

    return res.status(200).send('OK')
}