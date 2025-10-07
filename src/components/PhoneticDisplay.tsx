import { textToPhonetic } from '../utils/phonetics'

interface PhoneticDisplayProps {
  text: string
  className?: string
  showLabel?: boolean
}

const PhoneticDisplay = ({ text, className = '', showLabel = true }: PhoneticDisplayProps) => {
  const phoneticText = textToPhonetic(text)
  
  return (
    <div className={`phonetic-display ${className}`}>
      {showLabel && (
        <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
          Pronunciation Guide
        </p>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 sm:px-4 py-2 inline-block max-w-full">
        <p className="text-xs sm:text-sm text-blue-700 font-mono leading-relaxed tracking-wide break-all">
          /{phoneticText}/
        </p>
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 italic">
          <span className="hidden sm:inline">IPA (International Phonetic Alphabet)</span>
          <span className="sm:hidden">IPA</span>
        </p>
      )}
    </div>
  )
}

export default PhoneticDisplay