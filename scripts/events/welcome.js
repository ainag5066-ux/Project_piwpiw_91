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
  config: { name: "welcome", version: "13.0.0", author: "Ratul", category: "events" },

  onStart: async ({ api, event, threadsData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    try {
      const threadID = event.threadID;
      const added = event.logMessageData.addedParticipants || [];
      const botID = api.getCurrentUserID();

      // Bot ke ignore koro
      const newMembers = added.filter(u => u.userFbId !== botID);
      if (!newMembers.length) return;

      const threadData = await threadsData.get(threadID);
      const groupName = threadData?.threadName || "এই গ্রুপ";

      // 🌟 MEMBER MENTIONS & TEXT
      let mentions = [];
      let memberText = "";
      newMembers.forEach((m, i) => {
        mentions.push({ tag: m.fullName, id: m.userFbId });
        memberText += `🎉 ${i + 1}. @${m.fullName} 🎉\n`;
      });

      // 🌤️ TIME SESSION
      const hour = new Date().getHours();
      const session =
        hour < 12 ? "🌅 সুপ্রভাত" :
        hour < 17 ? "🌤️ শুভ দুপুর" :
        hour < 20 ? "🌆 শুভ সন্ধ্যা" :
        "🌙 শুভ রাত্রি";

      // 🏠 THREAD INFO
      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      // 🎊 FUN & STYLISH WELCOME
      const body =
`╔════════════════════════════╗
      🌸 আসসালামু আলাইকুম 🌸
╚════════════════════════════╝

👑 নতুন সদস্য${newMembers.length > 1 ? "রা" : ""} যোগ দিলেন 🎊
━━━━━━━━━━━━━━━━━━━━━━
${memberText.trim()}
━━━━━━━━━━━━━━━━━━━━━━

🏠 গ্রুপ : 『 ✨ ${groupName.toUpperCase()} ✨ 』
👥 মোট সদস্য : ${memberCount}

💖 বন্ধুত্বপূর্ণ হও এবং মজার মেম শেয়ার করো 😂  
🤝 সবাইকে সম্মান করো & স্প্যাম কোরো না 😎

⏰ ${session}

👑 মালিক : ✦ Mehedi Hasan ✦
🎁 পি.এস : কেক 🍰 খাও, আলিঙ্গন 🤗 করো & ভার্চুয়াল কনফেটি 🎉

🔥 মজা করো এবং ভালো সময় কাটাও 🔥
🌈 FUN ZONE এ স্বাগতম! 🌈`;

      const gifPath = await getRandomGif();

      await api.sendMessage(
        { body, mentions, attachment: [fs.createReadStream(gifPath)] },
        threadID
      );

    } catch (err) {
      console.error("❌ Welcome ERROR:", err);
    }
  }
};
