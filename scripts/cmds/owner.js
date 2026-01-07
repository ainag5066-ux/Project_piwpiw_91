const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
config: {
name: "owner",
author: "♡︎ 𝗦𝗵𝗔𝗻 ♡︎",
role: 0,
shortDescription: " ",
longDescription: "",
category: "admin",
guide: "{pn}"
},

onStart: async function ({ api, event }) {
try {
const ownerInfo = {
name: '𝗠𝗲𝗵𝗲𝗱𝗶 𝗛𝗮𝘀𝗮𝗻 ',
gender: '𝑴𝒂𝑳𝒆',
Birthday: '𝟭𝟯-𝟎𝟕-𝟐𝟎𝟎7',
religion: '𝗔𝗹𝗵𝗮𝗺𝗱𝘂𝗹𝗶𝗹𝗮𝗵 𝗠𝘂𝘀𝗹𝗶𝗺',
hobby: '𝗣𝗿𝗶𝗼𝗺𝗮𝗻𝘂𝘀𝗵 𝗸𝗲 𝗣𝗮𝘄𝗮 𝗦𝗮𝗿𝗮𝗷𝗶𝗯𝗼𝗻𝗲𝗿 𝗷𝗼𝗻𝗻𝗼',
Wp: '𝗧𝗵𝗮𝗽𝗽𝗼𝗿 𝗗𝗶𝘆𝗮 𝗸𝗶𝗱𝗻𝘆 𝗹𝗼𝗰𝗸 𝗸𝗼𝗿𝗲 𝗱𝗶𝗯𝗼 𝗰𝗮𝗶𝗹𝗲',
Relationship: '𝗔𝗹𝗵𝗮𝗺𝗱𝘂𝗹𝗶𝗹𝗹𝗮𝗵 𝗠𝗶𝗻𝗴𝗲𝗹🌺',
Height: '𝟱"𝟵'
};

const bold = 'https://drive.google.com/uc?export=download&id=1J4yQ13L2WTpdOuqcP0yEmzULACdwfvnQ';
const tmpFolderPath = path.join(__dirname, 'tmp');

if (!fs.existsSync(tmpFolderPath)) {
fs.mkdirSync(tmpFolderPath);
}

const videoResponse = await axios.get(bold, { responseType: 'arraybuffer' });
const videoPath = path.join(tmpFolderPath, 'owner_video.mp4');

fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

const response = `
◈ 𝖮𝖶𝖭𝖤𝖱 𝖨𝖭𝖥𝖮𝖱𝖬𝖠𝖳𝖨𝖮𝖭:\n
~Name: ${ownerInfo.name}
~Gender: ${ownerInfo.gender}
~Birthday: ${ownerInfo.Birthday}
~Religion: ${ownerInfo.religion}
~Relationship: ${ownerInfo.Relationship}
~Hobby: ${ownerInfo.hobby}
~Wp: ${ownerInfo.Wp}
~Height: ${ownerInfo.Height}
`;

await api.sendMessage({
body: response,
attachment: fs.createReadStream(videoPath)
}, event.threadID, event.messageID);

fs.unlinkSync(videoPath);

api.setMessageReaction('😍', event.messageID, (err) => {}, true);
} catch (error) {
console.error('Error in ownerinfo command:', error);
return api.sendMessage('An error occurred while processing the command.', event.threadID);
}
},

onChat: async function ({ api, event }) {
if (event.body && event.body.toLowerCase() === "owner") {
this.onStart({ api, event });
}
}
};
