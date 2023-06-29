# Clyde Gateway

[![Downloads](https://img.shields.io/npm/dm/clyde-gateway)](https://www.npmjs.com/package/clyde-gateway) [![Size](https://img.shields.io/bundlephobia/min/clyde-gateway)](https://www.npmjs.com/package/clyde-gateway) [![npm](https://img.shields.io/npm/v/clyde-gateway)](https://www.npmjs.com/package/clyde-gateway) [![Node.js Package](https://github.com/Av32000/Clyde-Gateway/actions/workflows/npm-publish-github-packages.yml/badge.svg)](https://github.com/Av32000/Clyde-Gateway/actions/workflows/npm-publish-github-packages.yml)

Clyde gateway is a simple and very light library to connect your bot to the Discord gateway.

## Install

To install Clyde-Gateway, simply run the following command:

```
npm install clyde-gateway
```

## Usage

To connect your bot to the gateway, you just have to create a new client and provide your token and your intents (See the [Discord doc](https://discord.com/developers/docs/topics/gateway#gateway-intents))

```js
const bot = new Client('TOKEN', [INTENTS]);
```

You can then receive all the events with the `on` function by providing the name of the event and the callback :

```js
bot.on('READY', message => {
	console.log(`${message.user.username} is ready !`);
});
```

Once connected, you can update your bot's status with the updatePresence() method:

```js
bot.on('READY', message => {
	console.log(`${message.user.username} is ready !`);
	bot.updatePresence('dnd', { name: 'Activity Name', type: ActivityType.GAME });
});
```

You can also fetch guild members with the getGuildMembers() method :

```js
bot.on('READY', message => {
	console.log(`${message.user.username} is ready !`);
	bot.getGuildMembers({ guildId: '1047980487928467476' }, members => {
		members.forEach(member => {
			console.log(member);
		});
	});
});
```

The getGuildMembers() method accepts the following arguments :

- `searchObject` [Required] [Object] :
  - `guildId` [Required] [String]: ID of the guild to get members for
  - `query` [String]: String that username starts with (All members if is null)
  - `limit` [Integer]: Maximum number of members to send matching the query (All members if is null)
  - `user_ids` [Array of String]: Used to specify which users you wish to fetch (All members if is null)
- `callback` [Required] [Function] : Function to call once all members have been retrieved, taking the list obtained as arguments

## Contributions

All contributions are welcome! Thank you to everyone who will open issues and pull requests to participate in the project. You are free to propose corrections/improvements as well as feature additions!
