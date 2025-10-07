import type { RecognitionResult } from '../types'

interface ScoreDisplayProps {
  result: RecognitionResult
  targetSentence: string
}

const ScoreDisplay = ({ result, targetSentence }: ScoreDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Perfect pronunciation!'
    if (score >= 80) return 'Great job! Very clear pronunciation.'
    if (score >= 70) return 'Good work! Keep practicing.'
    if (score >= 60) return 'Not bad! Try to speak more clearly.'
    return 'Keep practicing! Focus on pronunciation.'
  }

  const highlightDifferences = (target: string, spoken: string) => {
    const targetWords = target.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    const spokenWords = spoken.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    
    return targetWords.map((word, index) => {
      const spokenWord = spokenWords[index]
      const isMatch = spokenWord === word
      
      return (
        <span
          key={index}
          className={`px-1 py-0.5 rounded ${
            isMatch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {word}
        </span>
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${getScoreColor(result.accuracy)} mb-2`}>
          {result.accuracy}%
        </div>
        <p className="text-gray-600">{getScoreMessage(result.accuracy)}</p>
      </div>

      {/* Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Target Sentence</h4>
          <p className="text-blue-800">"{targetSentence}"</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">What You Said</h4>
          <p className="text-gray-800">"{result.transcript}"</p>
        </div>
      </div>

      {/* Word-by-word Analysis */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Word Analysis</h4>
        <div className="flex flex-wrap gap-2">
          {highlightDifferences(targetSentence, result.transcript)}
        </div>
        <div className="flex items-center space-x-4 mt-3 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-gray-600">Correct</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span className="text-gray-600">Needs improvement</span>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Confidence Level</span>
          <span className="font-bold text-gray-900">{result.confidence}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${result.confidence}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay