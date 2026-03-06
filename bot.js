const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp conectado!');
});

client.on('message', async msg => {

  const phone = msg.from;
  const message = msg.body;

  console.log("Mensagem recebida:", phone, message);

  try {

    await axios.post("SEU_WEBHOOK_AQUI", {
      phone: phone,
      message: message
    });

  } catch (err) {

    console.log("Erro webhook", err.message);

  }

});

client.initialize();
