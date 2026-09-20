import express from 'express';
import cors from 'cors';
import fetchAnimeHandler from './handlers/fetch-anime.js';
import previewHandler from './handlers/preview.js';

const app = express();
const PORT = process.env.PORT || 3210;

app.use(cors());
app.use(express.json({ limit: '20mb' })); // 预览带 base64 图片

app.get('/api/fetch-anime', (req, res) => fetchAnimeHandler(req, res));
app.post('/api/preview', (req, res) => previewHandler(req, res));
app.get('/api/health', (_, res) => res.send('ok'));

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Anime API listening on 127.0.0.1:${PORT}`);
});