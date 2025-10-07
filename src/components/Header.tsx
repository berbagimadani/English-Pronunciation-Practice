const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">🎤</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">SpeakEasy</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">English Pronunciation Practice</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-xs sm:text-sm text-gray-600 hidden md:block">
              Practice • Learn • Improve
            </div>
            <div className="text-xs text-gray-500 md:hidden">
              🎯 Practice
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header