// welcome.js
module.exports = {
    config: {
        name: "welcome",
        version: "11.0",
        author: "Ratul",
        category: "events"
    },

    onStart: async ({ api, event, threadsData }) => {
        try {
            if (event.logMessageType !== "log:subscribe") return;

            const threadID = event.threadID;
            const addedParticipants = event.logMessageData.addedParticipants || [];
            const botID = api.getCurrentUserID();

            // Ignore if bot joins
            if (addedParticipants.some(u => u.userFbId === botID)) return;

            // Thread info
            const threadData = await threadsData.get(threadID);
            const threadNameRaw = threadData.threadName || "This Group";
            const threadName = `🌸✨ ${threadNameRaw.toUpperCase()} ✨🌸`;

            // Members info
            const membersList = threadData.data?.members || [];

            // Mentions & names
            const mentions = addedParticipants.map(u => ({ tag: u.fullName, id: u.userFbId }));
            const userNames = addedParticipants.map(u => u.fullName).join(", ");

            // Member numbers
            const memberNumbers = addedParticipants.map(u => {
                const index = membersList.findIndex(m => m.id === u.userFbId);
                return index >= 0 ? index + 1 : membersList.length + 1;
            });
            const memberNumbersText = memberNumbers.map(num => `#${num}`).join(", ");

            // Time session
            const now = new Date();
            const hours = now.getHours();
            let session;
            if (hours >= 5 && hours <= 10) session = "Morning";
            else if (hours <= 12) session = "Noon";
            else if (hours <= 18) session = "Afternoon";
            else session = "Evening";

            // Stylish Welcome Message with Assalamualaikum
            const welcomeMessage = `
╔═══════════════❁🌸❁═══════════════╗
         🌟 𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 🌟
╚═══════════════❁🌸❁═══════════════╝

🎉 𝗡𝗘𝗪 𝗠𝗘𝗠𝗕𝗘𝗥: ${userNames}
🎀 𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘: ${threadName}
💫 𝗠𝗘𝗠𝗕𝗘𝗥 𝗡𝗨𝗠𝗕𝗘𝗥: ${memberNumbersText}

🌸 Enjoy your time, make friends & participate! 🌸
💖 From the team with lots of love 💖

⏰ 𝗧𝗶𝗺𝗲: Good ${session} 🌞
╔═══════════════❁🌸❁═══════════════╗
      ⭐💖 𝐇𝐀𝐕𝐄 𝐅𝐔𝐍 & 𝐒𝐓𝐀𝐘 𝐒𝐀𝐅𝐄 💖⭐
╚═══════════════❁🌸❁═══════════════╝
`;

            await api.sendMessage({ body: welcomeMessage, mentions }, threadID);

        } catch (err) {
            console.error("Welcome module error:", err);
        }
    }
};
