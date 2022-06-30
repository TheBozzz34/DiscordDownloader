const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { TOKEN, CLIENT_ID } = require('./config.json');
const commands = [
	{
		name: 'ping',
		description: 'Returns pong',
	},
];

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(Routes.applicationCommands(CLIENT_ID), {
			body: commands,
		});

		console.log('Successfully reloaded application (/) commands.');
	}
	catch (error) {
		console.error(error);
	}
})();