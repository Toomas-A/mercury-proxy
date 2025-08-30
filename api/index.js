const axios = require('axios');
const cheerio = require('cheerio');

const selectors = {
  // НОВЫЙ, простой селектор для runningshoesguru.com
  // Нацелен только на все параграфы на странице.
  'www.runningshoesguru.com': 'p', 
  
  // Селектор для believeintherun.com - пока оставим
  'believeintherun.com': '.entry-content', 
  
  // Селектор для doctorsofrunning.com - пока оставим
  'www.doctorsofrunning.com': '.post-content', 

  // Сайты, которые уже работали с этими селекторами
  'www.roadtrailrun.com': '.post-body',
  'weartesters.com': '.entry-content',
  'www.runnersworld.com': '.article-body',
  'www.irunfar.com': '.entry-content',
};

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (iPad; CPU OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/83.0.4103.88 Mobile/15E148 Safari/604.1',
];

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

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const requestHeaders = {
      'User-Agent': randomUserAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/',
      'DNT': '1', 
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
    };

    const { data } = await axios.get(articleUrl, {
      timeout: 15000, 
      headers: requestHeaders,
    });

    const $ = cheerio.load(data);
    let articleText = '';

    // Перебираем найденные элементы, чтобы собрать весь текст
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
