const {
  Telegraf,
  Markup,
} = require('telegraf');

const Sequelize = require("sequelize");
const userDb = require("./controller/userDatabase.js")
const MainMessage = require('./controller/main-messages.js')
const fileDb = require("./controller/fileDatabase.js")
const Commands = require('./controller/adminCommands.js')
require('dotenv').config()

const {
  apiModel,
  messageModel,
} = require("./helper/index");

// const app = express();

const bot = new Telegraf(process.env.BOT_TOKEN);

// connect with database
new Sequelize(
  'institute_Bot',
  'root',
  'Password123!', {
    logging: false,
    host: 'localhost',
    dialect: 'mysql',
  }
);

let subjectName = null;
let price_file = 1;
let file_status = false;

const keyboard = Markup
      .keyboard([
        ['📝 Test yaratish'],
        ["📚 Testlarni ko'rish"],
        ["🗑 Testni o'chirish"]
      ]).resize();

bot.command('start', async ctx => {
  // check user not admin
  if (ctx.message.from.id == process.env.ADMIN_ID) {
    return ctx.reply(`📝 createTest - Yangi test yaratish\n📚 Testlarni ko'rish - Barcha testlarni ko'rish\n🗑 Testni o'chirish - Testni o'chirish`, keyboard)
  };

  // check User subscription to channel
  const result = await messageModel.checkUserStatus(ctx.message.from.id);
  if (result == true) return

  // check user already registered
  const user = await userDb.findUser(ctx.message.from.id)
  if (user && user.userId == ctx.message.from.id) {
    return messageModel.helloUser(ctx, user.userId, user.fullName)
  };
  registerUser(ctx.message.from.id)
})

// register part
async function registerUser(chatId) {
  await bot.telegram.sendMessage(chatId, "✏️ To'liq ism-familiyangizni kiriting!", {
    reply_markup: {
      force_reply: true,
    },
  });
}

// commands
// bot.hears('getAllUsers', ctx => Commands.getAllUsers(ctx))
bot.hears('📝 Test yaratish', ctx => Commands.createTest(ctx))
bot.hears("📚 Testlarni ko'rish", async ctx => {
  const files = await fileDb.getAllFiles();
  if(!files.length) {
    return ctx.reply("Testlar mavjud emas!", keyboard)
  }
  var options = {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: JSON.stringify({
      inline_keyboard: files.map(function (file) {
        return [{
          text: `${file.subjectName}`,
          callback_data: `a`,
        }];
      })
    })
  };
  ctx.reply("Mavjud testlar", options)
})

// hears
bot.hears('📗 Testlar', async (ctx) => {
  const files = await fileDb.getAllFiles();
  var options = {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: createCinemaListInlineKeyboardMarkup(files)
  };
  if(!files.length) {
    return ctx.reply("Testlar mavjud emas!")
  }
  ctx.reply("Testni tanlang", options)
});

function createCinemaListInlineKeyboardMarkup(files) {
  return JSON.stringify({
    inline_keyboard: files.map(function (file) {
      return [{
        text: `${file.subjectName}`,
        callback_data: `subjectNames<>${file.id}<>${file.chat_id}<>${file.text}<>${file.subjectName}`,
      }];
    })
  });
}

bot.hears('⚙️ Sozlamalar', async ctx => {
  // check User subscription to channel
  const result = await messageModel.checkUserStatus(ctx.message.from.id);
  if (result == true) return
  
  MainMessage.userSettings(ctx)
});

bot.hears("🗑 Testni o'chirish", async ctx => {
  ctx.reply("O'chirmoqchi bo'lgan testni nomini o'zidek kiriting!",{
    reply_markup: {
      force_reply: true
    }
  })
})

// actions
bot.action('changeUserName', async (ctx) => {
  // check User subscription to channel
  const result = await messageModel.checkUserStatus(ctx.chat.id);
  if (result == true) return

  await bot.telegram.sendMessage(ctx.chat.id, "✍️ Yangi ism-familiyangizni kiriting", {
    reply_markup: {
      force_reply: true,
    },
  });
});

