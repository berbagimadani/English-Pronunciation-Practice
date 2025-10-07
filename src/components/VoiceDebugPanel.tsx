import React, { useState } from 'react'
import useSpeechSynthesis from '../hooks/useSpeechSynthesis'

const VoiceDebugPanel: React.FC = () => {
  const { voices, settings, speak } = useSpeechSynthesis()
  const [showDebug, setShowDebug] = useState(false)
  const [testText] = useState('Hello, this is a test of the voice.')

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-xs z-50"
      >
        🐛 Debug
      </button>
    )
  }

  const allSystemVoices = speechSynthesis.getVoices()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Voice Debug Panel</h2>
          <button
            onClick={() => setShowDebug(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Current Settings */}
          <div>
            <h3 className="font-semibold mb-2">Current Settings</h3>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <div><strong>Preferred Gender:</strong> {settings.preferredGender}</div>
              <div><strong>Selected Voice:</strong> {settings.voiceName || 'None'}</div>
              <div><strong>Voice URI:</strong> {settings.voiceURI || 'None'}</div>
              <div><strong>Rate:</strong> {settings.rate}</div>
              <div><strong>Pitch:</strong> {settings.pitch}</div>
              <div><strong>Volume:</strong> {settings.volume}</div>
            </div>
          </div>

          {/* Processed Voices */}
          <div>
            <h3 className="font-semibold mb-2">Processed Voices ({voices.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {voices.map((voice, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm border ${
                    voice.voiceURI === settings.voiceURI
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{voice.name}</strong>
                      <span className="ml-2 text-xs bg-gray-200 px-1 rounded">
                        {voice.gender === 'male' ? '👨' : voice.gender === 'female' ? '👩' : '🎭'} {voice.gender}
                      </span>
                      {voice.localService && (
                        <span className="ml-1 text-xs bg-green-200 px-1 rounded">Local</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(testText)
                        const systemVoice = allSystemVoices.find(v => v.voiceURI === voice.voiceURI)
                        if (systemVoice) {
                          utterance.voice = systemVoice
                          speechSynthesis.speak(utterance)
                        }
                      }}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      Test
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {voice.lang} • URI: {voice.voiceURI}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All System Voices */}
          <div>
            <h3 className="font-semibold mb-2">All System Voices ({allSystemVoices.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {allSystemVoices.map((voice, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>{voice.name}</strong>
                      {voice.localService && (
                        <span className="ml-2 text-xs bg-green-200 px-1 rounded">Local</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(testText)
                        utterance.voice = voice
                        speechSynthesis.speak(utterance)
                      }}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      Test
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {voice.lang} • URI: {voice.voiceURI}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Info */}
          <div>
            <h3 className="font-semibold mb-2">Browser Info</h3>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <div><strong>User Agent:</strong> {navigator.userAgent}</div>
              <div><strong>Platform:</strong> {navigator.platform}</div>
              <div><strong>Language:</strong> {navigator.language}</div>
              <div><strong>Speech Synthesis:</strong> {speechSynthesis ? 'Available' : 'Not Available'}</div>
            </div>
          </div>

          {/* Test Current Settings */}
          <div>
            <h3 className="font-semibold mb-2">Test Current Settings</h3>
            <button
              onClick={() => speak(testText)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              🔊 Test Current Voice Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceDebugPanel