import React, { useRef, useState, useEffect } from 'react'
import { Download, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface FloatingWhiteboardProps {
  isOpen?: boolean
}

export default function FloatingWhiteboard({ isOpen: initialOpen = false }: FloatingWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // קביעת גודל Canvas
    canvas.width = 400
    canvas.height = 500

    // עומס ומצב שמור מ-localStorage
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const savedCanvas = localStorage.getItem('whiteboard_canvas')
    if (savedCanvas) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = savedCanvas
    }

    setContext(ctx)
  }, [])

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!context) return
    setIsDrawing(true)

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (context) {
      context.closePath()
      // שמירה ל-localStorage
      const canvas = canvasRef.current
      if (canvas) {
        const imageData = canvas.toDataURL('image/png')
        localStorage.setItem('whiteboard_canvas', imageData)
      }
    }
  }

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    localStorage.removeItem('whiteboard_canvas')
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `הערות-${new Date().toISOString().slice(0, 10)}.png`
    link.click()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border-2 border-slate-200 p-2 mb-3">
          {/* כותרת */}
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-700 text-sm">לוח הערות דיגיטלי</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="border-2 border-slate-300 rounded cursor-crosshair bg-white block mb-2"
            style={{ touchAction: 'none' }}
          />

          {/* כפתורים */}
          <div className="flex gap-2">
            <button
              onClick={downloadCanvas}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-1.5 rounded transition flex items-center justify-center gap-1"
            >
              <Download size={14} />
              הורד
            </button>
            <button
              onClick={clearCanvas}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded transition flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              נקה
            </button>
          </div>
        </div>
      )}

      {/* כפתור פתיחה/סגירה */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg transition transform flex items-center justify-center text-white font-bold text-lg ${
          isOpen
            ? 'bg-slate-400 hover:bg-slate-500'
            : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-110'
        }`}
        title={isOpen ? 'סגור לוח' : 'פתח לוח הערות'}
      >
        {isOpen ? <ChevronDown size={20} /> : '📝'}
      </button>
    </div>
  )
}
