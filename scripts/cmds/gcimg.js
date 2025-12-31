const fs = require("fs-extra");
const https = require("https");
const path = require("path");

module.exports = {
 config: {
 name: "gcimg",
 aliases: ["groupimg", "groupimage", "gcavt"],
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 0,
 shortDescription: {
 en: "Get group cover photo"
 },
 longDescription: {
 en: "Sends the group chat cover image along with name, member count and admins."
 },
 category: "group",
 guide: {
 en: "{pn}"
 }
 },

 onStart: async function ({ api, event, threadsData, message }) {
 const threadID = event.threadID;

 try {
 const threadInfo = await api.getThreadInfo(threadID);

 // Cover photo
 const imageURL = threadInfo.imageSrc;
 if (!imageURL) return message.reply("⚠️ This group has no cover photo!");

 const fileName = `gcimg_${threadID}.jpg`;
 const filePath = path.join(__dirname, "cache", fileName);

 // Download if not cached
 if (!fs.existsSync(filePath)) {
 await new Promise((resolve, reject) => {
 const file = fs.createWriteStream(filePath);
 https.get(imageURL, (res) => {
 res.pipe(file);
 file.on("finish", () => file.close(resolve));
 }).on("error", reject);
 });
 }

 // Group name & member count
 const groupName = threadInfo.threadName || "Unnamed Group";
 const memberCount = threadInfo.participantIDs.length;

 // Admin list
 const adminIDs = threadInfo.adminIDs.map(ad => ad.id);
 const adminNames = await Promise.all(
 adminIDs.map(async (uid) => {
 try {
 const name = await api.getUserInfo(uid);
 return name[uid].name;
 } catch {
 return "Unknown";
 }
 })
 );

 const caption = `
🌸 𝙂𝙧𝙤𝙪𝙥 𝙉𝙖𝙢𝙚: ${groupName}
👑 𝘼𝙙𝙢𝙞𝙣𝙨 (${adminNames.length}):
➥ ${adminNames.join("\n➥ ")}
👥 𝙈𝙚𝙢𝙗𝙚𝙧𝙨: ${memberCount}
 `.trim();

 await message.reply({
 body: caption,
 attachment: fs.createReadStream(filePath)
 });

 } catch (err) {
 console.error(err);
 message.reply("❌ Failed to fetch group image or info.");
 }
 }
};
