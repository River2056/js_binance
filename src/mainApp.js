const fs = require('fs');
const puppeteer = require('puppeteer');
const markets = require('../markets.json');
const bot = require('./bot');

// app logic section
const fetchCoinSnapShot = async (market, chatId) => {
    try {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
        let minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        const baseUrl = `https://www.binance.com/zh-TW/trade/${market}?layout=pro&type=spot`;
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(baseUrl);

        // close tutorial dialog
        // document.querySelector("body > div.css-1u2nk9f > div.css-4nl6qi > div.css-4rbxuz > svg");
        await clickOnElement(page, 'body > div.css-1u2nk9f > div.css-4nl6qi > div.css-4rbxuz > svg');

        // switch to bollinger bands and close MA signs
        // document.querySelector("#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div.focus-area.css-haugtg > div.css-s0ysx3 > div.css-16pc8ej > div > svg")
        await clickOnElement(page, '#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div.focus-area.css-haugtg > div.css-s0ysx3 > div.css-16pc8ej > div > svg');
        
        // close MA
        // document.querySelector("#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.css-1xvpxce > div > div:nth-child(2) > div.css-17nafj > div")
        await clickOnElement(page, '#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.css-1xvpxce > div > div:nth-child(2) > div.css-17nafj > div');
        
        // open boll
        // document.querySelector("#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.css-1xvpxce > div > div:nth-child(2) > div:nth-child(4) > div")
        await clickOnElement(page, '#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.css-1xvpxce > div > div:nth-child(2) > div:nth-child(4) > div');

        // close sign dialog
        // document.querySelector("#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.css-1xvpxce > svg")
        await clickOnElement(page, '#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.css-1xvpxce > svg');

        // snapshot canvas
        // document.querySelector("#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.kline-container.css-vurnku > canvas.scene")
        const canvas = await page.$eval(
            '#__APP > div > div > div.css-1k8svrs > div.css-o0ej6l > div:nth-child(2) > div > div > div > div.kline-container.css-vurnku > canvas.scene', 
            elem => elem.toDataURL("image/png")
        );

        // replace prefix to properly save image to file
        fs.writeFileSync(`./output/${market}_${year}-${month}-${day}_${hour}:${minute}:${second}.png`, canvas.replace(/data:([A-Za-z-+\/]+);base64,/, ""), { encoding: 'base64' });
        console.log(`done saving ${market}.png`);
        if(chatId != null) {
            bot.sendMessage(chatId, `done fetching...${market}`);
        }
        await browser.close();
    } catch(e) {
        console.log('something wrong happened: ', e);
        if(chatId != null) {
            bot.sendMessage(chatId, `something wrong happened, please try again! ${e}`);
        }
    }
}

const clickOnElement = async (page, selector) => {
    await page.waitForSelector(selector);
    await page.click(selector);
}

// fetch image according to markets.json setting
const fetchAll = async (chatId) => {
    const totalMarkets = `total markets in markets.json: ${markets.length}`;
    console.log(totalMarkets);
    if(chatId != null) {
        bot.sendMessage(chatId, totalMarkets);
    }
    for(let i = 0; i < markets.length; i++) {
        await fetchCoinSnapShot(markets[i], chatId);
        if(chatId != null) {
            bot.sendMessage(chatId, `fetch count: ${i + 1}`);
        }
    }
}

module.exports = {
    fetchCoinSnapShot,
    fetchAll
}