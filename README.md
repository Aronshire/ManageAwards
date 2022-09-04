# ManageAwards
Create your giveaways with this bot.


## Installation
- Clone github project.
- Install dependencies for ```npm run install```
- Start for ```npm run start```

## Settings
First of all, you have to make your own settings in order to use the bot. (Like entering Mongodb and Discord tokens)

- Follow the path ```./src/config.js```
- Enter our Discord token and Mongodb Atlas url. (You can also use Local Mongodb)

## Commands
Commands work with Discord's slash (/) command system.
### Giveaway Start
**Usage:** /giveaway channel time winner-count prize

**Example:** /giveaway #awardchannel 10d 2 Discord Nitro

**Time Concepts**
- 1s = 1 second
- 1m = 1 minute
- 1d = 1 day
- 1y = 1 year

![image](https://user-images.githubusercontent.com/64329332/188336471-b960a82d-7d37-4d4e-8413-0a6169d94e33.png)
![image](https://user-images.githubusercontent.com/64329332/188336479-9d517618-e71b-420d-83a3-ab709fec3698.png)

### Giveaway End
**Usage:** /end giveaway-id

**Example:** /end 6327984492

![image](https://user-images.githubusercontent.com/64329332/188336548-c97f6052-b41e-441f-af6c-797a96963543.png)

![image](https://user-images.githubusercontent.com/64329332/188336552-69bb2948-45ca-4c73-9adc-77f29ad4924d.png)


### Giveaway Reroll
**Usage:** /reroll giveaway-id

**Example:** /reroll 6327984492

![image](https://user-images.githubusercontent.com/64329332/188336570-faee0a77-4e2a-48b4-b6b8-60fae58b953c.png)

![image](https://user-images.githubusercontent.com/64329332/188336577-2ce33d29-28ee-45f6-899d-e3dd22fd3815.png)


##Edit Giveaway Messages
You can change the messages in the giveaway messages. For this, you can change the ```options.messages``` data in the ```./src/commands/giveaway.js``` file.

**Example:**
```js
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
```

### Message Variables
You can edit the ```replaceMessage``` function in the ```./src/giveaway/index.js``` file to add more variables to the giveaway messages.
