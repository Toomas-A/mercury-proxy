const axios = require('axios');
const cheerio = require('cheerio');

// Функция для диагностики селекторов на странице
async function debugSelectors(url) {
  console.log(`\n🔍 Debugging selectors for: ${url}`);
  
  try {
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.google.com/',
    };

    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: requestHeaders
    });

    const $ = cheerio.load(data);
    
    // Список потенциальных селекторов для поиска контента
    const testSelectors = [
      'article',
      'main',
      '.entry-content',
      '.post-content',
      '.article-content',
      '.article-body',
      '.post-body',
      '.content',
      '[class*="content"]',
      '[class*="article"]',
      '[class*="post"]',
      'p'
    ];
    
    console.log('\n📊 Selector Analysis:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const results = [];
    
    testSelectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        let totalText = '';
        elements.each((i, el) => {
          totalText += $(el).text().trim() + ' ';
        });
        
        results.push({
          selector,
          count: elements.length,
          textLength: totalText.trim().length,
          sample: totalText.trim().substring(0, 100)
        });
      }
    });
    
    // Сортируем по длине текста (самые содержательные сверху)
    results.sort((a, b) => b.textLength - a.textLength);
    
    results.forEach(result => {
      console.log(`${result.selector.padEnd(20)} | ${String(result.count).padEnd(5)} elements | ${String(result.textLength).padEnd(8)} chars | ${result.sample}...`);
    });
    
    console.log('\n💡 Recommendation:');
    if (results.length > 0) {
      const best = results[0];
      console.log(`Best selector appears to be: "${best.selector}" (${best.textLength} characters)`);
    } else {
      console.log('No suitable selectors found. The page might be heavily JavaScript-rendered.');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Использование: node debug-parser.js "URL"
const url = process.argv[2];
if (!url) {
  console.log('Usage: node debug-parser.js "URL"');
  console.log('Example: node debug-parser.js "https://www.runningshoesguru.com/some-article"');
} else {
  debugSelectors(url);
}
