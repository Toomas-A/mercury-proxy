const axios = require('axios');
const cheerio = require('cheerio');
const playwright = require('playwright'); // Новая зависимость: Playwright

const selectors = {
  // Сайты, которые должны работать с cheerio
  'believeintherun.com': '.entry-content', 
  'www.roadtrailrun.com': '.post-body',
  'weartesters.com': '.entry-content',
  'www.runnersworld.com': '.article-body',
  'www.irunfar.com': '.entry-content',
  'www.doctorsofrunning.com': '.post-content',

  // Сайт, требующий Playwright
  'www.runningshoesguru.com': {
    usePlaywright: true,
    selector: '.entry-content' // Упрощенный и более прямой селектор для Playwright
  },
};

module.exports = async (req, res) => {
  const articleUrl = req.query.url;

  if (!articleUrl) {
    console.error('Missing URL parameter');
    return res.status(400).send('Missing required "url" query parameter');
  }

  try {
    const { hostname } = new URL(articleUrl);
    const config = selectors[hostname] || null;

    if (!config) {
      console.error(`No configuration found for domain: ${hostname}`);
      return res.status(404).send('No parser configuration found for this domain');
    }

    let articleText = '';

    if (config.usePlaywright) {
      console.log(`Using Playwright for ${hostname} with selector ${config.selector}`);
      let browser;
      try {
        browser = await playwright.chromium.launch(); // Запускаем браузер Chromium
        const page = await browser.newPage();
        await page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }); // Увеличиваем таймаут для Playwright

        // Ждем, пока селектор появится на странице
        await page.waitForSelector(config.selector, { timeout: 15000 });

        // Извлекаем текст из главного элемента статьи
        articleText = await page.$eval(config.selector, (element) => element.textContent);

      } catch (pwError) {
        console.error('Playwright failed:', pwError.message);
        return res.status(500).send(`Failed to parse with Playwright: ${pwError.message}`);
      } finally {
        if (browser) {
          await browser.close();
        }
      }

    } else { // Используем axios и cheerio для других сайтов
      console.log(`Using Axios/Cheerio for ${hostname} with selector ${config}`);
      const { data } = await axios.get(articleUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(data);
      $(config).each((i, element) => {
        articleText += $(element).text() + '\n\n';
      });
    }

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
