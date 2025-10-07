import { useState, useEffect } from 'react'
import type { NYTimesArticle } from '../services/nytimesApi'
import { getRandomArticle, extractPracticeSentences } from '../services/nytimesApi'

export interface ArticlePracticeData {
  article: NYTimesArticle
  sentences: string[]
  currentSentence: string
  isLoading: boolean
  error: string | null
}

export const useArticles = () => {
  const [data, setData] = useState<ArticlePracticeData>({
    article: {} as NYTimesArticle,
    sentences: [],
    currentSentence: '',
    isLoading: true,
    error: null
  })

  const loadRandomArticle = async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const article = await getRandomArticle()
      const sentences = extractPracticeSentences(article)
      const currentSentence = sentences[0] || article.snippet || ''
      
      setData({
        article,
        sentences,
        currentSentence,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Error loading article:', error)
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load article. Please try again.'
      }))
    }
  }

  const getRandomSentence = () => {
    if (data.sentences.length === 0) return
    
    const randomIndex = Math.floor(Math.random() * data.sentences.length)
    const newSentence = data.sentences[randomIndex]
    
    setData(prev => ({
      ...prev,
      currentSentence: newSentence
    }))
  }

  // Load initial article on mount
  useEffect(() => {
    loadRandomArticle()
  }, [])

  return {
    ...data,
    loadRandomArticle,
    getRandomSentence,
    hasMultipleSentences: data.sentences.length > 1
  }
}