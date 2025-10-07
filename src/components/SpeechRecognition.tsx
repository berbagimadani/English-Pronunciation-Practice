import { useState, useEffect, useRef, useMemo } from 'react'
import { computeAccuracy } from '../utils/textMatch'
import type { RecognitionResult } from '../types'
import useSpeechRecognition from '../hooks/useSpeechRecognition'

interface SpeechRecognitionProps {
  targetSentence: string
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onResult: (result: RecognitionResult) => void
  showResult: boolean
  hideButton?: boolean
  deviceType?: 'desktop' | 'mobile'
  microphoneMode?: 'hold' | 'toggle' | 'timer'
  onTimerUpdate?: (timeLeft: number, isActive: boolean) => void
}

const SpeechRecognition = ({
  targetSentence,
  isRecording,
  onStartRecording,
  onStopRecording,
  onResult,
  showResult,
  hideButton = false,
  deviceType = 'desktop',
  microphoneMode = 'timer',
  onTimerUpdate
}: SpeechRecognitionProps) => {
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [restartAttempts, setRestartAttempts] = useState(0)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const restartCountRef = useRef(0)
  const isRecordingRef = useRef(false)
  
  // Enhanced state for robust Android handling
  const accumulatedTranscriptRef = useRef('')
  const lastResultTimeRef = useRef<number>(0)
  const silenceTimeoutRef = useRef<number | null>(null)
  const isProcessingResultRef = useRef(false)
  
  // Ultra-robust Android state
  const [androidMode, setAndroidMode] = useState(false)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [isAndroidStable, setIsAndroidStable] = useState(false)
  const androidRestartTimeoutRef = useRef<number | null>(null)
  const quickRestartCountRef = useRef(0)
  const lastSuccessTimeRef = useRef<number>(0)
  const finalizeTimeoutRef = useRef<number | null>(null)

  // Simple localStorage backup to persist transcript between auto restarts
  const LS_KEY = 'sr_session_transcript'
  const saveBackup = (text: string) => {
    try {
      if (!text || !text.trim()) return
      localStorage.setItem(LS_KEY, JSON.stringify({ text, ts: Date.now() }))
    } catch {}
  }
  const loadBackup = (): string => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return ''
      const data = JSON.parse(raw)
      return typeof data?.text === 'string' ? data.text : ''
    } catch {
      return ''
    }
  }
  const clearBackup = () => {
    try { localStorage.removeItem(LS_KEY) } catch {}
  }
  
  // Timer mode state
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const timerIntervalRef = useRef<number | null>(null)
  const adaptiveTimerRef = useRef<number | null>(null)
  
  const { isSupported: apiSupported, hasPermission, permissionError, requestPermission } = useSpeechRecognition()

  const isSecure = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  }, [])

  // Calculate adaptive timer based on sentence length
  const calculateAdaptiveTimer = useMemo(() => {
    const words = targetSentence.trim().split(/\s+/).length

    
    // Base calculation: 
    // - 0.8 seconds per word (reading time)
    // - 1.5 seconds per word (speaking time with pauses)
    // - Add 3 seconds buffer for thinking/starting
    // - Minimum 8 seconds, maximum 25 seconds
    
    let baseTime = Math.max(
      8, // Minimum 8 seconds
      Math.min(
        25, // Maximum 25 seconds
        (words * 1.5) + 3 // 1.5s per word + 3s buffer
      )
    )
    // Add small global buffer for more consistent finalization on long sentences
    baseTime += 2
    
    console.log('⏱️ Adaptive timer calculated:', {
      sentence: targetSentence,
      words,
      calculatedTime: baseTime,
      formula: `(${words} words × 1.5s) + 3s buffer = ${baseTime}s`
    })
    
    return Math.round(baseTime)
  }, [targetSentence])

  // Helper function for force restart (same as Force Restart button)
  const forceRestartRecording = async () => {
    console.log('🔄 Force restart requested for external button')
    // Force stop current recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log('Recognition already stopped')
      }
    }
    // Reset counters only; do not clear transcript or accumulated text
    restartCountRef.current = 0
    setRestartAttempts(0)
    
    // Wait a moment then restart - but bypass the isRecording check
    setTimeout(async () => {
      console.log('🎤 Force restart - starting recognition directly...')
      
      if (!isSecure || !isSupported) {
        console.error('❌ Cannot start - not secure or not supported')
        return
      }

      // Ensure microphone permission
      if (hasPermission !== true) {
        console.log('🔐 Requesting microphone permission...')
        const granted = await requestPermission()
        if (!granted) {
          console.error('❌ Microphone permission not granted')
          return
        }
      }

      if (recognitionRef.current) {
        try {
          console.log('🎤 Force restart - attempting to start speech recognition...')
          // Keep current transcript; we want to preserve interim across restarts
          restartCountRef.current = 0
          setRestartAttempts(0)
          isRecordingRef.current = true
          
          // Start recognition directly
          recognitionRef.current.start()
          console.log('✅ Force restart - speech recognition started successfully')
        } catch (error) {
          console.error('❌ Force restart - failed to start speech recognition:', error)
          isRecordingRef.current = false
          onStopRecording()
        }
      }
    }, 500)
  }

  // Effect to handle external recording state changes
  useEffect(() => {
    console.log('🔄 SpeechRecognition useEffect triggered:', { hideButton, isRecording, isRecordingRefCurrent: isRecordingRef.current })
    if (hideButton) {
      if (isRecording && !isRecordingRef.current) {
        console.log('🎤 External button triggered START recording - using force restart')
        // Use force restart logic instead of regular startRecording
        forceRestartRecording()
      } else if (!isRecording && isRecordingRef.current) {
        console.log('🛑 External button triggered STOP recording')
        // Use the existing stopRecording function
        stopRecording()
      }
    }
  }, [isRecording, hideButton])

  useEffect(() => {
    // Detect Android Chrome for ultra-robust mode
    const userAgent = navigator.userAgent.toLowerCase()
    const isAndroidChrome = userAgent.includes('android') && userAgent.includes('chrome')
    setAndroidMode(isAndroidChrome)
    
    console.log('🤖 Android detection:', { isAndroidChrome, userAgent })

    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()

      const recognition = recognitionRef.current
      
      // Optimized configuration for timer mode (maximum stability)
      if (microphoneMode === 'timer') {
        // Timer mode: Simple, stable configuration for all devices
        recognition.continuous = false // Single result mode for stability
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        // Minimal configuration for maximum compatibility
        // @ts-expect-error non-standard properties
        recognition.maxAlternatives = 1
        
        console.log('⏱️ Timer mode: Stable configuration for all devices')
      } else if (isAndroidChrome) {
        // Android Chrome: Stable hold-to-speak configuration (fallback)
        recognition.continuous = microphoneMode === 'toggle'
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        // Android-specific optimizations for stability
        // @ts-expect-error non-standard properties
        recognition.maxAlternatives = 1
        // @ts-expect-error non-standard properties
        recognition.serviceURI = undefined
        
        console.log('🤖 Android Chrome: Stable configuration')
      } else {
        // Desktop/other devices: Standard configuration (fallback)
        recognition.continuous = microphoneMode === 'toggle'
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        console.log('🖥️ Desktop mode: Standard configuration')
      }

      // Bias recognizer toward target sentence words using JSGF (if supported)
      try {
        const anyWin: any = window as any
        const GrammarList = anyWin.SpeechGrammarList || anyWin.webkitSpeechGrammarList
        if (GrammarList && recognitionRef.current) {
          const words = targetSentence
            .replace(/[^\w\s'’-]/g, ' ')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 30) // keep grammar compact
          const unique = Array.from(new Set(words.map(w => w.toLowerCase())))
          if (unique.length) {
            const grammar = `#JSGF V1.0; grammar phrase; public <phrase> = ${unique.join(' | ')} ;`
            const list = new GrammarList()
            list.addFromString(grammar, 1)
            ;(recognitionRef.current as any).grammars = list
            console.log('🧠 Grammar attached to recognizer:', grammar)
          }
        }
      } catch (e) {
        console.log('Grammar attach skipped:', e)
      }

      console.log('🔧 Speech Recognition configured:', {
        deviceType,
        microphoneMode,
        androidMode: isAndroidChrome,
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      })

      recognition.onstart = () => {
        console.log('🎤 Speech recognition STARTED successfully')
        lastSuccessTimeRef.current = Date.now()
        quickRestartCountRef.current = 0
        setConnectionAttempts(0)
        
        if (androidMode) {
          setIsAndroidStable(true)
          console.log('🤖 Android: Connection established successfully')
        }
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('🎤 Speech recognition RESULT received')

        // Reset restart counter since we got a result (recognition is working)
        restartCountRef.current = 0
        setRestartAttempts(0)
        lastResultTimeRef.current = Date.now()

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

        // For timer mode and other modes: accumulate results
        if (microphoneMode === 'timer' || microphoneMode === 'toggle' || microphoneMode === 'hold') {
          if (finalTranscript) {
            // Add to accumulated transcript with space separator
            const newText = finalTranscript.trim()
            if (newText) {
              accumulatedTranscriptRef.current = accumulatedTranscriptRef.current 
                ? `${accumulatedTranscriptRef.current} ${newText}`.trim()
                : newText
              console.log('📱 Accumulated transcript:', accumulatedTranscriptRef.current)
            }
          }
          
          // Show current accumulated + interim text
          const displayText = (accumulatedTranscriptRef.current + (interimTranscript ? ` ${interimTranscript}` : '')).trim()
          if (displayText) {
            setTranscript(displayText)
            // Backup on every update so we don't lose on restart
            saveBackup(displayText)
          }

          // Set up silence detection for mobile
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
          }
          
          // Calculate adaptive timeout based on mode
          let adaptiveTimeout: number
          
          if (microphoneMode === 'timer') {
            // Timer mode: No silence timeout, let the timer handle it
            adaptiveTimeout = calculateAdaptiveTimer * 1000 // Convert to milliseconds
          } else {
            // Other modes: Calculate based on target sentence length
            const targetWords = targetSentence.split(' ').length
            const baseTimeout = microphoneMode === 'toggle' ? 3000 : 1500
            adaptiveTimeout = microphoneMode === 'toggle' 
              ? Math.max(baseTimeout, Math.min(targetWords * 600, 10000)) // 3-10 seconds for toggle
              : Math.max(baseTimeout, Math.min(targetWords * 400, 5000))   // 1.5-5 seconds for hold
          }
          
          silenceTimeoutRef.current = setTimeout(() => {
            console.log('🔇 Silence detected, processing accumulated result')
            processAccumulatedResult()
          }, adaptiveTimeout)
          
        } else {
          // Desktop mode: immediate processing
          const displayText = (finalTranscript || interimTranscript).trim()
          setTranscript(displayText)
          if (displayText) saveBackup(displayText)
          
          if (finalTranscript) {
            const accuracy = calculateAccuracy(targetSentence, finalTranscript)
            const confidence = event.results[0][0].confidence || 0.8

            onResult({
              transcript: finalTranscript,
              confidence: Math.round(confidence * 100),
              accuracy
            })
          }
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('🚨 Speech recognition ERROR:', event.error, event.message)
        
        if (androidMode) {
          setIsAndroidStable(false)
          setConnectionAttempts(prev => prev + 1)
          console.log('🤖 Android error detected, connection attempts:', connectionAttempts + 1)
        }

        // Handle specific errors with Android-specific logic
        if (event.error === 'not-allowed') {
          console.error('❌ Permission denied')
          requestPermission()
          onStopRecording()
        } else if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected')
          if (androidMode && isRecordingRef.current) {
            // Android: Don't stop on no-speech, just restart quickly
            console.log('🤖 Android: Ignoring no-speech error, will restart')
            return // Don't call onStopRecording
          }
        } else if (event.error === 'audio-capture') {
          console.error('❌ Microphone not available')
          onStopRecording()
        } else if (event.error === 'network') {
          console.error('❌ Network error - speech recognition service unavailable')
          if ((androidMode || microphoneMode === 'timer') && isRecordingRef.current) {
            // Android: Try to recover from network errors
            console.log('🤖 Android: Network error, attempting recovery')
            return // Don't stop, let onend handle restart
          }
          onStopRecording()
        } else if (event.error === 'aborted') {
          console.log('⚠️ Recognition aborted')
          if (!androidMode) {
            onStopRecording()
          }
        } else {
          // Unknown error
          if (!androidMode) {
            onStopRecording()
          }
        }
      }

      recognition.onend = () => {
        console.log('🛑 Speech recognition ENDED')

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        // Commit any interim text to accumulation before restart/finalize
        const liveText = (transcript || '').trim()
        if (liveText) {
          // Prefer the live display text which already includes accumulated+interim
          accumulatedTranscriptRef.current = liveText
          console.log('📝 Committed live transcript to accumulation:', accumulatedTranscriptRef.current)
          saveBackup(accumulatedTranscriptRef.current)
        }

        // Timer mode: keep recognition alive until countdown finishes
        if (microphoneMode === 'timer' && isRecordingRef.current && isTimerActive) {
          console.log('⏱️ Timer mode: Recognition ended early, auto-restarting to keep session alive')
          const delay = 150
          setTimeout(() => {
            if (recognitionRef.current && isRecordingRef.current && isTimerActive) {
              try {
                recognitionRef.current.start()
                console.log('⏱️ Timer mode: Recognition restarted')
              } catch (e) {
                console.warn('⏱️ Timer mode: Failed to restart recognition:', e)
              }
            }
          }, delay)
          return
        }
        
        // Stable Android handling for other modes
        if (androidMode && isRecordingRef.current) {
          const timeSinceLastSuccess = Date.now() - lastSuccessTimeRef.current
          const hasAccumulatedText = accumulatedTranscriptRef.current.trim().length > 0
          
          console.log('🤖 Android onend:', {
            timeSinceLastSuccess,
            hasAccumulatedText,
            quickRestartCount: quickRestartCountRef.current,
            connectionAttempts,
            microphoneMode
          })
          
          // For hold mode: Less aggressive restart, more stable
          if (microphoneMode === 'hold') {
            // If we have accumulated text, process it after shorter delay
            if (hasAccumulatedText && timeSinceLastSuccess > 2000) {
              console.log('🤖 Android hold mode: Processing accumulated text')
              processAccumulatedResult()
              restartCountRef.current = 0
              setRestartAttempts(0)
              isRecordingRef.current = false
              onStopRecording()
              return
            }
            
            // Moderate restart attempts for hold mode (less aggressive)
            if (quickRestartCountRef.current < 5) { // Reduced from 15 to 5 for stability
              quickRestartCountRef.current++
              setRestartAttempts(quickRestartCountRef.current)
              
              // Slower restart for stability
              const delay = Math.min(300 + (quickRestartCountRef.current * 200), 1000) // 300ms, 500ms, 700ms, 900ms, 1000ms
              
              if (androidRestartTimeoutRef.current) {
                clearTimeout(androidRestartTimeoutRef.current)
              }
              
              androidRestartTimeoutRef.current = setTimeout(() => {
                if (recognitionRef.current && isRecordingRef.current) {
                  try {
                    console.log(`🤖 Android hold mode restart (attempt ${quickRestartCountRef.current}/5, delay: ${delay}ms)`)
                    recognitionRef.current.start()
                  } catch (error) {
                    console.error('🤖 Android restart failed:', error)
                    if (quickRestartCountRef.current >= 5) {
                      console.log('🤖 Android: Max restarts reached for hold mode')
                      if (hasAccumulatedText) {
                        processAccumulatedResult()
                      }
                      isRecordingRef.current = false
                      setRestartAttempts(0)
                      onStopRecording()
                    }
                  }
                }
              }, delay)
              return
            } else {
              console.log('🤖 Android hold mode: Max restarts reached, processing any accumulated text')
              if (hasAccumulatedText) {
                processAccumulatedResult()
              }
              restartCountRef.current = 0
              setRestartAttempts(0)
              isRecordingRef.current = false
              onStopRecording()
              return
            }
          } else {
            // Toggle mode: Keep more aggressive restart for continuous operation
            if (hasAccumulatedText && timeSinceLastSuccess > 5000) {
              console.log('🤖 Android toggle mode: Processing accumulated text after timeout')
              processAccumulatedResult()
              restartCountRef.current = 0
              setRestartAttempts(0)
              isRecordingRef.current = false
              onStopRecording()
              return
            }
            
            if (quickRestartCountRef.current < 10) { // Moderate for toggle mode
              quickRestartCountRef.current++
              setRestartAttempts(quickRestartCountRef.current)
              
              const delay = Math.min(200 + (quickRestartCountRef.current * 100), 800)
              
              if (androidRestartTimeoutRef.current) {
                clearTimeout(androidRestartTimeoutRef.current)
              }
              
              androidRestartTimeoutRef.current = setTimeout(() => {
                if (recognitionRef.current && isRecordingRef.current) {
                  try {
                    console.log(`🤖 Android toggle mode restart (attempt ${quickRestartCountRef.current}/10, delay: ${delay}ms)`)
                    recognitionRef.current.start()
                  } catch (error) {
                    console.error('🤖 Android restart failed:', error)
                    if (quickRestartCountRef.current >= 10) {
                      console.log('🤖 Android: Max toggle restarts reached')
                      if (hasAccumulatedText) {
                        processAccumulatedResult()
                      }
                      isRecordingRef.current = false
                      setRestartAttempts(0)
                      onStopRecording()
                    }
                  }
                }
              }, delay)
              return
            } else {
              console.log('🤖 Android toggle mode: Max restarts reached, processing any accumulated text')
              if (hasAccumulatedText) {
                processAccumulatedResult()
              }
              restartCountRef.current = 0
              setRestartAttempts(0)
              isRecordingRef.current = false
              onStopRecording()
              return
            }
          }
        }

        // Handle restart logic based on microphone mode (non-Android)
        if (microphoneMode === 'toggle' && !androidMode) {
          // Toggle mode: smart restart with accumulation
          const timeSinceLastResult = Date.now() - lastResultTimeRef.current
          const hasAccumulatedText = accumulatedTranscriptRef.current.trim().length > 0
          
          if (!isRecordingRef.current) {
            // User stopped recording, process accumulated results
            console.log('🔄 Toggle mode: User stopped, processing accumulated results')
            if (hasAccumulatedText) {
              processAccumulatedResult()
            }
            restartCountRef.current = 0
            setRestartAttempts(0)
            onStopRecording()
          } else if (hasAccumulatedText && timeSinceLastResult > 4000) {
            // Has text and been silent for 4+ seconds in toggle mode, probably done
            console.log('🔄 Toggle mode: Long silence with text, processing results')
            processAccumulatedResult()
            restartCountRef.current = 0
            setRestartAttempts(0)
            isRecordingRef.current = false
            onStopRecording()
          } else if (isRecordingRef.current && restartCountRef.current < 6) {
            // Still recording and haven't hit max restarts, continue
            console.log(`🔄 Toggle mode: Attempting to restart recognition (attempt ${restartCountRef.current + 1}/6)`)
            restartCountRef.current++
            setRestartAttempts(restartCountRef.current)

            // Shorter delay for better responsiveness in toggle mode
            const delay = Math.min(300 + (restartCountRef.current * 100), 1000)
            setTimeout(() => {
              if (recognitionRef.current && isRecordingRef.current) {
                try {
                  console.log(`🔄 Restarting speech recognition... (delay: ${delay}ms)`)
                  recognitionRef.current.start()
                } catch (error) {
                  console.error('❌ Failed to restart recognition:', error)
                  if (restartCountRef.current >= 6) {
                    console.log('🔄 Toggle mode: Max restarts reached, processing any accumulated text')
                    if (hasAccumulatedText) {
                      processAccumulatedResult()
                    }
                    isRecordingRef.current = false
                    setRestartAttempts(0)
                    onStopRecording()
                  }
                }
              }
            }, delay)
          } else {
            console.log('🔄 Toggle mode: Stopping recording (max restarts or manual stop)')
            if (hasAccumulatedText) {
              processAccumulatedResult()
            }
            restartCountRef.current = 0
            setRestartAttempts(0)
            isRecordingRef.current = false
            onStopRecording()
          }
        } else if (!androidMode) {
          // Non-Android mobile or hold-to-speak: standard restart logic
          const timeSinceLastResult = Date.now() - lastResultTimeRef.current
          const hasAccumulatedText = accumulatedTranscriptRef.current.trim().length > 0
          
          if (!isRecordingRef.current) {
            console.log('📱 User stopped recording, processing accumulated results')
            if (hasAccumulatedText) {
              processAccumulatedResult()
            }
            restartCountRef.current = 0
            setRestartAttempts(0)
            onStopRecording()
          } else if (hasAccumulatedText && timeSinceLastResult > 3000) {
            console.log('📱 Long silence with text, processing results')
            processAccumulatedResult()
            restartCountRef.current = 0
            setRestartAttempts(0)
            isRecordingRef.current = false
            onStopRecording()
          } else if (isRecordingRef.current && restartCountRef.current < 8) {
            console.log(`🔄 Non-Android: Attempting to restart recognition (attempt ${restartCountRef.current + 1}/8)`)
            restartCountRef.current++
            setRestartAttempts(restartCountRef.current)

            const delay = Math.min(200 + (restartCountRef.current * 100), 800)
            setTimeout(() => {
              if (recognitionRef.current && isRecordingRef.current) {
                try {
                  console.log(`🔄 Restarting speech recognition... (delay: ${delay}ms)`)
                  recognitionRef.current.start()
                } catch (error) {
                  console.error('❌ Failed to restart recognition:', error)
                  if (restartCountRef.current >= 8) {
                    console.log('📱 Max restarts reached, processing any accumulated text')
                    if (hasAccumulatedText) {
                      processAccumulatedResult()
                    }
                    isRecordingRef.current = false
                    setRestartAttempts(0)
                    onStopRecording()
                  }
                }
              }
            }, delay)
          } else {
            console.log('🛑 Stopping recording (max restarts reached or manual stop)')
            if (hasAccumulatedText) {
              processAccumulatedResult()
            }
            restartCountRef.current = 0
            setRestartAttempts(0)
            isRecordingRef.current = false
            onStopRecording()
          }
        }
      }
    }

    return () => {
      // Clear all timeouts on cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (androidRestartTimeoutRef.current) {
        clearTimeout(androidRestartTimeoutRef.current)
      }
      
      // Clear timer-specific timeouts
      stopTimer()

      // Reset all recording state
      isRecordingRef.current = false
      accumulatedTranscriptRef.current = ''
      isProcessingResultRef.current = false
      quickRestartCountRef.current = 0

      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [targetSentence, onResult, onStopRecording])

  // Process accumulated transcript for mobile/hold/timer modes
  const processAccumulatedResult = () => {
    if (isProcessingResultRef.current) return // Prevent double processing
    // Prefer the live display text (includes accumulated + interim)
    const displayText = (transcript || '').trim()
    const accText = accumulatedTranscriptRef.current.trim()
    const finalText = (displayText || accText)
    if (!finalText) return
    
    console.log('🎯 Processing final accumulated result:', finalText)
    isProcessingResultRef.current = true
    
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
    
    const accuracy = calculateAccuracy(targetSentence, finalText)
    const confidence = 85 // Default confidence for accumulated results
    
    onResult({
      transcript: finalText,
      confidence,
      accuracy
    })
    
    // Reset accumulated transcript (keep transcript state for UI if needed)
    accumulatedTranscriptRef.current = ''
    isProcessingResultRef.current = false
    // Clear backup after finalizing result
    clearBackup()
  }

  const calculateAccuracy = (target: string, spoken: string): number => computeAccuracy(target, spoken)

  // Simplified timer functions - timer controls everything
  const startTimer = () => {
    const duration = calculateAdaptiveTimer
    setRecordingTimeLeft(duration)
    setIsTimerActive(true)
    
    // Notify parent about timer start
    onTimerUpdate?.(duration, true)
    
    console.log(`⏱️ Starting ${duration}s countdown timer for: "${targetSentence}"`)
    
    // Update countdown every second - this controls the entire recording state
    timerIntervalRef.current = setInterval(() => {
      setRecordingTimeLeft(prev => {
        const newTime = prev - 1
        console.log(`⏱️ Timer countdown: ${newTime}s remaining`)
        
        // Notify parent about timer update
        onTimerUpdate?.(newTime, newTime > 0)
        
        if (newTime <= 0) {
          // Timer finished - stop everything immediately
          console.log('⏱️ Timer finished - auto stopping recording')
          stopTimerRecording()
          return 0
        }
        return newTime
      })
    }, 1000)
  }
  
  const stopTimer = () => {
    console.log('⏱️ Stopping timer and clearing all intervals')
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (adaptiveTimerRef.current) {
      clearTimeout(adaptiveTimerRef.current)
      adaptiveTimerRef.current = null
    }
    if (finalizeTimeoutRef.current) {
      clearTimeout(finalizeTimeoutRef.current)
      finalizeTimeoutRef.current = null
    }
    setIsTimerActive(false)
    setRecordingTimeLeft(0)
    
    // Notify parent about timer stop
    onTimerUpdate?.(0, false)
  }
  
  const stopTimerRecording = () => {
    console.log('⏱️ Timer recording complete - processing results and updating state')
    
    // Stop timer first
    stopTimer()
    
    // Give engine a brief moment to flush final interim → final
    if (finalizeTimeoutRef.current) clearTimeout(finalizeTimeoutRef.current)
    finalizeTimeoutRef.current = window.setTimeout(() => {
      const snapshot = (transcript || '').trim()
      if (snapshot) {
        accumulatedTranscriptRef.current = snapshot
      }
      if (accumulatedTranscriptRef.current.trim()) {
        console.log('⏱️ Processing (finalized) transcript:', accumulatedTranscriptRef.current)
        processAccumulatedResult()
      }
      finalizeTimeoutRef.current = null
    }, 450)
    
    // Stop recognition and update all states
    isRecordingRef.current = false
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log('⏱️ Recognition already stopped:', error)
      }
    }
    
    // Update parent component state - this will update button
    onStopRecording()
  }

  const startRecording = async () => {
    console.log('🎯 Starting recording process...')
    console.log('States:', { isSecure, isSupported, isRecording, hasPermission, microphoneMode })

    if (!isSecure) {
      console.error('❌ Not secure context')
      return
    }
    if (!isSupported) {
      console.error('❌ Speech recognition not supported')
      return
    }
    if (isRecording) {
      console.log('⚠️ Already recording, skipping')
      return
    }

    // Check audio devices first (but don't block on Ubuntu)
    const hasAudioDevices = await checkAudioDevices()
    if (!hasAudioDevices) {
      console.warn('⚠️ No audio devices detected, but trying anyway (Ubuntu workaround)')
      // Don't return - continue with speech recognition attempt
    }

    // Ensure microphone permission has been granted (preflight)
    if (hasPermission !== true) {
      console.log('🔐 Requesting microphone permission...')
      const granted = await requestPermission()
      if (!granted) {
        console.error('❌ Microphone permission not granted')
        return
      }
    }

    // Remove extra pre-tests to reduce start latency; permission check above is sufficient

    if (recognitionRef.current) {
      try {
        console.log('🎤 Attempting to start speech recognition...')
        // Try to resume from backup if we had a prior partial
        if (!accumulatedTranscriptRef.current && !(transcript && transcript.trim())) {
          const backup = loadBackup()
          if (backup) {
            accumulatedTranscriptRef.current = backup
            setTranscript(backup)
            console.log('💾 Restored transcript from backup')
          }
        }

        // Reset all state for new recording session (but keep any restored text)
        restartCountRef.current = 0
        setRestartAttempts(0)
        isRecordingRef.current = true
        lastResultTimeRef.current = Date.now()
        isProcessingResultRef.current = false
        
        // Android-specific resets
        if (androidMode) {
          quickRestartCountRef.current = 0
          setConnectionAttempts(0)
          setIsAndroidStable(false)
          lastSuccessTimeRef.current = Date.now()
          console.log('🤖 Android: Starting new recording session')
        }

        // Timer mode: Start timer first, then recognition
        if (microphoneMode === 'timer') {
          console.log('⏱️ Timer mode: Start recognition immediately, then timer')
          onStartRecording()
          // Start recognition immediately to avoid missing first words
          recognitionRef.current.start()
          // Start countdown without artificial delay
          startTimer()
          console.log('✅ Timer mode: Recognition + timer started')
        } else {
          // Other modes: Start without artificial delay
          onStartRecording()
          recognitionRef.current.start()
          console.log('✅ Standard mode: Recognition started immediately')
        }

        // Set timeout based on microphone mode
        let timeoutDuration: number
        if (microphoneMode === 'timer') {
          timeoutDuration = (calculateAdaptiveTimer + 2) * 1000 // Timer + 2s buffer
        } else if (microphoneMode === 'toggle') {
          timeoutDuration = 45000 // 45 seconds for toggle mode
        } else {
          timeoutDuration = 15000 // 15 seconds for hold mode
        }
          
        timeoutRef.current = setTimeout(() => {
          console.log(`⏰ Recording timeout after ${timeoutDuration/1000} seconds`)
          if (recognitionRef.current && isRecordingRef.current) {
            if (microphoneMode === 'timer') {
              stopTimerRecording()
            } else {
              isRecordingRef.current = false
              recognitionRef.current.stop()
            }
          }
        }, timeoutDuration)
      } catch (error) {
        console.error('❌ Failed to start speech recognition:', error)
        onStopRecording() // Reset state on error

        // Try to request permission again
        await requestPermission()
      }
    } else {
      console.error('❌ No recognition instance available')
    }
  }

  const stopRecording = () => {
    console.log('🛑 Manual stop recording requested...')

    // Timer mode: Use timer stop function
    if (microphoneMode === 'timer') {
      console.log('⏱️ Timer mode: Manual stop requested')
      stopTimerRecording()
      return
    }

    // Clear all timeouts for other modes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    // Give engine a brief moment to flush final interim → final
    if (finalizeTimeoutRef.current) clearTimeout(finalizeTimeoutRef.current)
    finalizeTimeoutRef.current = window.setTimeout(() => {
      const snapshot = (transcript || '').trim()
      if (snapshot) {
        accumulatedTranscriptRef.current = snapshot
      }
      if ((deviceType === 'mobile' || microphoneMode === 'hold') &&
          accumulatedTranscriptRef.current.trim() &&
          !isProcessingResultRef.current) {
        console.log('📱 Processing accumulated results after short finalization delay')
        processAccumulatedResult()
      }
      finalizeTimeoutRef.current = null
    }, 450)

    // Reset restart counter and recording state
    restartCountRef.current = 0
    setRestartAttempts(0)
    isRecordingRef.current = false

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('❌ Error stopping recognition:', error)
      }
    }
    
    // Update parent state
    onStopRecording()
  }

  // Diagnostic function to check audio devices
  const checkAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      console.log('🎧 Available audio input devices:', audioInputs.length)
      audioInputs.forEach((device, index) => {
        console.log(`  ${index + 1}. ${device.label || 'Unknown Device'} (${device.deviceId})`)
      })

      if (audioInputs.length === 0) {
        console.error('❌ No audio input devices found!')
        return false
      }
      return true
    } catch (error) {
      console.error('❌ Error checking audio devices:', error)
      return false
    }
  }

  if (!isSecure) {
    return (
      <div className="text-center p-4 sm:p-6 lg:p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <span className="text-yellow-600 text-xl sm:text-2xl">🔒</span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">Secure Context Required</h3>
        <p className="text-yellow-700 text-sm sm:text-base">
          Microphone access requires HTTPS or localhost. Please use npm run dev, npm run preview, or deploy over HTTPS.
        </p>
      </div>
    )
  }

  if (!isSupported || !apiSupported) {
    return (
      <div className="text-center p-4 sm:p-6 lg:p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <span className="text-yellow-600 text-xl sm:text-2xl">⚠️</span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">
          Speech Recognition Not Supported
        </h3>
        <p className="text-yellow-700 mb-3 sm:mb-4 text-sm sm:text-base">
          Your browser doesn't support speech recognition. Please try using Chrome, Edge, or Safari.
        </p>
        <p className="text-xs sm:text-sm text-yellow-600">You can still practice by reading the sentences aloud!</p>
      </div>
    )
  }

  if (hasPermission === false || permissionError) {
    return (
      <div className="text-center p-4 sm:p-6 lg:p-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <span className="text-yellow-600 text-xl sm:text-2xl">🎙️</span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2">Microphone Access Issue</h3>
        <p className="text-yellow-700 mb-3 sm:mb-4 text-sm sm:text-base">
          {permissionError || 'Allow microphone access to start practicing.'}
        </p>
        {!permissionError?.includes('not supported') && (
          <button
            onClick={() => requestPermission()}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base mb-3 sm:mb-4"
          >
            Try Again
          </button>
        )}
        <div className="text-xs sm:text-sm text-gray-600">
          <p className="mb-2 font-medium">Ubuntu users - try these commands:</p>
          <div className="text-left space-y-1 max-w-md mx-auto bg-gray-100 p-2 rounded font-mono text-xs">
            <div>pulseaudio --check -v</div>
            <div>pulseaudio --start</div>
            <div>pactl list sources short</div>
            <div>sudo usermod -a -G audio $USER</div>
          </div>
          <p className="mt-2 text-xs">Then restart Chrome and try again</p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      {!showResult && (
        <>
          {/* Recording Button - only show if hideButton is false */}
          {!hideButton && (
            <div className="mb-4 sm:mb-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={showResult}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  microphoneMode === 'timer' && isTimerActive
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg'
                    : isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse-slow'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {microphoneMode === 'timer' && isTimerActive 
                  ? recordingTimeLeft 
                  : isRecording 
                    ? '⏹️' 
                    : '🎤'
                }
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-3 sm:mb-4">
            {!hideButton && (
              <p className="text-gray-600 mb-2 text-sm sm:text-base">
                {isRecording ? (
                  <span>
                    {microphoneMode === 'timer' 
                      ? 'Timer running... Speak clearly!' 
                      : 'Listening... Speak clearly!'
                    }
                    {restartAttempts > 0 && microphoneMode !== 'timer' && (
                      <span className="block text-xs text-orange-600 mt-1">
                        🔄 Reconnecting... (attempt {restartAttempts}/10)
                      </span>
                    )}
                  </span>
                ) : (
                  <span>
                    {microphoneMode === 'timer' ? (
                      <span>
                        {isTimerActive ? (
                          <span>
                            <span className="hidden sm:inline">Recording for {recordingTimeLeft}s... Click to stop early</span>
                            <span className="sm:hidden">Recording {recordingTimeLeft}s... Tap to stop</span>
                          </span>
                        ) : (
                          <span>
                            <span className="hidden sm:inline">Click to start {calculateAdaptiveTimer}s countdown timer</span>
                            <span className="sm:hidden">Tap for {calculateAdaptiveTimer}s timer</span>
                          </span>
                        )}
                      </span>
                    ) : (
                      <span>
                        <span className="hidden sm:inline">Click the microphone to start recording</span>
                        <span className="sm:hidden">Tap microphone to record</span>
                      </span>
                    )}
                  </span>
                )}
              </p>
            )}
            
            {/* Show recording status even when button is hidden */}
            {hideButton && isRecording && (
              <div className="text-center mb-2">
                <p className="text-gray-600 text-sm sm:text-base">
                  <span>
                    {microphoneMode === 'timer' 
                      ? 'Timer Mode: Speaking...' 
                      : androidMode 
                        ? 'Android Mode: Keep holding and speaking...' 
                        : microphoneMode === 'hold' 
                          ? 'Keep holding and speaking...' 
                          : 'Recording... Speak your sentence!'
                    }
                    {restartAttempts > 0 && microphoneMode !== 'timer' && (
                      <span className="block text-xs text-orange-600 mt-1">
                        {androidMode 
                          ? `🤖 Android reconnecting... (${restartAttempts}/15)`
                          : `🔄 Reconnecting... (attempt ${restartAttempts}/${microphoneMode === 'toggle' ? '6' : '8'})`
                        }
                      </span>
                    )}
                  </span>
                </p>
                
                {/* Timer Countdown Display */}
                {microphoneMode === 'timer' && isTimerActive && recordingTimeLeft > 0 && (
                  <div className="mt-3 mb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full border-4 border-blue-500 shadow-lg">
                      <span className="text-3xl font-bold text-blue-700">
                        {recordingTimeLeft}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2 font-medium">
                      ⏱️ Recording... {recordingTimeLeft}s remaining
                    </p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-2 mx-auto">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(recordingTimeLeft / calculateAdaptiveTimer) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Progress indicator for non-timer modes */}
                {microphoneMode !== 'timer' && (
                  <div className="mt-2">
                    <div className="text-xs text-blue-600">
                      {androidMode 
                        ? `🤖 Ultra-robust hold mode • Connection: ${isAndroidStable ? 'Stable' : 'Reconnecting'}`
                        : microphoneMode === 'toggle' 
                          ? '🔄 Collecting speech... Click Stop when finished'
                          : '📱 Collecting speech... Release when done'
                      }
                    </div>
                    {androidMode && connectionAttempts > 0 && (
                      <div className="text-xs text-orange-500 mt-1">
                        Connection attempts: {connectionAttempts} • Keep speaking!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Device-specific instructions */}
            {hideButton && !isRecording && (
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-2">
                  {androidMode 
                    ? '🤖 Android Ultra-Robust Mode: Hold button while speaking, release when done'
                    : microphoneMode === 'toggle' 
                      ? '🔄 Toggle mode: Click to start recording, click again to stop and evaluate'
                      : '📱 Hold mode: Hold button while speaking entire sentence, then release'
                  }
                </p>
                {androidMode && (
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                    ✅ Enhanced stability for Android Chrome (Hold Mode)
                  </div>
                )}
              </div>
            )}


            {isRecording && (
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-blue-500 rounded animate-pulse"></div>
                  <div className="w-1.5 sm:w-2 h-4 sm:h-6 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 sm:w-2 h-8 sm:h-10 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 sm:w-2 h-3 sm:h-4 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1.5 sm:w-2 h-5 sm:h-7 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Live Transcript */}
          {transcript && (
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">What you said:</p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-900">"{transcript}"</p>
            </div>
          )}


          {/* Debug info for Ubuntu users */}
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p>🔍 Debug: Check browser console (F12) for detailed logs</p>
            <p>🐧 Ubuntu users: If microphone icon appears then disappears:</p>
            <div className="ml-4 space-y-1">
              <p>• Run: <code className="bg-gray-100 px-1 rounded">pulseaudio --check -v</code></p>
              <p>• If not running: <code className="bg-gray-100 px-1 rounded">pulseaudio --start</code></p>
              <p>• Check: <code className="bg-gray-100 px-1 rounded">pactl list sources short</code></p>
              <p>• Open: System Settings → Sound → Input</p>
              <p>• Test microphone at: <a href="https://webcammictest.com/check-mic.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">webcammictest.com</a></p>
            </div>

            {/* Manual restart button for Ubuntu users */}
            {!isRecording && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    console.log('🔄 Manual restart requested by user')
                    // Force stop current recognition
                    if (recognitionRef.current) {
                      try {
                        recognitionRef.current.stop()
                      } catch (e) {
                        console.log('Recognition already stopped')
                      }
                    }
                    // Reset all counters and state
                    restartCountRef.current = 0
                    setRestartAttempts(0)
                    isRecordingRef.current = false
                    setTranscript('')
                    // Wait a moment then restart
                    setTimeout(() => {
                      startRecording()
                    }, 500)
                  }}
                  className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                >
                  🔄 Force Restart (Ubuntu Fix)
                </button>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  )
}

export default SpeechRecognition
