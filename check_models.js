require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    const fetch = require('node-fetch'); // we can also just use axios which is in package.json
  } catch(e) {}
  
  const axios = require('axios');
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    console.log("AVAILABLE MODELS:");
    res.data.models.forEach(m => {
        if(m.name.includes("flash")) {
            console.log(m.name, "-> Supported Methods:", m.supportedGenerationMethods);
        }
    });
  } catch(err) {
      console.error("Error fetching models:", err.message);
  }
}

checkModels();
