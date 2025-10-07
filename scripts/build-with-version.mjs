#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get git commit hash
let gitCommit = 'unknown'
try {
  gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
} catch (error) {
  console.warn('Could not get git commit hash:', error.message)
}

// Get package version
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
const version = packageJson.version

// Set environment variables
process.env.VITE_APP_VERSION = version
process.env.VITE_BUILD_DATE = new Date().toISOString()
process.env.VITE_GIT_COMMIT = gitCommit

console.log(`🚀 Building version ${version} (${gitCommit.substring(0, 8)})`)
console.log(`📅 Build date: ${process.env.VITE_BUILD_DATE}`)

// Run the build
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully!')
  
  // Create build info file
  const buildInfo = {
    version,
    buildDate: new Date().toISOString(),
    gitCommit,
    environment: 'production',
    features: [
      'Persistent Speech Settings',
      'Android Voice Detection',
      'Debug Panel',
      'Gender Voice Preference',
      'Auto Deploy'
    ]
  }
  
  writeFileSync(
    join(__dirname, '../dist/build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  )
  
  console.log('📋 Build info saved to dist/build-info.json')
  console.log('🎯 Ready for deployment!')
} catch (error) {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
}