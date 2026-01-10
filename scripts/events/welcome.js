const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.3",
		author: "NTKhang & Mehedi Hasan",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: `
🌸✨💖 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐥𝐚𝐢𝐤𝐮𝐦 💖✨🌸

🎀 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 {multiple} {userName} 𝐭𝐨 𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 🌟

📌 𝐆𝐫𝐨𝐮𝐩: ✨「 {boxName} 」✨
💎 𝐎𝐰𝐧𝐞𝐫: Mehedi Hasan
👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: {memberCount}

🌈 𝐖𝐢𝐬𝐡𝐢𝐧𝐠 𝐲𝐨𝐮 𝐚 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 {session} 🕊
⚠ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐟𝐨𝐥𝐥𝐨𝐰 𝐚𝐥𝐥 𝐫𝐮𝐥𝐞𝐬 ♻

💌 𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲 𝐚𝐧𝐝 𝐡𝐚𝐯𝐞 𝐟𝐮𝐧 🎉✨
			`
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			multiple1: "you",
			multiple2: "you guys",
			defaultWelcomeMessage: `
🌸✨💖 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐥𝐚𝐢𝐤𝐮𝐦 💖✨🌸

🎀 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 {multiple} {userName} 𝐭𝐨 𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 🌟

📌 𝐆𝐫𝐨𝐮𝐩: ✨「 {boxName} 」✨
💎 𝐎𝐰𝐧𝐞𝐫: Mehedi Hasan
👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: {memberCount}

🌈 𝐖𝐢𝐬𝐡𝐢𝐧𝐠 𝐲𝐨𝐮 𝐚 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 {session} 🕊
⚠ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐟𝐨𝐥𝐥𝐨𝐰 𝐚𝐥𝐥 𝐫𝐮𝐥𝐞𝐬 ♻

💌 𝐄𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐲 𝐚𝐧𝐝 𝐡𝐚𝐯𝐞 𝐟𝐮𝐧 🎉✨
			`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}

				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false) return;

					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [], mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1) multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId)) continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (userName.length == 0) return;

					// get total member count
					const threadInfo = await api.getThreadInfo(threadID);
					const memberCount = threadInfo.participantIDs.length;

					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};

					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						)
						.replace(/\{memberCount\}/g, memberCount);

					form.body = welcomeMessage;

					if (threadData.data.welcomeAttachment) {
						const files = threadData.data.welcomeAttachment;
						const attachments = files.map(file => drive.getFile(file, "stream"));
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}

					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
