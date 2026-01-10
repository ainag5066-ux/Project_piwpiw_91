const { createCanvas, loadImage } = require("canvas");
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
  return filePath;
}

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
  config: { name: "welcome", version: "16.1.0", author: "Ratul", category: "events" },

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

      const hour = new Date().getHours();
      const session =
        hour < 12 ? "🌅 সুপ্রভাত" :
        hour < 17 ? "🌤️ শুভ দুপুর" :
        hour < 20 ? "🌆 শুভ সন্ধ্যা" :
        "🌙 শুভ রাত্রি";

      const threadInfo = await api.getThreadInfo(threadID);
      const memberCount = threadInfo.participantIDs.length;

      // Load GIF background
      const gifPath = await getRandomGif();
      const bg = await loadImage(gifPath);

      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Draw member avatars
      const avatarSize = 100;
      const spacing = 20;
      let startX = (canvas.width - (newMembers.length * (avatarSize + spacing) - spacing)) / 2;

      const avatars = [];
      for (const member of newMembers) {
        const avatarPath = await getUserAvatar(member.userFbId);
        const avatarImg = await loadImage(avatarPath);
        avatars.push({ image: avatarImg, name: member.fullName });
      }

      avatars.forEach((av, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(startX + avatarSize / 2, 200, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(av.image, startX, 150, avatarSize, avatarSize);
        ctx.restore();
        startX += avatarSize + spacing;
      });

      // Overlay text
      ctx.fillStyle = "white";
      ctx.textAlign = "center";

      ctx.font = "bold 50px Arial";
      ctx.fillText("🌸 আসসালামু আলাইকুম 🌸", canvas.width / 2, 80);

      ctx.font = "bold 36px Arial";
      ctx.fillText(`🎉 নতুন সদস্য ${newMembers.length} জন যোগ দিলেন! 🎉`, canvas.width / 2, 320);

      ctx.font = "bold 30px Arial";
      ctx.fillText(`গ্রুপ ➤ ${groupName.toUpperCase()}`, canvas.width / 2, 380);

      ctx.font = "bold 28px Arial";
      ctx.fillText(`মোট সদস্য : ${memberCount}`, canvas.width / 2, 420);

      ctx.font = "bold 28px Arial";
      ctx.fillText(`${session}`, canvas.width / 2, 460);

      ctx.font = "bold 28px Arial";
      ctx.fillText(`👑 মালিক : Mehedi Hasan`, canvas.width / 2, 500);

      ctx.font = "bold 24px Arial";
      ctx.fillText("🎁 কেক 🍰, আলিঙ্গন 🤗 & ভার্চুয়াল কনফেটি 🎉", canvas.width / 2, 540);

      // Save and send image
      const outPath = path.join(CACHE_DIR, `welcome_group.png`);
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      await new Promise(resolve => out.on("finish", resolve));

      const mentions = newMembers.map(m => ({ tag: m.fullName, id: m.userFbId }));
      const msg = `🎊 নতুন সদস্য${newMembers.length > 1 ? "রা" : ""} স্বাগতম! 🎊\n\n🔥 মজা করো & ভালো সময় কাটাও`;

      await api.sendMessage(
        { body: msg, mentions, attachment: [fs.createReadStream(outPath)] },
        threadID
      );

      fs.unlinkSync(outPath);

    } catch (err) {
      console.error("❌ Welcome ERROR:", err);
    }
  }
};
