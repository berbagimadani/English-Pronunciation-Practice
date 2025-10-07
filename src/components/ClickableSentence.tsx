import ClickableWord from './ClickableWord'

interface ClickableSentenceProps {
  sentence: string
  className?: string
}

const ClickableSentence = ({ sentence, className = '' }: ClickableSentenceProps) => {
  // Split sentence into words and punctuation, preserving spaces
  const parts = sentence.split(/(\s+|[^\w\s]+)/).filter(part => part.length > 0)
  
  return (
    <div className={`clickable-sentence ${className}`}>
      <div className="flex flex-wrap items-center justify-center leading-relaxed tracking-tighter">
        {parts.map((part, index) => {
          // If it's just whitespace, render as space
          if (/^\s+$/.test(part)) {
            return <span key={index} className="">{part}</span>
          }
          
          // If it's just punctuation, render as non-clickable
          if (/^[^\w\s]+$/.test(part)) {
            return <span key={index} className="font-medium text-gray-900">{part}</span>
          }
          
          // If it contains letters, make it clickable
          if (/\w/.test(part)) {
            return (
              <ClickableWord 
                key={index} 
                word={part}
                className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-gray-900"
              />
            )
          }
          
          // Default case
          return <span key={index} className="font-medium text-gray-900">{part}</span>
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-500 italic">
          💡 <span className="hidden sm:inline">Click on any word to hear its pronunciation</span>
          <span className="sm:hidden">Tap words to hear pronunciation</span>
        </p>
      </div>
    </div>
  )
}

export default ClickableSentence