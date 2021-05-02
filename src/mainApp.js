const fs = require('fs');
const puppeteer = require('puppeteer');
const markets = require('../markets.json');

// app logic section
const fetchCoinSnapShot = async (market) => {
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
    fs.writeFileSync(`./output/${market}.png`, canvas.replace(/data:([A-Za-z-+\/]+);base64,/, ""), { encoding: 'base64' });
    console.log(`done saving ${market}.png`);
    await browser.close();
}

const clickOnElement = async (page, selector) => {
    await page.waitForSelector(selector);
    await page.click(selector);
}

// fetch image according to markets.json setting
const mainApp = async () => {
    for(const market of markets) {
        await fetchCoinSnapShot(market);
    }
}

module.exports = {
    fetchCoinSnapShot,
    mainApp
}