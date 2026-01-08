// welcome.js
module.exports = {
    config: {
        name: "welcome",
        version: "4.0",
        author: "Ratul",
        category: "events"
    },

    onStart: async ({ api, event }) => {
        try {
            // শুধু নতুন join handle করবে
            if (event.logMessageType !== "log:subscribe") return;

            const threadID = event.threadID;
            const addedParticipants = event.logMessageData.addedParticipants || [];
            const botID = api.getCurrentUserID();

            // যদি বট নিজেই join হয়
            if (addedParticipants.some(u => u.userFbId === botID)) return;

            let userNames = addedParticipants.map(u => u.fullName).join(", ");
            let mentions = addedParticipants.map(u => ({ tag: u.fullName, id: u.userFbId }));

            // Get current hour
            const date = new Date();
            const hours = date.getHours();
            const session = hours <= 10 ? "morning" :
                            hours <= 12 ? "noon" :
                            hours <= 18 ? "afternoon" : "evening";

            const welcomeMessage = `
╭•┄┅═══❁🌸❁═══┅┄•╮
     🌟 Assalamualaikum 🌟
╰•┄┅═══❁🌸❁═══┅┄•╯

✨ WELCOME ✨

❥ NEW MEMBER: [ ${userNames} ]

❤️ Enjoy & have fun ❤️

💫 Have a great ${session}! 💫
`;

            await api.sendMessage({ body: welcomeMessage, mentions }, threadID);

        } catch (err) {
            console.error("Welcome module error:", err);
        }
    }
};
