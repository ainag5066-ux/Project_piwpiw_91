// welcome.js
module.exports = {
    config: {
        name: "welcome",
        version: "6.0",
        author: "Ratul",
        category: "events"
    },

    onStart: async ({ api, event, threadsData }) => {
        try {
            if (event.logMessageType !== "log:subscribe") return;

            const threadID = event.threadID;
            const addedParticipants = event.logMessageData.addedParticipants || [];
            const botID = api.getCurrentUserID();

            if (addedParticipants.some(u => u.userFbId === botID)) return;

            // Get thread info
            const threadData = await threadsData.get(threadID);
            const threadName = threadData.threadName || "this group";
            const memberCount = threadData.data?.members?.length || 0;

            // Prepare mentions and names
            let userNames = addedParticipants.map(u => u.fullName).join(", ");
            let mentions = addedParticipants.map(u => ({ tag: u.fullName, id: u.userFbId }));

            // Time-based session
            const hours = new Date().getHours();
            const session =
                hours <= 10 ? "morning" :
                hours <= 12 ? "noon" :
                hours <= 18 ? "afternoon" : "evening";

            const welcomeMessage = `
╔═══════════════❁🌺❁═══════════════╗
         🌟 Assalamualaikum 🌟
╚═══════════════❁🌺❁═══════════════╝

✨💖  WELCOME TO OUR GROUP 💖✨

❥ NEW MEMBER: [ ${userNames} ]

🎀 Group Name: ${threadName}
🎉 Member Number: ${memberCount}

🌸 From the team, we hope you have a great time! 🌸

💖 Enjoy, Participate, and Make Friends 💖

⏰ Time: Good ${session} everyone!
╔═══════════════❁🌺❁═══════════════╗
        🌟 Have fun & stay safe 🌟
╚═══════════════❁🌺❁═══════════════╝
`;

            await api.sendMessage({ body: welcomeMessage, mentions }, threadID);

        } catch (err) {
            console.error("Welcome module error:", err);
        }
    }
};
