const {
  Telegraf
} = require('telegraf');
require('dotenv').config()

const db = require('./userDatabase.js')

const bot = new Telegraf(process.env.BOT_TOKEN);

exports.getAllUsers = async ctx => {
  if (ctx.message.from.id != process.env.ADMIN_ID) {
    return ctx.reply("❌ Sizning adminlik ruxsatingiz yo'q")
  }
  let users = await db.getAllUsers();
  users = JSON.stringify(users, null, 2);

  bot.telegram.sendMessage(ctx.message.chat.id, users, {
    reply_markup: {
      hide_keyboard: true,
    }
  })
}
exports.createTest = async (ctx) => {
  if (ctx.message.from.id != process.env.ADMIN_ID) {
    return ctx.reply("Sizning adminlik ruxsatingiz yo'q")
  }

  const message = "📒 Yangi fan nomini kiriting!"
  bot.telegram.sendMessage(ctx.message.from.id, message, {
    reply_markup: {
      force_reply: true
    }
  })
}
exports.createTestPrice = async ctx => {
  const message = "Test narxini kiriting. Misol: 15 000 so'm yoki 15 ming so'm";
  bot.telegram.sendMessage(ctx.message.chat.id, message, {
    reply_markup: {
      force_reply: true
    }
  })
}









