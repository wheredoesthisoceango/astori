const utilities = require('../utilities.js');

const { prefix, maxEnergy } = require('../config.json');

const minStoryPostLen = 500;

module.exports = {
    name: 'message',
    async execute(message, client, keyv) {
        if (message.content.startsWith(prefix) || message.author.bot) return;

		// const storyChannelID = await keyv.get('storyChannelID');
        const storyChannels = message.client.storyChannels;

        giveActiveEnergy(message, client);

        let isStoryChannel = false;

        storyChannels.filter(function(storyMembers, storyChannel) {
            console.log(`${storyChannel.id}, ${message.channel.id}`);
			if (storyChannel.id === message.channel.id) {
                isStoryChannel = true;
            }
		});

        if (isStoryChannel) {
            if (message.content.length < minStoryPostLen) {
                message.author.send(`Your most recent post was deleted as it is too short for the story channel. Story posts must be at least ${minStoryPostLen} characters, your post was ${message.content.length} characters. (Deletion disabled for testing purposes)`);
    
                // message.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`));
    
                // return;
            }

            if (message.content == 'Test') {
                const { badUsers } = client;

                if (!badUsers.has(message.author)) {
                    badUsers.set(message.author, 1);
                    // console.log('adding bad user for first time');
                }
                else {
                    let numViols = badUsers.get(message.author);
                    console.log(`Current num violations: ${numViols}`);
    
                    if (numViols < 2) {
                        numViols += 1;
                        badUsers.set(message.author, numViols);
                    }
                    else {
                        badUsers.set(message.author, 0);
                        
                        const command = client.commands.get('continue');
                        utilities.timeoutUser(client, command, message, 6);
    
                        message.author.send(`You have been timed out from using the !continue command for ${60} seconds as multiple posts from you have been flagged as inappropriate.`);
                    }
                }
            }
            // console.log('do something');

            utilities.checkMessageStorySafety(message, keyv);
        }
    },
};

function giveActiveEnergy(message, client) {
    const { activeEnergyCD } = client;

    const now = Date.now();
    const cooldownAmount = 1000 * 5;

    if (activeEnergyCD.has(message.author)) {
        return;
    }
    activeEnergyCD.set(message.author, now);
        
    const { energyUsers } = client;
    const currEnergy = energyUsers.get(message.author);

    if (currEnergy < maxEnergy) {
        const newEnergy = currEnergy + 1;   
        energyUsers.set(message.author, newEnergy);
        console.log(`Active Energy gained, user: ${message.author.tag}, new energy: ${newEnergy}`);
    }

    setTimeout(() => activeEnergyCD.delete(message.author), cooldownAmount);
}