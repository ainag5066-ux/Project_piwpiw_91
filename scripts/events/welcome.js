const { createCanvas, loadImage, registerFont } = require("canvas");
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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else line = testLine;
  }
  ctx.fillText(line.trim(), x, y);
  return y;
}

module.exports = {
  config: { name: "welcome", version: "9.0.0", author: "Ratul", category: "events" },

  onStart: async ({ api, event, threadsData }) => {
    if (event.logMessageType !== "log:subscribe") return;
    try {
      const threadID = event.threadID;
      const added = event.logMessageData.addedParticipants || [];
      const botID = api.getCurrentUserID();
      if (added.some(u => u.userFbId == botID)) return;

      const threadData = await threadsData.get(threadID);
      const groupName = threadData?.threadName || "This Group";

      const member = added[0];
      const userAvatarPath = await getUserAvatar(member.userFbId);
      const gifPath = await getRandomGif();

      // Canvas setup
      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      // Load GIF as background (first frame only)
      const bg = await loadImage(gifPath);
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Profile pic
      const avatar = await loadImage(userAvatarPath);
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
      ctx.fillText("🌸 ASSALAMUALAIKUM 🌸", canvas.width / 2, 50);

      ctx.font = "bold 34px Arial";
      ctx.fillText(`Welcome ➤ ${member.fullName}`, canvas.width / 2, 370);

      ctx.font = "bold 28px Arial";
      ctx.fillText(`To Group ➤ ${groupName}`, canvas.width / 2, 410);

      ctx.font = "bold 24px Arial";
      ctx.fillText("👑 OWNER : Mehedi Hasan", canvas.width / 2, 450);

      // Save image
      const outPath = path.join(CACHE_DIR, `welcome_${member.userFbId}.png`);
      const out = fs.createWriteStream(outPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      await new Promise(resolve => out.on("finish", resolve));

      await api.sendMessage(
        { body: `🌟 Welcome ${member.fullName} 🌟`, attachment: fs.createReadStream(outPath) },
        threadID
      );

      fs.unlinkSync(outPath);

    } catch (e) {
      console.error("❌ Welcome Error:", e);
    }
  }
};
