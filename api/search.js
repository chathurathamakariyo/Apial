// AlevelApi.com Client-side Scraper
// Vercel IP block එකෙන් බේරෙන්න මේක browser එකේ run වෙනවා

export default async (req, res) => {
    // Get query parameters
    const searchTerm = req.query.q || 'accounting';
    const pages = parseInt(req.query.pages) || 1;
    
    // HTML response එක
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="si">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AlevelApi Scraper - ${searchTerm}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                
                h1 {
                    color: #333;
                    margin-bottom: 10px;
                    text-align: center;
                    font-size: 2.5em;
                }
                
                h1 span {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .subtitle {
                    text-align: center;
                    color: #666;
                    margin-bottom: 30px;
                }
                
                .search-info {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .info-label {
                    font-weight: bold;
                    color: #555;
                }
                
                .info-value {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.9em;
                }
                
                .search-form {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .search-input {
                    flex: 1;
                    min-width: 200px;
                    padding: 12px 15px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                }
                
                .pages-select {
                    padding: 12px 15px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    background: white;
                    cursor: pointer;
                }
                
                .search-btn {
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .search-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }
                
                .loading {
                    text-align: center;
                    padding: 50px;
                }
                
                .spinner {
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #667eea;
                    border-radius: 50%;
                    width: 60px;
                    height: 60px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .loading-text {
                    color: #666;
                    font-size: 1.2em;
                }
                
                .loading-small {
                    color: #999;
                    margin-top: 10px;
                }
                
                .stats {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .stats-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .stats-number {
                    font-size: 1.5em;
                    font-weight: bold;
                }
                
                .results-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                
                .result-card {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 10px;
                    overflow: hidden;
                    transition: transform 0.3s, box-shadow 0.3s;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .result-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                }
                
                .result-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    background: #f5f5f5;
                }
                
                .result-content {
                    padding: 20px;
                }
                
                .result-category {
                    display: inline-block;
                    background: #e0e7ff;
                    color: #4338ca;
                    padding: 3px 10px;
                    border-radius: 15px;
                    font-size: 0.8em;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .result-title {
                    font-size: 1.2em;
                    margin-bottom: 10px;
                    line-height: 1.4;
                }
                
                .result-title a {
                    color: #333;
                    text-decoration: none;
                }
                
                .result-title a:hover {
                    color: #667eea;
                }
                
                .result-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 0.9em;
                    color: #666;
                    margin-bottom: 15px;
                }
                
                .result-link {
                    display: inline-block;
                    color: #667eea;
                    text-decoration: none;
                    font-weight: bold;
                }
                
                .result-link:hover {
                    text-decoration: underline;
                }
                
                .no-results {
                    text-align: center;
                    padding: 50px;
                    color: #666;
                }
                
                .no-results-icon {
                    font-size: 4em;
                    margin-bottom: 20px;
                    color: #ddd;
                }
                
                .error {
                    background: #fee;
                    color: #c33;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    text-align: center;
                }
                
                .error-details {
                    font-size: 0.9em;
                    color: #999;
                    margin-top: 10px;
                }
                
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                }
                
                @media (max-width: 768px) {
                    .container {
                        padding: 20px;
                    }
                    
                    h1 {
                        font-size: 2em;
                    }
                    
                    .search-info {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .results-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📚 <span>AlevelApi</span> Scraper</h1>
                <p class="subtitle">Advanced Level Past Papers & Marking Schemes</p>
                
                <!-- Search Info -->
                <div class="search-info">
                    <div class="info-item">
                        <span class="info-label">🔍 සෙවුම් පදය:</span>
                        <span class="info-value">${searchTerm}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📄 පිටු ගණන:</span>
                        <span class="info-value">${pages}</span>
                    </div>
                    
                    <!-- Search Form -->
                    <form class="search-form" onsubmit="event.preventDefault(); window.location.href = '/api/search?q=' + document.getElementById('newSearch').value + '&pages=' + document.getElementById('newPages').value;">
                        <input type="text" id="newSearch" class="search-input" placeholder="නව සෙවුමක්..." value="${searchTerm}">
                        <select id="newPages" class="pages-select">
                            <option value="1" ${pages === 1 ? 'selected' : ''}>පිටු 1</option>
                            <option value="2" ${pages === 2 ? 'selected' : ''}>පිටු 2</option>
                            <option value="3" ${pages === 3 ? 'selected' : ''}>පිටු 3</option>
                        </select>
                        <button type="submit" class="search-btn">සොයන්න</button>
                    </form>
                </div>
                
                <!-- Loading -->
                <div id="loading" class="loading">
                    <div class="spinner"></div>
                    <div class="loading-text">🔍 ${searchTerm} සඳහා ප්‍රතිඵල සොයමින්...</div>
                    <div class="loading-small">මෙය තත්පර කිහිපයක් ගත විය හැක</div>
                </div>
                
                <!-- Stats -->
                <div id="stats" class="stats" style="display: none;"></div>
                
                <!-- Results -->
                <div id="results" class="results"></div>
                
                <!-- Error -->
                <div id="error" class="error" style="display: none;"></div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} AlevelApi Scraper | සියලුම හිමිකම් ඇවිරිණි</p>
                </div>
            </div>
            
            <script>
                (async function() {
                    const searchTerm = ${JSON.stringify(searchTerm)};
                    const pages = ${pages};
                    
                    const loadingEl = document.getElementById('loading');
                    const statsEl = document.getElementById('stats');
                    const resultsEl = document.getElementById('results');
                    const errorEl = document.getElementById('error');
                    
                    try {
                        // CORS proxies (multiple proxies try කරන්න)
                        const proxies = [
                            'https://api.allorigins.win/raw?url=',
                            'https://corsproxy.io/?',
                            'https://proxy.cors.sh/',
                            'https://cors-anywhere.herokuapp.com/'
                        ];
                        
                        const baseUrl = 'https://www.alevelapi.com';
                        
                        // URL එක හදන්න
                        const searchUrl = pages === 1 
                            ? \`\${baseUrl}/?s=\${encodeURIComponent(searchTerm)}\`
                            : \`\${baseUrl}/page/\${pages}/?s=\${encodeURIComponent(searchTerm)}\`;
                        
                        console.log('📥 Fetching:', searchUrl);
                        
                        let html = null;
                        let proxyUsed = '';
                        
                        // Try each proxy until one works
                        for (const proxy of proxies) {
                            try {
                                console.log('Trying proxy:', proxy);
                                const response = await fetch(proxy + encodeURIComponent(searchUrl));
                                if (response.ok) {
                                    html = await response.text();
                                    proxyUsed = proxy;
                                    break;
                                }
                            } catch (e) {
                                console.log('Proxy failed:', proxy);
                                continue;
                            }
                        }
                        
                        if (!html) {
                            throw new Error('කිසිම proxy එකක් වැඩ කළේ නැහැ');
                        }
                        
                        // Parse HTML
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        
                        // Find post items
                        const selectors = [
                            'li.post-item',
                            'article',
                            '.post',
                            '.hentry',
                            '.type-post',
                            '.type-page',
                            '.post-item'
                        ];
                        
                        let items = [];
                        for (const selector of selectors) {
                            const found = doc.querySelectorAll(selector);
                            if (found.length > 0) {
                                items = found;
                                console.log(\`✅ Found \${found.length} items with selector: \${selector}\`);
                                break;
                            }
                        }
                        
                        // Hide loading
                        loadingEl.style.display = 'none';
                        
                        if (items.length === 0) {
                            errorEl.style.display = 'block';
                            errorEl.innerHTML = \`
                                <strong>❌ කිසිදු ප්‍රතිඵලයක් හමු නොවුණි</strong><br>
                                <div class="error-details">URL: \${searchUrl}</div>
                                <div class="error-details">Proxy used: \${proxyUsed || 'none'}</div>
                            \`;
                            return;
                        }
                        
                        // Process items
                        const results = [];
                        
                        items.forEach((item, index) => {
                            try {
                                // Title and Link
                                const titleSelectors = [
                                    'h2.entry-title a',
                                    'h2.entry-title',
                                    '.entry-title a',
                                    'h3 a',
                                    'a[rel="bookmark"]',
                                    '.post-title a'
                                ];
                                
                                let title = null;
                                let link = null;
                                
                                for (const sel of titleSelectors) {
                                    const elem = item.querySelector(sel);
                                    if (elem) {
                                        title = elem.textContent?.trim();
                                        link = elem.getAttribute('href');
                                        if (link && !link.startsWith('http')) {
                                            link = baseUrl + link;
                                        }
                                        break;
                                    }
                                }
                                
                                if (!title || !link) return;
                                
                                // Category
                                const categorySelectors = [
                                    '.bb-cat-links a',
                                    '.cat-links a',
                                    '.post-categories a',
                                    '.category a',
                                    '.post-meta a'
                                ];
                                
                                let category = 'Uncategorized';
                                for (const sel of categorySelectors) {
                                    const cat = item.querySelector(sel);
                                    if (cat) {
                                        category = cat.textContent?.trim() || category;
                                        break;
                                    }
                                }
                                
                                // Thumbnail
                                const thumbSelectors = [
                                    'img.wp-post-image',
                                    'img.attachment-thumbnail',
                                    '.post-thumbnail img',
                                    'img[src*="uploads"]'
                                ];
                                
                                let thumbnail = null;
                                for (const sel of thumbSelectors) {
                                    const img = item.querySelector(sel);
                                    if (img) {
                                        thumbnail = img.getAttribute('src') || img.getAttribute('data-src');
                                        if (thumbnail && !thumbnail.startsWith('http')) {
                                            thumbnail = baseUrl + thumbnail;
                                        }
                                        break;
                                    }
                                }
                                
                                // Description
                                const descSelectors = [
                                    '.entry-summary',
                                    '.post-excerpt',
                                    '.entry-content p',
                                    '.description'
                                ];
                                
                                let description = null;
                                for (const sel of descSelectors) {
                                    const desc = item.querySelector(sel);
                                    if (desc) {
                                        description = desc.textContent?.trim().substring(0, 150) + '...';
                                        break;
                                    }
                                }
                                
                                results.push({
                                    id: index + 1,
                                    title: title,
                                    link: link,
                                    category: category,
                                    thumbnail: thumbnail,
                                    description: description,
                                    type: item.classList.contains('page') ? 'page' : 'post'
                                });
                                
                            } catch (e) {
                                console.error('Error parsing item:', e);
                            }
                        });
                        
                        // Show stats
                        statsEl.style.display = 'flex';
                        statsEl.innerHTML = \`
                            <div class="stats-item">
                                <span>📊 සම්පූර්ණ ප්‍රතිඵල:</span>
                                <span class="stats-number">\${results.length}</span>
                            </div>
                            <div class="stats-item">
                                <span>🔍 සෙවුම් පදය:</span>
                                <span>\${searchTerm}</span>
                            </div>
                            <div class="stats-item">
                                <span>📄 පිටු:</span>
                                <span>\${pages}</span>
                            </div>
                        \`;
                        
                        // Show results
                        if (results.length === 0) {
                            resultsEl.innerHTML = '<div class="no-results"><div class="no-results-icon">🔍</div><h3>කිසිදු ප්‍රතිඵලයක් හමු නොවුණි</h3><p>වෙනත් සෙවුම් පදයක් උත්සාහ කරන්න</p></div>';
                            return;
                        }
                        
                        let resultsHtml = '<div class="results-grid">';
                        
                        results.forEach(result => {
                            resultsHtml += \`
                                <div class="result-card">
                                    \${result.thumbnail ? \`<img class="result-image" src="\${result.thumbnail}" alt="\${result.title}" loading="lazy">\` : ''}
                                    <div class="result-content">
                                        <span class="result-category">\${result.category}</span>
                                        <h3 class="result-title"><a href="\${result.link}" target="_blank">\${result.title}</a></h3>
                                        \${result.description ? \`<p class="result-meta">\${result.description}</p>\` : ''}
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span class="result-meta">\${result.type === 'page' ? '📄 පිටුව' : '📝 පෝස්ට්'}</span>
                                            <a href="\${result.link}" class="result-link" target="_blank">බලන්න →</a>
                                        </div>
                                    </div>
                                </div>
                            \`;
                        });
                        
                        resultsHtml += '</div>';
                        resultsEl.innerHTML = resultsHtml;
                        
                    } catch (error) {
                        console.error('Fatal error:', error);
                        loadingEl.style.display = 'none';
                        errorEl.style.display = 'block';
                        errorEl.innerHTML = \`
                            <strong>❌ දෝෂයක් සිදු විය</strong><br>
                            \${error.message}<br>
                            <div class="error-details">URL: \${window.location.href}</div>
                        \`;
                    }
                })();
            </script>
        </body>
        </html>
    `);
};