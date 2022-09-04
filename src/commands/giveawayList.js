const { EmbedBuilder, Colors, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
module.exports = {
    name: "giveawaylist",
    description: "List all giveaways",
    options: [],
    run: async (client, interaction, args) => {

        const giveaways = await client.giveaway.fetchAllGiveaways({ guildID: interaction.guild.id });

        if (giveaways.length === 0) return interaction.reply({ content: "No giveaways found!", ephemeral: true });

        const embed = new EmbedBuilder({
            color: Colors.Yellow,
            title: "Giveaways",
            footer: {
                text: "Giveaway List"
            },
            timestamp: new Date(),
            thumbnail: {
                url: interaction.guild.iconURL
            }
        });

        let page = 0;
        let maxPage = Math.ceil(giveaways.length / 10);

        let slicedGiveaways = giveaways.slice(page * 10, (page + 1) * 10);


        for (const giveaway of slicedGiveaways) {
            embed.addFields({
                name: giveaway.messageID,
                value: `Prize: ${giveaway.prize}\nHosted By: <@${giveaway.hostedBy}>\nWinners: ${giveaway.winnerCount}\nEnded: ${giveaway.ended ? "Yes" : "No"}`
            });
        }

        embed.setFooter({ text: `Page ${page + 1} of ${maxPage}` });

        let forwardButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("back")
                    .setLabel("Back")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("forward")
                    .setLabel("Forward")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === maxPage - 1),

            )

        const msg = await interaction.reply({ embeds: [embed], components: [forwardButton], fetchReply: true });

        const filter = (button) => button.user.id === interaction.user.id;

        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (button) => {
            if (button.customId === "forward") {
                page++;
                slicedGiveaways = giveaways.slice(page * 10, (page + 1) * 10);
                embed.data.fields = [];
                for (const giveaway of slicedGiveaways) {
                    embed.addFields({
                        name: giveaway.messageID,
                        value: `Prize: ${giveaway.prize}\nHosted By: <@${giveaway.hostedBy}>\nWinners: ${giveaway.winnerCount}\nEnded: ${giveaway.ended ? "Yes" : "No"}`
                    });
                }
                embed.setFooter({ text: `Page ${page + 1} of ${maxPage}` });
                forwardButton.components[1].setDisabled(page === maxPage - 1);
                forwardButton.components[0].setDisabled(page === 0);
                await button.update({ embeds: [embed], components: [forwardButton] });
            } else if (button.customId === "back") {
                page--;
                slicedGiveaways = giveaways.slice(page * 10, (page + 1) * 10);
                embed.data.fields = [];
                for (const giveaway of slicedGiveaways) {
                    embed.addFields({
                        name: giveaway.messageID,
                        value: `Prize: ${giveaway.prize}\nHosted By: <@${giveaway.hostedBy}>\nWinners: ${giveaway.winnerCount}\nEnded: ${giveaway.ended ? "Yes" : "No"}`
                    });
                }
                embed.setFooter({ text: `Page ${page + 1} of ${maxPage}` });
                forwardButton.components[1].setDisabled(page === maxPage - 1);
                forwardButton.components[0].setDisabled(page === 0);
                await button.update({ embeds: [embed], components: [forwardButton] });
            }
        });
    }
}