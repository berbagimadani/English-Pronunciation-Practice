# SpeakEasy - Feature Documentation

## 🎯 Core Features Overview

### 1. **Dual Practice Modes**
- **Pronunciation Lessons**: Structured learning with difficulty levels
- **Article Practice**: Real-world content from NY Times API

### 2. **Advanced Speech Controls** ⭐ NEW
- **Persistent Settings**: All preferences saved automatically
- **Gender Preference**: Quick Male/Female/Any voice selection
- **Speed Control**: 0.5x to 2.0x playback speed
- **Voice Quality**: Smart detection of Enhanced/Premium voices
- **Real-time Feedback**: Visual "✓ Saved" indicators

### 3. **Interactive Learning**
- **Clickable Words**: IPA phonetic notation on hover/click
- **Sentence Practice**: Break down content into manageable chunks
- **Real-time Recognition**: Instant pronunciation feedback
- **Accuracy Scoring**: Detailed word-by-word analysis

## 🔊 Speech Settings Features

### Persistent Storage
```typescript
// All settings automatically saved to localStorage
interface VoiceSettings {
  rate: number              // Speed: 0.5x - 2.0x
  pitch: number            // Pitch: 0.5 - 2.0
  volume: number           // Volume: 0% - 100%
  voiceURI: string         // Selected voice identifier
  voiceName: string        // Human-readable voice name
  preferredGender: 'male' | 'female' | 'any'
}
```

### Gender Preference System
- **👨 Male Voices**: Prioritizes male voices for natural pronunciation
- **👩 Female Voices**: Selects female voices when preferred
- **🎭 Any Voices**: No gender filter, selects best available

### Smart Voice Selection
1. **Quality Detection**: Prioritizes Enhanced, Premium, Neural voices
2. **Local Preference**: Prefers local system voices for performance
3. **Fallback System**: Auto-selects best alternative if preferred unavailable
4. **Gender Matching**: Finds best voice matching gender preference

## 📱 User Interface

### Compact Mode (Integrated)
```tsx
<SpeechControls 
  text={content}
  compact={true}
  showSettings={true}
/>
```
- Quick Listen button with speed presets
- Dropdown settings panel
- Gender preference buttons
- Minimal space usage

### Full Mode (Dedicated Panel)
```tsx
<SpeechControls 
  text={content}
  compact={false}
/>
```
- Complete settings interface
- Advanced controls (pitch, volume)
- Voice selection with categories
- Test voice functionality

## 🎓 Practice Modes

### Pronunciation Lessons
- **Beginner**: Basic greetings, simple phrases
- **Intermediate**: Daily conversations, common expressions  
- **Advanced**: Business English, complex sentences

### Article Practice
- **Real Content**: NY Times articles via API
- **Sentence Navigation**: Practice individual sentences
- **Contextual Learning**: Real-world pronunciation practice
- **Progressive Difficulty**: Natural content complexity

## 🔧 Technical Implementation

### Speech Synthesis Hook
```typescript
const {
  voices,              // Available voice options
  settings,            // Current voice settings
  isLoading,           // Voice loading state
  isSpeaking,          // Current speaking state
  speak,               // Speak text function
  stop,                // Stop speaking function
  updateSettings,      // Update and save settings
  changePreferredGender // Change gender preference
} = useSpeechSynthesis()
```

### Persistent Storage
- **Auto-save**: Settings saved on every change
- **Auto-restore**: Settings loaded on app start
- **Error Handling**: Graceful fallback if localStorage unavailable
- **Validation**: Ensures selected voices are still available

### Voice Management
- **Async Loading**: Handles browser voice loading delays
- **Event Listeners**: Responds to `voiceschanged` events
- **Categorization**: Groups voices by gender and quality
- **Recommendation**: Suggests best voices for user preferences

## 🚀 Performance Optimizations

### Voice Loading
- **Immediate Check**: Tries to load voices immediately
- **Event Listener**: Waits for `voiceschanged` event
- **Fallback Timer**: Ensures voices load even with delays
- **Caching**: Avoids repeated voice enumeration

### Settings Management
- **Debounced Saves**: Prevents excessive localStorage writes
- **Optimistic Updates**: UI updates immediately, saves asynchronously
- **Memory Efficiency**: Only stores essential settings data

## 🎨 User Experience

### Visual Feedback
- **Saved Indicators**: Green checkmark when settings saved
- **Speaking Animation**: Visual feedback during speech playback
- **Loading States**: Clear indication when voices are loading
- **Error Handling**: User-friendly error messages

### Accessibility
- **Keyboard Navigation**: Full keyboard support for controls
- **Screen Reader**: Proper ARIA labels and descriptions
- **High Contrast**: Clear visual distinction for all elements
- **Mobile Friendly**: Touch-optimized controls for mobile devices

## 📊 Browser Compatibility

### Speech Synthesis Support
- ✅ **Chrome**: Full support with high-quality voices
- ✅ **Edge**: Full support with system voices
- ✅ **Safari**: Good support, some voice limitations
- ⚠️ **Firefox**: Basic support, limited voice options

### Storage Support
- ✅ **localStorage**: Supported in all modern browsers
- ✅ **Fallback**: Graceful degradation if storage unavailable

## 🔮 Future Enhancements

### Planned Features
- **Voice Packs**: Download additional high-quality voices
- **Custom Speed Presets**: User-defined speed shortcuts
- **Voice Favorites**: Quick access to preferred voices
- **Export Settings**: Share settings between devices
- **Cloud Sync**: Synchronize settings across devices

### Technical Improvements
- **Voice Caching**: Cache voice data for faster loading
- **Compression**: Optimize settings storage size
- **Analytics**: Track usage patterns for improvements
- **A/B Testing**: Test different UI approaches