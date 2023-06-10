# Clyde Gateway

Clyde gateway is a simple and very light library to connect your bot to the discord gateway.

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
bot.on("READY", m => {
    console.log(m);
    bot.updatePresence("dnd", {name: "Activity Name", type: ActivityType.GAME})
})
```

## Contributions

All contributions are welcome! Thank you to everyone who will open issues and pull requests to participate in the project. You are free to propose corrections/improvements as well as feature additions!
