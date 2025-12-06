module.exports = {
  config: {
    name: "intro",
    aliases: ["me", "myinfo", "profile"],
    version: "7.0",
    author: "Mehedi Hasan",
    role: 0,
    shortDescription: "😂 Funny + stylish intro with photo (works 100%)",
  },

  onStart: async function({ api, event }) {
    try {
      // ===== Stylish info =====
      const name = "💎 𝗠𝗲𝗵𝗲𝗱𝗶 𝗛𝗮𝘀𝗮𝗻 💎";
      const classInfo = "🎓 Inter First Year";
      const hobby = "🎮 Gaming";
      const device = "📱 Samsung Note 8";
      const relation = "❤️ Secret";
      const city = "🏙 Sylhet";
      const religion = "🕌 Islam";

      // ===== Funny lines =====
      const funnyLines = [
        "🤣 Professional Meme Dealer",
        "🍕 Snack Level: Expert",
        "😜 Fluent in Sarcasm",
        "🛌 Nap Champion of the World",
        "🎧 Music Addict, will dance randomly",
        "😂 Laughs at own jokes (always)",
        "💡 Genius-level nonsense expert",
        "🐶 Talks to pets more than humans",
        "⚡ Energy: 100%, Sleep: 0%",
        "🔥 Too cool for regular vibes"
      ];

      // Pick 3 random funny lines
      const randomFunny = [];
      while(randomFunny.length < 3){
        const line = funnyLines[Math.floor(Math.random() * funnyLines.length)];
        if(!randomFunny.includes(line)) randomFunny.push(line);
      }

      // ===== Photo URL =====
      const photoURL = "https://i.ibb.co/hxBMndHx/594322121-1916715655860472-3395702086713011974-n-png-stp-dst-png-s480x480-nc-cat-110-ccb-1-7-nc-si.png";

      // ===== Message =====
      const message = `
💫 🌟 𝗨𝗹𝘁𝗿𝗮 𝗩𝗜𝗣 𝗙𝘂𝗻𝗻𝘆 𝗜𝗻𝘁𝗿𝗼 🌟 💫

👤 Name: ${name}
🎓 Class: ${classInfo}
🎮 Hobby: ${hobby}
📱 Device: ${device}
❤️ Rlsn: ${relation}
🏙 City: ${city}
🕌 Religion: ${religion}

💬 Fun Facts:
${randomFunny.map(l => `😂 ${l}`).join("\n")}

🌟 Crafted with ❤️ by Your Bot 🌟
      `;

      // ===== Send message with attachment =====
      api.sendMessage(
        { body: message, attachment: [{ type: "image", url: photoURL }] },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("Intro command error:", err);
      api.sendMessage("❌ Error loading your VIP intro.", event.threadID, event.messageID);
    }
  }
};
