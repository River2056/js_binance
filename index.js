const fs = require('fs');
const bot = require('./src/bot');
const eventEmitter = require('./src/appEvents');
const scheduler = require('./src/jobs');

console.log('initializing app...');
// create necessary folders during initialization
if(!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
}

console.log('type commands to activate bot');
eventEmitter.emit('callback-query');
// start command and keyboard
bot.onText(/\/start/, msg => {
    eventEmitter.emit('start-app', msg);
});

// bot commands
bot.onText(/\/help/, msg => {
    eventEmitter.emit('help', msg);
});

// send image through telegram
bot.onText(/\/fetchAll/, async (msg) => {
    eventEmitter.emit('fetch-all', msg);
});

bot.on('message', async msg => {
    eventEmitter.emit('message', msg);
});

// clear image files on server
bot.onText(/\/clearFiles/, msg => {
    eventEmitter.emit('clear-files', msg);
});

// hidden command: update-all
bot.onText(/\/update/, msg => {
    eventEmitter.emit('update-all', msg);
});

process.on('exit', () => scheduler.stop());