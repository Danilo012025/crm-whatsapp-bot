const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const WEBHOOK_URL = "https://SEU-CRM.com/api/whatsapp/webhook";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

let processedMessages = new Set();

client.on('qr', (qr) => {
  console.log('📲 Escaneie o QR Code abaixo:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado!');
});

client.on('authenticated', () => {
  console.log('🔐 Autenticado!');
});

client.on('auth_failure', msg => {
  console.error('❌ Falha de autenticação', msg);
});

client.on('disconnected', reason => {
  console.log('⚠️ WhatsApp desconectado:', reason);
});

client.on('message', async (message) => {

  try {

    if (processedMessages.has(message.id._serialized)) {
      return;
    }

    processedMessages.add(message.id._serialized);

    const contact = await message.getContact();
    const chat = await message.getChat();

    const payload = {
      message_id: message.id._serialized,
      from: message.from,
      to: message.to,
      body: message.body,
      timestamp: message.timestamp,
      type: message.type,
      from_me: message.fromMe,
      contact_name: contact.pushname || contact.name || null,
      chat_id: chat.id._serialized
    };

    await axios.post(WEBHOOK_URL, payload);

    console.log("📩 Mensagem enviada para CRM");

  } catch (error) {
    console.error("Erro ao enviar mensagem para CRM:", error.message);
  }

});

client.on('message_create', async (message) => {

  if (!message.fromMe) return;

  try {

    if (processedMessages.has(message.id._serialized)) {
      return;
    }

    processedMessages.add(message.id._serialized);

    const contact = await message.getContact();
    const chat = await message.getChat();

    const payload = {
      message_id: message.id._serialized,
      from: message.from,
      to: message.to,
      body: message.body,
      timestamp: message.timestamp,
      type: message.type,
      from_me: true,
      contact_name: contact.pushname || contact.name || null,
      chat_id: chat.id._serialized
    };

    await axios.post(WEBHOOK_URL, payload);

    console.log("📤 Mensagem enviada registrada no CRM");

  } catch (error) {
    console.error("Erro ao registrar mensagem enviada:", error.message);
  }

});

client.initialize();
