const express = require('express');
const fetch = require('node-fetch');
const Mercury = require('@postlight/mercury-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/parse', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const result = await Mercury.parse(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    res.json({
      title: result.title,
      content: result.content,
      textContent: result.content?.replace(/<[^>]+>/g, ''),
      lead_image_url: result.lead_image_url,
      date_published: result.date_published,
      url: result.url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Mercury parse failed' });
  }
});

app.get('/', (req, res) => {
  res.send('Mercury proxy is running');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
