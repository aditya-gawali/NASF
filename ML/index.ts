import dotenv from 'dotenv';
import { NewsService } from './services/NewsService';

dotenv.config();

console.log(process.env.GOOGLE_API_KEY);

// Environment variables check
function validateEnvironment(): boolean {
  const requiredVars = ['GOOGLE_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('💡 Please create .env file with: GOOGLE_API_KEY=your_key_here');
    console.error('🔗 Get your free Gemini API key from: https://makersuite.google.com/app/apikey');
    return false;
  }
  
  return true;
}

// Test function
async function testNewsSystem() {
//   if (!validateEnvironment()) {
//     process.exit(1);
//   }

  try {
    console.log('🔥 News Fetch & Summarize System Test');
    console.log('=====================================\n');

    const newsService = new NewsService();
    
    // Test 1: Technology news
    console.log('📱 Test 1: Technology News');
    const techNews = await newsService.getLatestNewsSummary('technology', 3);
    
    if (techNews.length > 0) {
      console.log('\n🔍 TECH NEWS SUMMARIES:');
      techNews.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.original.title}`);
        console.log(`   Source: ${item.original.source}`);
        console.log(`   Summary: ${item.summary}`);
        console.log(`   URL: ${item.original.url}`);
        console.log(`   Published: ${item.original.publishedAt}`);
      });
    }

    console.log('\n=====================================\n');

    // Test 2: General latest news
    console.log('🌍 Test 2: Latest World News');
    const generalNews = await newsService.getLatestNewsSummary(undefined, 5);
    
    if (generalNews.length > 0) {
      console.log('\n🔍 GENERAL NEWS SUMMARIES:');
      generalNews.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.original.title}`);
        console.log(`   Source: ${item.original.source}`);
        console.log(`   Summary: ${item.summary}`);
        console.log(`   URL: ${item.original.url}`);
      });
    }

    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// API-like function export (for integration)
export async function getNewsSummary(query?: string, limit: number = 10): Promise<any> {
  const newsService = new NewsService();
  return await newsService.getLatestNewsSummary(query, limit);
}

// Main execution
if (require.main === module) {
  testNewsSystem();
}

// Export for use in other files
// export { NewsService, NewsFetcherAgent, SummarizerAgent };
export { NewsService };