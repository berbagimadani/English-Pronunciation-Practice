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
    
    const voiceOptions: VoiceOption[] = availableVoices
      .filter(voice => voice.lang.startsWith('en')) // English voices only
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        gender: detectGender(voice.name),
        voiceURI: voice.voiceURI,
        localService: voice.localService
      }))
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

    setVoices(voiceOptions)
    
    // Auto-select voice based on stored settings or default to best male voice
    if (voiceOptions.length > 0) {
      // Check if stored voice is still available
      const storedVoice = voiceOptions.find(v => v.voiceURI === settings.voiceURI)
      
      if (!settings.voiceURI || !storedVoice) {
        // No stored voice or stored voice not available, select based on preferred gender
        let preferredVoice: VoiceOption
        
        if (settings.preferredGender === 'male') {
          preferredVoice = voiceOptions.find(v => v.gender === 'male') || voiceOptions[0]
        } else if (settings.preferredGender === 'female') {
          preferredVoice = voiceOptions.find(v => v.gender === 'female') || voiceOptions[0]
        } else {
          // 'any' - prefer male but accept any
          preferredVoice = voiceOptions.find(v => v.gender === 'male') || voiceOptions[0]
        }
        
        const newSettings = {
          ...settings,
          voiceURI: preferredVoice.voiceURI,
          voiceName: preferredVoice.name
        }
        setSettings(newSettings)
        saveSettings(newSettings)
      }
    }
    
    setIsLoading(false)
  }, [])

  // Detect gender from voice name (heuristic)
  const detectGender = (voiceName: string): 'male' | 'female' | 'unknown' => {
    const name = voiceName.toLowerCase()
    
    // Common male voice indicators
    const maleIndicators = [
      'male', 'man', 'david', 'daniel', 'alex', 'tom', 'thomas', 'james', 
      'john', 'michael', 'robert', 'william', 'richard', 'charles', 'mark',
      'paul', 'steven', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian',
      'george', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan'
    ]
    
    // Common female voice indicators
    const femaleIndicators = [
      'female', 'woman', 'samantha', 'victoria', 'susan', 'karen', 'sarah',
      'lisa', 'nancy', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth',
      'sharon', 'michelle', 'laura', 'sarah', 'kimberly', 'deborah', 'dorothy',
      'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol'
    ]

    if (maleIndicators.some(indicator => name.includes(indicator))) {
      return 'male'
    }
    if (femaleIndicators.some(indicator => name.includes(indicator))) {
      return 'female'
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
    
    // Set voice if available
    if (settings.voiceURI) {
      const selectedVoice = speechSynthesis.getVoices().find(
        voice => voice.voiceURI === settings.voiceURI
      )
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      setIsSpeaking(false)
    }

    // Speak
    speechSynthesis.speak(utterance)
  }, [settings])

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
    const voicesOfGender = voices.filter(v => 
      gender === 'any' ? true : v.gender === gender
    )
    
    if (voicesOfGender.length > 0) {
      // Select best voice of preferred gender
      const bestVoice = voicesOfGender.find(v => v.localService) || voicesOfGender[0]
      
      const newSettings = {
        ...settings,
        preferredGender: gender,
        voiceURI: bestVoice.voiceURI,
        voiceName: bestVoice.name
      }
      
      setSettings(newSettings)
      saveSettings(newSettings)
    } else {
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