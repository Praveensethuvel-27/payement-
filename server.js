const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

// CHANGE THIS IN DASHBOARD TOO!
const WEBHOOK_SECRET = 'machan_secret_123';

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Webhook
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const generated = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (generated === signature) {
        const event = req.body.event;
        const payment = req.body.payload.payment.entity;

        if (event === 'payment.captured') {
            const amount = payment.amount / 100;
            if (amount >= 2 && amount <= 10) {
                console.log(`SUCCESS: ${amount}₹ | ID: ${payment.id}`);
                // DB save here
            } else {
                console.log(`OUT OF RANGE: ${amount}₹`);
            }
        }

        if (event === 'payment.failed') {
            console.log(`FAILED: ${payment.id} | Reason: ${payment.error_description || 'Unknown'}`);
        }

        res.status(200).send('OK');
    } else {
        console.log('INVALID SIGNATURE');
        res.status(400).send('Invalid');
    }
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});
