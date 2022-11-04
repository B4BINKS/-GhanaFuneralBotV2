const Discord = require("discord.js");
require("console-stamp")(console, "HH:MM:ss.l");
const playArbitraryFFmpeg = require('discord.js-arbitrary-ffmpeg');

const {
	prefix,
	token_coffin,
	token_guy1,
	token_guy2,
	token_guy3,
	TextChannelId,
	SongDir,
	JoinTime,
	PlayTime,
	Volume,
	SpamDanceText
} = require("./config.json");
const clients = [];
for (let i = 0; i < 4; i++) {
	clients.push(new Discord.Client());
}

var tokens = [token_guy1, token_guy2, token_guy3, token_coffin];
for (let i = 0; i < tokens.length; i++) {
	if (!tokens[i]) {
		throw new Error("Token " + (i + 1) + " is empty"); // Crash if any token is empty
	}
}

for (var i = 0; i < clients.length; i++) {
	clients[i].login(tokens[i]);
	console.log("Client " + i + " has logged in.");
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

clients[0].on("message", async (message) => {
	let guildName = message.guild.name;
	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

	if (command === "join" && message.member.hasPermission("MANAGE_CHANNELS")) {
		console.log("Command for " + command + " Recieved in Server: " + guildName);

		if (!message.member.voice.channel) {
			return message.reply("You're not in any voice channel");
		}
		const connection = await message.member.voice.channel.join();
		let arrFFmpegParams = [
			'-i', SongDir
		  ];
		  
		  const objStreamDispatcher = playArbitraryFFmpeg(
			connection,
			arrFFmpegParams,
			{ volume: Volume }
			
		  )
		
		objStreamDispatcher.on("start", () => {
			console.log("Song is now playing in Server: " + guildName);
		});

		objStreamDispatcher.on("finish", () => {
			console.log("Song done playing");
			connection.disconnect();
		});
	} else if (command === "leave" && message.member.hasPermission("MANAGE_CHANNELS")) {
		message.member.voice.channel.leave();
	} else if (command === "help") {
		const helpEmbed = new Discord.MessageEmbed()
			.setColor("#0099ff")
			.setTitle("Ghana Funeral Meme Bot")
			.setAuthor(
				"Bot by github.com/Andi-Tafilaj | Remake by github.com/B4BINKS",
				"https://avatars.githubusercontent.com/u/116849188"
			)
			.setDescription(
				"Benjamin and his Henchmens will join your voice channel and play some song for you! A neato fun bot!"
			)
			.setThumbnail("https://media1.tenor.com/images/c0bfc4509ae66de179e7499517031dc8/tenor.gif")
			.addFields(
				{ 
					name: "- !g help", 
					value: "This command..." 
				},
				{ 
					name: "- !g join", 
				 	value: "Joins the voice channel you are in and start playing song" 
				},
				{ 
					name: "- !g leave", 
					value: "Leaves the voice channel incase needed!" 
				}
			);
		return message.channel.send(helpEmbed);
	}
});

function getFunc(botNum) {
	return async (message) => {
		const args = message.content.slice(prefix.length).split(/ +/);
		const command = args.shift().toLowerCase();
		if (
			(command === "join" && message.member.hasPermission("MANAGE_CHANNELS"))
		) {
			const channel = message.member.voice.channel;
			if (!channel) {
				return;
			}
			await sleep(JoinTime);
			const connection = await channel.join();
			await sleep(PlayTime);
			let arrFFmpegParams = [
				'-i', SongDir,
				'-ss', (JoinTime+PlayTime) / 1000
			  ];
			  
			  const objStreamDispatcher = playArbitraryFFmpeg(
				connection,
				arrFFmpegParams,
				{ volume: Volume/2}
				
			  )
			objStreamDispatcher.on("start", () => {
				console.log("Client " + botNum + " is now playing");
			});
	
			objStreamDispatcher.on("finish", () => {
				console.log("Client " + botNum + " finish playing");
				connection.disconnect();
			});
		}
		if (command === "leave" && message.member.hasPermission("MANAGE_CHANNELS")) {
			message.member.voice.channel.leave();
		}
	};
}

for (let i = 1; i < clients.length; i++) {
	clients[i].on("message", getFunc(i));
}