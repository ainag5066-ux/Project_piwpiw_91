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

async function getUserAvatar(userID) {
  const avatarPath = path.join(__dirname, "cache", `avatar_${userID}.jpg`);
  if (!fs.existsSync(avatarPath)) {
    const url = `https://graph.facebook.com/${userID}/picture?height=720&width=720`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(avatarPath, data);
  }
  return fs.createReadStream(avatarPath);
}

module.exports = {
  config: {
    name: "welcome",
    version: "5.0.0",
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

      let nameText = "";
      let mentions = [];

      for (const u of added) {
        nameText += `✦ @${u.fullName}\n`;
        mentions.push({ tag: u.fullName, id: u.userFbId });
      }

      const hour = new Date().getHours();
      const session =
        hour < 12 ? "🌅 𝗚𝗢𝗢𝗗 𝗠𝗢𝗥𝗡𝗜𝗡𝗚" :
        hour < 17 ? "🌤️ 𝗚𝗢𝗢𝗗 𝗔𝗙𝗧𝗘𝗥𝗡𝗢𝗢𝗡" :
        hour < 20 ? "🌆 𝗚𝗢𝗢𝗗 𝗘𝗩𝗘𝗡𝗜𝗡𝗚" :
        "🌙 𝗚𝗢𝗢𝗗 𝗡𝗜𝗚𝗛𝗧";

      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      const body =
`╔══════════════════════════════╗
      🌸✨  𝗔𝗦𝗦𝗔𝗟𝗔𝗠𝗨𝗔𝗟𝗔𝗜𝗞𝗨𝗠  ✨🌸
╚══════════════════════════════╝

👑✨ 𝗡𝗘𝗪 𝗠𝗘𝗠𝗕𝗘𝗥 𝗔𝗟𝗘𝗥𝗧 ✨👑
━━━━━━━━━━━━━━━━━━━━━━━
${nameText}
━━━━━━━━━━━━━━━━━━━━━━━

🏠 𝗚𝗥𝗢𝗨𝗣 𝗡𝗔𝗠𝗘
➤ ${groupName}

🔢 𝗠𝗘𝗠𝗕𝗘𝗥 𝗡𝗢
➤ ${memberCount}

💖 𝗕𝗲 𝗳𝗿𝗶𝗲𝗻𝗱𝗹𝘆  
💬 𝗦𝘁𝗮𝘆 𝗮𝗰𝘁𝗶𝘃𝗲  
😇 𝗥𝗲𝘀𝗽𝗲𝗰𝘁 𝗲𝘃𝗲𝗿𝘆𝗼𝗻𝗲  

⏰ ${session}

╔══════════════════════════════╗
   👑 𝗢𝗪𝗡𝗘𝗥 : ✦ 𝗠𝗲𝗵𝗲𝗱𝗶 𝗛𝗮𝘀𝗮𝗻 ✦ 👑
╚══════════════════════════════╝

🔥✨ 𝗘𝗡𝗝𝗢𝗬 𝗬𝗢𝗨𝗥 𝗦𝗧𝗔𝗬 ✨🔥`;

      const gif = await getWelcomeGif();
      const avatar = await getUserAvatar(added[0].userFbId);

      await api.sendMessage(
        {
          body,
          mentions,
          attachment: [avatar, gif]
        },
        threadID
      );

    } catch (err) {
      console.error("❌ Welcome GIF+PP error:", err);
    }
  }
};
