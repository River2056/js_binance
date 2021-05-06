const fs = require('fs');
const path = require('path');
const { fetchAll, fetchCoinSnapShot } = require('./mainApp');
const markets = require('../markets.json');
const config = require('../config/jobConfig.json');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');

const scheduler = new ToadScheduler();

const updateSnapShots = new Task('update-snapshots', () => {
    let images = fs.readdirSync('./output/');
    images.forEach(image => {
        fs.unlinkSync(path.join('./output', image));
    });
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
                await fetchCoinSnapShot(name, null);
            });
        }
    } else {
        fetchAll(null);
    }
});
const jobOptions = (config) => {
    const obj = {};
    const timeUnit = config['timeUnit'];
    const timeInterval = parseInt(config['timeInterval']);
    obj[timeUnit] = timeInterval;
    return obj
};

const job = new SimpleIntervalJob(jobOptions(config), updateSnapShots);
scheduler.addSimpleIntervalJob(job);

module.exports = scheduler;