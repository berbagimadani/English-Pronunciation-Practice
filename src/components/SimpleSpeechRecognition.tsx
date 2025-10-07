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
  
  // Enhanced refs for proper lifecycle management
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const accumulatedTranscriptRef = useRef('')
  const isRecordingRef = useRef(false)
  const recognitionRestartRef = useRef<number | null>(null)
  const sessionIdRef = useRef<string>('')
  const lastResultTimeRef = useRef<number>(0)
  
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

  // Enhanced accuracy calculation with deduplication
  const calculateAccuracy = (target: string, spoken: string): number => {
    // Clean and deduplicate spoken text
    const cleanSpoken = deduplicateText(spoken)
    
    const targetWords = target.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0)
    const spokenWords = cleanSpoken.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0)
    
    let matches = 0
    const maxLength = Math.max(targetWords.length, spokenWords.length)
    
    for (let i = 0; i < Math.min(targetWords.length, spokenWords.length); i++) {
      if (targetWords[i] === spokenWords[i]) {
        matches++
      }
    }
    
    return Math.round((matches / maxLength) * 100)
  }

  // Deduplicate repeated words/phrases in transcript
  const deduplicateText = (text: string): string => {
    if (!text) return ''
    
    const words = text.trim().split(/\s+/)
    const result: string[] = []
    let lastWord = ''
    let consecutiveCount = 0
    
    for (const word of words) {
      if (word === lastWord) {
        consecutiveCount++
        // Allow max 2 consecutive identical words
        if (consecutiveCount <= 2) {
          result.push(word)
        }
      } else {
        result.push(word)
        lastWord = word
        consecutiveCount = 1
      }
    }
    
    return result.join(' ')
  }

  // Generate unique session ID for tracking
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Enhanced timer with recognition lifecycle management
  const startTimer = () => {
    const duration = calculateAdaptiveTimer
    setRecordingTimeLeft(duration)
    setIsTimerActive(true)
    onTimerUpdate?.(duration, true)
    
    // Generate new session ID
    sessionIdRef.current = generateSessionId()
    console.log(`⏱️ Starting ${duration}s timer - Session: ${sessionIdRef.current}`)
    
    timerIntervalRef.current = setInterval(() => {
      setRecordingTimeLeft(prev => {
        const newTime = prev - 1
        console.log(`⏱️ Timer: ${newTime}s remaining (recording: ${isRecordingRef.current}, session: ${sessionIdRef.current})`)
        onTimerUpdate?.(newTime, newTime > 0)
        
        // Check if recognition is still alive every 3 seconds
        if (newTime > 0 && newTime % 3 === 0 && isRecordingRef.current) {
          checkAndRestartRecognition()
        }
        
        if (newTime <= 0) {
          console.log('⏱️ Timer finished - processing final results')
          finishRecording()
          return 0
        }
        return newTime
      })
    }, 1000)
  }

  // Check if recognition is still active and restart if needed
  const checkAndRestartRecognition = () => {
    const now = Date.now()
    const timeSinceLastResult = now - lastResultTimeRef.current
    
    // If no results for 5+ seconds, recognition might be dead
    if (timeSinceLastResult > 5000 && isRecordingRef.current && isTimerActive) {
      console.log('🔄 Recognition seems inactive, restarting...')
      restartRecognition()
    }
  }

  // Restart recognition during active timer
  const restartRecognition = () => {
    if (!isRecordingRef.current || !isTimerActive) return
    
    console.log('🔄 Restarting recognition to maintain session')
    
    // Clear any existing restart timeout
    if (recognitionRestartRef.current) {
      clearTimeout(recognitionRestartRef.current)
      recognitionRestartRef.current = null
    }
    
    // Stop current recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('Recognition already stopped')
      }
    }
    
    // Restart after short delay
    recognitionRestartRef.current = setTimeout(() => {
      if (isRecordingRef.current && isTimerActive && recognitionRef.current) {
        try {
          console.log('🎤 Restarting recognition for continuous session')
          recognitionRef.current.start()
          lastResultTimeRef.current = Date.now()
        } catch (error) {
          console.error('Failed to restart recognition:', error)
        }
      }
    }, 500)
  }

  const stopTimer = () => {
    console.log(`⏱️ Stopping timer - Session: ${sessionIdRef.current}`)
    
    // Clear timer interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    
    // Clear recognition restart timeout
    if (recognitionRestartRef.current) {
      clearTimeout(recognitionRestartRef.current)
      recognitionRestartRef.current = null
    }
    
    setIsTimerActive(false)
    setRecordingTimeLeft(0)
    onTimerUpdate?.(0, false)
  }

  // Finish recording and process results
  const finishRecording = () => {
    console.log(`🏁 Finishing recording session: ${sessionIdRef.current}`)
    
    // Stop timer first
    stopTimer()
    
    // Mark as not recording
    isRecordingRef.current = false
    
    // Process accumulated results
    if (accumulatedTranscriptRef.current.trim()) {
      console.log('📝 Processing final accumulated results:', accumulatedTranscriptRef.current)
      processResult()
    } else {
      console.log('⚠️ No results accumulated during session')
    }
    
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        console.log('🛑 Recognition stopped successfully')
      } catch (error) {
        console.log('🛑 Recognition already stopped:', error)
      }
    }
    
    // Update parent state
    onStopRecording()
  }

  // Enhanced result processing with deduplication
  const processResult = () => {
    const rawText = accumulatedTranscriptRef.current.trim()
    if (!rawText) {
      console.log('⚠️ No text to process')
      return
    }
    
    // Deduplicate and clean the text
    const cleanedText = deduplicateText(rawText)
    console.log('🎯 Processing result:', {
      raw: rawText,
      cleaned: cleanedText,
      session: sessionIdRef.current
    })
    
    const accuracy = calculateAccuracy(targetSentence, cleanedText)
    const confidence = Math.min(95, Math.max(60, 85 - (rawText.length - cleanedText.length) * 2)) // Reduce confidence for repetitive text
    
    onResult({
      transcript: cleanedText,
      confidence,
      accuracy
    })
    
    // Reset for next session
    accumulatedTranscriptRef.current = ''
    setTranscript('')
    sessionIdRef.current = ''
  }

  // Initialize speech recognition - SIMPLE setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()

      const recognition = recognitionRef.current
      
      // SIMPLE configuration - continuous recording during timer
      recognition.continuous = true   // Keep recording until timer stops
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      console.log('🎤 Simple speech recognition initialized')

      recognition.onstart = () => {
        console.log(`🎤 Recognition started - Session: ${sessionIdRef.current}`)
        isRecordingRef.current = true
        lastResultTimeRef.current = Date.now()
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Update last result time for activity tracking
        lastResultTimeRef.current = Date.now()
        
        console.log(`🎤 Result received (timer: ${recordingTimeLeft}s, session: ${sessionIdRef.current})`)

        let finalTranscript = ''
        let interimTranscript = ''
        let avgConfidence = 0.8

        // Process all results from this event
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const resultConfidence = event.results[i][0].confidence || 0.8
          avgConfidence = resultConfidence
          
          if (event.results[i].isFinal) {
            // Only add high-confidence final results
            if (resultConfidence > 0.6) {
              finalTranscript += transcript
            }
          } else {
            interimTranscript += transcript
          }
        }

        // Accumulate final results with smart deduplication
        if (finalTranscript) {
          const newText = finalTranscript.trim()
          if (newText && newText.length > 0) {
            // Check for immediate repetition
            const currentWords = accumulatedTranscriptRef.current.split(' ')
            const newWords = newText.split(' ')
            
            // Don't add if it's exactly the same as the last few words
            const lastFewWords = currentWords.slice(-newWords.length).join(' ')
            if (lastFewWords.toLowerCase() !== newText.toLowerCase()) {
              accumulatedTranscriptRef.current = accumulatedTranscriptRef.current 
                ? `${accumulatedTranscriptRef.current} ${newText}`.trim()
                : newText
              
              console.log('📝 Added to accumulated:', {
                new: newText,
                total: accumulatedTranscriptRef.current,
                confidence: avgConfidence
              })
            } else {
              console.log('🚫 Skipped duplicate text:', newText)
            }
          }
        }
        
        // Show current text (deduplicated accumulated + interim)
        const displayText = deduplicateText(accumulatedTranscriptRef.current) + 
          (interimTranscript ? ` ${interimTranscript}` : '')
        setTranscript(displayText)
        
        if (interimTranscript) {
          console.log('💬 Interim:', interimTranscript)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('🚨 Recognition error:', event.error)
        
        // Handle different error types
        if (event.error === 'not-allowed') {
          console.error('❌ Permission denied')
          stopRecording()
          requestPermission()
        } else if (event.error === 'no-speech') {
          console.log('🔇 No speech detected - continuing to listen...')
          // Don't stop for no-speech, let timer handle it
        } else if (event.error === 'audio-capture') {
          console.error('🎤 Audio capture error - stopping')
          stopRecording()
        } else if (event.error === 'network') {
          console.error('🌐 Network error - stopping')
          stopRecording()
        } else {
          console.log(`⚠️ Minor error (${event.error}) - continuing...`)
          // For other minor errors, don't stop - let timer control
        }
      }

      recognition.onend = () => {
        console.log(`🛑 Recognition ended - Timer active: ${isTimerActive}, Recording: ${isRecordingRef.current}`)
        
        if (isTimerActive && isRecordingRef.current) {
          // Timer still active - this is unexpected end, restart recognition
          console.log('🔄 Unexpected recognition end during timer - restarting')
          restartRecognition()
        } else if (!isTimerActive && isRecordingRef.current) {
          // Timer finished or manual stop
          console.log('🛑 Natural end - timer finished or manual stop')
          finishRecording()
        } else {
          console.log('🛑 Recognition ended - session already finished')
        }
      }
    }

    return () => {
      // Cleanup on unmount
      console.log('🧹 Cleaning up SimpleSpeechRecognition')
      stopTimer()
      if (recognitionRestartRef.current) {
        clearTimeout(recognitionRestartRef.current)
        recognitionRestartRef.current = null
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      isRecordingRef.current = false
      accumulatedTranscriptRef.current = ''
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

  // Enhanced start recording with proper session management
  const startRecording = async () => {
    console.log('🎯 Starting enhanced recording session...')

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
        // Reset all state for new session
        setTranscript('')
        accumulatedTranscriptRef.current = ''
        lastResultTimeRef.current = Date.now()
        
        // Clear any existing timeouts
        if (recognitionRestartRef.current) {
          clearTimeout(recognitionRestartRef.current)
          recognitionRestartRef.current = null
        }
        
        // Update parent state first
        onStartRecording()
        
        // Start timer (this will control the entire session)
        startTimer()
        
        // Mark as recording
        isRecordingRef.current = true
        
        // Small delay for stability
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Start recognition with session tracking
        recognitionRef.current.start()
        console.log(`✅ Enhanced recording started - Session: ${sessionIdRef.current}`)
      } catch (error) {
        console.error('❌ Failed to start recording:', error)
        // Clean up on failure
        isRecordingRef.current = false
        stopTimer()
        onStopRecording()
      }
    }
  }

  // Enhanced stop recording with proper cleanup
  const stopRecording = () => {
    console.log(`🛑 Manual stop requested - Session: ${sessionIdRef.current}`)
    
    // Use the enhanced finish recording method
    finishRecording()
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