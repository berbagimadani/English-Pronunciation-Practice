# Android Chrome Speech Settings Troubleshooting

## 🐛 Common Issues on Android Chrome

### Issue: Male Voice Selection Shows Female Voice
This is a common issue on Android Chrome due to:
1. **Voice Detection Algorithm**: Android voice names don't always follow standard patterns
2. **Voice Loading Timing**: Voices load asynchronously and may not be ready when settings are applied
3. **System Voice Limitations**: Android may have limited male voices available

## 🔧 Debugging Steps

### 1. Use Debug Panel
- Look for the red "🐛 Debug" button in bottom-right corner
- Click to open the Voice Debug Panel
- This shows:
  - Current settings
  - All processed voices with gender detection
  - All system voices available
  - Browser information

### 2. Check Voice Detection
In the debug panel, verify:
- **Processed Voices**: Are male voices correctly detected?
- **System Voices**: What voices are actually available on the device?
- **Current Settings**: Is the correct voice URI selected?

### 3. Test Individual Voices
- Use "Test" buttons in debug panel to test each voice
- Compare what you hear vs. what gender is detected
- Note which voices actually sound male/female

## 🛠️ Manual Fixes

### Fix 1: Manual Voice Selection
If gender detection fails:
1. Open Speech Settings (full mode)
2. Click "Advanced" to show all voices
3. Manually test each voice using the dropdown
4. Select the voice that sounds correct to you

### Fix 2: Clear Settings and Restart
If settings seem corrupted:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find localStorage → your domain
4. Delete `speechSynthesisSettings` key
5. Refresh the page
6. Reconfigure voice settings

### Fix 3: Force Voice Reload
If voices aren't loading properly:
1. Refresh the page
2. Wait for "Loading voices..." to complete
3. Check debug panel to see if more voices loaded
4. Try changing gender preference to force re-selection

## 📱 Android-Specific Voice Patterns

### Common Android Voice Names
- **Google Male Voices**: Often contain "male" in name
- **Samsung Voices**: May be numbered (Voice 1, Voice 3 = male)
- **System Voices**: May not have clear gender indicators

### Enhanced Detection Patterns
The app now detects these patterns:
- Explicit gender words: "male", "female", "man", "woman"
- Voice numbering: Odd numbers (1,3,5) often male, Even (2,4,6) often female
- Brand patterns: "Google Male", "Samsung Male", etc.

## 🔍 Debug Console Logs

Open browser developer tools and look for these logs:
```
🔊 Loading voices, total available: X
🎭 Voice "Voice Name" detected as: male/female/unknown
🎯 Processed voice options: [list of voices]
💾 Stored voice check: [URI] Found/Not found
✅ Selected voice: [name] (gender)
🔊 Speaking with voice: [name] (gender)
```

## 🚨 Known Android Limitations

### Limited Male Voices
- Some Android devices have very few or no male voices
- The app will fallback to best available voice
- Consider installing additional TTS engines from Play Store

### Voice Quality Variations
- System voices may vary in quality between devices
- Google TTS usually provides better quality
- Samsung devices may have Samsung-specific voices

### Browser Differences
- Chrome: Best support, most voices
- Samsung Internet: May have different voice set
- Firefox: Limited speech synthesis support

## 🔄 Workarounds

### If No Male Voices Available
1. Install Google Text-to-Speech from Play Store
2. Go to Android Settings → Accessibility → Text-to-Speech
3. Select Google TTS as default engine
4. Download additional voice data if prompted
5. Restart browser and test again

### If Settings Don't Persist
1. Check if browser is in incognito/private mode
2. Ensure site has storage permissions
3. Clear browser cache and try again
4. Check if device has sufficient storage space

## 📊 Reporting Issues

If problems persist, use the debug panel to gather:
1. **Browser Info**: User agent, platform, language
2. **Available Voices**: Complete list with URIs
3. **Current Settings**: What's actually selected
4. **Console Logs**: Any error messages

This information helps identify device-specific issues and improve voice detection.

## 🎯 Best Practices for Android

1. **Test After Selection**: Always test voice after changing gender preference
2. **Use Debug Panel**: Verify voice detection is working correctly
3. **Manual Override**: Don't rely solely on automatic detection
4. **Update TTS**: Keep Google TTS app updated for best voice quality
5. **Restart Browser**: If voices seem stuck, restart Chrome completely

## 🔮 Future Improvements

Planned enhancements for Android compatibility:
- Device-specific voice detection patterns
- Fallback voice quality scoring
- Voice preview before selection
- Better error recovery mechanisms
- Cloud-based voice identification