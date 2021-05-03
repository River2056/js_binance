const TelegramBot = require('node-telegram-bot-api');
const botTokenJson = require('../botToken.json');
const token = botTokenJson.crypto_binance_token;
const bot = new TelegramBot(token, { polling: true });

module.exports = bot;