// connect with coder
bot.action('connectWithCoder', async ctx => {
  ctx.replyWithHTML(`Salom ismim <a href='tg://user?id=${process.env.CODER_ID}'>${process.env.CODER_NAME}</a>, menga savollaringiz bo'lsa murojaat qilsangiz bo'ladi 🙂`)
})

bot.action('checkSubscription', async (ctx) => {
  const ctxMessage = ctx.update.callback_query;

  const userStatus = await bot.telegram.getChatMember('-100' + process.env.CHANNEL_ID, ctxMessage.from.id)

  if (userStatus && (userStatus.status == 'member' || userStatus.status == 'administrator' || userStatus.status == 'creator')) {
    try {
      await bot.telegram.deleteMessage(ctxMessage.message.chat.id, ctxMessage.message.message_id);
      const user = await userDb.findUser(userStatus.user.id);
  
      if (user && user.userId == userStatus.user.id) {
  
        return messageModel.helloUser(ctx, user.userId, user.fullName)
      } else {
        return registerUser(ctxMessage.from.id)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const text = "❌ Kechirasiz siz kanalga a'zo bo'lmadingiz. 🔰 Kanalga a'zo bo'lishingizni so'raymiz."
  const queryProps = {
    callback_query_id: ctxMessage.id,
    text,
    show_alert: true
  };

  await apiModel.apiRequestPOST(queryProps, "answerCallbackQuery")
})

bot.on("callback_query", async msg => {
  const data = msg.update.callback_query.data;
  const dataArray = data.split("<>")
  if (dataArray[0] == 'subjectNames') {
    return sendTestInfo(msg.update.callback_query.from.id, dataArray[1], dataArray[2], dataArray[3], dataArray[4])
  } else if (dataArray[0] == 'confirmSendFile') {
    try {
      const file = await fileDb.findFile(dataArray[2]);
      if (file) {
        const data = {
          document: file.file_id,
          chat_id: dataArray[1],
          caption: `✅ ${dataArray[2]} testi`,
        }
        await apiModel.apiRequestPOST(data, "sendDocument");
      }
      return bot.telegram.deleteMessage(msg.update.callback_query.message.chat.id, msg.update.callback_query.message.message_id)
    } catch (error) {
      console.log(error);
    }
  } else if (dataArray[0] == 'rejectSendFile') {
    try {
      await bot.telegram.sendMessage(dataArray[1], `❌ Siz ${dataArray[2]} testini sotib olish bo'yicha so'rovingiz rad etildi. Qaytadan urinib ko'ring`);

      return bot.telegram.deleteMessage(msg.update.callback_query.message.chat.id, msg.update.callback_query.message.message_id);
    } catch (error) {
      console.log(error);
    }
  }

});

async function sendTestInfo(userId, testId, chatId, text, subjectName) {
  const files = await fileDb.getAllFiles()

  files.map(async el => {
    if (el.id == testId && el.subjectName == subjectName) {
      await userDb.updatePendingFile(userId, el.file_id);
      await userDb.updatePendingPriceStatus(userId, true);
      await userDb.updatePendingSubjectName(userId, subjectName);
      await userDb.updatePendingFilePrice(userId, el.price_file)
      const message = `${subjectName} testini olish uchun ${process.env.CARD_NUMBER} karta raqamiga ${el.price_file} to'lov qilib, skrenshotini botga yuboring!`
      bot.telegram.sendMessage(userId, message, {
        reply_markup: {
          force_reply: true
        }
      })
    }
  })
}

bot.on('text', async (ctx) => {
  const lastMessage = ctx.message.reply_to_message;

  if (!lastMessage || lastMessage.from.is_bot == false) return

  if (lastMessage.text == "✍️ Yangi ism-familiyangizni kiriting") {
    const result = await userDb.changeUserName(ctx.message.from.id, ctx.message.text)
    if (result == 1) {
      const message = `✅ Ism o'zgardi: ${ctx.message.text}`
      return messageModel.helloUser(ctx, null, null, true, message)
    }
  } else if (lastMessage.text == "✏️ To'liq ism-familiyangizni kiriting!") {
    const fullName = ctx.message.text;
    const userId = ctx.message.from.id;
    const username = ctx.message.from.username ? ctx.message.from.username : null;

    await bot.telegram.sendMessage(ctx.chat.id, "Telefon raqamingizni yuboring! 👇", {
      reply_markup: {
        keyboard: [
          [{
            text: "📲 Telefon raqamni ulashish",
            request_contact: true,
          }, ],
        ],
        one_time_keyboard: true,
      }
    });
    return messageModel.checkUser(false, null, null, userId, fullName, username)
  } else if (lastMessage.text == "📒 Yangi fan nomini kiriting!") {
    const subject = await fileDb.findFile(ctx.message.text);
    if (subject) {
      const text = "❌ Kechirasiz bu nomdagi test allaqachon mavjud. Boshqa nom yozing!";
      await ctx.reply(text);
      return Commands.createTest(ctx)
    }
    subjectName = ctx.message.text
    Commands.createTestPrice(ctx)
  } else if (lastMessage.text == "Test narxini kiriting. Misol: 15 000 so'm yoki 15 ming so'm") {
    price_file = ctx.message.text
    await userDb.updatePendingFilePrice(ctx.message.from.id, price_file);
    file_status = await messageModel.createTestFile(ctx, subjectName, file_status);
  }
  else if(lastMessage.text == "O'chirmoqchi bo'lgan testni nomini o'zidek kiriting!") {
    const subject = ctx.message.text
    const result = await fileDb.deleteFile(subject);
    if(result){
      return ctx.reply(`✅ ${subject} testi muvaffaqiyatli o'chirildi!`, keyboard)
    }
    ctx.reply(`❌ ${subject} testini o'chirib bo'lmadi. Qaytadan to'g'ri urinib ko'ring!`, keyboard)
  } 
  else {
    const result = await messageModel.checkUserStatus(ctx.message.from.id);
    if (result == true) return
    return
  }
})
bot.on('contact', async (ctx) => {
  const lastMessage = ctx.message.reply_to_message;
  if (lastMessage && lastMessage.text == "Telefon raqamingizni yuboring! 👇" && lastMessage.from.is_bot == true) {
    let phoneNumber = ctx.message.contact.phone_number;
    return messageModel.checkUser(true, ctx, phoneNumber)
  }
})

bot.on('message', async ctx => {
  const lastMessage = ctx.message.reply_to_message;
  const user = await userDb.findUser(ctx.message.from.id)
  
  if (ctx.message.document && lastMessage &&  (lastMessage.text == "🗂 Test faylini yuboring (faqat fayl shaklda va bitta fayl)" || file_status == true)) {
    file_status = false;
    const caption = ctx.message.caption ? ctx.message.caption : null;
    
    const result = await fileDb.addFile(ctx.message.chat.id, ctx.message.document.file_id, caption, subjectName, price_file)
    if (result == 1) {
      return ctx.reply("✔️ Yangi test qo'shildi", keyboard)
    }
  } else if (ctx.message.photo && user && user.pending_price_status == true) {
    const userKeyboard = Markup
    .keyboard([
      ['📗 Testlar'],
      ["⚙️ Sozlamalar"]
    ]).resize();

    await userDb.updatePendingPriceStatus(ctx.message.from.id, false);

    ctx.reply("Skrenshotingiz adminga yuborildi, javobni kuting!", userKeyboard)
    return messageModel.sendScreenToAdmin(ctx.message, user);
  }
})

bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
