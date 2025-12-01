const fs = require('fs');

function l() {
  try {
    const d = fs.readFileSync("admin.json", "utf8");
    return JSON.parse(d);
  } catch (e) {
    return {};
  }
}

function s(s) {
  fs.writeFileSync("admin.json", JSON.stringify(s, null, 2));
}

let a = l();

module.exports = {
  config: {
    name: "antiadmin",
    version: "1.0",
    author: "Kshitiz",
    countDown: 5,
    role: 1,
    shortDescription: "",
    longDescription: "anti gc admin: If someone removes you from admin, the bot will add you again as admin. If the bot is removed from admin, moye moye.",
    category: "box",
    guide: "{pn} off or on - current state always on.",
  },

  onStart: async function({ message, event, threadsData, args }) {
    if (args[0] === "off") {
      a[event.threadID] = 'off';
      s(a);
      return message.reply(`Disabled.`);
    } else if (args[0] === "on") {
      delete a[event.threadID];
      s(a);
      return message.reply(`Enabled.`);
    } else {
      return message.reply(`Usage: {pn} off to turn off`);
    }
  },

  onEvent: async function({ api, event, threadsData }) {
    if (a[event.threadID] === 'off' || !event.logMessageData || event.logMessageData.ADMIN_EVENT !== "remove_admin") {
      return;
    }

    const d = event.threadID;
    const f = event.logMessageData.TARGET_ID;
    const g = event.author;

    try {
      if (g !== api.getCurrentUserID() && f !== api.getCurrentUserID()) {
        await api.changeAdminStatus(d, f, true);
        await api.changeAdminStatus(d, g, false);
      }
    } catch (h) {
      console.error("Error", h);
    }
  }
};
