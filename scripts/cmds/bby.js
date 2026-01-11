const axios = require("axios");

const getAPIBase = async () => {
  const { data } = await axios.get(
    "https://raw.githubusercontent.com/EwrShAn25/ShAn.s-Api/refs/heads/main/Api.json"
  );
  return data.shan;
};

const cError = (api, threadID, messageID) =>
  api.sendMessage("SH AN er api off 🦆💨", threadID, messageID);

module.exports.config = {
  name: "bby",
  aliases: ["baby","bbu", "shan"],
  version: "1.6.9",
  author: "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
  role: 0,
  description: {
    en: "Talk with the bot or teach it new responses"
  },
  category: "talk",
  countDown: 3,
  guide: {
    en: `{p}{n} <text> - Ask the bot something\n{p}ShAn teach <ask> - <answer> - Teach the bot a new response\n\nExamples:\n1. {p}{n} Hello\n2. {p}ShAn teach hi - hello\n3. {p}ShAn delete <text> - Delete all answers related to text\n4. {p}ShAn delete <text> - <index> - Delete specific answer at index\n5. {p}ShAn edit <Ask> - <New Ask> to update the ask query\n6. {p}ShAn edit <ask> - <index> - <new ans> update specific answer at index`,
  },
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const { threadID, messageID, senderID } = event;
  const ShAn = await getAPIBase();
  if (!ShAn) return cError(api, threadID, messageID);
  
  
  if (args.length === 0) {
    return api.sendMessage("Please provide text or teach the bot!", threadID, messageID);
  }

  const input = args.slice(1).join(" ").trim();

  if (args[0] === 'teach' || args[0] === '-t') {
    try {
      const [ask, answers] = input.split(" - ").map(text => text.trim());
      if (!ask || !answers) {
        return api.sendMessage("Invalid format. Use: {pn} teach <ask> - <answer1, answer2, ...>", threadID, messageID);
      }

      const answerArray = answers.split(",").map(ans => ans.trim()).filter(ans => ans !== "");

      const res = await axios.get(
        `${ShAn}/ShAn-bteach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(answerArray.join(","))}&uid=${senderID}&font=3`
      );

      let msg = "";
      //if add rewards
    /*const reward = 5000;
    const userData = await usersData.get(senderID);
    const name = userData?.name || "User";*/

    switch (res.data?.status) {
      case "Already Exists":
        msg = res.data.ShAn;
        break;

      case "Partial Success":
        //await usersData.set(senderID, { ...userData, money: (userData.money || 0) + reward });
        msg = res.data.ShAn; /*+
                      `\n🎉 Hey ${name} you win 5k coins! 💰`*/
        break;

      case "Success":
        //await usersData.set(senderID, { ...userData, money: (userData.money || 0) + reward });
        msg = res.data.ShAn /*+
                      `🎉 Hey ${name} you win 5k coins! 💰`*/
        break;

      default:
        msg = res.data?.ShAn || "❌ Teaching failed.";
    }

    return api.sendMessage(msg, threadID, messageID);

  } catch (error) {
    return cError(api, threadID, messageID);
  }
} else if (args[0] === 'msg' || args[0] === '-m') {
    try {
      const res = await axios.get(
        `${ShAn}/ShAn-bmsg?ask=${encodeURIComponent(input)}&uid=${senderID}&font=3`
      );

      return api.sendMessage(`📜 Ask: ${res.data.ask}\n\n${res.data.ShAn}`, threadID, messageID);
    } catch {
      return cError(api, threadID, messageID);
    }
  } else if (args[0] === 'list' || args[0] === '-l') {
    try {
      const res = await axios.get(
        `${ShAn}/ShAn-blist?font=3`
      );

      return api.sendMessage(res.data.ShAn, threadID, messageID);
    } catch {
      return cError(api, threadID, messageID);
    }
  } else if (args[0] === 'edit' || args[0] === '-e') {
    try {
      const parts = input.split(" - ").map(part => part.trim());

      if (parts.length < 2) {
        return api.sendMessage("Invalid format. Use:\n1. {pn} edit <ask> - <newAsk>\n2. {pn} edit <ask> - <index> - <newAnswer>", threadID, messageID);
      }

      const [ask, newAskOrIndex, newAns] = parts;
      if (!isNaN(newAskOrIndex) && newAns) {
        const index = parseInt(newAskOrIndex, 10);

        const res = await axios.get(
          `${ShAn}/ShAn-bedit?ask=${encodeURIComponent(ask)}&index=${index}&newAns=${encodeURIComponent(newAns)}&uid=${senderID}&font=3`
        );

        return api.sendMessage(res.data?.status === "Success"
          ? `✅ Successfully updated answer at index ${index} to: ${newAns}`
          : res.data?.ShAn || "❌ Failed to update the answer!", threadID, messageID);
      } else {
        const res = await axios.get(
          `${ShAn}/ShAn-bedit?ask=${encodeURIComponent(ask)}&newAsk=${encodeURIComponent(newAskOrIndex)}&uid=${senderID}&font=2`
        );

        return api.sendMessage(res.data?.status === "Success"
          ? `✅ Successfully updated question to: ${newAskOrIndex}`
          : res.data?.ShAn || "❌ Failed to update the question!", threadID, messageID);
      }
    } catch {
      return cError(api, threadID, messageID);
    }
  } else if (args[0] === 'remove' || args[0] === '-r' || args[0] === 'delete' || args[0] === '-d') {
    try {
      const parts = input.split(" - ").map(part => part.trim());

      if (!parts[0]) {
        return api.sendMessage("Invalid format. Use: {pn} delete <text> OR {pn} delete <text> - <index>", threadID, messageID);
      }

      const text = parts[0];
      const index = parts[1] && !isNaN(parts[1]) ? parseInt(parts[1], 10) : null;

      let url = `${ShAn}/ShAn-bdelete?text=${encodeURIComponent(text)}&uid=${senderID}&font=3`;
      if (index !== null) url += `&index=${index}`;

      const res = await axios.delete(url);

      return api.sendMessage(res.data?.status === "Success"
        ? `✅ Successfully deleted ${index !== null ? `answer at index ${index} of` : "all answers related to"}: ${text}`
        : res.data?.ShAn || "❌ Failed to delete the message!", threadID, messageID);
    } catch {
      return cError(api, threadID, messageID);
    }
  } else {
    try {
      const res = await axios.get(
        `${ShAn}/ShAn-bby?text=${encodeURIComponent(args.join(" "))}&uid=${senderID}&font=2`
      );
      const ans = res.data.ShAn;
      const react = res.data.react;

      return api.sendMessage(ans + react, threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "reply",
                messageID: info.messageID,
                author: senderID,
                ans
            });
        }, messageID);

    } catch {
      return cError(api, threadID, messageID);
    }
  }
};

