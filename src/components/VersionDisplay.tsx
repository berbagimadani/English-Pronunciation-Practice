import React, { useState } from 'react'

const VersionDisplay: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false)
  
  // Get version from package.json (will be injected by Vite)
  const version = import.meta.env.VITE_APP_VERSION || '1.2.1'
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString()
  const gitCommit = import.meta.env.VITE_GIT_COMMIT || 'unknown'

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-gray-800 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
      >
        v{version}
      </button>
      
      {showDetails && (
        <div className="absolute bottom-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-48 text-xs">
          <div className="space-y-1">
            <div><strong>Version:</strong> {version}</div>
            <div><strong>Build Date:</strong> {new Date(buildDate).toLocaleString()}</div>
            <div><strong>Git Commit:</strong> {gitCommit.substring(0, 8)}</div>
            <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
            <div><strong>Platform:</strong> {navigator.platform}</div>
            <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-gray-600">
              <strong>Features:</strong>
            </div>
            <div className="text-green-600">✅ Persistent Speech Settings</div>
            <div className="text-green-600">✅ Android Voice Detection</div>
            <div className="text-green-600">✅ Debug Panel</div>
            <div className="text-green-600">✅ Gender Voice Preference</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VersionDisplay