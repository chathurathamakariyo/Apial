const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'GET requests පමණක් අවසර දෙනවා.' 
        });
    }

    try {
        const searchTerm = req.query.q || 'accounting';
        const pages = Math.min(parseInt(req.query.pages) || 1, 5);

        const baseUrl = 'https://www.alevelapi.com';
        
        // Different User-Agents try කරන්න
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];

        let allResults = [];
        let debugInfo = [];

        for (let page = 1; page <= pages; page++) {
            const url = page === 1 
                ? `${baseUrl}/?s=${encodeURIComponent(searchTerm)}`
                : `${baseUrl}/page/${page}/?s=${encodeURIComponent(searchTerm)}`;

            console.log(`📥 Trying: ${url}`);

            try {
                // Random User-Agent එකක් use කරමු
                const headers = {
                    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                };

                const response = await axios.get(url, { 
                    headers, 
                    timeout: 10000,
                    maxRedirects: 5
                });
                
                const $ = cheerio.load(response.data);
                
                // Debug: පිටුවේ HTML structure එක check කරමු
                debugInfo.push({
                    page,
                    url,
                    title: $('title').text(),
                    hasPostItems: $('li.post-item').length > 0,
                    hasArticles: $('article').length > 0,
                    hasEntries: $('.entry-title').length > 0
                });

                // විවිධ selectors try කරමු
                const possibleSelectors = [
                    'li.post-item',
                    'article',
                    '.post-item',
                    '.post',
                    '.hentry',
                    '.type-post',
                    '.type-page',
                    '.post-grid',
                    '.post-list'
                ];

                let postItems = null;
                let usedSelector = '';

                for (const selector of possibleSelectors) {
                    const items = $(selector);
                    if (items.length > 0) {
                        postItems = items;
                        usedSelector = selector;
                        console.log(`✅ Selector "${selector}" වැඩ කරයි - items ${items.length}`);
                        break;
                    }
                }

                if (!postItems || postItems.length === 0) {
                    console.log('⚠️ කිසිම selector එකක් වැඩ කළේ නැහැ');
                    
                    // Save HTML for debugging (optional)
                    debugInfo.push({
                        htmlSample: response.data.substring(0, 500)
                    });
                    continue;
                }

                postItems.each((index, item) => {
                    try {
                        const $item = $(item);
                        
                        // Multiple title selector patterns
                        const titleSelectors = [
                            'h2.entry-title a',
                            'h2.entry-title',
                            '.entry-title a',
                            '.entry-title',
                            'h3 a',
                            'h2 a',
                            'a[rel="bookmark"]'
                        ];

                        let title = 'N/A';
                        let link = '#';
                        
                        for (const sel of titleSelectors) {
                            const elem = $item.find(sel);
                            if (elem.length > 0) {
                                title = elem.text().trim();
                                link = elem.attr('href') || link;
                                if (link && !link.startsWith('http')) {
                                    link = baseUrl + link;
                                }
                                break;
                            }
                        }

                        // Category selectors
                        const categorySelectors = [
                            '.bb-cat-links a',
                            '.cat-links a',
                            '.post-categories a',
                            '.category a',
                            '.post-meta a'
                        ];

                        let category = 'N/A';
                        for (const sel of categorySelectors) {
                            const cat = $item.find(sel).first();
                            if (cat.length > 0) {
                                category = cat.text().trim();
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
                            const img = $item.find(sel).first();
                            if (img.length > 0) {
                                thumbnail = img.attr('src') || img.attr('data-src') || null;
                                if (thumbnail && !thumbnail.startsWith('http')) {
                                    thumbnail = baseUrl + thumbnail;
                                }
                                break;
                            }
                        }

                        if (title !== 'N/A') {
                            allResults.push({
                                id: allResults.length + 1,
                                title: title,
                                link: link,
                                category: category,
                                thumbnail: thumbnail,
                                type: $item.hasClass('page') ? 'page' : 'post'
                            });
                        }

                    } catch (parseError) {
                        console.error('Parse error:', parseError.message);
                    }
                });

            } catch (pageError) {
                console.error(`❌ Error on page ${page}:`, pageError.message);
                debugInfo.push({
                    page,
                    error: pageError.message,
                    status: pageError.response?.status,
                    statusText: pageError.response?.statusText
                });
            }
        }

        // Return results with debug info
        return res.status(200).json({
            success: true,
            search_term: searchTerm,
            pages_scraped: pages,
            total_results: allResults.length,
            data: allResults,
            debug: debugInfo, // මේක temporary, පස්සේ ඉවත් කරන්න
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Scraper error:', error);
        
        return res.status(500).json({
            success: false,
            error: 'ස්ක්‍රැපිං අසාර්ථකයි.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};