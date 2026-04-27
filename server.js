const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
app.use(cors());

if (process.env.COOKIES_CONTENT) {
  fs.writeFileSync('./cookies.txt', process.env.COOKIES_CONTENT);
  console.log('Cookies written successfully');
}

app.get('/audio', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  try {
    const cookiesFlag = fs.existsSync('./cookies.txt')
      ? '--cookies ./cookies.txt'
      : '';

    const result = execSync(
      `./yt-dlp ${cookiesFlag} -f bestaudio -g "https://www.youtube.com/watch?v=${videoId}"`,
      { encoding: 'utf8', timeout: 30000 }
    ).trim();

    res.json({ url: result, mimeType: 'm4a' });
  } catch (e) {
    res.status(500).json({ error: 'Failed', details: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3000, () => {
  console.log('AUEN Proxy running!');
});