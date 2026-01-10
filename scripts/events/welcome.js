const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const WELCOME_GIF_URL = "https://files.catbox.moe/38guc2.gif";
const GIF_PATH = path.join(__dirname, "cache", "welcome.gif");

async function getWelcomeGif() {
  if (!fs.existsSync(GIF_PATH)) {
    const { data } = await axios.get(WELCOME_GIF_URL, { responseType: "arraybuffer" });
    await fs.ensureDir(path.dirname(GIF_PATH));
    await fs.writeFile(GIF_PATH, data);
  }
  return fs.createReadStream(GIF_PATH);
}

module.exports = {
  config: {
    name: "welcome",
    version: "3.0.0",
    author: "Ratul",
    category: "events"
  },

  onStart: async ({ api, event, threadsData, usersData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    try {
      const threadID = event.threadID;
      const added = event.logMessageData.addedParticipants || [];
      const botID = api.getCurrentUserID();

      // bot join ignore
      if (added.some(u => u.userFbId == botID)) return;

      const threadData = await threadsData.get(threadID);
      const groupName = threadData?.threadName || "This Group";

      let names = "";
      let mentions = [];

      for (const u of added) {
        names += `@${u.fullName} `;
        mentions.push({ tag: u.fullName, id: u.userFbId });
      }

      const hour = new Date().getHours();
      const session =
        hour < 12 ? "Good Morning ☀️" :
        hour < 17 ? "Good Afternoon 🌤️" :
        hour < 20 ? "Good Evening 🌆" :
        "Good Night 🌙";

      const memberCount = (await api.getThreadInfo(threadID)).participantIDs.length;

      const body =
`🌸✨ ASSALAMUALAIKUM ✨🌸

👤 New Member: ${names}
🏠 Group: ${groupName}
🔢 Member No: ${memberCount}

💖 Feel free to chat & enjoy
⏰ ${session}`;

      const gifStream = await getWelcomeGif();

      await api.sendMessage(
        {
          body,
          mentions,
          attachment: gifStream
        },
        threadID
      );

    } catch (err) {
      console.error("❌ Welcome GIF error:", err);
    }
  }
};
