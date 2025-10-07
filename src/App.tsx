import { useState } from 'react'
import Header from './components/Header.tsx'
import PronunciationPractice from './components/PronunciationPractice.tsx'
import LessonSelector from './components/LessonSelector.tsx'
import ArticlePractice from './components/ArticlePractice.tsx'
import VoiceDebugPanel from './components/VoiceDebugPanel.tsx'
import { lessons } from './data/lessons'
import type { Lesson } from './types'

type ViewMode = 'selector' | 'lesson' | 'article'

function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('selector')

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setViewMode('lesson')
  }

  const handleSelectArticlePractice = () => {
    setViewMode('article')
  }

  const handleBackToSelector = () => {
    setSelectedLesson(null)
    setViewMode('selector')
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'lesson':
        return selectedLesson ? (
          <PronunciationPractice
            lesson={selectedLesson}
            onBack={handleBackToSelector}
          />
        ) : null

      case 'article':
        return (
          <ArticlePractice
            onBack={handleBackToSelector}
          />
        )

      default:
        return (
          <LessonSelector
            lessons={lessons}
            onSelectLesson={handleSelectLesson}
            onSelectArticlePractice={handleSelectArticlePractice}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        {renderContent()}
      </main>
      <VoiceDebugPanel />
    </div>
  )
}

export default App