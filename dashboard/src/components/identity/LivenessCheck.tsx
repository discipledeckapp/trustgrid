'use client'
import { useRef, useState, useEffect } from 'react'
import { Camera, RefreshCw, Check, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface LivenessCheckProps {
  workerId: string
  onCapture: (photoBase64: string, sessionId: string | null) => void
  onSkip?: () => void
}

export function LivenessCheck({ workerId, onCapture, onSkip }: LivenessCheckProps) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)

  const [phase, setPhase] = useState<'requesting' | 'live' | 'countdown' | 'preview' | 'error'>('requesting')
  const [countdown, setCountdown] = useState(3)
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      // Create liveness session in background
      try {
        const { data } = await api.post(`/identity/liveness/create-session`)
        if (data.available && data.sessionId) setSessionId(data.sessionId)
      } catch {
        // Session creation failure is non-fatal — we still capture the selfie
      }
      setPhase('live')
    } catch {
      setErrorMsg('Camera access denied. Please allow camera access or use photo upload instead.')
      setPhase('error')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  async function startCountdown() {
    setPhase('countdown')
    setCountdown(3)
    for (let i = 3; i >= 1; i--) {
      setCountdown(i)
      await new Promise<void>(r => setTimeout(r, 1000))
    }
    capture()
  }

  function capture() {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
    setCapturedBase64(base64)
    stopCamera()
    setPhase('preview')
  }

  function retake() {
    setCapturedBase64(null)
    setPhase('requesting')
    startCamera()
  }

  if (phase === 'error') {
    return (
      <div className="text-center p-6">
        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">{errorMsg}</p>
        {onSkip && (
          <button onClick={onSkip} className="text-sm text-indigo-600 font-semibold hover:underline">
            Use photo upload instead →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video max-w-sm mx-auto">
        {phase !== 'preview' && (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
        )}
        {capturedBase64 && phase === 'preview' && (
          <img src={`data:image/jpeg;base64,${capturedBase64}`} className="w-full h-full object-cover scale-x-[-1]" alt="Captured" />
        )}
        {/* Face oval guide */}
        {phase === 'live' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-white/60 rounded-full w-40 h-52" style={{boxShadow:'0 0 0 9999px rgba(0,0,0,0.4)'}} />
          </div>
        )}
        {/* Countdown overlay */}
        {phase === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-8xl font-black text-white animate-pulse">{countdown}</span>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {phase === 'live' && (
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">Position your face in the oval</p>
          <button onClick={startCountdown}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
            <Camera className="w-4 h-4" /> Take Selfie
          </button>
        </div>
      )}

      {phase === 'preview' && capturedBase64 && (
        <div className="flex justify-center gap-3">
          <button onClick={retake}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Retake
          </button>
          <button onClick={() => onCapture(capturedBase64, sessionId)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
            style={{background:'linear-gradient(135deg,#4F46E5,#0D9488)'}}>
            <Check className="w-4 h-4" /> Use This Photo
          </button>
        </div>
      )}

      {phase === 'requesting' && (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      )}
    </div>
  )
}
