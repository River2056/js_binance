const fs = require('fs');
const path = require('path');
const { fetchAll, fetchCoinSnapShot } = require('./src/mainApp');
const markets = require('./markets.json');
const bot = require('./src/bot');

console.log('initializing app...');
// create necessary folders during initialization
if(!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
}

console.log('type commands to activate bot');
// start command and keyboard
bot.onText(/\/start/, msg => {
    const individualMarketKeyboard = markets.map(market => ({ "text": market, "callback_data": market }));
    bot.sendMessage(
        msg.chat.id, 
        'Welcome to River\'s auto fetch cryptocurrency snapshot bot', 
        {
            "reply_markup": {
                "keyboard": [
                    [{ "text": "/help", "callback_data": "/help" }],
                    [{ "text": "/fetchAll", "callback_data": "/fetchAll" }],
                    [{ "text": "/clearFiles", "callback_data": "/clearFiles" }],
                    [...individualMarketKeyboard]
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
        /start - show greeting and predefined keyboard
        /fetchAll - fetch all snapshots of cryptocurrencies set in markets.json
        /clearFiles - clear server snapshot files
        
        use predefined keyboards or type custom trade markets to fetch snapshot
        e.g. BTC_USDT
        `
    );
});

// send image through telegram
bot.onText(/\/fetchAll/, async (msg) => {
    bot.sendMessage(msg.chat.id, 'fetching snapshots from binance...');
    bot.sendMessage(msg.chat.id, 'this might take a moment, please wait...');
    await fetchAll(msg.chat.id);
    bot.sendMessage(msg.chat.id, 'done fetching all markets!');
    let images = fs.readdirSync('./output/');
    images.forEach(image => {
        const imageFile = fs.readFileSync(path.join('./output', image));
        bot.sendPhoto(msg.chat.id, imageFile, { caption: image.slice(0, image.indexOf('.')) });
    });
});

bot.on('message', async msg => {
    const regex = /[a-zA-Z]+_[a-zA-Z]+/g;
    const market = msg.text.toString().toUpperCase();
    if(regex.test(market)) {
        // fetch single snapshot
        bot.sendMessage(msg.chat.id, `fetching single market klines...${market}`);
        await fetchCoinSnapShot(market, msg.chat.id);
        bot.sendMessage(msg.chat.id, 'done fetching!');
        let images = fs.readdirSync('./output/');
        const imageFile = fs.readFileSync(path.join('./output', images.filter(image => image.startsWith(market))[0]));
        bot.sendPhoto(msg.chat.id, imageFile, { caption: market });
    }
});

// clear image files on server
bot.onText(/\/clearFiles/, msg => {
    bot.sendMessage(
        msg.chat.id, 
        'Are you sure you want to clear files?',
        {
            "reply_markup": {
                "inline_keyboard": [
                    [{ "text": "/yes", "callback_data": "/yes" }, { "text": "/no", "callback_data": "/no" }]
                ],
                "one_time_keyboard": true
            }
        }
    )
});

// answering after user chooses /yes or /no for /clearFiles
bot.on('callback_query', callbackQuery => {
    bot.answerCallbackQuery(callbackQuery.id)
    .then(() => {
        if(callbackQuery.data.toString().toLowerCase() === '/yes') {
            console.log('confirm clear server files');
            bot.sendMessage(callbackQuery.message.chat.id, 'proceed with clearing server snapshot files...');
            const imageFolder = fs.readdirSync('./output/');
            imageFolder.forEach(image => {
                fs.unlinkSync(path.join('./output', image));
            });
            console.log('files cleared!');
            bot.sendMessage(callbackQuery.message.chat.id, 'server files cleared!');
        }
    })
});