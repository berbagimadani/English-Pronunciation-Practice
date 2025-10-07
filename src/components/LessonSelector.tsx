import type { Lesson } from '../types'

interface LessonSelectorProps {
  lessons: Lesson[]
  onSelectLesson: (lesson: Lesson) => void
  onSelectArticlePractice: () => void
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
}

const LessonSelector = ({ lessons, onSelectLesson, onSelectArticlePractice }: LessonSelectorProps) => {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
          Choose Your Lesson
        </h2>
        <p className="text-sm sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
          Select a lesson that matches your skill level and start practicing
        </p>
      </div>

      {/* Special Article Practice Card */}
      <div className="mb-6 sm:mb-8">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-95 text-white"
          onClick={onSelectArticlePractice}
        >
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">📰</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Article Practice</h3>
                  <p className="text-green-100 text-xs sm:text-sm">Real news content • Updated daily</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 border border-white border-opacity-30">
                NEW
              </span>
            </div>

            <div className="space-y-2 mb-4 sm:mb-5">
              <p className="text-green-100 text-xs sm:text-sm">
                Practice with real NY Times articles
              </p>
              <div className="text-xs sm:text-sm text-green-50">
                Longer sentences • Authentic content • Random articles
              </div>
            </div>

            <button className="w-full bg-white text-green-600 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold hover:bg-green-50 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base">
              <span>🚀 Try Article Practice</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 active:scale-95"
            onClick={() => onSelectLesson(lesson)}
          >
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 leading-tight pr-2">
                  {lesson.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${difficultyColors[lesson.difficulty]}`}>
                  {lesson.difficulty}
                </span>
              </div>

              <div className="space-y-2 mb-4 sm:mb-5">
                <p className="text-gray-600 text-xs sm:text-sm">
                  {lesson.sentences.length} sentences
                </p>
                <div className="text-xs sm:text-sm text-gray-500 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  Preview: "{lesson.sentences[0]}"
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base">
                <span>Start Practice</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 sm:mt-10 lg:mt-12 bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 lg:p-8">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-blue-600 text-lg sm:text-xl">🎯</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Choose Lesson</h4>
            <p className="text-gray-600 text-xs sm:text-sm">Select a lesson that matches your level</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-green-600 text-lg sm:text-xl">🎤</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Speak Clearly</h4>
            <p className="text-gray-600 text-xs sm:text-sm">Read the sentence aloud with clear pronunciation</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
              <span className="text-purple-600 text-lg sm:text-xl">📊</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Get Feedback</h4>
            <p className="text-gray-600 text-xs sm:text-sm">See how well you pronounced each word</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonSelector