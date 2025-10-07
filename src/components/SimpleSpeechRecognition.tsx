import { useState, useEffect, useRef, useMemo } from 'react'
import type { RecognitionResult } from '../types'
import useSpeechRecognition from '../hooks/useSpeechRecognition'

interface SimpleSpeechRecognitionProps {
  targetSentence: string
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onResult: (result: RecognitionResult) => void
  showResult: boolean
  hideButton?: boolean
  onTimerUpdate?: (timeLeft: number, isActive: boolean) => void
}

const SimpleSpeechRecognition = ({
  targetSentence,
  isRecording,
  onStartRecording,
  onStopRecording,
  onResult,
  showResult,
  hideButton = false,
  onTimerUpdate
}: SimpleSpeechRecognitionProps) => {
  // Minimal state - only what we absolutely need
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  
  // Minimal refs - no complex state tracking
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const accumulatedTranscriptRef = useRef('')
  const isRecordingRef = useRef(false)
  
  const { isSupported: apiSupported, hasPermission, permissionError, requestPermission } = useSpeechRecognition()

  const isSecure = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  }, [])

  // Simple adaptive timer calculation
  const calculateAdaptiveTimer = useMemo(() => {
    const words = targetSentence.trim().split(/\s+/).length
    const baseTime = Math.max(8, Math.min(20, (words * 1.2) + 4)) // Simpler formula
    console.log(`⏱️ Simple timer: ${baseTime}s for ${words} words`)
    return Math.round(baseTime)
  }, [targetSentence])

  // Simple accuracy calculation
  const calculateAccuracy = (target: string, spoken: string): number => {
    const targetWords = target.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    const spokenWords = spoken.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    
    let matches = 0
    const maxLength = Math.max(targetWords.length, spokenWords.length)
    
    for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
      if (targetWords[i] === spokenWords[i]) {
        matches++
      }
    }
    
    return Math.round((matches / maxLength) * 100)
  }

  // Simple timer functions
  const startTimer = () => {
    const duration = calculateAdaptiveTimer
    setRecordingTimeLeft(duration)
    setIsTimerActive(true)
    onTimerUpdate?.(duration, true)
    
    console.log(`⏱️ Starting simple ${duration}s timer`)
    
    timerIntervalRef.current = setInterval(() => {
      setRecordingTimeLeft(prev => {
        const newTime = prev - 1
        onTimerUpdate?.(newTime, newTime > 0)
        
        if (newTime <= 0) {
          console.log('⏱️ Timer finished - stopping recording')
          stopRecording()
          return 0
        }
        return newTime
      })
    }, 1000)
  }

  const stopTimer = () => {
    console.log('⏱️ Stopping timer')
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setIsTimerActive(false)
    setRecordingTimeLeft(0)
    onTimerUpdate?.(0, false)
  }

  // Process final result
  const processResult = () => {
    const finalText = accumulatedTranscriptRef.current.trim()
    if (!finalText) return
    
    console.log('🎯 Processing final result:', finalText)
    
    const accuracy = calculateAccuracy(targetSentence, finalText)
    const confidence = 85 // Default confidence
    
    onResult({
      transcript: finalText,
      confidence,
      accuracy
    })
    
    // Reset
    accumulatedTranscriptRef.current = ''
    setTranscript('')
  }

  // Initialize speech recognition - SIMPLE setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()

      const recognition = recognitionRef.current
      
      // SIMPLE configuration - no complex device detection
      recognition.continuous = false  // Single result for stability
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      console.log('🎤 Simple speech recognition initialized')

      recognition.onstart = () => {
        console.log('🎤 Recognition started')
        isRecordingRef.current = true
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('🎤 Recognition result received')

        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // Accumulate final results
        if (finalTranscript) {
          const newText = finalTranscript.trim()
          if (newText) {
            accumulatedTranscriptRef.current = accumulatedTranscriptRef.current 
              ? `${accumulatedTranscriptRef.current} ${newText}`.trim()
              : newText
            console.log('📝 Accumulated:', accumulatedTranscriptRef.current)
          }
        }
        
        // Show current text
        const displayText = accumulatedTranscriptRef.current + 
          (interimTranscript ? ` ${interimTranscript}` : '')
        setTranscript(displayText)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('🚨 Recognition error:', event.error)
        
        // Simple error handling - just stop
        if (event.error === 'not-allowed') {
          console.error('❌ Permission denied')
          requestPermission()
        }
        
        // Don't try to restart - just stop cleanly
        stopRecording()
      }

      recognition.onend = () => {
        console.log('🛑 Recognition ended')
        
        // Simple handling - process results and stop
        if (isRecordingRef.current) {
          processResult()
          stopRecording()
        }
      }
    }

    return () => {
      stopTimer()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [targetSentence])

  // Handle external recording state changes
  useEffect(() => {
    if (hideButton) {
      if (isRecording && !isRecordingRef.current) {
        startRecording()
      } else if (!isRecording && isRecordingRef.current) {
        stopRecording()
      }
    }
  }, [isRecording, hideButton])

  // Simple start recording
  const startRecording = async () => {
    console.log('🎯 Starting simple recording...')

    if (!isSecure || !isSupported) {
      console.error('❌ Not supported or not secure')
      return
    }

    if (hasPermission !== true) {
      console.log('🔐 Requesting permission...')
      const granted = await requestPermission()
      if (!granted) {
        console.error('❌ Permission not granted')
        return
      }
    }

    if (recognitionRef.current && !isRecordingRef.current) {
      try {
        // Reset state
        setTranscript('')
        accumulatedTranscriptRef.current = ''
        isRecordingRef.current = true
        
        // Start timer and recognition
        onStartRecording()
        startTimer()
        
        // Small delay for stability
        await new Promise(resolve => setTimeout(resolve, 200))
        
        recognitionRef.current.start()
        console.log('✅ Simple recording started')
      } catch (error) {
        console.error('❌ Failed to start:', error)
        stopRecording()
      }
    }
  }

  // Simple stop recording
  const stopRecording = () => {
    console.log('🛑 Stopping simple recording...')
    
    stopTimer()
    
    if (accumulatedTranscriptRef.current.trim()) {
      processResult()
    }
    
    isRecordingRef.current = false
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Recognition already stopped')
      }
    }
    
    onStopRecording()
  }

  // Render - SIMPLE UI
  if (!apiSupported || !isSecure) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-yellow-700 mb-3 text-sm">
          Please use Chrome, Edge, or Safari with HTTPS.
        </p>
      </div>
    )
  }

  if (hasPermission === false || permissionError) {
    return (
      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-yellow-600 text-xl">🎙️</span>
        </div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Microphone Access Needed</h3>
        <p className="text-yellow-700 mb-3 text-sm">
          {permissionError || 'Allow microphone access to start practicing.'}
        </p>
        <button
          onClick={() => requestPermission()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Grant Permission
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      {!showResult && (
        <>
          {/* Simple Recording Button */}
          {!hideButton && (
            <div className="mb-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={showResult}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-200 ${
                  isTimerActive
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg'
                    : isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-blue-500 hover:bg-blue-600'
                } disabled:opacity-50`}
              >
                {isTimerActive ? recordingTimeLeft : isRecording ? '⏹️' : '🎤'}
              </button>
            </div>
          )}

          {/* Simple Instructions */}
          <div className="mb-3">
            {!hideButton && (
              <p className="text-gray-600 mb-2 text-sm">
                {isTimerActive ? (
                  <span>Recording for {recordingTimeLeft}s... Speak clearly!</span>
                ) : isRecording ? (
                  <span>Listening... Speak clearly!</span>
                ) : (
                  <span>Click to start {calculateAdaptiveTimer}s timer recording</span>
                )}
              </p>
            )}
            
            {hideButton && isRecording && (
              <p className="text-gray-600 text-sm">
                {isTimerActive 
                  ? `Recording... ${recordingTimeLeft}s remaining`
                  : 'Listening... Speak clearly!'
                }
              </p>
            )}
          </div>

          {/* Simple Timer Display */}
          {isTimerActive && recordingTimeLeft > 0 && (
            <div className="mt-3 mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full border-4 border-blue-500 shadow-lg">
                <span className="text-2xl font-bold text-blue-700">
                  {recordingTimeLeft}
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-2 font-medium">
                ⏱️ {recordingTimeLeft}s remaining
              </p>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2 mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(recordingTimeLeft / calculateAdaptiveTimer) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Simple transcript display */}
          {transcript && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">You said:</span> "{transcript}"
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SimpleSpeechRecognition