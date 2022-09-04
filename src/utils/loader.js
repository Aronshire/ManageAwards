const client = require('./client');
const config = require('../config');
const { Collection } = require('discord.js');
const fs = require('fs');
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const _commands = [];
const __commands_global = global._commands = new Collection();

fs.readdir('./src/commands', (err, commands) => {
	if (err) throw new Error(err);
	commands.forEach(async (command) => {
		try {
			const _cmdFile = require("../." + './src/commands' + "/" + command);
			const { name, description, options } =
				typeof _cmdFile == "function" ? _cmdFile(client) : _cmdFile;
			_commands.push({ name, description, options });
			const __command = require(`../commands/${command}`);
			__commands_global.set(__command.name, __command);
		} catch (err) {
			console.error(err);
		}
	});
});

global.commands = __commands_global.toJSON();
const rest = new REST({ version: "9" }).setToken(config.token);

client.once("ready", async () => {
	try {
		console.log("(*): Loading Application commands..");
		await rest.put(Routes.applicationCommands(client.user.id), {
			body: _commands,
		});
		console.log("(*): Application Commands loaded!");
	} catch (err) {
		console.error(err);
	}
});

client.on("interactionCreate", async (interaction) => {
	try {
		if (!interaction.isCommand()) return;

		const args = interaction.options._hoistedOptions;
		fs.readdir('./src/commands', (err, commands) => {
			if (err) throw new Error(err);
			commands.forEach(async (command) => {
				const _command = require("../." + './src/commands' + "/" + command);
				if (
					interaction.commandName.toLowerCase() ===
					_command.name.toLowerCase()
				)
					_command.run(client, interaction, args);
			});
		});
	} catch (err) {
		console.error(err);
	}
});