import React, { useCallback, useEffect, useRef } from 'react';
import { Tldraw, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

interface WhiteboardProps {
  initialData?: string;
  onChange?: (data: string) => void;
}

export default function Whiteboard({ initialData, onChange }: WhiteboardProps) {
  const editorRef = useRef<any>(null);

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor;

    if (initialData) {
      try {
        const snapshot = JSON.parse(initialData);
        console.log('✅ Restoring snapshot:', snapshot);
        editor.loadSnapshot(snapshot);
      } catch (e) {
        console.error('❌ Failed to load whiteboard data:', e);
      }
    }

    // Listen for store changes
    const cleanup = editor.store.listen(
      () => {
        if (onChange) {
          const snapshot = editor.getSnapshot();
          const json = JSON.stringify(snapshot);
          console.log('📦 Whiteboard updated:', json);
          onChange(json);
        }
      },
      { source: 'user' }
    );

    return () => cleanup();
  }, [initialData, onChange]);

  return (
    <div className="h-[600px] w-full border border-gray-200 rounded-lg overflow-hidden">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
