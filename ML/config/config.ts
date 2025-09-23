export const config = {
  // FREE APIs - No API key required
  freeNewsAPIs: {
    // BBC News RSS - Always working
    bbcNews: 'https://feeds.bbci.co.uk/news/rss.xml',
    // CNN RSS
    cnnNews: 'https://rss.cnn.com/rss/edition.rss',
    // Reuters RSS
    reutersNews: 'https://feeds.reuters.com/reuters/topNews',
    // The Guardian RSS
    guardianNews: 'https://www.theguardian.com/world/rss',
    // Al Jazeera RSS
    alJazeeraNews: 'https://www.aljazeera.com/xml/rss/all.xml',
    // Times of India RSS
    toiNews: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    // Hindustan Times RSS
    htNews: 'https://www.hindustantimes.com/feeds/rss/india-news/index.xml'
  },
  
  // NewsAPI (Free tier - 100 requests/day)
  newsAPI: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: process.env.NEWS_API_KEY || '', // Optional
    endpoints: {
      topHeadlines: '/top-headlines',
      everything: '/everything'
    }
  },

  // OpenAI for summarization
   gemini: {
    apiKey: process.env.GOOGLE_API_KEY!,
    model: 'gemini-1.5-flash-latest'
  }
};