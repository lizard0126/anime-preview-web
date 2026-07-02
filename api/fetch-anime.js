import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const season = req.query.season || '202607';

    try {
        const response = await axios.get(`http://yuc.wiki/${season}/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                Referer: 'http://yuc.wiki/'
            },
            timeout: 30000
        });

        const html = response.data;
        const entries = html.match(/<!--#[A-C]\d+-->[\s\S]*?(?=<!--#[A-C]\d+-->|$)/g) || [];
        const animes = entries.map(entry => parseEntry(cheerio.load(entry))).filter(Boolean);

        res.status(200).json({ success: true, data: animes, count: animes.length });
    } catch (err) {
        res.status(200).json({ success: false, error: err.message });
    }
}

function parseEntry($) {
    const title = $('[class^="title_cn_r"]').first().text().trim();
    if (!title) return null;

    const subtitle = $('[class^="title_jp_r"]').first().text().trim() || '';
    const type = $('[class^="type_"]').first().text().trim() || '';

    const tags = [];
    $('[class^="type_tag"]').each((_, el) => {
        const t = $(el).text().trim();
        if (t) {
            t.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed) tags.push(trimmed);
            });
        }
    });

    let visual = '';
    $('img[data-src]').first().each((_, el) => {
        visual = $(el).attr('data-src') || '';
    });

    let staff = '';
    $('[class^="staff_r"]').first().each((_, el) => {
        staff = $(el).html() || '';
        staff = staff.replace(/\s*<br\s*\/?>\s*/gi, '\n').replace(/&nbsp;/g, ' ').trim();
        staff = staff.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
    });

    let cast = '';
    $('[class^="cast_r"]').first().each((_, el) => {
        cast = $(el).html() || '';
        cast = cast.replace(/\s*<br\s*\/?>\s*/gi, '\n').replace(/&nbsp;/g, ' ').trim();
        cast = cast.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
    });

    const broadcast = $('.broadcast_r').first().text().trim() || '';

    return {
        title,
        subtitle,
        type,
        tags,
        visual,
        staff,
        cast,
        broadcast,
        comments: [],
        selected: true
    };
}