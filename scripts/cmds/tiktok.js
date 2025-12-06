const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt"],
    version: "2 0",
    author: "Saimx69x",
    role: 0,
    shortDescription: "Search and download TikTok videos",
    longDescription: "Paginated TikTok video search (10 per page) ",
    category: "media",
    guide: "{p}tiktok <keyword>"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query)
      return api.sendMessage("🌀 | Type a keyword!\nExample: /tiktok sakura haruka", event.threadID, event.messageID);

    try {
      api.setMessageReaction("⌛️", event.messageID, event.threadID, () => {});
    } catch (e) {
      console.error("Reaction error (start):", e.message);
    }

    try {
      const res = await axios.get(`https://xsaim8x-xxx-api.onrender.com/api/tiktok?query=${encodeURIComponent(query)}`, { timeout: 15000 });
      const data = res.data?.results || res.data?.data || [];

      if (!data || data.length === 0) {
        try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
        return api.sendMessage("❌ | No TikTok videos found!", event.threadID, event.messageID);
      }

      const allResults = Array.isArray(data) ? data.slice(0, 30) : [];
      try { api.setMessageReaction("✅️", event.messageID, event.threadID, () => {}); } catch {}

      await sendPage(api, event, allResults, 1, query);
    } catch (err) {
      console.error("Fetch error:", err?.message || err);
      try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
      api.sendMessage("⚠️ | Failed to fetch TikTok results. Try again later.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      if (event.senderID !== Reply.author) return;

      const body = event.body.trim().toLowerCase();

      try { api.setMessageReaction("⌛️", event.messageID, event.threadID, () => {}); } catch {}

      if (body === "next") {
        const nextPage = Reply.page + 1;
        const maxPage = Math.ceil(Reply.results.length / 10);
        if (nextPage > maxPage) {
          try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
          return api.sendMessage("⚠️ | No more results!", event.threadID, event.messageID);
        }

        try { api.unsendMessage(Reply.resultMsgID); } catch {}
        try { api.setMessageReaction("✅️", event.messageID, event.threadID, () => {}); } catch {}
        return await sendPage(api, event, Reply.results, nextPage, Reply.query);
      }

      const choice = parseInt(body);
      if (isNaN(choice) || choice < 1 || choice > 10) {
        try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
        return api.sendMessage("⚠️ | Reply a number (1–10) or 'next'.", event.threadID, event.messageID);
      }

      const index = (Reply.page - 1) * 10 + (choice - 1);
      const selected = Reply.results[index];
      if (!selected) {
        try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
        return api.sendMessage("❌ | Invalid choice!", event.threadID, event.messageID);
      }

      try { api.unsendMessage(Reply.resultMsgID); } catch {}

      const filePath = path.join(__dirname, `cache_tt_video_${event.senderID}.mp4`);
      try {
        const videoRes = await axios.get(selected.noWatermark, { responseType: "arraybuffer", timeout: 30000 });
        fs.writeFileSync(filePath, Buffer.from(videoRes.data, "binary"));

        try { api.setMessageReaction("✅️", event.messageID, event.threadID, () => {}); } catch {}

        api.sendMessage(
          {
            body: `🎬 ${selected.title ? (selected.title.length > 60 ? selected.title.slice(0, 57) + "..." : selected.title) : "TikTok Video"}\n👁️ ${selected.views || "0"} | ❤️ ${selected.likes || "0"} | 💬 ${selected.comments || "0"}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          (err) => {
            try { fs.unlinkSync(filePath); } catch {}
            if (err) {
              console.error("Send video error:", err);
              try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
              api.sendMessage("❌ | Failed to send video.", event.threadID, event.messageID);
            }
          },
          event.messageID
        );
      } catch (err2) {
        console.error("Download/send error:", err2?.message || err2);
        try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
        api.sendMessage("❌ | Failed to download or send TikTok video.", event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("onReply error:", err);
      try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
      api.sendMessage("⚠️ | Something went wrong while replying!", event.threadID, event.messageID);
    }
  }
};
async function sendPage(api, event, allResults, page, query) {
  const start = (page - 1) * 10;
  const end = start + 10;
  const pageResults = allResults.slice(start, end);

  let message = `🎵 𝗧𝗶𝗸𝗧𝗼𝗸 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 (${query}) - Page ${page}\n\n`;
  const attachments = [];

  for (let i = 0; i < pageResults.length; i++) {
    const v = pageResults[i];
    const shortTitle = v && v.title ? (v.title.length > 45 ? v.title.slice(0, 45) + "..." : v.title) : "Untitled";
    message += `${i + 1}. 🎬 ${shortTitle}\n👁️ ${v.views || 0} views\n\n`;

    try {
      const imgPath = path.join(__dirname, `cache_tt_${event.senderID}_${page}_${i}.jpg`);
      const imgRes = await axios.get(v.cover, { responseType: "arraybuffer", timeout: 10000 });
      fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));
      attachments.push(fs.createReadStream(imgPath));
    } catch (e) {
      console.error("Cover fetch failed:", e.message);
    }
  }

  message += "👉 Reply with a number (1–10) to download.\n➡️ Type 'next' for more results.";

  return new Promise((resolve) => {
    api.sendMessage(
      { body: message.trim(), attachment: attachments.length ? attachments : undefined },
      event.threadID,
      (err, info) => {
        if (err) {
          console.error("sendPage error:", err);
          try { api.setMessageReaction("❌️", event.messageID, event.threadID, () => {}); } catch {}
          api.sendMessage("⚠️ | Failed to send results.", event.threadID, event.messageID);
          attachments.forEach((att) => {
            try { fs.unlinkSync(att.path); } catch {}
          });
          return resolve();
        }

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "tiktok",
          author: event.senderID,
          results: allResults,
          query,
          page,
          resultMsgID: info.messageID
        });

        setTimeout(() => {
          attachments.forEach((att) => {
            try { fs.unlinkSync(att.path); } catch {}
          });
        }, 60000);

        resolve();
      },
      event.messageID
    );
  });
      }
