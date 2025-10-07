import { useState } from 'react'
import { useArticles } from '../hooks/useArticles'
import ClickableSentence from './ClickableSentence'
import PhoneticDisplay from './PhoneticDisplay'
import SimpleSpeechRecognition from './SimpleSpeechRecognition'
import ScoreDisplay from './ScoreDisplay'
import SpeechControls from './SpeechControls'
import type { RecognitionResult } from '../types'

interface ArticlePracticeProps {
  onBack: () => void
}

const ArticlePractice = ({ onBack }: ArticlePracticeProps) => {
  const {
    article,
    currentSentence,
    isLoading,
    error,
    loadRandomArticle,
    getRandomSentence,
    hasMultipleSentences
  } = useArticles()

  const [isRecording, setIsRecording] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null)

  // Timer state
  const [timerTimeLeft, setTimerTimeLeft] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)

  const handleRecognitionResult = (result: RecognitionResult) => {
    setLastResult(result)
    setShowResult(true)
    setIsRecording(false)
  }

  const handleRetry = () => {
    setShowResult(false)
    setLastResult(null)
  }

  const handleNewSentence = () => {
    if (hasMultipleSentences) {
      getRandomSentence()
    } else {
      loadRandomArticle()
    }
    handleRetry()
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back to Lessons</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Article Practice</h2>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Loading Article...</h3>
            <p className="text-sm sm:text-base text-gray-600">Fetching fresh content for your practice</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back to Lessons</span>
            <span className="sm:hidden">Back</span>
          </button>
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Article Practice</h2>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl sm:text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Error Loading Content</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadRandomArticle}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <span>←</span>
          <span className="hidden sm:inline">Back to Lessons</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Title */}
          <div className="text-right mr-3">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Article Practice</h2>
            <p className="text-xs sm:text-sm text-gray-600">Real News Content</p>
          </div>



          <button
            onClick={handleNewSentence}
            className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
          >
            <span>🎲</span>
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        {/* Article Info */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 hidden">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
            {article.headline?.main || 'News Article'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Practice with real news content • Fresh articles updated regularly
          </p>
        </div>

        {/* Practice Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-3 sm:mb-4">Practice this sentence:</h4>

          {/* Clickable Sentence */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border-2 border-green-200 shadow-sm">
            <ClickableSentence sentence={currentSentence} />
          </div>

          {/* Phonetic Transcription */}
          <PhoneticDisplay text={currentSentence} className="mb-4 sm:mb-6" />

          {/* Timer Mode Button */}
          <div className="flex justify-center space-x-3 mb-4">
            <SpeechControls
              text={currentSentence}
              compact={true}
              showSettings={true}
              className="flex-shrink-0"
            />

            <button
              onClick={() => {
                console.log('🎯 Article Timer mode: Click - current state:', isRecording)
                if (isRecording) {
                  console.log('🛑 Article Timer mode: Stopping recording...')
                  setIsRecording(false)
                } else {
                  console.log('⏱️ Article Timer mode: Starting adaptive timer recording...')
                  setIsRecording(true)
                }
              }}
              disabled={showResult}
              className={`inline-flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all duration-200 text-sm sm:text-base select-none font-medium shadow-lg ${isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-lg">
                {isTimerActive ? timerTimeLeft : isRecording ? '⏹️' : '🎤'}
              </span>
              <span className="hidden sm:inline">
                {isTimerActive 
                  ? `Recording ${timerTimeLeft}s` 
                  : isRecording 
                    ? 'Stop Recording' 
                    : 'Start Timer Recording'
                }
              </span>
              <span className="sm:hidden">
                {isTimerActive ? `${timerTimeLeft}s` : isRecording ? 'Stop' : 'Record'}
              </span>
            </button>
          </div>

          {/* Timer Mode Info */}
          <div className="mb-4 text-center">
            <div className="inline-flex items-center space-x-2 text-xs text-gray-600">
              <span>⏱️ Adaptive Timer Mode</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Article Practice
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              💡 Timer automatically adjusts based on sentence length for optimal recording
            </div>
          </div>
        </div>

        {/* Simple Speech Recognition Component */}
        <SimpleSpeechRecognition
          targetSentence={currentSentence}
          isRecording={isRecording}
          onStartRecording={() => setIsRecording(true)}
          onStopRecording={() => setIsRecording(false)}
          onResult={handleRecognitionResult}
          showResult={showResult}
          hideButton={true}
          onTimerUpdate={(timeLeft, isActive) => {
            setTimerTimeLeft(timeLeft)
            setIsTimerActive(isActive)
          }}
        />

        {/* Result Display */}
        {showResult && lastResult && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
            <ScoreDisplay result={lastResult} targetSentence={currentSentence} />

            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
              <button
                onClick={handleRetry}
                className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
              <button
                onClick={handleNewSentence}
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                {hasMultipleSentences ? 'Next Sentence' : 'New Article'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Speech Settings Section */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <SpeechControls
          text={currentSentence}
          compact={false}
          showSettings={true}
        />
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">💡 Practice Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">📰</span>
            <p className="text-gray-600">Practice with real news content for authentic language exposure</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">🎯</span>
            <p className="text-gray-600">Click individual words to hear their pronunciation</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-600 mt-0.5">🔄</span>
            <p className="text-gray-600">Use the random button to get fresh content regularly</p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-600 mt-0.5">📊</span>
            <p className="text-gray-600">Focus on accuracy and clear pronunciation</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticlePractice