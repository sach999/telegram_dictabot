const axios = require("axios")

exports.meaning = async (word) => {
    try {
        let result = await axios.get(`https://owlbot.info/api/v4/dictionary/${word}`, {
            headers: {
                'Authorization': `token ${process.env.OWL_TOKEN}`
            }
        });
        return result
    } catch (error) {
        // console.log(error);
        return null;
    }
}