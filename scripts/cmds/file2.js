const fs = require('fs');

module.exports = {

	config: {

		name: "file2",

		aliases: ["files","f"," fi",],

		version: "1.0",

		author: "SEXY ROCKY",

		countDown: 5,

		role: 0,

		shortDescription: "Send bot script",

		longDescription: "Send bot specified file ",

		category: "𝗢𝗪𝗡𝗘𝗥",

		guide: "{pn} file name. Ex: .{pn} filename"

	},

	onStart: async function ({ message, args, api, event }) {

		const permission = ["100051168244116","61580336378735", "100031770681053"];

		if (!permission.includes(event.senderID)) {

			return api.sendMessage(" 🫢🌺ভাগ মাগি আমার বস গোজো অরুপে পিউ পিউ ছারা তোর নানাও পারবেনা কমান্ড চুরি করতে. 😝🤣🫦😩", event.threadID, event.messageID);

		}

		const fileName = args[0];

		if (!fileName) {

			return api.sendMessage("Please provide a file name.", event.threadID, event.messageID);

		}

		const filePath = __dirname + `/${fileName}.js`;

		if (!fs.existsSync(filePath)) {

			return api.sendMessage(`File not found: ${fileName}.js`, event.threadID, event.messageID);

		}

		const fileContent = fs.readFileSync(filePath, 'utf8');

		api.sendMessage({ body: fileContent }, event.threadID);

	}

};
