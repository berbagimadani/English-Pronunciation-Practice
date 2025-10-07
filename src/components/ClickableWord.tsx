import { useState } from 'react'
import { getWordPhonetic } from '../utils/phonetics'

interface ClickableWordProps {
  word: string
  className?: string
}

const ClickableWord = ({ word, className = '' }: ClickableWordProps) => {
  const [isPlaying, setIsPlaying] = useState(false)

  const cleanWord = word.replace(/[^\w]/g, '') // Remove punctuation for phonetic lookup
  const phonetic = getWordPhonetic(cleanWord)

  // Don't make it clickable if it's empty after cleaning
  if (!cleanWord) {
    return <span className={className}>{word}</span>
  }

  const playWordAudio = () => {
    if (isPlaying) return

    setIsPlaying(true)

    const utterance = new SpeechSynthesisUtterance(cleanWord)
    utterance.rate = 0.6 // Slower rate for individual words
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => {
      setIsPlaying(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
    }

    // Stop any currently playing speech
    speechSynthesis.cancel()
    speechSynthesis.speak(utterance)
  }

  return (
    <span
      onClick={playWordAudio}
      className={`
        inline-block cursor-pointer transition-all duration-200 
        hover:bg-blue-100 hover:text-blue-700 hover:scale-105 hover:shadow-sm
        px-1 py-1 rounded-md relative group select-none
        ${isPlaying ? 'bg-blue-200 text-blue-800 animate-pulse shadow-md' : ''}
        ${className}
      `}
      title={`Click to hear: "${cleanWord}" ${phonetic !== cleanWord ? `(${phonetic})` : ''}`}
    >
      {word}

      {/* Tooltip with phonetic */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20 shadow-lg">
        <div className="text-center">
          <div className="font-semibold text-white">{cleanWord}</div>
          {phonetic !== cleanWord && (
            <div className="font-mono text-blue-200 text-xs mt-1">/{phonetic}/</div>
          )}
          <div className="text-gray-300 text-xs mt-1">🔊 Click to listen</div>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>

      {/* Audio icon indicator */}
      {isPlaying && (
        <span className="absolute -top-2 -right-2 text-sm animate-bounce">🔊</span>
      )}
    </span>
  )
}

export default ClickableWord