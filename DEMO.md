# SpeakEasy Demo Guide

## Quick Start Demo

1. **Open the app** at `http://localhost:5173`
2. **Choose a lesson** - Start with "Basic Greetings" (Beginner level)
3. **Listen to pronunciation** - Click the 🔊 Listen button to hear correct pronunciation
4. **Practice speaking** - Click the microphone button and say the sentence clearly
5. **View feedback** - See your accuracy score and word-by-word analysis

## Key Features to Demonstrate

### 1. Responsive Design
- Resize browser window to see mobile-responsive layout
- All components adapt beautifully to different screen sizes

### 2. Speech Recognition
- **Browser Support**: Works best in Chrome, Edge, or Safari
- **Microphone Permission**: Allow microphone access when prompted
- **Real-time Feedback**: Instant transcription and accuracy scoring

### 3. Lesson Progression
- **Multiple Difficulty Levels**: Beginner → Intermediate → Advanced
- **Progress Tracking**: Visual progress bar shows completion status
- **Sentence Variety**: Different types of English sentences for comprehensive practice

### 4. Scoring System
- **Accuracy Percentage**: Based on word-by-word comparison
- **Confidence Level**: How certain the system is about recognition
- **Visual Feedback**: Green (correct) vs Red (needs improvement) highlighting

### 5. Modern UI/UX
- **Gradient Backgrounds**: Beautiful blue-to-indigo gradients
- **Smooth Animations**: Hover effects and transitions
- **Intuitive Icons**: Clear visual indicators for all actions
- **Clean Typography**: Inter font for excellent readability

## Test Sentences by Difficulty

### Beginner
- "Hello, how are you today?"
- "Nice to meet you."
- "Good morning, everyone."

### Intermediate  
- "What time does the meeting start?"
- "Could you please repeat that?"
- "The weather is beautiful today."

### Advanced
- "We need to discuss the quarterly results."
- "The presentation was quite impressive."
- "Our team exceeded expectations this month."

## Technical Features

### Speech Recognition Technology
- Uses Web Speech API (built into modern browsers)
- No external dependencies or API keys required
- Works offline once loaded

### Performance Optimizations
- Fast Vite build system
- Optimized React components
- Efficient state management

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast color schemes
- Clear visual feedback

## Browser Testing

### Recommended Browsers
1. **Chrome** (Best support) - Full speech recognition
2. **Edge** (Good support) - Full speech recognition  
3. **Safari** (iOS 14.5+) - Full speech recognition

### Limited Support
- **Firefox** - No speech recognition (shows fallback message)
- **Older browsers** - Graceful degradation

## Mobile Experience

### Features on Mobile
- Touch-friendly interface
- Responsive button sizes
- Optimized text sizing
- Swipe-friendly navigation

### Mobile-Specific Considerations
- Microphone access required
- May need HTTPS in production
- Battery usage during speech recognition

## Customization Examples

### Adding New Lessons
```typescript
// In src/App.tsx
{
  id: '4',
  title: 'Travel English',
  difficulty: 'intermediate',
  sentences: [
    'Where is the nearest airport?',
    'I would like to book a hotel room.',
    'How much does this cost?'
  ]
}
```

### Changing Color Scheme
```javascript
// In tailwind.config.js
colors: {
  primary: {
    500: '#your-color',
    600: '#your-darker-color',
  }
}
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Deployment Considerations
- Requires HTTPS for speech recognition in production
- Microphone permissions needed
- Modern browser requirement
- CDN-friendly static files

## Troubleshooting Common Issues

### Speech Recognition Not Working
1. Check browser compatibility
2. Allow microphone permissions
3. Ensure HTTPS in production
4. Test microphone hardware

### Styling Issues
1. Verify Tailwind CSS is properly configured
2. Check PostCSS configuration
3. Ensure all dependencies are installed

### Performance Issues
1. Use production build for testing
2. Check network connection for font loading
3. Optimize images if added

This demo showcases a complete, production-ready English pronunciation learning application with modern web technologies!