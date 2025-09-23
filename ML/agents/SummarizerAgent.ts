import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { NewsArticle, ProcessedNews } from '../types/news';
import { config } from '../config/config';

export class SummarizerAgent {
    private llm: ChatGoogleGenerativeAI;

    constructor() {
        this.llm = new ChatGoogleGenerativeAI({
            modelName: config.gemini.model,
            temperature: 0.3,
            apiKey: config.gemini.apiKey,
            maxOutputTokens: 1024,
        });
    }

    // Single article summarize karna
    async summarizeArticle(article: NewsArticle): Promise<string> {
        try {
            const prompt = `
Summarize this news article in clear, concise English:

Title: ${article.title}
Source: ${article.source}
Content: ${article.content}

Instructions:
- Create a 2-3 sentence summary in English
- Highlight key points and important facts
- Include numbers, statistics, and key data if present
- Keep it informative and engaging
- Use professional news writing style

Summary:`;

            const response = await this.llm.invoke([new HumanMessage(prompt)]);
            const summary = response.content as string;

            console.log(`✅ Summarized: ${article.title.substring(0, 50)}...`);
            return summary.trim();

        } catch (error) {
            console.error(`❌ Summarization failed for: ${article.title}`, error);
            return `Summary generation failed for this article. Original title: ${article.title}`;
        }
    }

    // Multiple articles process karna
    async processArticles(articles: NewsArticle[]): Promise<ProcessedNews[]> {
        const processedNews: ProcessedNews[] = [];

        console.log(`🤖 Starting summarization for ${articles.length} articles...`);

        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];

            try {
                console.log(`📝 Processing ${i + 1}/${articles.length}: ${article.title.substring(0, 60)}...`);

                const summary = await this.summarizeArticle(article);

                processedNews.push({
                    original: article,
                    summary,
                    processedAt: new Date().toISOString()
                });

                // Rate limiting - Gemini API calls ke beech mein gap (Gemini is more generous)
                if (i < articles.length - 1) {
                    await this.delay(800); // 0.8 seconds gap for Gemini
                }

            } catch (error) {
                console.error(`❌ Processing failed for article ${i + 1}:`, error);

                // Error ke case mein bhi entry add karo
                processedNews.push({
                    original: article,
                    summary: `Error: Could not generate summary for "${article.title}"`,
                    processedAt: new Date().toISOString()
                });
            }
        }

        console.log(`✅ Summarization completed! Processed ${processedNews.length} articles`);
        return processedNews;
    }

    // Delay helper
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Main execute function
    async execute(articles: NewsArticle[]): Promise<ProcessedNews[]> {
        if (!articles.length) {
            console.log('⚠️  No articles to summarize');
            return [];
        }

        return await this.processArticles(articles);
    }
}
