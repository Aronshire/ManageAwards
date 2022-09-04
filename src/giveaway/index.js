const giveawayModel = require("../database/models/giveaways");
const randomId = require("../utils/randomId");

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, TextChannel, Interaction, Client, Colors } = require("discord.js");

class Giveaway {
    /**@param {Client} client */
    constructor(client) {
        this.client = client;

        this.updateGiveaways();
        this.events();
    }

    /**@param {Object} options - Options for the giveaway
     * @param {TextChannel} options.channel
     * @param {Number} options.duration
     * @param {String} options.prize
     * @param {Number} options.winnerCount
     * @param {Interaction} options.interaction
     * @param {Object} options.messages
     * 
     * @returns {giveawayModel} giveaway
     */
    async startGiveaway(options) {
        if (!options.interaction) throw new Error("No interaction provided!");
        if (!options.prize) return this.sendError({ interaction: options.interaction, error: "No prize provided!" });
        if (!options.winnerCount) return this.sendError({ interaction: options.interaction, error: "No winner count provided!" });
        if (!options.channel) return this.sendError({ interaction: options.interaction, error: "No channel provided!" });
        if (!options.duration) return this.sendError({ interaction: options.interaction, error: "No duration provided!" });
        if (!options.messages) return this.sendError({ interaction: options.interaction, error: "No messages provided!" });

        let data = {
            id: randomId(10),
            channelID: options.channel.id,
            guildID: options.interaction.guild.id,
            messageID: null,
            prize: options.prize,
            hostedBy: options.interaction.user,
            winnerCount: options.winnerCount,
            participants: [],
            winners: [],
            endAt: options.duration + Date.now(),
            startAt: Date.now(),
            ended: false,
            messages: options.messages,
        };

        let replacedMessages = await this.replaceMessage({ messages: options.messages, endAt: options.duration + Date.now(), hostedBy: options.interaction.user, participants: 0, winners: [], prize: options.prize });

        let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Enter")
                    .setCustomId("giveaway-enter"))

        let embed = new EmbedBuilder({
            footer: {
                text: `WinnerCount: ${data.winnerCount} | Giveaway ID: ${data.id}`,
            },
            color: Colors.Green,
            title: data.prize,
            description: `${replacedMessages.timeRemaining}\n${replacedMessages.participants}\n${replacedMessages.inviteToParticipate}\n\n${replacedMessages.hostedBy}`,
        })

        options.channel.send({ content: data.messages.giveaway });
        let msg = await options.channel.send({ embeds: [embed], components: [button] });

        data.messageID = msg.id;

        let giveaway = await new giveawayModel(data).save();

