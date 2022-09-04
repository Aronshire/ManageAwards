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
    databse: {
        url: "",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    }
}