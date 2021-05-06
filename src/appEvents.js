const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { fetchAll, fetchCoinSnapShot } = require('./mainApp');
const bot = require('./bot');
const markets = require('../markets.json');

const eventEmitter = new EventEmitter();

eventEmitter.on('start-app', msg => {
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

eventEmitter.on('help', msg => {
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

eventEmitter.on('fetch-all', msg => {
    bot.sendMessage(msg.chat.id, 'fetching snapshots from binance...');
    bot.sendMessage(msg.chat.id, 'this might take a moment, please wait...');
    // await fetchAll(msg.chat.id);
    bot.sendMessage(msg.chat.id, 'done fetching all markets!');
    let images = fs.readdirSync('./output/');
    images.forEach(image => {
        const imageFile = fs.readFileSync(path.join('./output', image));
        bot.sendPhoto(msg.chat.id, imageFile, { caption: image.slice(0, image.indexOf('.')) });
    });
});

eventEmitter.on('message', async msg => {
    const regex = /[a-zA-Z]+_[a-zA-Z]+/g;
    const market = msg.text.toString().toUpperCase();
    if(regex.test(market)) {
        // fetch single snapshot
        bot.sendMessage(msg.chat.id, `fetching single market klines...${market}`);
        // await fetchCoinSnapShot(market, msg.chat.id);
        // bot.sendMessage(msg.chat.id, 'done fetching!');
        let images = fs.readdirSync('./output/');
        let checkImageExists = images.filter(image => image.startsWith(market));
        if(checkImageExists == null || checkImageExists == undefined || checkImageExists.length === 0) {
            eventEmitter.emit('update-one', market, msg.chat.id);
        } else {
            let imageName = images.filter(image => image.startsWith(market))[0];
            imageName = imageName.slice(0, imageName.lastIndexOf('.'));
            const imageFile = fs.readFileSync(path.join('./output', images.filter(image => image.startsWith(market))[0]));
            bot.sendPhoto(msg.chat.id, imageFile, { caption: imageName });
        }
    }
});

eventEmitter.on('update-all', msg => {
    let chatId = null;
    if(msg != null) chatId = msg.chat.id;
    let images = fs.readdirSync('./output/');
    if(images.length > 0 && images.length > markets.length) {
        let names = [];
        const regex = /[a-zA-Z]+_[a-zA-Z]+/g;
        images.forEach(image => {
            let fileName = image.match()[0];
            if(!names.includes(fileName)) {
                names.push(fileName);
            }
        });
        if(names.length > 0) {
            names.forEach(async name => {
                await fetchCoinSnapShot(name, chatId);
            });
        }
    } else {
        fetchAll(chatId);
    }
});

eventEmitter.on('update-one', async (marketName, chatId) => {
    let images = fs.readdirSync('./output/');
    let imageArray = images.filter(image => image.startsWith(marketName));
    if(imageArray == null || imageArray == undefined || imageArray.length === 0) {
        await fetchCoinSnapShot(marketName, chatId);
        images = fs.readdirSync('./output/');
        let imageName = images.filter(image => image.startsWith(marketName))[0];
        imageName = imageName.slice(0, imageName.lastIndexOf('.'));
        const imageFile = fs.readFileSync(path.join('./output', images.filter(image => image.startsWith(marketName))[0]));
        bot.sendPhoto(chatId, imageFile, { caption: imageName });
    }
});

eventEmitter.on('clear-files', msg => {
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

eventEmitter.on('callback-query', () => {
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
});

module.exports = eventEmitter;