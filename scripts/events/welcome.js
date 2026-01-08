const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.4",
		author: "Ratul",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			welcomeMessage: "👋 Hello! Welcome to the group ❤️\nBot prefix: %1\nType %1help to see commands",
			multiple1: "you",
			multiple2: "you all",
			defaultWelcomeMessage: ({ userName, boxName, memberNumber, session }) => `
╭•┄┅═══❁🌺❁═══┅┄•╮
   🌟 Assalamualaikum 🌟
╰•┄┅═══❁🌺❁═══┅┄•╯

✨🆆🅴🅻🅻 🅲🅾🅼🅴✨

❥𝐍𝐄𝐖~ 🇲‌🇪‌🇲‌🇧‌𝐄𝐑
[ ${userName} ]

༆-✿ Welcome to our group! ࿐

🌺✨ From the team ✨🌺

❤️🫰 Enjoy & have fun 🫰❤️

༆-✿ You are member number ${memberNumber} of this group 🌸

╭•┄┅═══❁🌺❁═══┅┄•╮
  🌸 Group: ${boxName} 🌸
╰•┄┅═══❁🌺❁═══┅┄•╯

💫 Have a great ${session}! 💫
`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;

				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID()))
					return message.send(getLang("welcomeMessage", prefix));

				// Initialize temp storage
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// Wait 1.5s then send welcome
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false) return;

					const dataAdded = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [];
					const mentions = [];
					let multiple = dataAdded.length > 1;

					for (const user of dataAdded) {
						if (dataBanned.some((item) => item.id == user.userFbId)) continue;
						userName.push(user.fullName);
						mentions.push({ tag: user.fullName, id: user.userFbId });
					}

					if (userName.length == 0) return;

					let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

					if (typeof welcomeMessage === "function") {
						welcomeMessage = welcomeMessage({
							userName: userName.join(", "),
							boxName: threadName,
							memberNumber: threadData.data.members.length,
							session:
								hours <= 10
									? getLang("session1")
									: hours <= 12
										? getLang("session2")
										: hours <= 18
											? getLang("session3")
											: getLang("session4")
						});
					} else {
						welcomeMessage = welcomeMessage
							.replace(/\{userName\}/g, userName.join(", "))
							.replace(/\{boxName\}/g, threadName)
							.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"));
					}

					message.send({ body: welcomeMessage, mentions });
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
