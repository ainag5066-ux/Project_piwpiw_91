const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "vip",
    version: "1.0",
    author: "NTKhang | Saimx69x",
    countDown: 5,
    role: 0,
    description: {
      vi: "Thêm, xóa, sửa quyền VIP",
      en: "Add, remove, edit VIP role"
    },
    category: "box chat",
    guide: {
      vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền VIP cho người dùng'
        + '\n   {pn} [remove | -r] <uid | @tag>: Xóa quyền VIP của người dùng'
        + '\n   {pn} [list | -l]: Liệt kê danh sách VIP',
      en: '   {pn} [add | -a] <uid | @tag>: Add VIP role for user'
        + '\n   {pn} [remove | -r] <uid | @tag>: Remove VIP role of user'
        + '\n   {pn} [list | -l]: List all VIP users'
    }
  },

  langs: {
    vi: {
      added: "✅ | Đã thêm quyền VIP cho %1 người dùng:\n%2",
      alreadyVip: "\n⚠️ | %1 người dùng đã có quyền VIP từ trước rồi:\n%2",
      missingIdAdd: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền VIP",
      removed: "✅ | Đã xóa quyền VIP của %1 người dùng:\n%2",
      notVip: "⚠️ | %1 người dùng không có quyền VIP:\n%2",
      missingIdRemove: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền VIP",
      listVip: "💎 | Danh sách VIP:\n%1"
    },
    en: {
      added: "✅ | Added VIP role for %1 users:\n%2",
      alreadyVip: "\n⚠️ | %1 users already have VIP role:\n%2",
      missingIdAdd: "⚠️ | Please enter ID or tag user to add VIP role",
      removed: "✅ | Removed VIP role of %1 users:\n%2",
      notVip: "⚠️ | %1 users don't have VIP role:\n%2",
      missingIdRemove: "⚠️ | Please enter ID or tag user to remove VIP role",
      listVip: "💎 | List of VIPs:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang, role }) {
    switch (args[0]) {
      case "add":
      case "-a": {
    
        if (role < 3) return message.reply("⚠️ | You don't have permission to add VIPs.");

        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else if (event.messageReply)
            uids.push(event.messageReply.senderID);
          else
            uids = args.filter(arg => !isNaN(arg));

          const notVipIds = [];
          const vipIds = [];
          for (const uid of uids) {
            if (config.vipuser.includes(uid))
              vipIds.push(uid);
            else
              notVipIds.push(uid);
          }

          config.vipuser.push(...notVipIds);
          const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (notVipIds.length > 0 ? getLang("added", notVipIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (vipIds.length > 0 ? getLang("alreadyVip", vipIds.length, vipIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdAdd"));
      }

      case "remove":
      case "-r": {
        
        if (role < 3) return message.reply("⚠️ | You don't have permission to remove VIPs.");

        if (args[1]) {
          let uids = [];
          if (Object.keys(event.mentions).length > 0)
            uids = Object.keys(event.mentions);
          else
            uids = args.filter(arg => !isNaN(arg));

          const notVipIds = [];
          const vipIds = [];
          for (const uid of uids) {
            if (config.vipuser.includes(uid))
              vipIds.push(uid);
            else
              notVipIds.push(uid);
          }

          for (const uid of vipIds)
            config.vipuser.splice(config.vipuser.indexOf(uid), 1);

          const getNames = await Promise.all(vipIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
          writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
          return message.reply(
            (vipIds.length > 0 ? getLang("removed", vipIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
            + (notVipIds.length > 0 ? getLang("notVip", notVipIds.length, notVipIds.map(uid => `• ${uid}`).join("\n")) : "")
          );
        }
        else
          return message.reply(getLang("missingIdRemove"));
      }

      case "list":
      case "-l": {
    
        if (config.vipuser.length === 0)
          return message.reply("⚠️ | No VIP users found");
        const getNames = await Promise.all(config.vipuser.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
        return message.reply(getLang("listVip", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
      }

      default:
        return message.SyntaxError();
    }
  }
};
