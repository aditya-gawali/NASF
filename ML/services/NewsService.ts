import { NewsFetcherAgent } from '../agents/NewsFetcherAgent';
import { SummarizerAgent } from '../agents/SummarizerAgent';
import { ProcessedNews } from '../types/news';

export class NewsService {
  private fetcherAgent: NewsFetcherAgent;
  private summarizerAgent: SummarizerAgent;

  constructor() {
    this.fetcherAgent = new NewsFetcherAgent();
    this.summarizerAgent = new SummarizerAgent();
  }

  // Complete pipeline - Fetch + Summarize
  async getLatestNewsSummary(query?: string, limit: number = 10): Promise<ProcessedNews[]> {
    try {
      console.log('🏁 Starting News Summary Pipeline...');
      console.log(`📊 Query: ${query || 'Latest News'}, Limit: ${limit}`);
      
      // Step 1: Fetch news
      const articles = await this.fetcherAgent.execute(query, limit);
      
      if (!articles.length) {
        console.log('❌ No articles found!');
        return [];
      }

      // Step 2: Summarize articles
      const processedNews = await this.summarizerAgent.execute(articles);
      
      console.log('🎉 Pipeline completed successfully!');
      return processedNews;
      
    } catch (error) {
      console.error('❌ News Service error:', error);
      throw error;
    }
  }

  // Only fetch news (without summarization)
  async fetchLatestNews(query?: string, limit: number = 10) {
    return await this.fetcherAgent.execute(query, limit);
  }

  // Only summarize provided articles
  async summarizeNews(articles: any[]) {
    return await this.summarizerAgent.execute(articles);
  }
}