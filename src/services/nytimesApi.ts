// NY Times API service
const API_KEY = 'MyhsgSUSEYW3H0l813E0WOMC7gfhI8AT'
const BASE_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json'

export interface NYTimesArticle {
  headline: {
    main: string
  }
  snippet: string
  lead_paragraph: string
  abstract: string
  web_url: string
  pub_date: string
}

export interface NYTimesResponse {
  response: {
    docs: NYTimesArticle[]
  }
}

// Cache for storing fetched articles
let cachedArticles: NYTimesArticle[] = []
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const fetchNYTimesArticles = async (query: string = 'election'): Promise<NYTimesArticle[]> => {
  const now = Date.now()
  
  // Return cached data if still valid
  if (cachedArticles.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedArticles
  }

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&api-key=${API_KEY}&page=0&sort=newest`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: NYTimesResponse = await response.json()
    
    // Filter articles that have meaningful content
    const articles = data.response.docs.filter(article => 
      article.snippet && 
      article.snippet.length > 50 && 
      article.snippet.length < 500 // Not too long for pronunciation practice
    )
    
    cachedArticles = articles
    lastFetchTime = now
    
    return articles
  } catch (error) {
    console.error('Error fetching NY Times articles:', error)
    
    // Return fallback content if API fails
    return getFallbackArticles()
  }
}

// Fallback content in case API is unavailable
const getFallbackArticles = (): NYTimesArticle[] => {
  return [
    {
      headline: { main: "Technology Advances in Modern Society" },
      snippet: "The rapid advancement of technology has transformed the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, these innovations continue to shape our future in unprecedented ways.",
      lead_paragraph: "Technology continues to evolve at an exponential rate, bringing both opportunities and challenges to modern society.",
      abstract: "An exploration of technological advancement and its impact on society.",
      web_url: "#",
      pub_date: new Date().toISOString()
    },
    {
      headline: { main: "Climate Change and Environmental Protection" },
      snippet: "Scientists around the world are working together to address the growing concerns about climate change and environmental degradation. Their research focuses on sustainable solutions that can help preserve our planet for future generations.",
      lead_paragraph: "Environmental protection has become a critical global priority as climate change effects become more apparent.",
      abstract: "Research and solutions for environmental protection and climate change mitigation.",
      web_url: "#",
      pub_date: new Date().toISOString()
    },
    {
      headline: { main: "Education in the Digital Age" },
      snippet: "The integration of digital technology in education has revolutionized learning methods and accessibility. Students now have access to online resources, virtual classrooms, and interactive learning platforms that enhance their educational experience.",
      lead_paragraph: "Digital transformation in education is creating new opportunities for learning and teaching.",
      abstract: "How digital technology is transforming modern education systems.",
      web_url: "#",
      pub_date: new Date().toISOString()
    },
    {
      headline: { main: "Healthcare Innovation and Medical Research" },
      snippet: "Medical researchers are making significant breakthroughs in treating various diseases and improving patient care. Advanced diagnostic tools and personalized medicine are becoming more accessible to healthcare providers worldwide.",
      lead_paragraph: "Healthcare innovation continues to improve patient outcomes and treatment effectiveness.",
      abstract: "Recent advances in medical research and healthcare technology.",
      web_url: "#",
      pub_date: new Date().toISOString()
    },
    {
      headline: { main: "Global Economic Trends and Market Analysis" },
      snippet: "Economic analysts are closely monitoring global market trends and their impact on international trade. The interconnected nature of modern economies requires careful consideration of various factors that influence financial stability.",
      lead_paragraph: "Global economic trends continue to shape international trade and financial markets.",
      abstract: "Analysis of current global economic trends and market conditions.",
      web_url: "#",
      pub_date: new Date().toISOString()
    }
  ]
}

// Get a random article from the cached or fetched articles
export const getRandomArticle = async (): Promise<NYTimesArticle> => {
  const articles = await fetchNYTimesArticles()
  const randomIndex = Math.floor(Math.random() * articles.length)
  return articles[randomIndex]
}

// Extract practice sentences from article content
export const extractPracticeSentences = (article: NYTimesArticle): string[] => {
  const sentences: string[] = []
  
  // Add snippet as main practice sentence
  if (article.snippet) {
    sentences.push(article.snippet)
  }
  
  // Add lead paragraph if different from snippet
  if (article.lead_paragraph && article.lead_paragraph !== article.snippet) {
    sentences.push(article.lead_paragraph)
  }
  
  // Add abstract if different from others
  if (article.abstract && 
      article.abstract !== article.snippet && 
      article.abstract !== article.lead_paragraph) {
    sentences.push(article.abstract)
  }
  
  return sentences.filter(sentence => sentence && sentence.length > 20)
}