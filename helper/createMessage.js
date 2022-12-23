const {
  Markup,
  Telegraf
} = require("telegraf");
require('dotenv').config()

const userDb = require("../controller/userDatabase.js")
const fileDb = require("../controller/fileDatabase.js");
const apiModel = require("./apiRequestPost.js")
const bot = new Telegraf(process.env.BOT_TOKEN);

// createDefault value
let reUserId = null;
let reFullName = null;
let reUsername = null;

async function helloUser(ctx, userId, fullName, notHello = false, text = null) {
  const userKeyboard = Markup
    .keyboard([
      ['📗 Testlar'],
      ["⚙️ Sozlamalar"]
    ]).resize();
  if (notHello == true) {
    return await ctx.reply(text, userKeyboard)
  }
  return await ctx.replyWithHTML(`<a href='tg://user?id=${userId}'>${fullName}</a>, botga xush kelibsiz!`, userKeyboard)
}

async function checkUser(status = false, ctx = null, phoneNumber = null, userId = null, fullName = null, username = null) {
  if (status == false) {
    reUserId = userId;
    reFullName = fullName;
    reUsername = username;
  }
  if (status == true) {
    await userDb.addUser(reUserId, reFullName, phoneNumber, reUsername);
    helloUser(ctx, reUserId, reFullName);
  }
}

async function settings(ctx) {
  const userId = ctx.message.from.id;
  let user = await userDb.findUser(userId);

  const message = `🛠️ Sozlamalar:
├ Ism-familiya: <code>${user.fullName}</code>
└ Telefon-raqam: <code>${user.phoneNumber}</code>`;

  const queryProps = {
    text: message,
    disable_web_page_preview: true,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Ism-familiyani o'zgartirish", 'changeUserName')],
      [Markup.button.callback("Bot yaratuvchisi bilan bog'lanish", 'connectWithCoder')],
    ]).resize()
  };

  return queryProps;
};

async function checkUserStatus(userId) {
  const userStatus = await bot.telegram.getChatMember('-100' + process.env.CHANNEL_ID, userId)

  if (userStatus && userStatus.status != 'left' || userId == process.env.ADMIN_ID) return false

  const message = "❌ Kechirasiz botdan foydalanish uchun quyidagi kanalga a'zo bolishingizni so'raymiz."

  await bot.telegram.sendMessage(userId, message, {
    reply_markup: {
      inline_keyboard: [
        [{
          text: "Kanal",
          url: `https://t.me/${process.env.CHANNEL_NAME}`
        }],
        [{
          text: "✅ Tekshirish",
          callback_data: 'checkSubscription'
        }]
      ]
    }
  })

  return true
}
async function createTestFile(ctx, subjectName, file_status) {
  bot.telegram.sendMessage(ctx.message.chat.id, "🗂 Test faylini yuboring (faqat fayl shaklda va bitta fayl)", {
    reply_markup: {
      force_reply: true
    }
  })
  file_status = true
  return file_status
}

async function sendScreenToAdmin(msg, user) {
  const message = `Test nomi: ${user.pending_subject_name}
Testni sotib oluvchi: <a href='tg://user?id=${user.userId}'>${user.fullName}</a>
Testning narxi: ${user.pending_file_price}
`
console.log(message);
  const data = {
    caption: message,
    photo: msg.photo[0].file_id,
    chat_id: '-100' + process.env.SCREEN_GROUP_ID,
    reply_markup: {
      inline_keyboard: [
        [{
          text: "✅ Tasdiqlash",
          callback_data: `confirmSendFile<>${user.userId}<>${user.pending_subject_name}`
        }],
        [{
          text: "❌ Bekor qilish",
          callback_data: `rejectSendFile<>${user.userId}<>${user.pending_subject_name}`
        }]
      ],
    },
    parse_mode: 'HTML'
  }
  const data2 = {
    caption: message,
    photo: msg.photo[0].file_id,
    chat_id: '-825050431',
    reply_markup: {
      inline_keyboard: [
        [{
          text: "✅ Tasdiqlash",
          callback_data: `confirmSendFile<>${user.userId}<>${user.pending_subject_name}`
        }],
        [{
          text: "❌ Bekor qilish",
          callback_data: `rejectSendFile<>${user.userId}<>${user.pending_subject_name}`
        }]
      ],
    },
    parse_mode: 'HTML'
  }
  const result = await apiModel.apiRequestPOST(data, "sendPhoto")
}
module.exports = {
  helloUser,
  checkUser,
  settings,
  checkUserStatus,
  createTestFile,
  sendScreenToAdmin,
}