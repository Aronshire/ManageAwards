const { GatewayIntentBits } = require('discord.js');

module.exports = {
    token: "",
    owners: [],
    developers: [],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    database: {
        url: "",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
}