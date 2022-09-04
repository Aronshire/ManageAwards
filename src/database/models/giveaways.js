const mongoose = require("mongoose");
const Schema = mongoose.Schema;

module.exports = mongoose.model(
    "giveaways",
    new Schema(
        {
            id: {
                type: String,
                required: true,
                unique: true,
            },
            messageID: {
                type: String,
                required: true,
            },
            channelID: {
                type: String,
                required: true,
            },
            guildID: {
                type: String,
                required: true,
            },
            startAt: {
                type: Number,
                required: true,
            },
            endAt: {
                type: Number,
                required: true,
            },
            ended: {
                type: Boolean,
                required: true,
                default: false,
            },
            participants: {
                type: Array,
                required: true,
                default: [],
            },
            messages: {
                type: Object,
                required: true,
                default: null,
            },
            winnerCount: {
                type: Number,
                required: true,
            },
            prize: {
                type: String,
                required: true,
            },
            hostedBy: {
                type: Object,
                required: true,
            },
            winners: {
                type: Array,
                required: false,
                default: [],
            }
        },
        {
            timestamps: false,
        }
    ).index({ id: 1 })
);
