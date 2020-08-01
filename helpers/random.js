const axios = require("axios")

exports.random = async () => {

    try {
        let result = await axios.get(`https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&maxLength=-1&api_key=${process.env.WORDNIK_TOKEN}`)
        return result;
    } catch (error) {
        console.log(error);
    }
}