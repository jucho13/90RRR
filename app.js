// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// require('dotenv').config();

// const app = express();
// app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.send('hola');
// })

// // Verificación del webhook
// app.get('/webhook', (req, res) => {
//     const verifyToken = process.env.ACCESS_TOKEN;
//     const mode = req.query['hub.mode'];
//     const token = req.query['hub.verify_token'];
//     const challenge = req.query['hub.challenge'];

//     if (mode === 'subscribe' && token === verifyToken) {
//         console.log('Webhook verified');
//         res.status(200).send(challenge);
//     } else {
//         res.sendStatus(403);
//     }
// });

// // Recibir eventos de WhatsApp
// app.post('/webhook', (req, res) => {
//     const body = req.body;

//     console.log('Webhook received:', JSON.stringify(body, null, 2));

//     if (body.object) {
//         res.sendStatus(200);
//     } else {
//         res.sendStatus(404);
//     }
// });

// // Enviar mensajes
// app.post('/send-message', async (req, res) => {
//     const { recipient, message } = req.body;

//     const url = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;
//     const payload = {
//         messaging_product: 'whatsapp',
//         to: recipient,
//         text: { body: message },
//     };

//     try {
//         const response = await axios.post(url, payload, {
//             headers: {
//                 Authorization: `Bearer ${process.env.VERIFY_TOKEN}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         res.status(200).send(response.data);
//     } catch (error) {
//         console.error('Error sending message:', error.response.data);
//         res.status(400).send(error.response.data);
//     }
// });

// // Iniciar servidor
// app.listen(process.env.PORT, () => {
//     console.log(`Server running on port ${process.env.PORT}`);
// });

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Rutas de verificación del webhook
app.get('/webhook', (req, res) => {
    const verifyToken = process.env.ACCESS_TOKEN;
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

// Webhook para recibir mensajes
app.post('/webhook', (req, res) => {
    const body = req.body;
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    if (body.object) {
        const entry = body.entry[0];
        const changes = entry.changes[0];
        const message = changes.value.messages[0];

        // Obtener el número del remitente
        const sender = message.from;

        // Llamar a la función para gestionar el flujo del mensaje
        handleMessage(sender, message.text.body);

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// Función para manejar los flujos
const handleMessage = async (sender, message) => {
    if (message.toLowerCase() === 'hola' || message.toLowerCase() === 'hi') {
        await sendMessageWithButtons(
            sender, 
            "🙌 ¡Hola! ¿Cómo puedo ayudarte hoy?", 
            [
                { id: '1', title: 'Ver opciones' },
                { id: '2', title: 'Más información' }
            ]
        );
    } else if (message === '1') {
        await sendMessageWithButtons(
            sender, 
            "Selecciona una opción:",
            [
                { id: '3', title: '¿Qué es este bot?' },
                { id: '4', title: '¿Cómo funciona?' }
            ]
        );
    } else if (message === '3') {
        await sendMessage(sender, "Este bot te guiará a través de flujos de conversación para ofrecerte información útil.");
    } else if (message === '4') {
        await sendMessage(sender, "Este bot funciona a través de flujos de preguntas y respuestas. Responde a las preguntas y te guiaré.");
    } else {
        await sendMessage(sender, "Lo siento, no entendí tu respuesta. Escribe 'hi' o 'hola' para comenzar.");
    }
};

// Función para enviar mensaje con botones interactivos
const sendMessageWithButtons = async (recipient, message, buttons) => {
    const url = `https://graph.facebook.com/v17.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const payload = {
        messaging_product: 'whatsapp',
        to: recipient,
        text: { body: message },
        interactive: {
            type: 'button',
            body: {
                text: message,
            },
            action: {
                buttons: buttons.map(button => ({
                    type: 'reply',
                    reply: {
                        id: button.id,
                        title: button.title,
                    },
                })),
            },
        },
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${process.env.VERIFY_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Mensaje con botones enviado:', response.data);
    } catch (error) {
        console.error('Error al enviar mensaje con botones:', error.response.data);
    }
};

// Función para enviar mensaje simple
const sendMessage = async (recipient, message) => {
    const url = `https://graph.facebook.com/v17.0/${process.env.PHONE_NUMBER_ID}/messages`;
    const payload = {
        messaging_product: 'whatsapp',
        to: recipient,
        text: { body: message },
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${process.env.VERIFY_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Mensaje enviado:', response.data);
    } catch (error) {
        console.error('Error al enviar mensaje:', error.response.data);
    }
};

// Iniciar servidor
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en el puerto ${process.env.PORT}`);
});

