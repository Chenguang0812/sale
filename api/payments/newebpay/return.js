export default function handler(req, res) {
    console.log('NewebPay return query:', req.query)

    return res.redirect('/checkout/success')
}