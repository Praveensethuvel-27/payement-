const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

const WEBHOOK_SECRET = 'machan_secret_123'; // ← Dashboard la same secret podu

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Webhook endpoint
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
            if (amount >= 2 && amount <= 10) {
                console.log(`✅ Success: ${amount}₹ | ID: ${payment.id}`);
                // DB save pannu da
            } else {
                console.log('⚠️ Amount out of range!');
            }
        }

        if (event === 'payment.failed') {
            console.log('❌ Payment Failed:', payment.id);
        }

        res.status(200).send("OK");
    } else {
        console.log("🚨 Invalid Signature!");
        res.status(400).send("Invalid");
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