        return giveaway;
    }

    async replaceMessage(options) {
        if (!options.messages) throw new Error({ interaction: options.channel, error: "No messages provided!" });

        let obj = {}
        let messageValues = Object.values(options.messages)
        let messageKeys = Object.keys(options.messages)

        messageValues.forEach((x, index) => {
            let key = x.replace(/{duration}/g, `<t:${Math.round(options.endAt / 1000)}:R>`).replace(/{user}/g, "<@" + options.hostedBy + ">").replace(/{participants}/g, options.participants).replace(/{prize}/g, options.prize)
            if (options.winners?.length > 0) {
                key = key.replace(/{winners}/g, options.winners.join(", "));
            }
            messageValues[index] = key
        });

        for (let i = 0; i < messageValues.length; i++) {
            let value = messageValues[i];
            let key = messageKeys[i];

            obj[key] = value;
        }

        return obj;

    }

    async sendError(options) {
        if (!options) throw new Error("No options provided!");
        if (!options.interaction) throw new Error("No interaction provided!");
        if (!options.error) throw new Error("No error provided!");

        let embed = new EmbedBuilder({
            title: "Error",
            description: options.error,
            color: 0xff0000,
        })

        let msg = await options.interaction.channel.send({ embeds: [embed], ephemeral: true });

        return msg;
    }

    async end(options) {

        let giveaway = await this.fetchGiveaway(options);

        if (!giveaway) return new Error("No giveaway found!");

        let channel = this.client.channels.cache.get(giveaway.channelID);

        if (!channel) return new Error("No channel found!");

        let msg = await channel.messages.fetch(giveaway.messageID);

        if (!msg) return new Error("No message found!");

        if (giveaway.ended) return new Error("Giveaway already ended!");

        let winners = await this.roll({ participants: giveaway.participants, winnerCount: giveaway.winnerCount });

        let replacedMessages = await this.replaceMessage({ messages: giveaway.messages, endAt: giveaway.endAt, hostedBy: giveaway.hostedBy, participants: giveaway.participants.length, winners: winners, prize: giveaway.prize });

        let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Ended")
                    .setCustomId("giveaway-ended")
                    .setDisabled(true))

        if (winners.length == 0) {
            let embed = new EmbedBuilder({
                footer: {
                    text: `WinnerCount: ${giveaway.winnerCount} | Giveaway ID: ${giveaway.id}`,
                },
                color: Colors.Red,
                title: giveaway.prize,
                description: `${replacedMessages.noWinner}\n${replacedMessages.participants}\n\n${replacedMessages.hostedBy}`,
            })

            await giveawayModel.updateOne({ id: giveaway.id }, { ended: true, winners: [] });
            return await msg.edit({ embeds: [embed], components: [button] });
        }


        let embed = new EmbedBuilder({
            footer: {
                text: `Winner Count: ${giveaway.winnerCount} | Giveaway ID: ${giveaway.id}`,
            },
            color: Colors.Red,
            title: giveaway.prize,
            description: `${replacedMessages.winners}\n${replacedMessages.participants}\n\n${replacedMessages.hostedBy}`,
        })
        await giveawayModel.updateOne({ id: giveaway.id }, { ended: true, winners: winners });
        await msg.edit({ embeds: [embed], components: [button] });
        msg.channel.send({ content: replacedMessages.winMessage });

        return giveaway;
    }

    async reroll(options) {
        let giveaway = await this.fetchGiveaway(options);

        if (!giveaway) throw new Error("No giveaway found!");

        let channel = this.client.channels.cache.get(giveaway.channelID);

        if (!channel) throw new Error("No channel found!");

        let msg = await channel.messages.fetch(giveaway.messageID);

        if (!msg) throw new Error("No message found!");

        let winners = await this.roll({ participants: giveaway.participants, winnerCount: giveaway.winnerCount });

        let replacedMessages = await this.replaceMessage({ messages: giveaway.messages, endAt: giveaway.endAt, hostedBy: giveaway.hostedBy, participants: giveaway.participants.length, winners: winners, prize: giveaway.prize });

        let button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Rerolled")
                    .setCustomId("giveaway-ended")
                    .setDisabled(true))

        if (winners.length == 0) {
            let embed = new EmbedBuilder({
                footer: {
                    text: `WinnerCount: ${giveaway.winnerCount} | Giveaway ID: ${giveaway.id}`,
                },
                color: Colors.Red,
                title: giveaway.prize,
                description: `${replacedMessages.noWinner}\n${replacedMessages.participants}\n\n${replacedMessages.hostedBy}`,
            })

            await giveawayModel.updateOne({ id: giveaway.id }, { ended: true, winners: [] });
            return await msg.edit({ embeds: [embed], components: [button] });
        }

        let embed = new EmbedBuilder({
            footer: {
                text: `Winner Count: ${giveaway.winnerCount} | Giveaway ID: ${giveaway.id}`,
            },
            color: Colors.Red,
            title: giveaway.prize,
            description: `${replacedMessages.winners}\n${replacedMessages.participants}\n\n${replacedMessages.hostedBy}`,
        })
        await giveawayModel.updateOne({ id: giveaway.id }, { $set: { ended: true, winners: winners } });
        await msg.edit({ embeds: [embed], components: [button] });
        msg.channel.send({ content: replacedMessages.winMessage });

        return giveaway;

    }

    async roll(options) {

        if (!options) throw new Error("No options provided!");
        if (!options.participants) throw new Error("No participants provided!");
        if (!options.winnerCount) throw new Error("No winnerCount provided!");

        let winners = [];

        if (options.participants.length <= options.winnerCount) {
            return [];
        }

        for (let i = 0; i < options.winnerCount; i++) {
            let winner = options.participants[Math.floor(Math.random() * options.participants.length)];
            winners.push("<@" + winner + ">");
        }

        return winners;

    }

    async deleteGiveaway(options) {

        let giveaway = await this.fetchGiveaway(options);

        if (!giveaway) return new Error("No giveaway found!");

        await giveawayModel.deleteOne({ id: giveaway.id });

        return giveaway;
    }

    async fetchAllGiveaways(options) {

        let giveaways = await giveawayModel.find(options);

        return giveaways;
    }

    async fetchGiveaway(options) {

        let giveaway = await giveawayModel.findOne(options);

        return giveaway;
    }

    async fetchGiveawayMessage(options) {

        let giveaway = await this.fetchGiveaway(options);

        if (!giveaway) return new Error("No giveaway found!");

        let channel = this.client.channels.cache.get(giveaway.channelID);

        if (!channel) return new Error("No channel found!");

        let msg = await channel.messages.fetch(giveaway.messageID);

        if (!msg) return new Error("No message found!");

        return msg;
    }

    async updateGiveaways() {
        setInterval(async () => {

            let giveaways = await this.fetchAllGiveaways({ ended: false });

            giveaways.forEach(async (giveaway) => {
                if (giveaway.endAt < Date.now()) {
                    await this.end({ id: giveaway.id });
                }
            });

        }, 1000);
    }

    async events() {
        this.client.on("interactionCreate", async (interaction) => {
            if (interaction.isButton()) {
                if (interaction.customId == "giveaway-ended") return interaction.reply({ content: "This giveaway has ended!", ephemeral: true });
                if (interaction.customId == "giveaway-enter") {
                    let giveaway = await this.fetchGiveaway({ messageID: interaction.message.id });
                    if (!giveaway) return interaction.reply({ content: "No giveaway found!", ephemeral: true });
                    if (giveaway.ended) return interaction.reply({ content: "This giveaway has ended!", ephemeral: true });
                    if (giveaway.participants.includes(interaction.user.id)) return interaction.reply({ content: "You have already joined this giveaway!", ephemeral: true });
                    await giveawayModel.updateOne({ id: giveaway.id }, { $push: { participants: interaction.user.id } });

                    let message = await this.fetchGiveawayMessage({ id: giveaway.id });

                    let replacedMessages = await this.replaceMessage({ messages: giveaway.messages, endAt: giveaway.endAt, hostedBy: giveaway.hostedBy, participants: giveaway.participants.length + 1, winners: giveaway.winners, prize: giveaway.prize });

                    let embed = new EmbedBuilder({
                        footer: {
                            text: `Winner Count: ${giveaway.winnerCount} | Giveaway ID: ${giveaway.id}`,
                        },
                        color: Colors.Green,
                        title: giveaway.prize,
                        description: `${replacedMessages.timeRemaining}\n${replacedMessages.participants}\n${replacedMessages.inviteToParticipate}\n\n${replacedMessages.hostedBy}`,
                    })

                    await message.edit({ embeds: [embed] });
                    return interaction.reply({ content: "You have joined this giveaway!", ephemeral: true });
                }
            }
        });
    }
}

module.exports = Giveaway;
