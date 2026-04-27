const express = require('express');
const cors = require('cors');
const YTDlpWrap = require('yt-dlp-wrap').default;
const app = express();

app.use(cors());

const ytDlp = new YTDlpWrap('./yt-dlp');

app.get('/audio', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'videoId required' });
  try {
    const info = await ytDlp.getVideoInfo(
      `https://www.youtube.com/watch?v=${videoId}`
    );
    // Найти лучший аудио формат
    const format = info.formats
      .filter((f) => f.acodec !== 'none' && f.vcodec === 'none')
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    if (!format) return res.status(404).json({ error: 'No audio format found' });

    res.json({ url: format.url, mimeType: format.ext });
  } catch (e) {
    res.status(500).json({ error: 'Failed', details: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3000, () => {
  console.log('AUEN Proxy running!');
});