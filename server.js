const express = require('express');
const cors = require('cors');
const fs = require('fs');
const YTDlpWrap = require('yt-dlp-wrap').default;

const app = express();
app.use(cors());

// Записать cookies из env переменной в файл при старте
if (process.env.COOKIES_CONTENT) {
  fs.writeFileSync('./cookies.txt', process.env.COOKIES_CONTENT);
  console.log('Cookies written from environment variable');
}

const ytDlp = new YTDlpWrap('./yt-dlp');

// GET /audio?videoId=xxxx
app.get('/audio', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });

  try {
    const args = ['--dump-json', '-f', 'bestaudio'];

    // Использовать cookies если есть
    if (fs.existsSync('./cookies.txt')) {
      args.push('--cookies', './cookies.txt');
    }

    const info = await ytDlp.getVideoInfo(
      `https://www.youtube.com/watch?v=${videoId}`,
      args
    );

    // Найти лучший аудио формат
    const format = info.formats
      ? info.formats
          .filter((f) => f.acodec !== 'none' && f.vcodec === 'none')
          .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0]
      : info;

    if (!format || !format.url) {
      return res.status(404).json({ error: 'No audio format found' });
    }

    res.json({ url: format.url, mimeType: format.ext || 'm4a' });
  } catch (e) {
    res.status(500).json({ error: 'Failed', details: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3000, () => {
  console.log('AUEN Proxy running!');
});