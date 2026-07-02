let projectData = {
    title: '新番速递',
    animes: []
};

let defaultCommenter = {
    name: '',
    qq: '',
    avatar: ''
};

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    renderAnimeList();
    loadFromLocalStorage();
});

function saveToLocalStorage() {
    try {
        const saveData = { projectData, defaultCommenter };
        localStorage.setItem('anime-comment-data', JSON.stringify(saveData));
    } catch (e) {
        console.error('保存到本地存储失败:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('anime-comment-data');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.projectData) projectData = data.projectData;
            if (data.defaultCommenter) {
                defaultCommenter = data.defaultCommenter;
                document.getElementById('defaultName').value = defaultCommenter.name || '';
                document.getElementById('defaultQQ').value = defaultCommenter.qq || '';
                updateDefaultAvatarStatus();
            }
            renderAnimeList();
            log('✅ 已从本地存储恢复数据');
        }
    } catch (e) {
        console.error('从本地存储恢复失败:', e);
    }
}

function initEventListeners() {
    document.getElementById('fetchBtn').addEventListener('click', fetchAnimeList);
    document.getElementById('batchAddBtn').addEventListener('click', batchAddAnime);
    document.getElementById('loadJsonBtn').addEventListener('click', importComments);
    document.getElementById('saveJsonBtn').addEventListener('click', exportComments);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);

    document.getElementById('defaultName').addEventListener('change', (e) => {
        defaultCommenter.name = e.target.value;
        saveToLocalStorage();
    });

    document.getElementById('defaultQQ').addEventListener('change', (e) => {
        defaultCommenter.qq = e.target.value;
        if (e.target.value) {
            defaultCommenter.avatar = `http://q1.qlogo.cn/g?b=qq&nk=${e.target.value}&s=100`;
            updateDefaultAvatarStatus();
            renderAnimeList();
            saveToLocalStorage();
        }
    });

    document.getElementById('fetchDefaultAvatar').addEventListener('click', () => {
        const qq = document.getElementById('defaultQQ').value;
        if (qq) {
            defaultCommenter.avatar = `http://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`;
            updateDefaultAvatarStatus();
            log('✅ 默认头像已设置');
            renderAnimeList();
            saveToLocalStorage();
        } else {
            alert('请先输入 QQ 号');
        }
    });

    document.getElementById('clearDefault').addEventListener('click', () => {
        defaultCommenter = { name: '', qq: '', avatar: '' };
        document.getElementById('defaultName').value = '';
        document.getElementById('defaultQQ').value = '';
        updateDefaultAvatarStatus();
        saveToLocalStorage();
    });

    document.getElementById('toggleSelectAllBtn').addEventListener('click', () => {
        const animes = projectData.animes;
        if (!animes?.length) {
            log('⚠️ 没有动画可选择');
            return;
        }

        const allSelected = animes.every(a => a.selected !== false);
        const newState = !allSelected;
        animes.forEach(anime => { anime.selected = newState; });

        document.getElementById('toggleSelectAllBtn').textContent = newState ? '取消全选' : '全选';
        renderAnimeList();
        log(`✅ 已${newState ? '全选' : '取消全选'}所有动画`);
    });
}

function updateDefaultAvatarStatus() {
    const status = document.getElementById('defaultAvatarStatus');
    if (defaultCommenter.qq) {
        status.textContent = '头像已获取';
        status.style.color = '#52c41a';
    } else {
        status.textContent = '未设置QQ号';
        status.style.color = '#999';
    }
}

async function fetchAnimeList() {
    const season = document.getElementById('seasonInput').value || '202607';
    showLoading('正在抓取番剧列表...');

    try {
        const apiUrl = `/api/fetch-anime?season=${season}`;
        log(`📡 请求: ${apiUrl}`);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch {
                errorText = '无法读取响应';
            }
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        if (!result.success) {
            hideLoading();
            log(`❌ 抓取失败: ${result.error}`);
            return;
        }

        const fetchedAnimes = result.data;

        if (!fetchedAnimes.length) {
            hideLoading();
            log('⚠️ 未找到番剧数据，请检查季度代码');
            return;
        }

        const existingComments = new Map();
        projectData.animes.forEach(anime => {
            if (anime.title && anime.comments?.length) {
                existingComments.set(anime.title, anime.comments);
            }
        });

        projectData.animes = fetchedAnimes.map(anime => {
            const comments = existingComments.get(anime.title);
            if (comments) {
                return { ...anime, comments };
            }
            return anime;
        });

        renderAnimeList();
        saveToLocalStorage();
        log(`✅ 成功抓取 ${fetchedAnimes.length} 部动画（已保留 ${existingComments.size} 部评论）`);
    } catch (err) {
        console.error('抓取错误:', err);
        log(`❌ 请求失败: ${err.message}`);
    } finally {
        hideLoading();
    }
}

