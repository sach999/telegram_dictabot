const dotenv = require('dotenv').config({ path: "./config.env" })
let express = require("express");
let app = express();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const cron = require('node-cron');

const { subscribe, unsubscribe, fetchData } = require("./helpers/wordperday")
const { meaning } = require("./helpers/meaning")
const { random } = require("./helpers/random")

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const helpMessage = "-->Don't know the meaning of a word that your friend just sent?😕 It's alright, just type /word followed by the meaning of the word you are looking for. Eg., /word banana\n\n-->Playing Pictionary or Dumb-charades?🤭 Get a random word using /random\n\n-->Subscribe to my Word for the day using /subscribe😋\n\n-->Use /help to get this dialog box anytime\n\n Have a nice dayy!!!😁";



//Schedule messages for subscribers
cron.schedule('0 9 * * *', async () => {
    let res = await fetchData();
    let message = res[0];
    let users = res[1];

    //get the word and its meaning
    let word = message.word;
    let partOfSpeech = message.definitions[0].partOfSpeech;
    let meaning = message.definitions[0].text;

    //send to subscribed users
    users.forEach(async (user) => {
        // console.log(user.data());
        await bot.sendMessage(user.data().chatId, `<u>Word of the Day</u>\n<b>${word}</b>\n<i>${partOfSpeech}</i>\n\n${meaning}\n\nIf you feel I'm annoying hit /unsubscribe 😥`, { parse_mode: 'HTML' })
    })
});


//Invoked when a user joins
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        "Hello There!!😋😋\nWelcome, <b>DICTABOT</b> is here for you\n\n" + helpMessage,
        { parse_mode: 'HTML', }
    );
})



//help
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        helpMessage,
        { parse_mode: 'HTML', }
    );
})


//Get meaning of a word
bot.onText(/\/word (.+)/, async (msg, match) => {

    let result = await meaning(match[1]);
    if (result === null) {
        bot.sendMessage(msg.chat.id, "Something went wrong, try again or check your spellings.");
        bot.sendMessage(msg.chat.id, "If you require any help or wanna know what I can do, type /help 😋");
    } else {
        // console.log(result.data)
        let type = result.data.definitions[0].type;
        let meaning = result.data.definitions[0].definition;
        let example = result.data.definitions[0].example;
        let imageUrl = result.data.definitions[0].image_url;
        bot.sendMessage(msg.chat.id, `<b>${match[1]}</b>\n<i>${type}</i>\n\nMeaning : ${meaning} \n\nExample : ${example}`, { parse_mode: 'HTML' });
        if (imageUrl != null) {
            bot.sendPhoto(msg.chat.id, imageUrl);
        }
    }

})




//Get a random word
bot.onText(/\/random/, async (msg) => {
    let result = await random();
    // console.log(result.data);
    bot.sendMessage(msg.chat.id, result.data.word);
    bot.sendMessage(msg.chat.id, "If you require any help or wanna know what I can do, type /help 😋");
})


//unsubscribe
bot.onText(/\/unsubscribe/, async (msg) => {
    const res = await unsubscribe(msg);
    bot.sendMessage(msg.chat.id, "You have been unsubscribed.😭\nFeel free to subscribe again using /subscribe")
});


//subscribe
bot.onText(/\/subscribe/, async (msg) => {
    // console.log("Subscribe")
    const res = await subscribe(msg);
    bot.sendMessage(msg.chat.id, "Congo!! You have been subscribed successfully!!🤩")
});


//default message
bot.on("message", (msg) => {
    if (msg.entities === undefined && msg.chat.type === "private") {
        bot.sendMessage(msg.chat.id, `Hi ${msg.chat.first_name} 😋\n\nHit /help if you need any help!!`)
    }
})


// bot.onText(/\/test/, async (msg) => {
//     let res = await fetchData();
//     let message = res[0];
//     let users = res[1];
//     // console.log(message);
//     let word = message.word;
//     let partOfSpeech = message.definitions[0].partOfSpeech;
//     let meaning = message.definitions[0].text;

//     users.forEach(async (user) => {
//         // console.log(user.data());
//         await bot.sendMessage(user.data().chatId, `<u>Word of the Day</u>\n<b>${word}</b>\n<i>${partOfSpeech}</i>\n\n${meaning}\n\nIf you feel I'm annoying hit /unsubscribe 😥`, { parse_mode: 'HTML' })
//     })
// })

//debugging
bot.on("polling_error", (err) => console.log(err));


//Run server
app.listen(process.env.PORT || 3000, () => {
    console.log("Telegram bot running")
})