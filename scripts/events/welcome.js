// file name: welcome.js
const { getTime } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.0",
		author: "Ratul",
		category: "events"
	},

	langs: {
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			defaultWelcomeMessage: ({ userName, boxName, memberNumber, session }) => `
╭•┄┅═══❁🌸❁═══┅┄•╮
     🌟 Assalamualaikum 🌟
╰•┄┅═══❁🌸❁═══┅┄•╯

✨🆆🅴🅻🅲🅾🅼🅴✨

❥ 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑: [ ${userName} ]

༆-✿ Welcome to our group! ࿐

🌺✨ From the team ✨🌺

❤️🫰 Enjoy & have fun 🫰❤️

༆-✿ You are member number ${memberNumber} of this group 🌸

╭•┄┅═══❁🌸❁═══┅┄•╮
   🌸 Group: ${boxName} 🌸
╰•┄┅═══❁🌸❁═══┅┄•╯

💫 Have a great ${session}! 💫
`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		// শুধু join event handle করবে
		if (event.logMessageType !== "log:subscribe") return;

		const { threadID } = event;
		const addedParticipants = event.logMessageData.addedParticipants;
		const hours = parseInt(getTime("HH"));

		// যদি বট নিজেই join হয় তাহলে স্কিপ করবে
		if (addedParticipants.some(u => u.userFbId === api.getCurrentUserID())) return;

		// প্রথমবার join হলে টাইমআউট সেট
		if (!global.temp.welcomeEvent[threadID])
			global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

		global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...addedParticipants);
		clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

		global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
			const threadData = await threadsData.get(threadID);
			if (!threadData.settings.sendWelcomeMessage) return;

			const bannedUsers = threadData.data.banned_ban || [];
			const threadName = threadData.threadName;

			const usersToWelcome = global.temp.welcomeEvent[threadID].dataAddedParticipants.filter(
				user => !bannedUsers.some(b => b.id === user.userFbId)
			);

			if (usersToWelcome.length === 0) return;

			const userNames = usersToWelcome.map(u => u.fullName).join(", ");
			const mentions = usersToWelcome.map(u => ({ tag: u.fullName, id: u.userFbId }));
			const memberNumber = threadData.data.members.length;

			const session =
				hours <= 10 ? getLang("session1") :
				hours <= 12 ? getLang("session2") :
				hours <= 18 ? getLang("session3") : getLang("session4");

			const welcomeMessage = getLang("defaultWelcomeMessage")({
				userName: userNames,
				boxName: threadName,
				memberNumber,
				session
			});

			await message.send({ body: welcomeMessage, mentions });

			// temp data delete
			delete global.temp.welcomeEvent[threadID];
		}, 1500);
	}
};