function batchAddAnime() {
    const text = prompt('输入动画标题：\n格式：中文标题 | 日文标题');
    if (!text) return;

    const lines = text.split('\n').filter(line => line.trim());
    let added = 0;

    lines.forEach(line => {
        const parts = line.split('|').map(s => s.trim());
        const title = parts[0];
        const subtitle = parts[1] || '';
        if (title) {
            projectData.animes.push({
                title,
                subtitle,
                type: '',
                tags: [],
                visual: '',
                staff: '',
                cast: '',
                broadcast: '',
                comments: [],
                selected: true
            });
            added++;
        }
    });

    if (added > 0) {
        renderAnimeList();
        saveToLocalStorage();
        log(`✅ 已添加 ${added} 部番剧`);
    }
}

function importComments() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            const importedAnimes = importedData.animes || [];

            if (!importedAnimes.length) {
                log('⚠️ JSON 中没有动画数据');
                return;
            }

            const mode = confirm(
                `JSON 中包含 ${importedAnimes.length} 部动画。\n\n` +
                `点击"确定" - 合并评论（按标题匹配）\n` +
                `点击"取消" - 替换全部数据`
            );

            if (mode) {
                const localMap = new Map();
                projectData.animes.forEach(anime => {
                    if (anime.title) localMap.set(anime.title, anime);
                });

                let matchedCount = 0;
                let unmatchedCount = 0;
                let totalCommentsAdded = 0;

                for (const importedAnime of importedAnimes) {
                    if (!importedAnime.title) continue;
                    const localAnime = localMap.get(importedAnime.title);

                    if (localAnime) {
                        if (!localAnime.comments) localAnime.comments = [];

                        const importedComments = importedAnime.comments || [];
                        for (const comment of importedComments) {
                            const existingNames = new Set(localAnime.comments.map(c => c.name));
                            if (comment.name && !existingNames.has(comment.name)) {
                                const avatar = comment.avatar || (comment.qq ? `http://q1.qlogo.cn/g?b=qq&nk=${comment.qq}&s=100` : '');
                                localAnime.comments.push({
                                    name: comment.name || '',
                                    qq: comment.qq || '',
                                    avatar: avatar,
                                    text: comment.text || '',
                                    medal: comment.medal || '',
                                    images: comment.images || []
                                });
                                totalCommentsAdded++;
                            }
                        }
                        matchedCount++;
                    } else {
                        unmatchedCount++;
                    }
                }

                log(`✅ 合并完成：匹配 ${matchedCount} 部，新增 ${totalCommentsAdded} 条评论${unmatchedCount > 0 ? `，${unmatchedCount} 部未匹配` : ''}`);
            } else {
                projectData = importedData;
                log(`✅ 已替换为 JSON 数据，共 ${importedAnimes.length} 部动画`);
            }

            renderAnimeList();
            saveToLocalStorage();
        } catch (err) {
            log(`❌ 导入失败: ${err.message}`);
        }
    };
    input.click();
}

