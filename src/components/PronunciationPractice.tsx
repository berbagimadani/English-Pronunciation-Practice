import { useState, useMemo } from 'react'
import type { Lesson, RecognitionResult } from '../types'
import SpeechRecognition from './SpeechRecognition.tsx'
import ProgressBar from './ProgressBar.tsx'
import ScoreDisplay from './ScoreDisplay.tsx'
import PhoneticDisplay from './PhoneticDisplay.tsx'
import ClickableSentence from './ClickableSentence.tsx'
import SpeechControls from './SpeechControls.tsx'

interface PronunciationPracticeProps {
  lesson: Lesson
  onBack: () => void
}

const PronunciationPractice = ({ lesson, onBack }: PronunciationPracticeProps) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [results, setResults] = useState<RecognitionResult[]>([])
  const [showResult, setShowResult] = useState(false)
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null)


  // Enhanced device detection for microphone behavior
  const deviceInfo = useMemo(() => {
    if (typeof window === 'undefined') return { isAndroidChrome: false, isDesktop: true }
    
    const userAgent = navigator.userAgent.toLowerCase()
    const isAndroid = userAgent.includes('android')
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge') && !userAgent.includes('samsung')
    
    // Safe check for userAgentData
    const userAgentData = (navigator as any).userAgentData
    const isMobile = userAgentData?.mobile || /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    console.log('🔍 Device detection:', {
      userAgent: navigator.userAgent,
      isAndroid,
      isChrome,
      isMobile,
      userAgentData
    })
    
    return {
      isAndroidChrome: isAndroid && isChrome,
      isDesktop: !isMobile,
      isMobile
    }
  }, [])

  // All devices use timer-based recording for maximum stability
  console.log('🎯 All devices: using click-to-start with adaptive timer (maximum stability)')

  const currentSentence = lesson.sentences[currentSentenceIndex]
  const progress = ((currentSentenceIndex + (showResult ? 1 : 0)) / lesson.sentences.length) * 100

  const handleRecognitionResult = (result: RecognitionResult) => {
    setLastResult(result)
    setResults(prev => [...prev, result])
    setShowResult(true)
    setIsRecording(false)
  }

  const handleNext = () => {
    if (currentSentenceIndex < lesson.sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1)
      setShowResult(false)
      setLastResult(null)
    }
  }

  const handleRetry = () => {
    setShowResult(false)
    setLastResult(null)
  }

  const calculateOverallScore = () => {
    if (results.length === 0) return 0
    return Math.round(results.reduce((sum, result) => sum + result.accuracy, 0) / results.length)
  }

  const isCompleted = currentSentenceIndex === lesson.sentences.length - 1 && showResult

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <span>←</span>
          <span className="hidden sm:inline">Back to Lessons</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="text-right">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">{lesson.title}</h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {currentSentenceIndex + 1} of {lesson.sentences.length}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={progress} />

      {/* Main Content */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        {!isCompleted ? (
          <>
            {/* Current Sentence */}
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-3 sm:mb-4">Practice this sentence:</h3>

              {/* Clickable Sentence */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border-2 border-blue-200 shadow-sm">
                <div className="mb-2 sm:mb-3 text-center">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🎯 Interactive Practice
                  </span>
                </div>
                <ClickableSentence sentence={currentSentence} />
              </div>

              {/* Phonetic Transcription */}
              <PhoneticDisplay text={currentSentence} className="mb-4 sm:mb-6" />

              {/* Audio Playback and Microphone Buttons */}
              <div className="flex justify-center space-x-3">
                <SpeechControls 
                  text={currentSentence}
                  compact={true}
                  showSettings={true}
                  className="flex-shrink-0"
                />

                <button
                  onClick={() => {
                    console.log('🎯 Timer mode: Click - current state:', isRecording)
                    if (isRecording) {
                      console.log('🛑 Timer mode: Stopping recording...')
                      setIsRecording(false)
                    } else {
                      console.log('⏱️ Timer mode: Starting adaptive timer recording...')
                      setIsRecording(true)
                    }
                  }}
                  disabled={showResult}
                  className={`inline-flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base select-none ${isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                >
                  <span>{isRecording ? '⏹️' : '🎤'}</span>
                  <span className="hidden sm:inline">
                    {isRecording ? 'Stop Timer' : 'Start Timer'}
                  </span>
                  <span className="sm:hidden">
                    {isRecording ? 'Stop' : 'Timer'}
                  </span>
                </button>
              </div>
            </div>

            {/* Timer Mode Info */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-xs text-gray-600">
                <span>⏱️ Adaptive Timer Mode</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Maximum Stability
                </span>
                <span className="text-gray-400">
                  ({deviceInfo.isAndroidChrome ? 'Android' : deviceInfo.isDesktop ? 'Desktop' : 'Mobile'} detected)
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                💡 Timer automatically adjusts based on sentence length for optimal recording
              </div>
            </div>

            {/* Speech Recognition Component */}
            <SpeechRecognition
              targetSentence={currentSentence}
              isRecording={isRecording}
              onStartRecording={() => setIsRecording(true)}
              onStopRecording={() => setIsRecording(false)}
              onResult={handleRecognitionResult}
              showResult={showResult}
              hideButton={true}
              deviceType={deviceInfo.isDesktop ? 'desktop' : 'mobile'}
              microphoneMode="timer"
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
                  {currentSentenceIndex < lesson.sentences.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      Next Sentence
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Completion Screen */
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-green-600 text-2xl sm:text-3xl">🎉</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Lesson Complete!</h3>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6">
              Overall Score: <span className="font-bold text-green-600">{calculateOverallScore()}%</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">Sentences Practiced</h4>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{lesson.sentences.length}</p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-1 sm:mb-2 text-sm sm:text-base">Average Accuracy</h4>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{calculateOverallScore()}%</p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onBack}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
              >
                Choose Another Lesson
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Speech Settings Section - only show when not completed */}
      {!isCompleted && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <SpeechControls 
            text={currentSentence}
            compact={false}
            showSettings={true}
          />
        </div>
      )}
    </div>
  )
}

export default PronunciationPractice