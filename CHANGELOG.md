# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2024-12-10

### Added
- **Persistent Speech Settings**: All speech preferences now saved automatically to localStorage
- **Gender Voice Preference**: Quick selection between Male 👨, Female 👩, or Any 🎭 voices
- **Advanced Speech Controls**: Comprehensive voice settings with speed, pitch, and volume control
- **Smart Voice Selection**: Automatic selection of best quality voices based on preferences
- **Real-time Settings Feedback**: Visual "✓ Saved" indicator when settings are updated
- **Voice Quality Detection**: Prioritizes Enhanced, Premium, and Neural voices
- **Local Voice Preference**: Prefers local system voices for better performance

### Enhanced
- **Speech Controls Component**: Complete redesign with compact and full modes
- **Voice Management**: Improved voice loading and categorization system
- **Settings Persistence**: All user preferences maintained across browser sessions
- **Error Handling**: Better fallback system when preferred voices are unavailable

### Technical Improvements
- **useSpeechSynthesis Hook**: Enhanced with localStorage integration
- **Voice Detection**: Improved gender detection algorithm for voice categorization
- **Settings Management**: Centralized settings with automatic save functionality
- **Performance**: Optimized voice loading and selection process

## [1.1.0] - 2024-12-09

### Added
- **Article Practice Mode**: Practice pronunciation with real news articles
- **NY Times API Integration**: Fetch real articles for practice content
- **Clickable Sentence Component**: Interactive sentence-by-sentence practice
- **Clickable Word Component**: Word-level interaction with phonetic display
- **Phonetic Display**: IPA notation for pronunciation guidance
- **Article Management**: Random article loading and sentence navigation

### Enhanced
- **Dual Practice Modes**: Choose between structured lessons or article practice
- **Real Content**: Practice with authentic English content from news sources
- **Interactive Elements**: Click on words and sentences for detailed feedback
- **Responsive Design**: Improved mobile experience for both practice modes

## [1.0.0] - 2024-12-08

### Added
- **Initial Release**: Basic pronunciation practice application
- **Speech Recognition**: Real-time pronunciation feedback using Web Speech API
- **Lesson System**: Beginner, Intermediate, and Advanced difficulty levels
- **Scoring System**: Accuracy percentage and confidence scoring
- **Audio Playback**: Text-to-speech for correct pronunciation examples
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Modern UI**: Clean, intuitive user interface

### Features
- Real-time speech recognition and feedback
- Multiple difficulty levels with curated lessons
- Word-by-word pronunciation analysis
- Accuracy scoring and improvement suggestions
- Cross-browser compatibility (Chrome, Edge, Safari)
- Mobile-responsive design