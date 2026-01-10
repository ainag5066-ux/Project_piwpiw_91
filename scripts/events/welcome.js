const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

// 🌈 RANDOM FUN WELCOME GIFs
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
  return filePath;
}

module.exports = {
  config: { name: "welcome", version: "12.1.0", author: "Ratul", category: "events" },

  onStart: async ({ api, event, threadsData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    try {
      const threadID = event.threadID;
      const added = event.logMessageData.addedParticipants || [];
      const botID = api.getCurrentUserID();

      // Bot add ignore
      const newMembers = added.filter(u => u.userFbId != botID);
      if (!newMembers.length) return;

      const threadData = await threadsData.get(threadID);
      const groupName = threadData?.threadName || "This Group";

      // ✨ MEMBER MENTIONS & TEXT
      let mentions = [];
      let memberText = "";
      for (const member of newMembers) {
        mentions.push({ tag: member.fullName, id: member.userFbId });
        memberText += `🎉 @${member.fullName} 🎉\n`;
      }

      // ✨ TIME SESSION
      const hour = new Date().getHours();
      const session =
        hour < 12 ? "🌅 GOOD MORNING" :
        hour < 17 ? "🌤️ GOOD AFTERNOON" :
        hour < 20 ? "🌆 GOOD EVENING" :
        "🌙 GOOD NIGHT";

      // ✨ THREAD INFO
      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      // ✨ FUN & STYLISH MESSAGE
      const body =
`╔════════════════════════════╗
      🌸 ASSALAMUALAIKUM 🌸
╚════════════════════════════╝

👑 NEW MEMBER${newMembers.length > 1 ? "S" : ""} JOINED 🎊
━━━━━━━━━━━━━━━━━━━━━━
${memberText.trim()}
━━━━━━━━━━━━━━━━━━━━━━

🏠 GROUP : 『 ✨ ${groupName.toUpperCase()} ✨ 』
👥 TOTAL MEMBERS : ${memberCount}

💖 Be Friendly & Share Memes 😂  
🤝 Respect Everyone & Don't Spam 😎

⏰ ${session}

👑 OWNER : ✦ Mehedi Hasan ✦
🎁 PS: Enjoy cake 🍰, hugs 🤗 & virtual confetti 🎉

🔥 ENJOY YOUR STAY 🔥
🌈 Welcome to the FUN ZONE! 🌈`;

      // ✨ RANDOM GIF
      const gifPath = await getRandomGif();

      // ✅ Send message
      await api.sendMessage(
        { body, mentions, attachment: [fs.createReadStream(gifPath)] },
        threadID
      );

    } catch (err) {
      console.error("❌ Welcome ERROR:", err);
    }
  }
};
