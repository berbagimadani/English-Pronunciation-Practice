# Deployment Guide

## 🚀 Auto Deployment Setup

### Netlify Configuration
The app is configured for automatic deployment to Netlify when code is pushed to the `master` branch.

#### Required Netlify Environment Variables
Set these in your Netlify dashboard:
- `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
- `NETLIFY_SITE_ID`: Your Netlify site ID

#### GitHub Secrets Required
Add these to your GitHub repository secrets:
- `NETLIFY_AUTH_TOKEN`: Same as above
- `NETLIFY_SITE_ID`: Same as above

### Build Configuration
- **Build Command**: `npm run build:prod`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **Auto Deploy**: Enabled on `master` branch push

## 📋 Version Management

### Version Display
- Version number shown in bottom-left corner (click to expand)
- Shows: version, build date, git commit, environment info
- Includes feature list and platform information

### Version Bumping
```bash
# Update version in package.json
npm version patch  # 1.2.1 -> 1.2.2
npm version minor  # 1.2.1 -> 1.3.0  
npm version major  # 1.2.1 -> 2.0.0

# Then commit and push
git add package.json
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"
git push
```

## 🔧 Build Process

### Local Development Build
```bash
npm run dev          # Development server
npm run build        # Standard build
npm run build:prod   # Production build with version info
npm run preview      # Preview production build
```

### Production Build Features
- ✅ Version injection from package.json
- ✅ Git commit hash inclusion
- ✅ Build timestamp
- ✅ Environment detection
- ✅ Build info JSON generation
- ✅ Asset optimization
- ✅ Security headers

## 🌐 Deployment Workflow

### Automatic Deployment
1. **Push to master** → Triggers GitHub Action
2. **Build with version info** → Includes git commit, timestamp
3. **Deploy to Netlify** → Automatic deployment
4. **Update live site** → New version available immediately

### Manual Deployment
```bash
# Build locally
npm run build:prod

# Deploy to Netlify (if CLI installed)
netlify deploy --prod --dir=dist
```

## 🔍 Monitoring Deployment

### Check Deployment Status
- **GitHub Actions**: Check workflow status in repository
- **Netlify Dashboard**: View deployment logs and status
- **Live Site**: Check version number in bottom-left corner

### Build Info Endpoint
Access build information at: `https://your-site.netlify.app/build-info.json`

Example response:
```json
{
  "version": "1.2.1",
  "buildDate": "2024-12-10T10:30:00.000Z",
  "gitCommit": "abc123def456...",
  "environment": "production",
  "features": [
    "Persistent Speech Settings",
    "Android Voice Detection",
    "Debug Panel",
    "Gender Voice Preference",
    "Auto Deploy"
  ]
}
```

## 🛡️ Security Configuration

### Headers Applied
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: microphone=(self), camera=(), geolocation=(), payment=()
- **Content-Security-Policy**: Configured for app requirements

### Caching Strategy
- **Static Assets**: 1 year cache with immutable flag
- **HTML Files**: 1 hour cache for faster updates
- **API Responses**: No cache for dynamic content

## 📱 Mobile Optimization

### Android Chrome Specific
- **Microphone Permissions**: Properly configured
- **Voice Detection**: Enhanced for Android TTS engines
- **Debug Panel**: Available for troubleshooting
- **Performance**: Optimized for mobile devices

### PWA Features (Future)
- Service worker for offline functionality
- App manifest for install prompt
- Background sync for settings

## 🔧 Troubleshooting Deployment

### Common Issues

#### Build Fails
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try local build
npm run build:prod
```

#### Deployment Fails
1. Check GitHub Actions logs
2. Verify Netlify secrets are set
3. Check Netlify build logs
4. Verify netlify.toml configuration

#### Version Not Updating
1. Check if version was bumped in package.json
2. Verify build script is running correctly
3. Clear browser cache
4. Check build-info.json endpoint

### Debug Commands
```bash
# Check current version
node -p "require('./package.json').version"

# Check git commit
git rev-parse HEAD

# Test build locally
npm run build:prod && npm run preview
```

## 🚀 Performance Monitoring

### Metrics to Track
- **Build Time**: Should be under 2 minutes
- **Bundle Size**: Monitor for size increases
- **Load Time**: Test on mobile devices
- **Voice Loading**: Check Android compatibility

### Optimization
- Code splitting for better loading
- Asset compression and minification
- CDN delivery via Netlify
- Lazy loading for components