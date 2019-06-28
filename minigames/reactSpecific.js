var fs = require('fs');

module.exports = {
    startMessage: 'do this:',
    defTime: 25000,
    name: 'reactSpecific',
    run: async function (channel, players, time, client, info) {
        const config = JSON.parse(fs.readFileSync(`./guilds/${channel.guild.id}.json`))
        const alternatives = config.tasks.react

        const emoji = alternatives[getRandomInt(alternatives.length)]
        const startMessage = await channel.send(`React to this message with this emoji: ${emoji}`)

        let allReactions = startMessage.awaitReactions(() => true, {
            time: time
        })
        await sleep(time - 1000)
        //when time is up
        await channel.send('Simon says time\'s up!')
        await sleep(1000)
        allReactions = await allReactions
        allReactions = allReactions.array()
        
        let allUsers = []
        for (let reaction of allReactions) {
            
            if (reaction.emoji.toString() === emoji) {
                let users = await reaction.fetchUsers()
                allUsers = allUsers.concat(users.array())
            }
        }

        //console.log(allUsers.map(user => user.name))

        let out = []
        let outIndex = []
        //check each player to see if they are out
        players.forEach((player, i) => {
            //check each message
            let reacted = false

            if (allUsers.includes(player)) {
                //if simon didnt say, the player is out
                if (!info.simonSaid) {
                    out.push(player)
                    outIndex.push(i)
                } else {
                    reacted = true
                }

            }

            if (info.simonSaid && !reacted) {
                out.push(player)
                outIndex.push(i)
            }
        })
        outIndex.sort((a, b) => b - a);
        let newPlayers = players
        outIndex.forEach((i) => {
            newPlayers.splice(i)
        })
        return ({
            playersOut: out,
            playersLeft: newPlayers
        })
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

