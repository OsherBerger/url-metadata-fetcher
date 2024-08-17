// backend/index.js
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');  // Import the cors package
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Security middleware
app.use(helmet());

// Enable CORS for all routes
app.use(cors());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // limit each IP to 5 requests per second
});
app.use(limiter);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/fetch-metadata', async (req, res) => {
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid input. Expecting an array of URLs.' });
  }

  const results = [];

  for (const url of urls) {
    try {
      const response = await axios.get(url);

      if (response.status !== 200) {
        results.push({ url, error: `Failed to fetch metadata. Status code: ${response.status}` });
        continue;
      }

      const html = response.data;
      const $ = cheerio.load(html);

      const title = $('head > title').text();
      const description = $('meta[name="description"]').attr('content');
      const image = $('meta[property="og:image"]').attr('content');

      results.push({ url, title, description, image });
    } catch (error) {
      console.error(`Error fetching metadata for ${url}:`, error.message);
      results.push({ url, error: error.message || 'Could not retrieve metadata.' });
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server.');
  server.close(() => {
    console.log('Server closed.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing server.');
  server.close(() => {
    console.log('Server closed.');
  });
});
