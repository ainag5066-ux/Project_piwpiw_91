// ... previous code remains unchanged

ctx.textAlign = "center";
ctx.shadowColor = "rgba(0,0,0,0.7)";
ctx.shadowBlur = 4;
const centerX = canvas.width / 2;
let currentY = canvas.height - overlayHeight + 40; // start inside overlay

// Main greeting
ctx.font = "bold 48px ModernoirBold"; // made bigger
ctx.fillStyle = "#ffffff";
ctx.fillText("ASSALAMUALAIKUM", centerX, currentY);

currentY += 50;
ctx.font = "bold 38px ModernoirBold"; // slightly bigger
ctx.fillStyle = "#ffea00";
if (displayUserName.length > 26) ctx.font = "bold 34px ModernoirBold";
ctx.fillText(displayUserName, centerX, currentY);

currentY += 45;
ctx.font = "bold 32px ModernoirBold"; // bigger for the welcome line
ctx.fillStyle = "#ffffff";
const line3Text = `Welcome to ${displayThreadName}`;
const maxWidth = canvas.width - 160;
const lineHeight = 36;
currentY = wrapText(ctx, line3Text, centerX, currentY, maxWidth, lineHeight);

// Member count
currentY += 40;
ctx.font = "bold 28px ModernoirBold";
ctx.fillStyle = "#00ffcc";
ctx.fillText(`You're the ${memberCount}th member of this group`, centerX, currentY);

// Add Owner info
currentY += 38;
ctx.font = "bold 28px ModernoirBold";
ctx.fillStyle = "#ff6666"; // red-ish for owner
ctx.fillText("Owner: Mehedi Hasan", centerX, currentY);

// ... continue with saving image and sending message
