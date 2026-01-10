const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const CACHE_DIR = path.join(__dirname, "cache");

// 🌈 RANDOM WELCOME GIFs
const WELCOME_GIFS = [
  "https://files.catbox.moe/38guc2.gif",
  "https://files.catbox.moe/7xq1k3.gif",
  "https://files.catbox.moe/vq1l9a.gif",
  "https://files.catbox.moe/9x0k4b.gif",
  "https://files.catbox.moe/1kz9e7.gif"
];

async function getRandomGif() {
  const gifURL = WELCOME_GIFS[Math.floor(Math.random() * WELCOME_GIFS.length)];
  const gifPath = path.join(CACHE_DIR, path.basename(gifURL));

  if (!fs.existsSync(gifPath)) {
    await fs.ensureDir(CACHE_DIR);
    const res = await axios.get(gifURL, {
      responseType: "arraybuffer",
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    await fs.writeFile(gifPath, res.data);
  }
  return fs.createReadStream(gifPath);
}

module.exports = {
  config: {
    name: "welcome",
    version: "8.0.0",
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
      const rawGroupName = threadData?.threadName || "This Group";

      // ✨ GROUP NAME STYLE
      const groupName =
`╭─── ❖ 🌸 𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘 🌸 ❖ ───╮
      『 ${rawGroupName} 』
╰─── ❖ ❖ ❖ ❖ ❖ ❖ ❖ ───╯`;

      let mentions = [];
      let memberText = "";

      for (const u of added) {
        memberText += `🌟 𝑾𝒆𝒍𝒄𝒐𝒎𝒆 ➤ @${u.fullName} 🌟\n`;
        mentions.push({ tag: u.fullName, id: u.userFbId });
      }

      const hour = new Date().getHours();
      const session =
        hour < 12 ? "🌅 𝙂𝙊𝙊𝘿 𝙈𝙊𝙍𝙉𝙄𝙉𝙂" :
        hour < 17 ? "🌤️ 𝙂𝙊𝙊𝘿 𝘼𝙁𝙏𝙀𝙍𝙉𝙊𝙊𝙉" :
        hour < 20 ? "🌆 𝙂𝙊𝙊𝘿 𝙀𝙑𝙀𝙉𝙄𝙉𝙂" :
        "🌙 𝙂𝙊𝙊𝘿 𝙉𝙄𝙂𝙃𝙏";

      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      const body =
`╔══════════════════════════════╗
   🌸✨ 𝗔𝗦𝗦𝗔𝗟𝗔𝗠𝗨𝗔𝗟𝗔𝗜𝗞𝗨𝗠 ✨🌸
╚══════════════════════════════╝

👑✨ 𝗡𝗘𝗪 𝗠𝗘𝗠𝗕𝗘𝗥 𝗔𝗟𝗘𝗥𝗧 ✨👑
━━━━━━━━━━━━━━━━━━━━━━━
${memberText.trim()}
━━━━━━━━━━━━━━━━━━━━━━━

${groupName}

👥 𝗧𝗢𝗧𝗔𝗟 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 ➤ ${memberCount}

💖 Be Friendly  
💬 Stay Active  
🤝 Respect Everyone  

⏰ ${session}

╔══════════════════════════════╗
 👑 𝗢𝗪𝗡𝗘𝗥 : ✦ 𝗠𝗲𝗵𝗲𝗱𝗶 𝗛𝗮𝘀𝗮𝗻 ✦ 👑
╚══════════════════════════════╝

🔥✨ 𝗘𝗡𝗝𝗢𝗬 𝗬𝗢𝗨𝗥 𝗦𝗧𝗔𝗬 ✨🔥`;

      const gifStream = await getRandomGif();

      await api.sendMessage(
        {
          body,
          mentions,
          attachment: gifStream
        },
        threadID
      );

    } catch (err) {
      console.error("❌ Welcome error:", err);
    }
  }
};
