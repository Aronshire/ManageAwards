const client = require('./utils/client');
const config = require('./config');
require('./utils/loader');
require('./database/connect');

const Giveaway = require('./giveaway/index');

const GiveawayManager = client.giveaway = new Giveaway(client);

client.login(config.token);

client.on('ready', () => {
    console.log(`(*): Logged in as ${client.user.tag}`);
});