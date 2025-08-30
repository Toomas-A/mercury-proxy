const axios = require('axios');
const cheerio = require('cheerio');

const selectors = {
  // WORKING: A simple selector for runningshoesguru.com
  // It targets all paragraphs on the page
  'www.runningshoesguru.com': 'p', 
  
  // FIXED: Selector for believeintherun.com
  'believeintherun.com': '.pf-content p', 
  
  // FIXED: Selector for doctorsofrunning.com
  'www.doctorsofrunning.com': '.post-content p', 

  // FIXED: Selector for weartesters.com
  'weartesters.com': '.pf-content p',
  
  // FIXED: Selector for runnersworld.com
  'www.runnersworld.com': '.body-copy-01',

  // FIXED: Selector for irunfar.com
  'www.irunfar.com': '.post-content',

  // NOT WORKING: Selector for roadtrailrun.com - (blocked by Google)
  'www.roadtrailrun.com': '.post-body',
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
