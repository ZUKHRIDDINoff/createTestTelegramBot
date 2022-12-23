const axios = require("axios");
require('dotenv').config()

exports.apiRequestPOST = async(data, method) => {
    const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}`;
    console.log(2,data);
    console.log(3,url);
    try {
        const response = await axios.post(url, data);

        const responseData = response.data;

        return (responseData && responseData.result) || responseData;
    } catch (err) {
        return { message_id: 0, error: err };
    }
}
