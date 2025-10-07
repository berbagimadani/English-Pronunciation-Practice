# Netlify Auto-Deploy Setup Guide

## 🚀 Quick Setup Steps

### 1. Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub account
3. Authorize Netlify to access your repositories

### 2. Connect Repository
1. Click "New site from Git"
2. Choose GitHub
3. Select `English-Pronunciation-Practice` repository
4. Configure build settings:
   - **Branch**: `master`
   - **Build command**: `npm run build:prod`
   - **Publish directory**: `dist`

### 3. Get Netlify Credentials
1. Go to Netlify dashboard → Site settings
2. Copy **Site ID** (under Site details)
3. Go to User settings → Applications → Personal access tokens
4. Generate new token, copy **Auth Token**

### 4. Add GitHub Secrets
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `NETLIFY_AUTH_TOKEN`: Your Netlify auth token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

### 5. Test Deployment
1. Make any small change to code
2. Commit and push to master:
   ```bash
   git add .
   git commit -m "test: trigger deployment"
   git push
   ```
3. Check GitHub Actions tab for workflow status
4. Check Netlify dashboard for deployment progress

## 🔧 Configuration Details

### Build Settings
```toml
# netlify.toml (already configured)
[build]
  publish = "dist"
  command = "npm run build:prod"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
```

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml (already configured)
name: Deploy to Netlify
on:
  push:
    branches: [ master ]
```

## 📱 Testing on Android

### After Deployment
1. **Get your Netlify URL** (e.g., `https://amazing-app-123456.netlify.app`)
2. **Open on Android Chrome**
3. **Test voice features**:
   - Click version number (bottom-left) to see build info
   - Try Male/Female voice selection
   - Use Debug panel (🐛 button) to troubleshoot
   - Test speech synthesis with different voices

### Verification Checklist
- [ ] Version number displays correctly
- [ ] Male voice selection works
- [ ] Female voice selection works  
- [ ] Debug panel shows available voices
- [ ] Speech synthesis works on mobile
- [ ] Settings persist after refresh
- [ ] Microphone permissions work

## 🐛 Troubleshooting

### If Auto-Deploy Doesn't Work
1. **Check GitHub Actions**:
   - Go to repository → Actions tab
   - Look for failed workflows
   - Check error logs

2. **Verify Secrets**:
   - GitHub repository → Settings → Secrets
   - Ensure `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are set

3. **Check Netlify Logs**:
   - Netlify dashboard → Deploys
   - Click on failed deployment
   - Review build logs

### If Android Voice Issues Persist
1. **Use Debug Panel**:
   - Click 🐛 button on live site
   - Check "All System Voices" section
   - Test individual voices
   - Note which voices actually work

2. **Check Console Logs**:
   - Open Chrome DevTools on mobile
   - Look for voice detection logs
   - Report issues with specific voice names

3. **Try Different TTS Engines**:
   - Install Google Text-to-Speech from Play Store
   - Set as default in Android Settings
   - Restart browser and test again

## 🎯 Expected Results

### Successful Deployment
- ✅ GitHub Actions workflow completes successfully
- ✅ Netlify shows "Published" status
- ✅ Live site accessible via Netlify URL
- ✅ Version number updates automatically
- ✅ All features work on mobile

### Android Voice Testing
- ✅ Debug panel shows available voices
- ✅ Male/Female selection changes voice correctly
- ✅ Speech synthesis works with selected voice
- ✅ Settings persist across sessions
- ✅ Console logs show correct voice detection

## 🔄 Continuous Deployment

### Workflow
1. **Code changes** → Push to master
2. **GitHub Actions** → Runs build and tests
3. **Netlify Deploy** → Automatic deployment
4. **Live Update** → New version available immediately

### Version Tracking
- Each deployment gets unique version number
- Git commit hash included in build
- Build timestamp for tracking
- Feature list for verification

## 📊 Monitoring

### Check Deployment Status
- **GitHub**: Actions tab shows workflow status
- **Netlify**: Dashboard shows deployment history
- **Live Site**: Version number confirms latest build

### Performance Monitoring
- **Lighthouse**: Test performance scores
- **Mobile Testing**: Verify Android compatibility
- **Voice Quality**: Test TTS functionality
- **Load Times**: Monitor on mobile networks

## 🎉 Success Indicators

When everything is working correctly:
1. **Push to master** triggers automatic deployment
2. **Version number** updates on live site
3. **Android voice selection** works properly
4. **Debug tools** help troubleshoot issues
5. **Settings persist** across browser sessions

Your app will be automatically deployed and updated every time you push changes to the master branch! 🚀