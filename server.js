// webhook.js
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json({ limit: '10mb' })); // Razorpay body large irukkum

const WEBHOOK_SECRET = 'machan_secret_123'; // Dashboard la set panna secret

app.post('/webhook', (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const generated_signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    // Signature verify (security must!)
    if (generated_signature === signature) {
        const event = req.body.event;
        const payment = req.body.payload.payment.entity;

        console.log('Webhook Event:', event);

        if (event === 'payment.captured') {
            const amount = payment.amount / 100; // paise → rupees
            const paymentId = payment.id;

            if (amount >= 2 && amount <= 10) {
                console.log(`✅ Success: ${amount}₹ | ID: ${paymentId}`);
                // DB la save pannu, user ku credit pannu
            } else {
                console.log('⚠️ Amount out of range!');
            }
        }

        if (event === 'payment.failed') {
            console.log('❌ Payment Failed:', payment.id);
        }

        res.status(200).send('OK'); // Must 200 return pannu
    } else {
        console.log('🚨 Invalid Signature - Possible Tampering!');
        res.status(400).send('Invalid Signature');
    }
});

app.listen(3000, () => {
    console.log('Webhook server running on port 3000');
});