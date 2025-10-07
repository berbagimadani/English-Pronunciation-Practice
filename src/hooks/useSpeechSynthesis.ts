import { useState, useEffect, useCallback } from 'react'

export interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  voiceURI: string
  voiceName: string
  preferredGender: 'male' | 'female' | 'any'
}

export interface VoiceOption {
  name: string
  lang: string
  gender: 'male' | 'female' | 'unknown'
  voiceURI: string
  localService: boolean
}

// Storage key for persisting settings
const SPEECH_SETTINGS_KEY = 'speechSynthesisSettings'

// Load settings from localStorage
const loadStoredSettings = (): Partial<VoiceSettings> => {
  try {
    const stored = localStorage.getItem(SPEECH_SETTINGS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.warn('Failed to load speech settings from localStorage:', error)
    return {}
  }
}

// Save settings to localStorage
const saveSettings = (settings: VoiceSettings) => {
  try {
    localStorage.setItem(SPEECH_SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save speech settings to localStorage:', error)
  }
}

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Initialize settings with stored values
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    const storedSettings = loadStoredSettings()
    return {
      rate: storedSettings.rate || 0.8,
      pitch: storedSettings.pitch || 1,
      volume: storedSettings.volume || 1,
      voiceURI: storedSettings.voiceURI || '',
      voiceName: storedSettings.voiceName || '',
      preferredGender: storedSettings.preferredGender || 'male'
    }
  })

  // Load available voices
  const loadVoices = useCallback(() => {
    const availableVoices = speechSynthesis.getVoices()
    console.log('🔊 Loading voices, total available:', availableVoices.length)
    
    // Debug: Log all available voices for troubleshooting
    availableVoices.forEach((voice, index) => {
      console.log(`Voice ${index}: ${voice.name} (${voice.lang}) - URI: ${voice.voiceURI} - Local: ${voice.localService}`)
    })
    
    const voiceOptions: VoiceOption[] = availableVoices
      .filter(voice => voice.lang.startsWith('en')) // English voices only
      .map(voice => {
        const gender = detectGender(voice.name)
        console.log(`🎭 Voice "${voice.name}" detected as: ${gender}`)
        return {
          name: voice.name,
          lang: voice.lang,
          gender,
          voiceURI: voice.voiceURI,
          localService: voice.localService
        }
      })
      .sort((a, b) => {
        // Prioritize local voices and male voices
        if (a.localService !== b.localService) {
          return a.localService ? -1 : 1
        }
        if (a.gender !== b.gender) {
          return a.gender === 'male' ? -1 : 1
        }
        return a.name.localeCompare(b.name)
      })

    console.log('🎯 Processed voice options:', voiceOptions.map(v => `${v.name} (${v.gender})`))
    setVoices(voiceOptions)
    
    // Auto-select voice based on stored settings or default to best male voice
    if (voiceOptions.length > 0) {
      // Check if stored voice is still available
      const storedVoice = voiceOptions.find(v => v.voiceURI === settings.voiceURI)
      console.log('💾 Stored voice check:', settings.voiceURI, storedVoice ? 'Found' : 'Not found')
      
      if (!settings.voiceURI || !storedVoice) {
        // No stored voice or stored voice not available, select based on preferred gender
        let preferredVoice: VoiceOption
        
        console.log('🎭 Selecting voice for preferred gender:', settings.preferredGender)
        
        if (settings.preferredGender === 'male') {
          preferredVoice = voiceOptions.find(v => v.gender === 'male') || voiceOptions[0]
        } else if (settings.preferredGender === 'female') {
          preferredVoice = voiceOptions.find(v => v.gender === 'female') || voiceOptions[0]
        } else {
          // 'any' - prefer male but accept any
          preferredVoice = voiceOptions.find(v => v.gender === 'male') || voiceOptions[0]
        }
        
        console.log('✅ Selected voice:', preferredVoice.name, `(${preferredVoice.gender})`)
        
        const newSettings = {
          ...settings,
          voiceURI: preferredVoice.voiceURI,
          voiceName: preferredVoice.name
        }
        setSettings(newSettings)
        saveSettings(newSettings)
      } else {
        console.log('✅ Using stored voice:', storedVoice.name, `(${storedVoice.gender})`)
      }
    }
    
    setIsLoading(false)
  }, [])

  // Enhanced gender detection for Android and other platforms
  const detectGender = (voiceName: string): 'male' | 'female' | 'unknown' => {
    const name = voiceName.toLowerCase()
    
    // Enhanced Android-specific voice patterns
    const androidMalePatterns = [
      // Explicit gender indicators
      'male', 'man', 'masculine', 'boy', 'guy', 'gentleman', 'mr', 'sir',
      // Google TTS voices
      'google male', 'android male', 'google us male', 'google uk male',
      // Samsung voices
      'samsung male', 'bixby male', 'samsung english male',
      // Common male names in TTS
      'david', 'daniel', 'alex', 'alexander', 'tom', 'thomas', 'james', 'john', 
      'michael', 'robert', 'william', 'richard', 'charles', 'mark', 'paul', 
      'steven', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 
      'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan', 'christopher', 
      'matthew', 'anthony', 'donald', 'steven', 'andrew', 'joshua', 'daniel',
      // Android system voice patterns
      'voice 1', 'voice 3', 'voice 5', 'voice 7', 'voice 9', // Odd numbers often male
      'tts male', 'speech male', 'narrator male'
    ]
    
    const androidFemalePatterns = [
      // Explicit gender indicators
      'female', 'woman', 'feminine', 'girl', 'lady', 'miss', 'mrs', 'ms', 'madam',
      // Google TTS voices
      'google female', 'android female', 'google us female', 'google uk female',
      // Samsung voices
      'samsung female', 'bixby female', 'samsung english female',
      // Common female names in TTS
      'samantha', 'victoria', 'susan', 'karen', 'sarah', 'lisa', 'nancy',
      'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon',
      'michelle', 'laura', 'kimberly', 'deborah', 'dorothy', 'amy', 'angela',
      'brenda', 'emma', 'olivia', 'ava', 'isabella', 'sophia', 'charlotte',
      'jennifer', 'patricia', 'maria', 'elizabeth', 'linda', 'barbara',
      // Android system voice patterns
      'voice 2', 'voice 4', 'voice 6', 'voice 8', 'voice 10', // Even numbers often female
      'tts female', 'speech female', 'narrator female'
    ]

    // Check for explicit gender indicators first
    if (androidMalePatterns.some(pattern => name.includes(pattern))) {
      return 'male'
    }
    if (androidFemalePatterns.some(pattern => name.includes(pattern))) {
      return 'female'
    }
    
    // Additional heuristics for Android voices
    // Many Android voices don't have clear gender indicators in names
    // We'll use additional context clues
    
    // Check for numbered voices (often gender-specific on Android)
    if (name.includes('voice 1') || name.includes('voice 3') || name.includes('voice 5')) {
      return 'male' // Odd numbers often male on Android
    }
    if (name.includes('voice 2') || name.includes('voice 4') || name.includes('voice 6')) {
      return 'female' // Even numbers often female on Android
    }
    
    return 'unknown'
  }

  // Initialize voices
  useEffect(() => {
    // Load voices immediately if available
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices()
    }

    // Listen for voices changed event (some browsers load voices asynchronously)
    const handleVoicesChanged = () => {
      loadVoices()
    }

    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
    
    // Fallback timeout
    const timeout = setTimeout(() => {
      if (voices.length === 0) {
        loadVoices()
      }
    }, 1000)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
      clearTimeout(timeout)
    }
  }, [loadVoices, voices.length])

  // Speak text with current settings
  const speak = useCallback((text: string) => {
    // Stop any current speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Apply settings
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = settings.volume
    
    // Set voice if available with enhanced error handling
    if (settings.voiceURI) {
      const allVoices = speechSynthesis.getVoices()
      const selectedVoice = allVoices.find(voice => voice.voiceURI === settings.voiceURI)
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
        console.log('🔊 Speaking with voice:', selectedVoice.name, `(${detectGender(selectedVoice.name)})`)
      } else {
        console.warn('⚠️ Selected voice not found, using default. URI:', settings.voiceURI)
        // Try to find a voice that matches the preferred gender
        const fallbackVoice = voices.find(v => v.gender === settings.preferredGender)
        if (fallbackVoice) {
          const actualFallback = allVoices.find(v => v.voiceURI === fallbackVoice.voiceURI)
          if (actualFallback) {
            utterance.voice = actualFallback
            console.log('🔄 Using fallback voice:', actualFallback.name)
          }
        }
      }
    } else {
      console.log('🔊 Speaking with default voice (no voice selected)')
    }

    // Event handlers with enhanced logging
    utterance.onstart = () => {
      console.log('🎤 Speech started')
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      console.log('🎤 Speech ended')
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('🚨 Speech synthesis error:', event.error)
      setIsSpeaking(false)
      
      // Try to recover by using default voice
      if (utterance.voice) {
        console.log('🔄 Retrying with default voice...')
        const retryUtterance = new SpeechSynthesisUtterance(text)
        retryUtterance.rate = settings.rate
        retryUtterance.pitch = settings.pitch
        retryUtterance.volume = settings.volume
        // Don't set voice, use default
        speechSynthesis.speak(retryUtterance)
      }
    }

    // Speak
    speechSynthesis.speak(utterance)
  }, [settings, voices])

  // Stop speaking
  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Update settings and save to localStorage
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings }
      saveSettings(updatedSettings)
      return updatedSettings
    })
  }, [])

  // Get recommended voices based on preferred gender
  const getRecommendedVoices = useCallback(() => {
    return voices.filter(voice => {
      const name = voice.name.toLowerCase()
      // Prefer voices that sound more natural
      const naturalIndicators = ['enhanced', 'premium', 'neural', 'natural', 'high-quality']
      const isNatural = naturalIndicators.some(indicator => name.includes(indicator))
      
      // Filter by preferred gender first
      if (settings.preferredGender !== 'any' && voice.gender !== settings.preferredGender) {
        return false
      }
      
      return voice.gender === settings.preferredGender || isNatural || voice.localService
    }).slice(0, 5) // Top 5 recommendations
  }, [voices, settings.preferredGender])

  // Change preferred gender and auto-select best voice of that gender
  const changePreferredGender = useCallback((gender: 'male' | 'female' | 'any') => {
    console.log('🎭 Changing preferred gender to:', gender)
    
    const voicesOfGender = voices.filter(v => 
      gender === 'any' ? true : v.gender === gender
    )
    
    console.log(`🔍 Found ${voicesOfGender.length} voices for gender "${gender}":`, 
      voicesOfGender.map(v => `${v.name} (${v.gender})`))
    
    if (voicesOfGender.length > 0) {
      // Select best voice of preferred gender
      // Priority: local service > high quality indicators > first available
      const bestVoice = voicesOfGender.find(v => v.localService) || 
                       voicesOfGender.find(v => {
                         const name = v.name.toLowerCase()
                         return name.includes('enhanced') || name.includes('premium') || name.includes('neural')
                       }) ||
                       voicesOfGender[0]
      
      console.log('✅ Selected best voice:', bestVoice.name, `(${bestVoice.gender})`)
      
      const newSettings = {
        ...settings,
        preferredGender: gender,
        voiceURI: bestVoice.voiceURI,
        voiceName: bestVoice.name
      }
      
      setSettings(newSettings)
      saveSettings(newSettings)
      
      // Test the voice immediately to verify it works
      setTimeout(() => {
        const testUtterance = new SpeechSynthesisUtterance('Test')
        const actualVoice = speechSynthesis.getVoices().find(v => v.voiceURI === bestVoice.voiceURI)
        if (actualVoice) {
          testUtterance.voice = actualVoice
          testUtterance.volume = 0.1 // Very quiet test
          console.log('🧪 Testing voice:', actualVoice.name)
          speechSynthesis.speak(testUtterance)
        }
      }, 100)
      
    } else {
      console.warn(`⚠️ No voices found for gender "${gender}", updating preference only`)
      // Just update the preference
      updateSettings({ preferredGender: gender })
    }
  }, [voices, settings, updateSettings])

  return {
    voices,
    settings,
    isLoading,
    isSpeaking,
    speak,
    stop,
    updateSettings,
    getRecommendedVoices,
    changePreferredGender
  }
}

export default useSpeechSynthesis