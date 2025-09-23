import axios from 'axios';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { NewsArticle } from '../types/news';
import { config } from '../config/config';

export class NewsFetcherAgent {
    private rssParser: Parser;

    constructor() {
        this.rssParser = new Parser({
            customFields: {
                item: [
                    ['media:content', 'mediaContent'],
                    ['content:encoded', 'contentEncoded'],
                    ['description', 'description']
                ]
            }
        });
    }

    // RSS Feeds se news fetch - COMPLETELY FREE
    async fetchFromRSSFeeds(limit: number = 5): Promise<NewsArticle[]> {
        const allArticles: NewsArticle[] = [];

        console.log('🔄 Fetching from RSS feeds...');

        for (const [sourceName, feedUrl] of Object.entries(config.freeNewsAPIs)) {
            try {
                console.log(`📡 Fetching from ${sourceName}...`);

                const feed = await this.rssParser.parseURL(feedUrl);

                const articles = feed.items.slice(0, limit).map(item => {
                    // Extract proper content
                    let content = item.contentSnippet || item.description || item.content || '';

                    // Clean HTML tags if any
                    if (content.includes('<')) {
                        const $ = cheerio.load(content);
                        content = $.text().trim();
                    }

                    return {
                        title: item.title?.trim() || 'No Title',
                        content: content.substring(0, 1000), // Limit content length
                        source: feed.title || sourceName,
                        url: item.link || '',
                        publishedAt: item.pubDate || new Date().toISOString(),
                        author: item.creator || item.author,
                        imageUrl: this.extractImageUrl(item)
                    } as unknown as NewsArticle;
                });

                allArticles.push(...articles);
                console.log(`✅ Fetched ${articles.length} articles from ${sourceName}`);

                // Rate limiting - RSS servers ko overload na karo
                await this.delay(1000);

            } catch (error) {
                console.error(`❌ Failed to fetch from ${sourceName}:`, error instanceof Error ? error.message : 'Unknown error');
            }
        }

        console.log(`📰 Total fetched: ${allArticles.length} articles`);
        return this.removeDuplicates(allArticles);
    }

    // NewsAPI se fetch (Optional - requires API key)
    async fetchFromNewsAPI(query: string = 'technology', limit: number = 5): Promise<NewsArticle[]> {
        if (!config.newsAPI.apiKey) {
            console.log('⏭️  NewsAPI key not provided, skipping...');
            return [];
        }

        try {
            console.log('📡 Fetching from NewsAPI...');

            const response = await axios.get(`${config.newsAPI.baseUrl}/everything`, {
                params: {
                    q: query,
                    pageSize: limit,
                    sortBy: 'publishedAt',
                    language: 'en',
                    apiKey: config.newsAPI.apiKey
                },
                timeout: 10000
            });

            const articles = response.data.articles.map((article: any) => ({
                title: article.title,
                content: article.description || article.content || '',
                source: article.source.name,
                url: article.url,
                publishedAt: article.publishedAt,
                author: article.author,
                imageUrl: article.urlToImage
            })) as NewsArticle[];

            console.log(`✅ Fetched ${articles.length} articles from NewsAPI`);
            return articles;

        } catch (error) {
            console.error('❌ NewsAPI fetch failed:', error instanceof Error ? error.message : 'Unknown error');
            return [];
        }
    }

    // Image URL extract karna RSS se
    private extractImageUrl(item: any): string | undefined {
        // Try different image fields
        if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
            return item.enclosure.url;
        }

        if (item.mediaContent?.url) {
            return item.mediaContent.url;
        }

        // Extract from content
        if (item.content) {
            const $ = cheerio.load(item.content);
            const img = $('img').first();
            if (img.length) {
                return img.attr('src');
            }
        }

        return undefined;
    }

    // Duplicate removal
    private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
        const seen = new Set<string>();
        return articles.filter(article => {
            const key = article.url || article.title.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Simple delay function
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main execute function
    async execute(query?: string, limit: number = 10): Promise<NewsArticle[]> {
        try {
            console.log('🚀 News Fetcher Agent started...');

            // RSS feeds se fetch (Always works)
            const rssArticles = await this.fetchFromRSSFeeds(Math.ceil(limit / 2));

            // NewsAPI se fetch (Optional)
            const newsApiArticles = await this.fetchFromNewsAPI(query, Math.ceil(limit / 2));

            // Combine both
            const allArticles = [...rssArticles, ...newsApiArticles];

            // Final cleanup
            const finalArticles = this.removeDuplicates(allArticles)
                .filter(article => article.title && article.content)
                .slice(0, limit);

            console.log(`✅ Final articles count: ${finalArticles.length}`);
            return finalArticles;

        } catch (error) {
            console.error('❌ News Fetcher Agent error:', error);
            return [];
        }
    }
}