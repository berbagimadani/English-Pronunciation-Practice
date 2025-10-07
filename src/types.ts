export interface RecognitionResult {
  transcript: string
  confidence: number
  accuracy: number
}

export interface Lesson {
  id: string
  title: string
  sentences: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}