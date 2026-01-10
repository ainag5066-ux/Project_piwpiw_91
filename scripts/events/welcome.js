const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

const WELCOME_GIFS = [
  "https://files.catbox.moe/38guc2.gif",
  "https://files.catbox.moe/7xq1k3.gif",
  "https://files.catbox.moe/vq1l9a.gif",
  "https://files.catbox.moe/9x0k4b.gif",
  "https://files.catbox.moe/1kz9e7.gif"
];

async function getRandomGif() {
  const url = WELCOME_GIFS[Math.floor(Math.random() * WELCOME_GIFS.length)];
  const filePath = path.join(CACHE_DIR, path.basename(url));

  if (!fs.existsSync(filePath)) {
    await fs.ensureDir(CACHE_DIR);
    const res = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(filePath, res.data);
  }
  return fs.createReadStream(filePath);
}

module.exports = {
  config: {
    name: "welcome",
    version: "8.1.0",
    author: "Ratul",
    category: "events"
  },

  onStart: async ({ api, event, threadsData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    try {
      const threadID = event.threadID;
      const added = event.logMessageData.addedParticipants || [];
      const botID = api.getCurrentUserID();
      if (added.some(u => u.userFbId == botID)) return;

      const threadData = await threadsData.get(threadID);
      const groupName = threadData?.threadName || "This Group";

      let mentions = [];
      let memberLines = "";

      for (const u of added) {
        memberLines += `➤ @${u.fullName}\n`; // ❗ clean mention
        mentions.push({ tag: u.fullName, id: u.userFbId });
      }

      const hour = new Date().getHours();
      const session =
        hour < 12 ? "🌅 GOOD MORNING" :
        hour < 17 ? "🌤️ GOOD AFTERNOON" :
        hour < 20 ? "🌆 GOOD EVENING" :
        "🌙 GOOD NIGHT";

      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      const body =
`╔══════════════════════╗
   🌸 ASSALAMUALAIKUM 🌸
╚══════════════════════╝

👑 NEW MEMBER JOINED
━━━━━━━━━━━━━━
${memberLines.trim()}
━━━━━━━━━━━━━━

🏠 GROUP : 『 ${groupName} 』
👥 TOTAL MEMBERS : ${memberCount}

💖 Be Friendly
🤝 Respect Everyone

⏰ ${session}

👑 OWNER : Mehedi Hasan

🔥 ENJOY YOUR STAY 🔥`;

      const gif = await getRandomGif();

      await api.sendMessage(
        {
          body,
          mentions,
          attachment: [gif] // ✅ MUST BE ARRAY
        },
        threadID
      );

    } catch (e) {
      console.error("WELCOME ERROR:", e);
    }
  }
};
