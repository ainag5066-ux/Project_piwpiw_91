// welcome.js
module.exports = {
    config: {
        name: "welcome",
        version: "8.0",
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
            const threadName = threadData.threadName || "this group";
            const membersList = threadData.data?.members || [];

            // Mentions & names
            const mentions = addedParticipants.map(u => ({ tag: u.fullName, id: u.userFbId }));
            const userNames = addedParticipants.map(u => u.fullName).join(", ");

            // Calculate member numbers
            const memberNumbers = addedParticipants.map(u => {
                const index = membersList.findIndex(m => m.id === u.userFbId);
                return index >= 0 ? index + 1 : membersList.length;
            });
            const memberNumbersText = memberNumbers.join(", ");

            // Time-based session
            const now = new Date();
            const hours = now.getHours();
            let session;
            if (hours >= 5 && hours <= 10) session = "morning";
            else if (hours <= 12) session = "noon";
            else if (hours <= 18) session = "afternoon";
            else session = "evening";

            // Stylish welcome message
            const welcomeMessage = `
╔═══════════════❁🌸❁═══════════════╗
        🌟 Assalamualaikum 🌟
╚═══════════════❁🌸❁═══════════════╝

✨💖  WELCOME TO OUR GROUP 💖✨

❥ NEW MEMBER: ${userNames}
🎀 Group Name: ${threadName}
🎉 Member Number: ${memberNumbersText}

🌸 From the team, we hope you have a wonderful time! 🌸
💖 Enjoy, Participate, and Make Friends 💖

⏰ Time: Good ${session} 🌞
╔═══════════════❁🌸❁═══════════════╗
       🌟 Have fun & stay safe 🌟
╚═══════════════❁🌸❁═══════════════╝
`;

            await api.sendMessage({ body: welcomeMessage, mentions }, threadID);

        } catch (err) {
            console.error("Welcome module error:", err);
        }
    }
};
