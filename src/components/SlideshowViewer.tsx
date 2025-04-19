'use client'

import { useEffect, useRef } from 'react'
import { Tldraw, createTLStore, Editor } from 'tldraw'
import 'tldraw/tldraw.css'

type SlideshowViewerProps = {
  whiteboardJson: string | null // JSON string stored in Supabase
  dialogue?: string
  sceneName?: string
  location?: string
  day?: string
}

export default function SlideshowViewer({
  whiteboardJson,
  dialogue,
  sceneName,
  location,
  day,
}: SlideshowViewerProps) {
  const store = useRef(createTLStore()).current
  const editorRef = useRef<Editor | null>(null)

  useEffect(() => {
    if (!whiteboardJson) return

    try {
      const parsed = JSON.parse(whiteboardJson)
      const snapshot =
        parsed?.document?.store && 'document:document' in parsed.document.store
          ? parsed.document.store // wrapped structure
          : parsed // assume it's a raw snapshot

      if (snapshot && 'document:document' in snapshot) {
        editorRef.current?.store.loadSnapshot(snapshot)
      } else {
        console.warn('Invalid snapshot format', parsed)
      }
    } catch (e) {
      console.error('Failed to load whiteboard JSON:', e)
    }
  }, [whiteboardJson])

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 left-2 z-10 bg-white/80 p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold">{sceneName || 'Scene'}</h2>
        {location && <p><strong>Location:</strong> {location}</p>}
        {day && <p><strong>Time of Day:</strong> {day}</p>}
        {dialogue && <p className="mt-2 italic">{dialogue}</p>}
      </div>

      <Tldraw
        store={store}
        inferDarkMode
        readOnly
        hideUi
        onMount={(editor) => {
          editorRef.current = editor
        }}
      />
    </div>
  )
}
