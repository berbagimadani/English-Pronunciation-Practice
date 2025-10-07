import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  smoothingTimeConstant?: number
  fftSize?: number
}

export default function useAudioLevel(options: Options = {}) {
  const { smoothingTimeConstant = 0.8, fftSize = 2048 } = options

  const [level, setLevel] = useState(0) // 0..1
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close() } catch {}
      audioCtxRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    analyserRef.current = null
    setIsActive(false)
    setLevel(0)
  }, [])

  const start = useCallback(async () => {
    if (isActive) return
    setError(null)
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext)
      const audioCtx: AudioContext = new AudioCtx()
      audioCtxRef.current = audioCtx

      const analyser = audioCtx.createAnalyser()
      analyser.smoothingTimeConstant = smoothingTimeConstant
      analyser.fftSize = fftSize
      analyserRef.current = analyser

      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)

      const data = new Uint8Array(analyser.fftSize)
      const loop = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteTimeDomainData(data)
        // Compute RMS of time-domain signal normalized 0..1
        let sum = 0
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128 // -1..1
          sum += v * v
        }
        const rms = Math.sqrt(sum / data.length) // 0..~1
        // Light smoothing + clamp
        setLevel(prev => Math.max(rms * 1.1, prev * 0.85))
        rafRef.current = requestAnimationFrame(loop)
      }
      setIsActive(true)
      rafRef.current = requestAnimationFrame(loop)
    } catch (e: any) {
      console.error('Audio level meter error:', e)
      setError(e?.message || 'Failed to access microphone')
      stop()
      return false
    }
    return true
  }, [fftSize, smoothingTimeConstant, isActive, stop])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { level, isActive, error, start, stop }
}

