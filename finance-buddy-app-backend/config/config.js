const config = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/bank-statements',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDWgPLEFJS991QbifcS-OFvYNx6zP3T9iU',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
  };
  
  export default config;
