// welcome.js
module.exports = {
    config: {
        name: "welcome",
        version: "7.0",
        author: "Ratul",
        category: "events"
    },

    onStart: async ({ api, event, threadsData }) => {
        try {
            if (event.logMessageType !== "log:subscribe") return;

            const threadID = event.threadID;
            const addedParticipants = event.logMessageData.addedParticipants || [];
            const botID = api.getCurrentUserID();

            // যদি বট নিজেই join হয়
            if (addedParticipants.some(u => u.userFbId === botID)) return;

            // Thread info
            const threadData = await threadsData.get(threadID);
            const threadName = threadData.threadName || "this group";

            // সঠিক member number বের করার জন্য current members
            const membersList = threadData.data?.members || [];
            // প্রতিটি নতুন সদস্যের member number বের করা
            const memberNumbers = addedParticipants.map(u => {
                const memberIndex = membersList.findIndex(m => m.id === u.userFbId);
                return memberIndex >= 0 ? memberIndex + 1 : membersList.length + 1;
            });

            // Prepare mentions & names
            let userNames = addedParticipants.map(u => u.fullName).join(", ");
            let mentions = addedParticipants.map(u => ({ tag: u.fullName, id: u.userFbId }));

            // Member numbers string (যদি একাধিক join করে)
            let memberNumbersText = memberNumbers.length === 1 ? `${memberNumbers[0]}` : memberNumbers.join(", ");

            // Time-based session
            const hours = new Date().getHours();
            const session =
                hours <= 10 ? "morning" :
                hours <= 12 ? "noon" :
                hours <= 18 ? "afternoon" : "evening";

            const welcomeMessage = `
╔═══════════════❁🌸❁═══════════════╗
         🌟 Assalamualaikum 🌟
╚═══════════════❁🌸❁═══════════════╝

✨💖  WELCOME TO OUR GROUP 💖✨

❥ NEW MEMBER: [ ${userNames} ]
🎀 Group Name: ${threadName}
🎉 Member Number: ${memberNumbersText}

🌸 From the team, we hope you have a great time! 🌸
💖 Enjoy, Participate, and Make Friends 💖

⏰ Time: Good ${session} everyone!
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
