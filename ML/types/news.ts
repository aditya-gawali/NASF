export interface NewsArticle {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  source: string;
  url: string;
  publishedAt: Date;
  category?: string;
  author?: string;
  imageUrl?: string;
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface AgentState {
  articles: NewsArticle[];
  currentArticle?: NewsArticle;
  processingStatus: 'fetching' | 'summarizing' | 'storing' | 'completed' | 'error';
  error?: string;
}

export interface ProcessedNews {
  original: NewsArticle;
  summary: string;
  processedAt: string;
}