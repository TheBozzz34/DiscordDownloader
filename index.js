const { Client, Intents } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const { TOKEN, DROPBOX_TOKEN } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const YTDlpWrap = require('yt-dlp-wrap').default;
const https = require('https');
const data = '{"limit": 1000}';
const fs = require('fs');
const dropboxV2Api = require('dropbox-v2-api');


const dropbox = dropboxV2Api.authenticate({
	token: DROPBOX_TOKEN,
});
const ytDlpWrap = new YTDlpWrap('./yt-dlp.exe');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});


client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
});

let count = '1';

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'download') {
		const currentCount = count++;
		await interaction.reply({ content: 'Your download has started, check the Dropbox in a few seconds', ephemeral: true });
		// eslint-disable-next-line no-inner-declarations
		function editMessage() {
			fs.readFile('downloads/' + currentCount + '.mp4', function(err, data) {
				const req = https.request('https://content.dropboxapi.com/2/files/upload', {
					method: 'POST',
					headers: {
						'Authorization': 'Bearer ' + DROPBOX_TOKEN,
						'Dropbox-API-Arg': JSON.stringify({
							'path': '/DiscordBotDownloads/' + currentCount + '.mp4',
							'mode': 'overwrite',
							'autorename': true,
							'mute': false,
							'strict_conflict': false,
						}),
						'Content-Type': 'application/octet-stream',
					},
				}, (res) => {
					console.log('statusCode: ', res.statusCode);
					//console.log('headers: ', res.headers);
					dropbox({
						resource: 'sharing/create_shared_link_with_settings',
						parameters: {
							path: '/DiscordBotDownloads/' + currentCount + '.mp4',
						},
					}, (err, result, response) => {
						if (err) { return console.log('err:', err); }
						// console.log(result.url);
						interaction.editReply('Here is your video: ' + result.url);
					});

					res.on('data', function(d) {
						process.stdout.write(d);
					});
				});

				req.write(data);
				req.end();
			});

		}
		const URL = interaction.options.getString('url');
		const ytDlpEventEmitter = ytDlpWrap
			.exec([
				URL,
				'-f',
				'best',
				'-o',
				'downloads/' + currentCount + '.mp4',
				// 'downloads/%(title)s.mp4',
			])
			.on('progress', (progress) =>
				console.log(
					progress.percent,
				),
			)
			.on('ytDlpEvent', (eventType, eventData) =>
				console.log(eventType, eventData),
			)
			.on('error', (error) => console.error(error))
			.on('close', () => editMessage());

		console.log(ytDlpEventEmitter.ytDlpProcess.pid);
	}


});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (interaction.commandName === 'getlink') {
		await interaction.reply({ content: 'This command is temporarily disabled.', ephemeral: true });
		/*
		const currentCount = count++;
		await interaction.reply({ content: 'Getting your link', ephemeral: true });
		dropbox({
			resource: 'sharing/create_shared_link_with_settings',
			parameters: {
				path: '/DiscordBotDownloads/' + currentCount + '.mp4',
			},
		}, (err, result, response) => {
			if (err) { return console.log('err:', err); }
			// console.log(result);
			interaction.editReply('Here is your video' + response.url);
		});
        */
	}
});

client.login(TOKEN);