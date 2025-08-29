const axios = require('axios');
const cheerio = require('cheerio');

const selectors = {
  // НОВЫЙ, БОЛЕЕ СПЕЦИФИЧНЫЙ селектор для runningshoesguru.com
  'www.runningshoesguru.com': '.main-content-wrapper div.elementor-widget-container', 
  
  // Селектор для believeintherun.com - пока оставим, но проверим позже
  'believeintherun.com': '.entry-content', 
  
  // Селектор для doctorsofrunning.com - пока оставим, но проверим позже
  'www.doctorsofrunning.com': '.post-content', 

  // Сайты, которые уже работали с этими селекторами
  'www.roadtrailrun.com': '.post-body',
  'weartesters.com': '.entry-content',
  'www.runnersworld.com': '.article-body',
  'www.irunfar.com': '.entry-content',
};

module.exports = async (req, res) => {
  const articleUrl = req.query.url;

  if (!articleUrl) {
    console.error('Missing URL parameter');
    return res.status(400).send('Missing required "url" query parameter');
  }

  try {
    const { hostname } = new URL(articleUrl);
    const selector = selectors[hostname] || null;

    if (!selector) {
      console.error(`No selector found for domain: ${hostname}`);
      return res.status(404).send('No selector found for this domain');
    }

    console.log(`Fetching content from ${articleUrl} with selector ${selector}`);

    const { data } = await axios.get(articleUrl, {
      timeout: 15000, 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    let articleText = '';

    $(selector).each((i, element) => {
      articleText += $(element).text().trim() + '\n\n'; 
    });

    if (articleText.trim()) {
      console.log('Successfully extracted article text.');
      res.status(200).send(articleText.trim());
    } else {
      console.log('Extracted text is empty. Selector might be wrong or content not found.');
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
