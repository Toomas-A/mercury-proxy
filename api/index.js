const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const articleUrl = req.query.url;

  if (!articleUrl) {
    return res.status(400).send('Missing required "url" query parameter');
  }

  try {
    const { data } = await axios.get(articleUrl);
    const $ = cheerio.load(data);

    const articleText = $('.entry-content').text();

    if (articleText) {
      res.status(200).send(articleText);
    } else {
      res.status(404).send('Could not extract text from the URL');
    }
  } catch (error) {
    console.error('Parsing failed:', error);
    res.status(500).send('Failed to parse the provided URL');
  }
};
