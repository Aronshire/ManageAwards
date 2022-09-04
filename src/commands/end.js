module.exports = {
    name: "end",
    description: "End a giveaway",
    options: [
        {
            type: 3,
            name: "giveaway-id",
            description: "ID of the giveaway",
            required: true
        }
    ],
    run: async (client, interaction, args) => {

        const id = args[0].value;

        if (!id) return interaction.reply({ content: "Please specify a valid message ID!", ephemeral: true });

        const giveaway = await client.giveaway.fetchGiveaway({ id });

        if (!giveaway) return interaction.reply({ content: "No giveaway found for " + id + ", please check and try again", ephemeral: true });

        if (giveaway.ended) return interaction.reply({ content: "This giveaway has already ended!", ephemeral: true });

        client.giveaway.end({ id }).then(() => {
            interaction.reply({ content: "Giveaway ended!", ephemeral: true });
        }).catch((err) => {
            interaction.reply({ content: "No giveaway found for " + id + ", please check and try again", ephemeral: true });
        });

    }
}