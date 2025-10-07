# SpeakEasy - English Pronunciation Practice App

A modern, responsive web application for practicing English pronunciation using real-time speech recognition technology.

## Features

- 🎤 **Real-time Speech Recognition** - Uses Web Speech API for instant feedback
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🎯 **Multiple Practice Modes** - Pronunciation lessons and article reading practice
- 📊 **Detailed Feedback** - Word-by-word analysis and accuracy scoring
- 🎨 **Modern UI/UX** - Clean, intuitive interface built with Tailwind CSS
- 🔊 **Advanced Speech Controls** - Customizable voice settings with persistent storage
- 🎭 **Voice Preferences** - Choose between male, female, or any voice with speed control
- 📰 **Article Practice** - Practice with real news articles from NY Times API
- 💾 **Persistent Settings** - All speech preferences saved automatically

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Speech Recognition**: Web Speech API
- **Audio**: Web Speech Synthesis API

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Modern web browser (Chrome, Edge, or Safari recommended for speech recognition)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd english-pronunciation-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Browser Compatibility

### Speech Recognition Support
- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Safari (iOS 14.5+)
- ❌ Firefox (not supported)

### Microphone Permission
The app requires microphone access to function properly. Make sure to allow microphone permissions when prompted.

## How to Use

### Pronunciation Practice Mode
1. **Choose a Lesson**: Select from beginner, intermediate, or advanced lessons
2. **Configure Speech Settings**: Set your preferred voice gender and speed
3. **Listen**: Click the speaker icon to hear the correct pronunciation
4. **Practice**: Click the microphone button and speak the sentence clearly
5. **Get Feedback**: View your accuracy score and word-by-word analysis
6. **Improve**: Use the feedback to improve your pronunciation

### Article Practice Mode
1. **Load Article**: Get a random news article or load a specific one
2. **Sentence Practice**: Practice individual sentences from the article
3. **Listen & Repeat**: Use speech controls to hear pronunciation at your preferred speed
4. **Track Progress**: Monitor your pronunciation accuracy across different content

## Features in Detail

### Practice Modes

#### Pronunciation Lessons
- **Beginner**: Basic greetings and simple phrases
- **Intermediate**: Daily conversations and common expressions
- **Advanced**: Business English and complex sentences

#### Article Practice
- **Real Content**: Practice with actual news articles
- **Sentence-by-Sentence**: Break down articles into manageable chunks
- **Contextual Learning**: Learn pronunciation in real-world contexts

### Advanced Speech Controls

#### Voice Settings (Persistent Storage)
- **Gender Preference**: Choose Male 👨, Female 👩, or Any 🎭 voice
- **Speed Control**: Adjust playback speed from 0.5x to 2.0x
- **Voice Selection**: Choose from available system voices
- **Advanced Settings**: Fine-tune pitch and volume
- **Auto-Save**: All preferences saved automatically to localStorage

#### Smart Voice Features
- **Quality Detection**: Prioritizes high-quality voices (Enhanced, Premium, Neural)
- **Local Voice Preference**: Prefers local system voices for better performance
- **Fallback System**: Automatically selects best available voice if preferred not found
- **Real-time Feedback**: Visual indicators when settings are saved

### Scoring System

- **90-100%**: Excellent pronunciation
- **80-89%**: Great job, very clear
- **70-79%**: Good work, keep practicing
- **60-69%**: Not bad, focus on clarity
- **Below 60%**: Keep practicing, focus on pronunciation

### Feedback Analysis

- **Green highlighting**: Words pronounced correctly
- **Red highlighting**: Words that need improvement
- **Confidence score**: How confident the system is in the recognition
- **Overall accuracy**: Percentage of correctly pronounced words

## Development

### Project Structure

```
src/
├── components/
│   ├── ArticlePractice.tsx     # Article reading practice mode
│   ├── ClickableSentence.tsx   # Interactive sentence component
│   ├── ClickableWord.tsx       # Interactive word component with phonetics
│   ├── LessonSelector.tsx      # Lesson selection interface
│   ├── PhoneticDisplay.tsx     # IPA phonetic notation display
│   ├── PronunciationPractice.tsx # Main pronunciation practice component
│   ├── ScoreDisplay.tsx        # Results and feedback display
│   ├── SpeechControls.tsx      # Advanced speech settings component
│   └── SpeechRecognition.tsx   # Speech recognition logic
├── hooks/
│   ├── useSpeechRecognition.ts # Speech recognition hook
│   ├── useSpeechSynthesis.ts   # Speech synthesis with persistent settings
│   └── useArticles.ts          # Article fetching and management
├── services/
│   └── nytimesApi.ts          # NY Times API integration
├── data/
│   └── lessons.ts             # Pronunciation lesson data
├── types/
│   └── speech.d.ts            # TypeScript type definitions
├── App.tsx                    # Main app component
└── main.tsx                   # App entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Adding New Lessons

Edit the `lessons` array in `src/data/lessons.ts`:

```typescript
export const lessons: Lesson[] = [
  {
    id: 'unique-id',
    title: 'Lesson Title',
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    sentences: [
      'First sentence to practice',
      'Second sentence to practice',
      // ... more sentences
    ]
  }
]
```

### Configuring Speech Settings

The speech settings are automatically managed through localStorage. Users can:

- Select voice gender preference (Male/Female/Any)
- Adjust playback speed (0.5x - 2.0x)
- Choose specific voices from available system voices
- Fine-tune pitch and volume in advanced mode

All settings persist across browser sessions automatically.

### Customizing Styles

The app uses Tailwind CSS. You can customize colors and styles in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

## Troubleshooting

### Speech Recognition Not Working

1. **Check browser compatibility** - Use Chrome, Edge, or Safari
2. **Allow microphone permissions** - Check browser settings
3. **Use HTTPS** - Speech recognition requires a secure connection in production
4. **Check microphone** - Ensure your microphone is working properly

### Audio Playback Issues

1. **Check browser audio settings** - Ensure audio is not muted
2. **Try different browsers** - Some browsers have different speech synthesis support
3. **Check system audio** - Ensure system audio is working

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Web Speech API for speech recognition capabilities
- Tailwind CSS for the beautiful styling system
- React and Vite for the excellent development experience