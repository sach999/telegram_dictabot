const firebase = require("firebase");
const axios = require("axios")
const TelegramBot = require("node-telegram-bot-api");

const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGING_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MESUREMENT_ID
};

const app = firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();


//fetch subscribed users to send message
exports.fetchData = async () => {
    try {
        let message = await axios.get(`https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${process.env.WORDNIK_TOKEN}`);
        // console.log(message.data);
        let users = await db.collection('subscribers').get();
        return [message.data, users];
    } catch (error) {
        console.log(error);
    }

}

//unsubscribe
exports.unsubscribe = async (msg) => {
    try {
        const res = await db.collection('subscribers').doc(msg.chat.id.toString()).delete();
    } catch (error) {
        console.log(error);
    }
}

//subscribe
exports.subscribe = async (msg) => {
    // console.log(msg);
    try {
        const res = await db.collection('subscribers').doc(msg.chat.id.toString()).set({
            userName: msg.chat.first_name,
            chatId: msg.chat.id
        });
    } catch (error) {
        console.log(error);
    }

}
