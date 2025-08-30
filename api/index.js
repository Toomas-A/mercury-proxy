const axios = require('axios');
const Mercury = require('@postlight/mercury-parser');

module.exports = async (req, res) => {
  const articleUrl = req.query.url;

  if (!articleUrl) {
    return res.status(400).send('Missing required "url" query parameter');
  }

  try {
    const result = await Mercury.parse(articleUrl);
    
    if (result && result.content) {
      res.status(200).send(result.content);
    } else {
      res.status(404).send('Could not extract text from the URL');
    }
  } catch (error) {
    console.error('Parsing failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).send('Failed to parse the provided URL');
  }
};
