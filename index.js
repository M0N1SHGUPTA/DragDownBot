const express = require("express");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();


const BOT_TOKEN = process.env.bot_token;
const RAPIDAPI_KEY = process.env.rapid_api_key;
const RENDER_URL = process.env.render_url;
const bot = new TelegramBot(BOT_TOKEN);
bot.setWebHook(`${RENDER_URL}/webhook`);

app.post("/webhook", (req, res)=>{
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/', (req, res)=>{
    res.send("Bot is running...");
});



// API FETCHES the URL from rapid api video downloader api
async function fetchMedia(PintrestUrl){
    const options = {
        method: "POST",
        url: 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink', headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
            'Content-Type': 'application/json'
        },
        data: {
            url : PintrestUrl
        }
    };
    const response = await axios.request(options);
    return response.data.medias[0].url;
}


// async function main(){
//     const data = await fetchMedia("https://in.pinterest.com/pin/916904805404482524/");
//     console.log(data);
// }
// main();

// Bot sends reply with the link of the video url

bot.on("message", async (msg)=>{
    const chatId = msg.chat.id;
    const text = msg.text;

    //ignore if its not a url
    if(!text.startsWith("http")){
        bot.sendMessage(chatId, "❌ Could not download. Make sure it's a valid link.");
        return;
    };

    try{
        await bot.sendMessage(chatId, "⏳ Fetching media...");
        const mediaUrl = await fetchMedia(text);
        await bot.sendVideo(chatId, mediaUrl);
    } catch(err){
        await bot.sendMessage(chatId, "❌ Could not download. Make sure it's a valid link.");
        console.log(err.message);
    }
});

app.listen(3000, ()=>{
    console.log("bot is running on webhook mode!);
});
