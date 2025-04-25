import React, { useCallback, useEffect, useRef } from 'react';
import { Tldraw, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

interface MindMapProps {
  initialData?: string;
  onChange?: (data: string) => void;
  readOnly?: boolean;
}

export default function MindMap({ initialData, onChange, readOnly = false }: MindMapProps) {
  const editorRef = useRef<any>(null);

  const handleMount = useCallback((editor: any) => {
    editorRef.current = editor;

    if (initialData) {
      try {
        const snapshot = JSON.parse(initialData);
        editor.loadSnapshot(snapshot);
      } catch (e) {
        console.error('Failed to load mindmap data:', e);
      }
    }

    if (!readOnly) {
      const cleanup = editor.store.listen(
        () => {
          if (onChange) {
            const snapshot = editor.getSnapshot();
            const json = JSON.stringify(snapshot);
            onChange(json);
          }
        },
        { source: 'user' }
      );

      return () => cleanup();
    }
  }, [initialData, onChange, readOnly]);

  return (
    <div className="h-[600px] w-full border border-gray-200 rounded-lg overflow-hidden">
      <Tldraw
        onMount={handleMount}
        readOnly={readOnly}
      />
    </div>
  );
}