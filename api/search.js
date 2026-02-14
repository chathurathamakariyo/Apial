const axios = require('axios');
const xml2js = require('xml2js');

export default async (req, res) => {
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
        
        // RSS feed URL එක - API key එකක් අවශ්ය නැහැ
        const rssUrl = `https://www.alevelapi.com/search/${encodeURIComponent(searchTerm)}/feed/rss2/`;
        
        console.log(`📥 Fetching RSS: ${rssUrl}`);
        
        const response = await axios.get(rssUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });
        
        // XML parse කරන්න
        const parser = new xml2js.Parser({ 
            explicitArray: false,
            ignoreAttrs: false,
            mergeAttrs: true
        });
        
        const result = await parser.parseStringPromise(response.data);
        
        // RSS structure එක check කරන්න
        if (!result.rss || !result.rss.channel) {
            throw new Error('Invalid RSS format');
        }
        
        // Items ගන්න (array එකක් නෙමේ නම් array එකක් හදන්න)
        let items = result.rss.channel.item || [];
        if (!Array.isArray(items)) {
            items = [items];
        }
        
        // Pagination: පිටුවකට items 10 බැගින්
        const itemsPerPage = 10;
        const startIndex = 0;
        const endIndex = pages * itemsPerPage;
        const paginatedItems = items.slice(startIndex, endIndex);
        
        // Results හදන්න
        const allResults = paginatedItems.map((item, index) => {
            // Description එක clean කරන්න (HTML tags ඉවත් කරන්න)
            const description = item.description 
                ? item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...'
                : null;
            
            // Categories ගන්න
            let category = 'N/A';
            if (item.category) {
                category = Array.isArray(item.category) 
                    ? item.category.join(', ') 
                    : item.category;
            }
            
            return {
                id: startIndex + index + 1,
                title: item.title || 'N/A',
                link: item.link || '#',
                description: description,
                category: category,
                pubDate: item.pubDate || null,
                creator: item['dc:creator'] || null
            };
        });
        
        // Response එක එවන්න
        return res.status(200).json({
            success: true,
            search_term: searchTerm,
            pages_scraped: pages,
            items_per_page: itemsPerPage,
            total_results: items.length,
            returned_results: allResults.length,
            data: allResults,
            rss_url: rssUrl,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ RSS fetch error:', error);
        
        // Error response එක
        return res.status(500).json({
            success: false,
            error: 'RSS feed එක ලබා ගැනීමට අපොහොසත් විය.',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};