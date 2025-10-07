import { useState } from 'react'
import useSpeechSynthesis from '../hooks/useSpeechSynthesis'

interface SpeechControlsProps {
  text: string
  className?: string
  compact?: boolean
  showSettings?: boolean
}

const SpeechControls = ({ 
  text, 
  className = '', 
  compact = false, 
  showSettings = false 
}: SpeechControlsProps) => {
  const { 
    voices, 
    settings, 
    isLoading, 
    isSpeaking, 
    speak, 
    stop, 
    updateSettings,
    getRecommendedVoices,
    changePreferredGender 
  } = useSpeechSynthesis()
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)

  const handleSpeak = () => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text)
    }
  }

  const handleRateChange = (rate: number) => {
    updateSettings({ rate })
    showSavedFeedback()
  }

  const handleVoiceChange = (voiceURI: string) => {
    const voice = voices.find(v => v.voiceURI === voiceURI)
    if (voice) {
      updateSettings({ 
        voiceURI: voice.voiceURI, 
        voiceName: voice.name 
      })
      showSavedFeedback()
    }
  }

  const showSavedFeedback = () => {
    setShowSavedIndicator(true)
    setTimeout(() => setShowSavedIndicator(false), 2000)
  }

  const speedPresets = [
    { label: 'Slow', value: 0.6, icon: '🐌' },
    { label: 'Normal', value: 0.8, icon: '🚶' },
    { label: 'Fast', value: 1.0, icon: '🏃' },
    { label: 'Very Fast', value: 1.2, icon: '🏃‍♂️💨' }
  ]

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-500">Loading voices...</span>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={handleSpeak}
          disabled={!text}
          className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
            isSpeaking
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <span>{isSpeaking ? '⏹️' : '🔊'}</span>
          <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
        </button>
        
        {showSettings && (
          <div className="flex items-center space-x-1">
            {speedPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleRateChange(preset.value)}
                className={`px-1 py-0.5 text-xs rounded transition-colors ${
                  Math.abs(settings.rate - preset.value) < 0.1
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={`${preset.label} (${preset.value}x)`}
              >
                {preset.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const recommendedVoices = getRecommendedVoices()

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Speech Settings</h3>
          {showSavedIndicator && (
            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full animate-pulse">
              <span>✓</span>
              <span>Saved</span>
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      {/* Play Button */}
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={handleSpeak}
          disabled={!text}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isSpeaking
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <span>{isSpeaking ? '⏹️' : '🔊'}</span>
          <span>{isSpeaking ? 'Stop Speaking' : 'Listen to Text'}</span>
        </button>
        
        {isSpeaking && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-blue-500 rounded animate-pulse"></div>
              <div className="w-1 h-3 bg-blue-400 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-5 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {/* Speed Controls */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Speed: {settings.rate}x
        </label>
        <div className="flex items-center space-x-2">
          {speedPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleRateChange(preset.value)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                Math.abs(settings.rate - preset.value) < 0.1
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              }`}
            >
              <span>{preset.icon}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
        
        {showAdvanced && (
          <div className="mt-2">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x (Very Slow)</span>
              <span>2.0x (Very Fast)</span>
            </div>
          </div>
        )}
      </div>

      {/* Gender Preference */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voice Gender Preference
        </label>
        <div className="flex items-center space-x-2">
          {[
            { value: 'male', label: 'Male', icon: '👨' },
            { value: 'female', label: 'Female', icon: '👩' },
            { value: 'any', label: 'Any', icon: '🎭' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => changePreferredGender(option.value as 'male' | 'female' | 'any')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                settings.preferredGender === option.value
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voice: {settings.voiceName || 'Default'}
          <span className="text-xs text-gray-500 ml-2">
            (Preference: {settings.preferredGender === 'male' ? '👨 Male' : settings.preferredGender === 'female' ? '👩 Female' : '🎭 Any'})
          </span>
        </label>
        {recommendedVoices.length === 0 && (
          <div className="mb-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-2 space-y-1">
            <div>No matching voices found for your preference on this device.</div>
            <div>Showing all available English voices.</div>
            <details className="mt-1">
              <summary className="cursor-pointer text-amber-800 underline">How to enable more voices on Android</summary>
              <ul className="list-disc ml-4 mt-1 space-y-1 text-amber-800">
                <li>Open Settings → System → Languages & input → Text-to-speech output</li>
                <li>Select Google Text-to-speech → Install voice data</li>
                <li>Under English, download a Male voice (if available)</li>
                <li>Restart the browser and reload this page</li>
              </ul>
            </details>
          </div>
        )}
        
        {recommendedVoices.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">Recommended voices:</p>
            <div className="grid grid-cols-1 gap-2">
              {recommendedVoices.map((voice) => (
                <button
                  key={voice.voiceURI}
                  onClick={() => handleVoiceChange(voice.voiceURI)}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                    settings.voiceURI === voice.voiceURI
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{voice.gender === 'male' ? '👨' : voice.gender === 'female' ? '👩' : '🗣️'}</span>
                    <span className="font-medium">{voice.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {voice.localService && (
                      <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">Local</span>
                    )}
                    <span className="text-xs text-gray-500">{voice.lang}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {showAdvanced && voices.length > recommendedVoices.length && (
          <details className="mt-3">
            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
              Show all voices ({voices.length - recommendedVoices.length} more)
            </summary>
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {voices
                .filter(voice => !recommendedVoices.some(rv => rv.voiceURI === voice.voiceURI))
                .map((voice) => (
                  <button
                    key={voice.voiceURI}
                    onClick={() => handleVoiceChange(voice.voiceURI)}
                    className={`w-full flex items-center justify-between p-2 rounded text-xs transition-colors ${
                      settings.voiceURI === voice.voiceURI
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>{voice.name}</span>
                    <span>{voice.gender === 'male' ? '👨' : voice.gender === 'female' ? '👩' : '🗣️'}</span>
                  </button>
                ))}
            </div>
          </details>
        )}
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pitch: {settings.pitch}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => {
                updateSettings({ pitch: parseFloat(e.target.value) })
                showSavedFeedback()
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volume: {Math.round(settings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={(e) => {
                updateSettings({ volume: parseFloat(e.target.value) })
                showSavedFeedback()
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default SpeechControls
