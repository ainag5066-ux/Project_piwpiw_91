const { createCanvas, loadImage } = require("canvas");
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

// ✨ RANDOM GIF
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

// ✨ USER AVATAR
async function getUserAvatar(userID) {
  const avatarPath = path.join(CACHE_DIR, `avatar_${userID}.jpg`);
  if (!fs.existsSync(avatarPath)) {
    const url = `https://graph.facebook.com/${userID}/picture?height=720&width=720`;
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(avatarPath, data);
  }
  return avatarPath;
}

module.exports = {
  config: { name: "welcome", version: "15.0.0", author: "Ratul", category: "events" },

  onStart: async ({ api, event, threadsData }) => {
    if (event.logMessageType !== "log:subscribe") return;

    try {
      const threadID = event.threadID;
      const added = event.logMessageData.addedParticipants || [];
      const botID = api.getCurrentUserID();
      const newMembers = added.filter(u => u.userFbId !== botID);
      if (!newMembers.length) return;

      const threadData = await threadsData.get(threadID);
      const groupName = threadData?.threadName || "এই গ্রুপ";

      // ✨ TIME SESSION
      const hour = new Date().getHours();
      const session =
        hour < 12 ? "🌅 সুপ্রভাত" :
        hour < 17 ? "🌤️ শুভ দুপুর" :
        hour < 20 ? "🌆 শুভ সন্ধ্যা" :
        "🌙 শুভ রাত্রি";

      // ✨ THREAD INFO
      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      // Loop for each new member
      for (const member of newMembers) {
        const avatarPath = await getUserAvatar(member.userFbId);
        const gifPath = await getRandomGif();

        // Canvas setup
        const canvas = createCanvas(1000, 500);
        const ctx = canvas.getContext("2d");

        // Load GIF as background (first frame)
        const bg = await loadImage(gifPath);
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        // Profile pic
        const avatar = await loadImage(avatarPath);
        const avatarSize = 150;
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 180, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, canvas.width / 2 - avatarSize / 2, 105, avatarSize, avatarSize);
        ctx.restore();

        // Overlay text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";

        ctx.font = "bold 40px Arial";
        ctx.fillText("🌸 আসসালামু আলাইকুম 🌸", canvas.width / 2, 50);

        ctx.font = "bold 34px Arial";
        ctx.fillText(`🎉 ${member.fullName} 🎉`, canvas.width / 2, 370);

        ctx.font = "bold 28px Arial";
        ctx.fillText(`গ্রুপ ➤ ${groupName.toUpperCase()}`, canvas.width / 2, 410);

        ctx.font = "bold 24px Arial";
        ctx.fillText(`মোট সদস্য : ${memberCount}`, canvas.width / 2, 450);

        ctx.font = "bold 24px Arial";
        ctx.fillText(`${session}`, canvas.width / 2, 480);

        // Save image
        const outPath = path.join(CACHE_DIR, `welcome_${member.userFbId}.png`);
        const out = fs.createWriteStream(outPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);
        await new Promise(resolve => out.on("finish", resolve));

        // Send message
        const msg = `🎊 নতুন সদস্য ${member.fullName} কে স্বাগতম! 🎊\n\n👑 মালিক : Mehedi Hasan\n🔥 মজা করো & ভালো সময় কাটাও`;
        await api.sendMessage(
          { body: msg, attachment: fs.createReadStream(outPath) },
          threadID
        );

        fs.unlinkSync(outPath);
      }

    } catch (err) {
      console.error("❌ Welcome ERROR:", err);
    }
  }
};
