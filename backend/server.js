// Basic Twilio Voice Webhook Server for Jenny
// Covenantal Media AI PBC

const express = require('express');
const bodyParser = require('body-parser');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// 1. Incoming call webhook
app.post('/voice', (req, res) => {
    const twiml = new VoiceResponse();

    // Greet caller and start streaming audio
    twiml.say("Welcome to Covenantal Media AI Radio. You're on the air with Jenny.");
    
    twiml.connect({
        action: '/stream-end'
    }).stream({
        url: 'wss://YOUR_SERVER_URL/media-stream'
    });

    res.type('text/xml');
    res.send(twiml.toString());
});

// 2. Twilio notifies when stream ends
app.post('/stream-end', (req, res) => {
    console.log("Caller disconnected.");
    res.send("OK");
});

// 3. WebSocket server for audio stream
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    console.log("Twilio media stream connected.");

    ws.on('message', async msg => {
        const data = JSON.parse(msg);

        // Incoming audio from caller
        if (data.event === 'media') {
            const audio = data.media.payload; // base64 audio

            // TODO: Send audio → STT → Jenny LLM → TTS
            // TODO: Send TTS audio back to Twilio via ws.send()
        }
    });

    ws.on('close', () => {
        console.log("Media stream closed.");
    });
});

// 4. Start server
app.listen(3000, () => {
    console.log("Jenny call-in server running on port 3000");
});
