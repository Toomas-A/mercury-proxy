const axios = require('axios');
const cheerio = require('cheerio');

const selectors = {
  'www.runningshoesguru.com': '.entry-content',
  'believeintherun.com': '.wysiwyg-wrapper',
  'www.roadtrailrun.com': '.post-body',
  'weartesters.com': '.entry-content',
  'www.runnersworld.com': '.article-body',
  'www.irunfar.com': '.entry-content',
  'www.doctorsofrunning.com': '.post-content',
};

module.exports = async (req, res) => {
  const articleUrl = req.query.url;

  if (!articleUrl) {
    return res.status(400).send('Missing required "url" query parameter');
  }

  try {
    const { data } = await axios.get(articleUrl);
    const $ = cheerio.load(data);

    const hostname = new URL(articleUrl).hostname;
    const selector = selectors[hostname] || null;

    if (!selector) {
      return res.status(404).send('No selector found for this domain');
    }

    const articleText = $(selector).text();

    if (articleText.trim()) {
      res.status(200).send(articleText.trim());
    } else {
      res.status(404).send('Could not extract text from the URL');
    }
  } catch (error) {
    console.error('Parsing failed:', error);
    res.status(500).send('Failed to parse the provided URL');
  }
};
