const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS request handling (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET request only
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'GET requests පමණක් අවසර දෙනවා.' 
        });
    }

    try {
        // Query parameters ගැනීම
        const searchTerm = req.query.q || 'accounting';
        const pages = parseInt(req.query.pages) || 1;
        
        // Validate pages
        if (pages > 5) {
            return res.status(400).json({
                success: false,
                error: 'පිටු 5කට වඩා ස්ක්‍රැප් කරන්න අවසර නැහැ.'
            });
        }

        const baseUrl = 'https://www.alevelapi.com';
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };

        let allResults = [];
        let resultCount = 0;

        // Loop through pages
        for (let page = 1; page <= pages; page++) {
            const url = page === 1 
                ? `${baseUrl}/?s=${encodeURIComponent(searchTerm)}`
                : `${baseUrl}/page/${page}/?s=${encodeURIComponent(searchTerm)}`;

            console.log(`📥 පිටුව ${page} ස්ක්‍රැප් කරනවා...`);

            try {
                const response = await axios.get(url, { 
                    headers, 
                    timeout: 8000 
                });
                
                const $ = cheerio.load(response.data);

                // සෙවුම් ප්‍රතිඵල සොයා ගැනීම
                const postItems = $('li.post-item');

                if (postItems.length === 0) {
                    console.log('✅ තවත් ප්‍රතිඵල නැහැ.');
                    break;
                }

                postItems.each((index, item) => {
                    try {
                        const article = $(item).find('article');
                        
                        // සිරස්තලය (Title)
                        const titleElem = article.find('h2.entry-title a');
                        const title = titleElem.text().trim() || 'N/A';
                        const link = titleElem.attr('href') || '#';
                        
                        // කාණ්ඩය (Category)
                        const catElem = article.find('.bb-cat-links a');
                        const category = catElem.text().trim() || 'N/A';
                        
                        // පින්තූරය (Thumbnail)
                        const imgElem = article.find('img.wp-post-image');
                        const thumbnail = imgElem.attr('src') || null;
                        
                        // ප්‍රතිඵල වර්ගය (Post Type)
                        const postType = article.hasClass('page') ? 'page' : 'post';
                        
                        // Description/Meta
                        const metaElem = article.find('.entry-sub-title, .post-excerpt');
                        const description = metaElem.text().trim() || null;

                        resultCount++;
                        
                        allResults.push({
                            id: resultCount,
                            title: title,
                            link: link.startsWith('http') ? link : baseUrl + link,
                            category: category,
                            thumbnail: thumbnail,
                            type: postType,
                            description: description
                        });

                    } catch (parseError) {
                        console.error('⚠️ ප්‍රතිඵලයක් parse කිරීමේදී දෝෂයක්:', parseError.message);
                    }
                });

            } catch (pageError) {
                console.error(`❌ පිටුව ${page} ස්ක්‍රැප් කිරීමේදී දෝෂයක්:`, pageError.message);
                // Continue with next page
            }
        }

        // ප්‍රතිඵල return කිරීම
        return res.status(200).json({
            success: true,
            search_term: searchTerm,
            pages_scraped: pages,
            total_results: allResults.length,
            data: allResults,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ ස්ක්‍රැපර් දෝෂය:', error);
        
        return res.status(500).json({
            success: false,
            error: 'ස්ක්‍රැපිං අසාර්ථකයි.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};