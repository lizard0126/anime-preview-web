import ejs from 'ejs';

// 从桌面端 page.ejs 复制的模板（移除了字体引用，适配网页）
const PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%= title %> - 预览</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      width: 800px;
      font-family: 'Microsoft YaHei', sans-serif;
      background: #fffef5;
      box-sizing: border-box;
    }

    .visual-section {
      display: flex;
      position: relative;
      margin-bottom: 40px;
      padding-bottom: 24px;
      align-items: flex-start;
    }

    .title-box {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .label {
      font-family: 'label', sans-serif;
      font-size: 40px;
      font-weight: bold;
      background: #fff;
      border-radius: 8px;
      color: #333;
      padding: 4px 12px;
      display: inline-block;
      margin-bottom: 24px;
      transform: skew(-15deg) translateX(-18px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .title-row {
      position: relative;
      margin-top: 12px;
      display: flex;
      flex-direction: row;
      gap: 4px;
      line-height: 1;
      transform: translateX(-20px);
    }

    .cn-title {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: 'title', sans-serif;
      line-height: 1.5;
      font-weight: bold;
      font-size: 50px;
      color: #111;
      white-space: normal;
      max-height: 700px;
      overflow-wrap: break-word;
      overflow: hidden;
    }

    .cn-title-long {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: 'title', sans-serif;
      line-height: 1.5;
      font-weight: bold;
      font-size: 50px;
      color: #111;
      white-space: normal;
      height: 700px;
      overflow-wrap: break-word;
      overflow: visible;
      z-index: 0;
    }

    .jp-title {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: 'title', sans-serif;
      line-height: 1.5;
      font-size: 36px;
      color: #666;
      white-space: nowrap;
      overflow: hidden;
      transform: translateY(2em);
      position: absolute;
      right: 100%;
      z-index: 0;
      max-height: 700px;
    }

    .visual-container {
      flex: 1;
      position: relative;
      display: flex;
      justify-content: flex-end;
      overflow: visible;
    }

    .visual-image {
      width: 520px;
      height: auto;
      border-radius: 0 0 520px 520px;
      object-fit: cover;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
    }

    .comment {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 48px;
      width: 100%;
      box-sizing: border-box;
      position: relative;
      z-index: 2;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 1);
    }

    .comment-wrapper {
      position: relative;
      z-index: 1;
    }

    .comment-wrapper::before {
      content: '';
      position: absolute;
      top: -24px;
      left: -24px;
      right: -24px;
      bottom: -24px;
      background: rgba(255, 255, 237, 0.8);
      border-radius: 32px;
      z-index: -1;
    }

    .comment-content {
      background: #fff;
      border-radius: 20px;
      padding: 20px;
      max-width: calc(100% - 100px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      word-wrap: break-word;
      box-sizing: border-box;
    }

    .comment-name {
      font-weight: bold;
      font-size: 28px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .comment-text {
      font-size: 26px;
      color: #333;
      overflow-wrap: break-word;
      white-space: pre-line;
    }

    .comment-text img {
      max-width: 100%;
      height: auto;
      display: block;
      margin-top: 12px;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      max-height: 300px;
    }

    .medal {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      padding: 2px 12px;
      border-radius: 12px;
      margin-left: 8px;
      vertical-align: middle;
      line-height: 1.4;
    }

    .medal-gold {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #7B3F00;
      border: 2px solid #B8860B;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
    }

    .medal-silver {
      background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
      color: #333;
      border: 2px solid #808080;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
    }

    .medal-black {
      background: linear-gradient(135deg, #333, #111);
      color: #fff;
      border: 2px solid #000;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .footer-credit {
      font-family: 'footer', sans-serif;
      text-align: center;
      margin-top: 0;
      font-size: 30px;
      color: #999;
      z-index: 2;
    }
  </style>
</head>
<body>
  <div class="visual-section">
    <div class="title-box">
      <div class="label">新番速递</div>
      <div class="title-row">
        <% if (title && title.length > 26) { %>
          <div class="cn-title-long"><%= title %></div>
        <% } else { %>
          <% if (subtitle) { %>
            <div class="jp-title"><%= subtitle %></div>
          <% } %>
          <div class="cn-title"><%= title %></div>
        <% } %>
      </div>
    </div>
    <div class="visual-container">
      <% if (visual && visual.startsWith('http')) { %>
        <img class="visual-image" src="<%= visual %>" alt="视觉图" referrerPolicy="no-referrer" onerror="this.style.display='none'" />
      <% } else if (visual) { %>
        <img class="visual-image" src="<%= visual %>" alt="视觉图" onerror="this.parentElement.innerHTML='<div style=\"width:520px;height:400px;background:#e8e8e8;border-radius:0 0 520px 520px;display:flex;align-items:center;justify-content:center;color:#999;\">暂无视觉图</div>'" />
      <% } else { %>
        <div style="width:520px;height:400px;background:#e8e8e8;border-radius:0 0 520px 520px;display:flex;align-items:center;justify-content:center;color:#999;">暂无视觉图</div>
      <% } %>
    </div>
  </div>

  <div class="comment-wrapper">
    <% comments.forEach(function(c) { %>
      <div class="comment">
        <% if (c.avatar && c.avatar.startsWith('http')) { %>
          <img class="avatar" src="<%= c.avatar %>" alt="头像" referrerPolicy="no-referrer" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2230%22>?</text></svg>'" />
        <% } else if (c.avatar) { %>
          <img class="avatar" src="<%= c.avatar %>" alt="头像" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2230%22>?</text></svg>'" />
        <% } else { %>
          <div class="avatar" style="background:#ddd;display:flex;align-items:center;justify-content:center;font-size:30px;color:#999;">?</div>
        <% } %>
        <div class="comment-content">
          <div class="comment-name">
            <%= c.name %>
            <% if (c.medal === '金牌') { %><span class="medal medal-gold">🏅 金牌</span><% } %>
            <% if (c.medal === '银牌') { %><span class="medal medal-silver">🥈 银牌</span><% } %>
            <% if (c.medal === '黑牌') { %><span class="medal medal-black">⚫ 黑牌</span><% } %>
          </div>
          <div class="comment-text"><%- c.text %></div>
        </div>
      </div>
    <% }); %>
  </div>

  <div class="footer-credit">天央动漫社·节操部制作</div>
</body>
</html>`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: '仅支持 POST 请求' });
    return;
  }

  try {
    const { anime } = req.body;
    if (!anime || !anime.title) {
      res.status(400).json({ success: false, error: '缺少动画数据' });
      return;
    }

    const tplData = {
      title: anime.title || '未命名番剧',
      subtitle: anime.subtitle || '',
      visual: anime.visual || '',
      comments: (anime.comments || []).map(c => ({
        name: c.name || '匿名用户',
        avatar: c.avatar || '',
        text: c.text || '',
        medal: c.medal || ''
      }))
    };

    // 处理评论中的图片
    tplData.comments.forEach(c => {
      const comment = anime.comments.find(ac => ac.name === c.name);
      if (comment && comment.images && comment.images.length > 0) {
        let imgHtml = '';
        comment.images.forEach(img => {
          // 如果是 base64 或 HTTP 链接，直接使用
          if (img.startsWith('data:') || img.startsWith('http')) {
            imgHtml += `<img src="${img}" referrerPolicy="no-referrer" style="max-width:100%;height:auto;display:block;margin-top:12px;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.2);max-height:300px;" />`;
          }
        });
        c.text = c.text + imgHtml;
      }
    });

    const html = ejs.render(PAGE_TEMPLATE, tplData);

    res.status(200).json({ success: true, html });
  } catch (err) {
    console.error('预览生成错误:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}