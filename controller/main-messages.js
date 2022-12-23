const {
    messageModel,
} = require("../helper/index");

async function userSettings(ctx) {
    const queryProps = await messageModel.settings(ctx);
    return await ctx.reply(queryProps.text, queryProps)
};
module.exports = {
    userSettings
}