const Mercury = require('@postlight/mercury-parser');

exports.handler = async (event) => {
  const articleUrl = event.queryStringParameters.url;

  if (!articleUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required "url" query parameter' }),
    };
  }

  try {
    const result = await Mercury.parse(articleUrl);

    if (result && result.text) {
      return {
        statusCode: 200,
        body: result.text,
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Could not extract text from the URL' }),
      };
    }
  } catch (error) {
    console.error('Parsing failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to parse the provided URL' }),
    };
  }
};
