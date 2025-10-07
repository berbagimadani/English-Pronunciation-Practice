import { useState, useEffect } from 'react'

export const useSpeechRecognition = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    // Check if we're in a secure context
    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      setPermissionError('Microphone access requires HTTPS or localhost')
      return
    }

    // Check microphone permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          setHasPermission(permissionStatus.state === 'granted')

          permissionStatus.onchange = () => {
            setHasPermission(permissionStatus.state === 'granted')
          }
        })
        .catch(() => {
          // Fallback: assume permission is needed
          setHasPermission(null)
        })
    } else {
      // Browser doesn't support permissions API, try to detect support
      setHasPermission(null)
    }
  }, [])

  const requestPermission = async () => {
    try {
      setPermissionError(null)

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Microphone access not supported in this browser')
        setHasPermission(false)
        return false
      }

      // Add a small delay to prevent rapid successive calls
      await new Promise(resolve => setTimeout(resolve, 100))

      // Try with full constraints first
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          }
        })
      } catch (constraintError) {
        console.warn('⚠️ Full constraints failed, trying basic audio (Ubuntu fallback)')
        // Fallback for Ubuntu - try with basic audio only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        })
      }

      // Stop the stream immediately as we just needed permission
      stream.getTracks().forEach(track => {
        track.stop()
      })

      setHasPermission(true)
      setPermissionError(null)
      return true
    } catch (error: any) {
      console.error('Microphone permission error:', error)

      let errorMessage = 'Microphone access denied'
      if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please check your microphone connection.'
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Microphone not supported in this browser'
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Microphone access blocked by security policy'
      } else if (error.name === 'AbortError') {
        errorMessage = 'Microphone access request was cancelled'
      }

      setPermissionError(errorMessage)
      setHasPermission(false)
      return false
    }
  }

  return {
    isSupported,
    hasPermission,
    permissionError,
    requestPermission
  }
}

export default useSpeechRecognition