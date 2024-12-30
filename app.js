const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('hola');
})

// Verificación del webhook
app.get('/webhook', (req, res) => {
    const verifyToken = process.env.VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Recibir eventos de WhatsApp
app.post('/webhook', (req, res) => {
    const body = req.body;

    console.log('Webhook received:', JSON.stringify(body, null, 2));

    if (body.object) {
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// Enviar mensajes
app.post('/send-message', async (req, res) => {
    const { recipient, message } = req.body;

    const url = `https://graph.facebook.com/v16.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const payload = {
        messaging_product: 'whatsapp',
        to: recipient,
        text: { body: message },
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error sending message:', error.response.data);
        res.status(400).send(error.response.data);
    }
});

// Iniciar servidor
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
