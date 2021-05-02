const fs = require('fs');
const path = require('path');
const { mainApp } = require('./src/mainApp');
const TelegramBot = require('node-telegram-bot-api');
const botTokenJson = require('./botToken.json');
const token = botTokenJson.crypto_binance_token;
const bot = new TelegramBot(token, { polling: true });

console.log('initializing app...');
// create necessary folders during initialization
if(!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
}

console.log('type commands to activate bot');
// start command and keyboard
bot.onText(/\/start/, msg => {
    bot.sendMessage(
        msg.chat.id, 
        'Welcome to River\'s auto fetch cryptocurrency snapshot bot', 
        {
            "reply_markup": {
                "keyboard": [
                    [{ "text": "/help", "callback_data": "/help" }],
                    [{ "text": "/fetch", "callback_data": "/fetch" }]
                ]
            }
        }
    );
});

// bot commands
bot.onText(/\/help/, msg => {
    bot.sendMessage(
        msg.chat.id, 
        `available bot commands:
        /fetch - fetch all snapshots of cryptocurrencies set in markets.json
        `
    );
});

// send image through telegram
bot.onText(/\/fetch/, async (msg) => {
    bot.sendMessage(msg.chat.id, 'fetching snapshots from binance...');
    bot.sendMessage(msg.chat.id, 'this might take a moment, please wait...');
    await mainApp();
    bot.sendMessage(msg.chat.id, 'done fetching!');
    let images = fs.readdirSync('./output/');
    images.forEach(image => {
        const imageFile = fs.readFileSync(path.join('./output', image));
        bot.sendPhoto(msg.chat.id, imageFile, { caption: image });
    });
});

