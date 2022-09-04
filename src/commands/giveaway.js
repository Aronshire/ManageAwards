const ms = require("ms");
module.exports = {
    name: "giveaway",
    description: "Start a giveaway",
    options: [
        {
            type: 7,
            name: "channel",
            description: "The channel where the giveaway will be hosted",
            required: true
        },
        {
            type: 3,
            name: "duration",
            description: "The duration of the giveaway",
            required: true
        },
        {
            type: 10,
            name: "winners",
            description: "The number of winners of the giveaway",
            required: true
        },
        {
            type: 3,
            name: "prize",
            description: "The prize of the giveaway",
            required: true
        }
    ],
    run: async (client, interaction, args) => {

        const channel = args[0].channel;
        const duration = args[1].value;
        const winners = args[2].value;
        const prize = args[3].value;

        if (!channel) return interaction.reply({ content: "Please specify a channel!", ephemeral: true });
        if (!duration) return interaction.reply({ content: "Please specify a duration!", ephemeral: true });
        if (!winners) return interaction.reply({ content: "Please specify the number of winners!", ephemeral: true });
        if (!prize) return interaction.reply({ content: "Please specify a prize!", ephemeral: true });

        let options = {
            channel,
            duration: ms(duration),
            prize: prize,
            winnerCount: winners,
            interaction,
            messages: {
                giveaway: "🎉🎉 **GIVEAWAY** 🎉🎉",
                giveawayEnded: "🎉🎉 **GIVEAWAY ENDED** 🎉🎉",
                timeRemaining: "Time remaining: **{duration}**!",
                inviteToParticipate: "Click to Enter button for participate!",
                participants: "Entries: {participants}",
                winMessage: "Congratulations, {winners}! You won **{prize}**!",
                embedFooter: "Giveaways",
                noWinner: "Giveaway cancelled, no valid participations.",
                hostedBy: "Hosted by: {user}",
                winners: "winner(s): {winners}",
                endedAt: "Ended at",
            }
        };
        client.giveaway.startGiveaway(options);

        interaction.reply({ content: "Giveaway started!" })
    }
}