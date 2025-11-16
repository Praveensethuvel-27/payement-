const express = require('express');
const crypto = require('crypto');
const app = express();

app.use(express.json({ limit: '10mb' }));

const WEBHOOK_SECRET = 'machan_secret_123';

// Home route (to avoid Cannot GET /)
app.get("/", (req, res) => {
    res.send("Webhook Server Running Successfully 🚀");
});

app.post('/webhook', (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const generated_signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (generated_signature === signature) {
        const event = req.body.event;
        const payment = req.body.payload.payment.entity;

        console.log('Webhook Event:', event);

        if (event === 'payment.captured') {
            const amount = payment.amount / 100;
            const paymentId = payment.id;

            if (amount >= 2 && amount <= 10) {
                console.log(`✅ Success: ${amount}₹ | ID: ${paymentId}`);
            } else {
                console.log('⚠️ Amount out of range!');
            }
        }

        if (event === 'payment.failed') {
            console.log('❌ Payment Failed:', payment.id);
        }

        return res.status(200).send('OK');
    } else {
        console.log('🚨 Invalid Signature - Possible Tampering!');
        return res.status(400).send('Invalid Signature');
    }
});

// Render-friendly PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Webhook server running on port ${port}`);
});
