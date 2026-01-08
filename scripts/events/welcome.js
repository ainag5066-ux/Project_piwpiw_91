const { getTime } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.6",
		author: "Ratul",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			multiple1: "you",
			multiple2: "you all",
			defaultWelcomeMessage: ({ userName, boxName, memberNumber, session }) => `
‎╭•┄┅═══❁🌺❁═══┅┄•╮
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
		if (event.logMessageType !== "log:subscribe") return;

		const { threadID } = event;
		const dataAddedParticipants = event.logMessageData.addedParticipants;
		const hours = getTime("HH");

		if (dataAddedParticipants.some(u => u.userFbId === api.getCurrentUserID())) return;

		if (!global.temp.welcomeEvent[threadID])
			global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

		global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
		clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

		global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
			const threadData = await threadsData.get(threadID);
			if (!threadData.settings.sendWelcomeMessage) return;

			const dataBanned = threadData.data.banned_ban || [];
			const threadName = threadData.threadName;
			const userName = [];
			const mentions = [];

			for (const user of global.temp.welcomeEvent[threadID].dataAddedParticipants) {
				if (dataBanned.some(b => b.id === user.userFbId)) continue;
				userName.push(user.fullName);
				mentions.push({ tag: user.fullName, id: user.userFbId });
			}

			if (userName.length === 0) return;

			const memberNumber = threadData.data.members.length;
			const session =
				hours <= 10 ? getLang("session1") :
				hours <= 12 ? getLang("session2") :
				hours <= 18 ? getLang("session3") : getLang("session4");

			const welcomeMessage = getLang("defaultWelcomeMessage")({
				userName: userName.join(", "),
				boxName: threadName,
				memberNumber,
				session
			});

			message.send({ body: welcomeMessage, mentions });
			delete global.temp.welcomeEvent[threadID];
		}, 1500);
	}
};
