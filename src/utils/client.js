const config = require('../config')
const { Client } = require('discord.js');

const client = new Client({ intents: config.intents });

module.exports = client;