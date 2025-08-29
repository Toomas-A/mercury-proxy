const Mercury = require('@postlight/mercury-parser');

exports.handler = async (event) => {
  // Получаем URL из параметров запроса.
  // Например, из запроса вида: your-function.netlify.app/.netlify/functions/parser?url=https://your-website.com
  const articleUrl = event.queryStringParameters.url;

  // Проверяем, был ли передан URL.
  if (!articleUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required "url" query parameter' }),
    };
  }

  try {
    // Используем Mercury Parser для извлечения основного контента статьи.
    const result = await Mercury.parse(articleUrl);
    
    // Возвращаем очищенный текст в качестве ответа.
    // Mercury также предоставляет поле `content` с HTML, но нам нужен только `text`.
    return {
      statusCode: 200,
      body: result.content,
    };
  } catch (error) {
    console.error('Parsing failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to parse the provided URL' }),
    };
  }
};