function exportComments() {
    if (!projectData.animes.length) {
        log('⚠️ 没有数据可导出');
        return;
    }

    const exportData = {
        title: projectData.title || '新番速递',
        animes: projectData.animes.map(anime => ({
            title: anime.title,
            subtitle: anime.subtitle,
            comments: (anime.comments || []).map(c => ({
                name: c.name,
                qq: c.qq || '',
                avatar: c.avatar || '',
                text: c.text,
                medal: c.medal,
                images: c.images || []
            }))
        }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `评论数据_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    log(`✅ 已导出 ${exportData.animes.length} 部动画的评论数据`);
}

function clearAll() {
    if (!projectData.animes.length) {
        log('⚠️ 没有数据可清除');
        return;
    }

    if (confirm('确定要清除全部数据吗？此操作不可撤销！')) {
        projectData.animes = [];
        renderAnimeList();
        saveToLocalStorage();
        log('✅ 已清除全部数据');
    }
}

function renderAnimeList() {
    const container = document.getElementById('animeList');
    container.innerHTML = '';

    if (!projectData.animes?.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div>点击"从 yuc.wiki 抓取"获取番剧列表，或点击"添加动画"添加</div>
                <div>输入默认评论昵称与QQ号（用于获取头像）</div>
                <div>在对应动画条目点击添加评论</div>
                <div>导入或导出评论</div>
            </div>
        `;
        return;
    }

    projectData.animes.forEach((anime, index) => {
        const card = document.createElement('div');
        card.className = 'anime-card';

        const comments = Array.isArray(anime.comments) ? anime.comments : [];
        const tags = Array.isArray(anime.tags) ? anime.tags : [];

        card.innerHTML = `
            <div class="anime-header">
                <input type="checkbox" class="anime-select" data-index="${index}" ${anime.selected !== false ? 'checked' : ''}>
                <span class="anime-index">#${index + 1}</span>
                <input type="text" class="title-input" value="${escapeHtml(anime.title || '')}" placeholder="中文标题" data-index="${index}">
                <input type="text" class="subtitle-input" value="${escapeHtml(anime.subtitle || '')}" placeholder="日文标题" data-index="${index}">
                <button class="preview-btn" data-index="${index}">预览</button>
                <button class="delete-btn" data-index="${index}">×</button>
            </div>
            <div class="anime-info">
                <span>类型: ${escapeHtml(anime.type || '')}</span>
                <div class="tags">${tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
                <span>${escapeHtml(anime.broadcast || '')}</span>
            </div>
            ${anime.staff ? `<div class="anime-detail"><span class="detail-label">制作:</span><span class="detail-text">${escapeHtml(anime.staff)}</span></div>` : ''}
            ${anime.cast ? `<div class="anime-detail"><span class="detail-label">声优:</span><span class="detail-text">${escapeHtml(anime.cast)}</span></div>` : ''}
            <div class="visual-info">
                <span class="visual-path" title="${escapeHtml(anime.visual || '未选择视觉图')}">${anime.visual ? '视觉图: 已选择' : '视觉图: 未选择'}</span>
            </div>
            <div class="comments-section">
                <div class="comments-header">
                    <span>评论 (${comments.length})</span>
                    <button class="add-default-comment-btn" data-index="${index}" ${defaultCommenter.name ? '' : 'disabled'}>${defaultCommenter.name ? '添加' + escapeHtml(defaultCommenter.name) + '的评论' : '请先设置默认信息'}</button>
                    <button class="add-comment-btn" data-index="${index}">添加评论</button>
                </div>
                <div class="comments-list" data-index="${index}">
                    ${comments.map((c, ci) => {
            return `
                            <div class="comment-item">
                                <div class="comment-row">
                                    <input type="text" class="comment-name" value="${escapeHtml(c.name || '')}" placeholder="昵称" data-anime="${index}" data-comment="${ci}">
                                    <input type="text" class="comment-qq" value="${escapeHtml(c.qq || '')}" placeholder="QQ号" data-anime="${index}" data-comment="${ci}">
                                    <select class="comment-medal" data-anime="${index}" data-comment="${ci}">
                                        <option value="">无奖牌</option>
                                        <option value="金牌" ${c.medal === '金牌' ? 'selected' : ''}>金牌</option>
                                        <option value="银牌" ${c.medal === '银牌' ? 'selected' : ''}>银牌</option>
                                        <option value="黑牌" ${c.medal === '黑牌' ? 'selected' : ''}>黑牌</option>
                                    </select>
                                    <span class="avatar-status">${c.qq ? '头像已获取' : '未设置QQ号'}</span>
                                    <button class="btn-qq-avatar" data-anime="${index}" data-comment="${ci}">获取头像</button>
                                    <button class="btn-delete-comment" data-anime="${index}" data-comment="${ci}">×</button>
                                </div>
                                <textarea class="comment-text" placeholder="评论内容" data-anime="${index}" data-comment="${ci}">${escapeHtml(c.text || '')}</textarea>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    bindAnimeEvents();
}

function bindAnimeEvents() {
    document.querySelectorAll('.title-input').forEach(input => {
        input.addEventListener('change', e => {
            const index = parseInt(e.target.dataset.index);
            projectData.animes[index].title = e.target.value;
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.subtitle-input').forEach(input => {
        input.addEventListener('change', e => {
            const index = parseInt(e.target.dataset.index);
            projectData.animes[index].subtitle = e.target.value;
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = parseInt(e.target.dataset.index);
            previewAnime(index);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            if (confirm('确定删除？')) {
                const index = parseInt(e.target.dataset.index);
                projectData.animes.splice(index, 1);
                renderAnimeList();
                saveToLocalStorage();
            }
        });
    });

    document.querySelectorAll('.add-comment-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = parseInt(e.target.dataset.index);
            projectData.animes[index].comments = projectData.animes[index].comments || [];
            projectData.animes[index].comments.push({
                name: '',
                qq: '',
                avatar: '',
                text: '',
                medal: '',
                images: []
            });
            renderAnimeList();
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.add-default-comment-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = parseInt(e.target.dataset.index);
            if (!defaultCommenter.name) return;

            projectData.animes[index].comments = projectData.animes[index].comments || [];
            projectData.animes[index].comments.push({
                name: defaultCommenter.name,
                qq: defaultCommenter.qq,
                avatar: defaultCommenter.avatar,
                text: '',
                medal: '',
                images: []
            });
            renderAnimeList();
            saveToLocalStorage();
        });
    });

    document.querySelectorAll('.comment-name').forEach(input => {
        input.addEventListener('change', e => {
            const { anime, comment } = e.target.dataset;
            if (projectData.animes[anime]?.comments[comment]) {
                projectData.animes[anime].comments[comment].name = e.target.value;
                saveToLocalStorage();
            }
        });
    });

    document.querySelectorAll('.comment-qq').forEach(input => {
        input.addEventListener('change', e => {
            const { anime, comment } = e.target.dataset;
            const commentData = projectData.animes[anime]?.comments[comment];
            if (commentData) {
                commentData.qq = e.target.value;
                if (e.target.value) {
                    commentData.avatar = `http://q1.qlogo.cn/g?b=qq&nk=${e.target.value}&s=100`;
                    renderAnimeList();
                }
                saveToLocalStorage();
            }
        });
    });

    document.querySelectorAll('.comment-medal').forEach(select => {
        select.addEventListener('change', e => {
            const { anime, comment } = e.target.dataset;
            if (projectData.animes[anime]?.comments[comment]) {
                projectData.animes[anime].comments[comment].medal = e.target.value;
                saveToLocalStorage();
            }
        });
    });

    document.querySelectorAll('.comment-text').forEach(textarea => {
        textarea.addEventListener('change', e => {
            const { anime, comment } = e.target.dataset;
            if (projectData.animes[anime]?.comments[comment]) {
                projectData.animes[anime].comments[comment].text = e.target.value;
                saveToLocalStorage();
            }
        });
    });

    document.querySelectorAll('.btn-qq-avatar').forEach(btn => {
        btn.addEventListener('click', e => {
            const { anime, comment } = e.target.dataset;
            const commentData = projectData.animes[anime]?.comments[comment];
            if (commentData?.qq) {
                commentData.avatar = `http://q1.qlogo.cn/g?b=qq&nk=${commentData.qq}&s=100`;
                renderAnimeList();
                saveToLocalStorage();
                log(`✅ 已获取 ${commentData.name || '该用户'} 的头像`);
            } else {
                alert('请先输入 QQ 号');
            }
        });
    });

    document.querySelectorAll('.btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', e => {
            const { anime, comment } = e.target.dataset;
            if (projectData.animes[anime]?.comments) {
                projectData.animes[anime].comments.splice(parseInt(comment), 1);
                renderAnimeList();
                saveToLocalStorage();
            }
        });
    });
}

// ========== 预览功能 ==========
async function previewAnime(index) {
    const anime = projectData.animes[index];
    if (!anime) return;

    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '<div class="preview-placeholder">正在生成预览...</div>';
    log(`👁 正在生成预览: ${anime.title}`);

    try {
        const commentsWithAvatar = (anime.comments || []).map(c => {
            const comment = { ...c };
            if (comment.avatar && !comment.avatar.startsWith('http') && !comment.avatar.startsWith('data:')) {
                comment.avatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23ddd" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23999" font-size="30">?</text></svg>';
            }
            return comment;
        });

        const requestData = {
            anime: {
                title: anime.title,
                subtitle: anime.subtitle,
                // 确保视觉图完整传递
                visual: anime.visual || '',
                comments: commentsWithAvatar
            }
        };

        console.log('预览请求数据:', requestData);

        const response = await fetch('/api/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        let html = result.html;

        console.log('预览 HTML 包含视觉图:', html.includes('visual-image'));

        // 创建 iframe 显示预览
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'width:100%;min-height:500px;border:none;border-radius:4px;background:#fffef5;';
        // 使用更宽松的 sandbox 权限
        iframe.sandbox = 'allow-scripts allow-same-origin allow-popups';

        previewContainer.innerHTML = '';
        previewContainer.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        // 等待图片加载完成后调整高度
        setTimeout(() => {
            const height = iframe.contentDocument?.body?.scrollHeight || 500;
            iframe.style.height = height + 'px';
        }, 500);

        log(`✅ 预览生成成功: ${anime.title}`);
    } catch (err) {
        console.error('预览失败:', err);
        previewContainer.innerHTML = `<div class="preview-placeholder" style="color:red;">预览失败: ${escapeHtml(err.message)}</div>`;
        log(`❌ 预览失败: ${err.message}`);
    }
}

// ========== 日志 ==========
function log(msg) {
    const logDiv = document.getElementById('log');
    logDiv.innerHTML += `<div>${escapeHtml(msg)}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

// ========== 加载状态 ==========
function showLoading(text) {
    const loading = document.getElementById('loading');
    document.getElementById('loadingText').textContent = text || '正在加载...';
    loading.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// ========== 工具函数 ==========
function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}