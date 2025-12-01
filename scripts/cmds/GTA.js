const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "gta",
    aliases: [],
    author: "Kshitiz",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an gta art style image.",
    longDescription: "Generates an gta art style image.",
    category: "fun",
    guide: "{p}gta <prompt>",
  },
  onStart: async function ({ message, args, api, event }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
      const prompt = args.join(" ");
      const lado = "https://gta-art.onrender.com/gen";

      const ladoResponse = await axios.get(lado, {
        params: {
          prompt: prompt
        },
        responseType: "json" 
      });

      const imageUrl = ladoResponse.data.url;

     
      const taodepResponse = await axios.get(
        "http://server.gamehosting.vn:25755/taoanhdep/lamnetanh?url=" + encodeURIComponent(imageUrl)
      );

      const finalImageUrl = taodepResponse.data.data;

    
      const imageResponse = await axios.get(finalImageUrl, {
        responseType: "arraybuffer"
      });

      const cacheFolderPath = path.join(__dirname, "/cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));

      const stream = fs.createReadStream(imagePath);
      message.reply({
        body: "",
        attachment: stream
      });
    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | Error while generating the image.");
    }
  }
};
