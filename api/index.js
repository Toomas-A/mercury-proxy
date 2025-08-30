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

module.exports = async (req, res) => {
  const articleUrl = req.query.url;

  if (!articleUrl) {
    return res.status(400).send('Missing required "url" query parameter');
  }

  try {
    const { hostname } = new URL(articleUrl);
    const selector = selectors[hostname] || null;

    if (!selector) {
      return res.status(404).send('No selector found for this domain');
    }

    const { data } = await axios.get(articleUrl);
    const $ = cheerio.load(data);
    let articleText = '';

    $(selector).each((i, element) => {
      articleText += $(element).text() + '\n\n';
    });

    if (articleText.trim()) {
      res.status(200).send(articleText.trim());
    } else {
      res.status(404).send('Could not extract text from the URL');
    }
  } catch (error) {
    res.status(500).send('Failed to parse the provided URL');
  }
};
