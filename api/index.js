const axios = require('axios');
const cheerio = require('cheerio');

const selectors = {
  // Для runningshoesguru.com мы временно вернем весь HTML
  'www.runningshoesguru.com': { returnRawHtml: true }, 
  
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
    console.error('Missing URL parameter');
    return res.status(400).send('Missing required "url" query parameter');
  }

  try {
    const { hostname } = new URL(articleUrl);
    const config = selectors[hostname] || null; // Теперь config может быть объектом или строкой

    if (!config) {
      console.error(`No configuration found for domain: ${hostname}`);
      return res.status(404).send('No parser configuration found for this domain');
    }

    console.log(`Fetching content from ${articleUrl}`); // Убрали селектор из лога, так как для runningshoesguru.com его нет

    const { data } = await axios.get(articleUrl, {
      timeout: 15000, 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Если для runningshoesguru.com установлено returnRawHtml: true, возвращаем весь HTML
    if (config.returnRawHtml) {
      console.log('Returning raw HTML for inspection.');
      console.log('First 500 chars of data:', data.substring(0, 500)); // Выводим первые 500 символов в логи
      res.setHeader('Content-Type', 'text/plain'); // Указываем браузеру отображать как обычный текст
      return res.status(200).send(data);
    }

    // Для остальных сайтов продолжаем парсить как обычно
    const $ = cheerio.load(data);
    let articleText = '';

    $(config).each((i, element) => { // Используем config напрямую, так как это селектор для остальных сайтов
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