module.exports.onChat = async ({ api, event }) => {
  const { threadID, messageID, body, senderID } = event;

  const cMessages = ["🎀 Hello bby!", "🎀 Hi there!", "🎀 Hey! How can I help?😝"];

  const userInput = body.toLowerCase().trim();
  const keywords = ["bby", "hii", "baby", "bot", "বট", "robot"];

  if (keywords.some((keyword) => userInput.startsWith(keyword))) {
    const isQuestion = userInput.split(" ").length > 1;
    if (isQuestion) {
      const question = userInput.slice(userInput.indexOf(" ") + 1).trim();

      try {
        const res = await axios.get(
          `${await getAPIBase()}/ShAn-bby?text=${encodeURIComponent(question)}&uid=${senderID}&font=2`
        );
        const ans = res.data.ShAn;
        const react = res.data.react;

        return api.sendMessage(ans + react, threadID, (error, info) => {
          if (!error) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: module.exports.config.name,
              type: "reply",
              author: senderID,
              ans
            });
          }
        }, messageID);
      } catch (error) {
        return cError(api, threadID, messageID);
      }
    } else {
      const rMsg = cMessages[Math.floor(Math.random() * cMessages.length)];
      
      return api.sendMessage(rMsg, threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            author: senderID
          });
        }
      }, messageID);
    }
  }
};

module.exports.onReply = async ({ api, event }) => {
  const { threadID, messageID, senderID, body } = event;

  try {
    if (senderID == api.getCurrentUserID()) return;

    if (event.type == "message_reply") {
      const res = await axios.get(
        `${await getAPIBase()}/ShAn-bby?text=${encodeURIComponent(body)}&uid=${senderID}&font=2`
      );
      const ans = res.data.ShAn;
      const react = res.data.react;

      return api.sendMessage(ans + react, threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            type: "reply",
            messageID: info.messageID,
            author: senderID,
            ans
          });
        }
      }, messageID);
    }
  } catch {
    return cError(api, threadID, messageID);
  }
};
