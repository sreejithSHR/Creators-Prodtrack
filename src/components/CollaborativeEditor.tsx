import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuthStore } from '../store/auth';

interface CollaborativeEditorProps {
  projectId: string;
  content: string;
  onSave: (content: string) => void;
}

export default function CollaborativeEditor({
  projectId,
  content,
  onSave,
}: CollaborativeEditorProps) {
  const { user } = useAuthStore();
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const wsProvider = new WebsocketProvider(
      'wss://demos.yjs.dev',
      `shot-list-${projectId}`,
      ydoc
    );

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
    };
  }, [projectId]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: provider?.doc,
      }),
      CollaborationCursor.configure({
        provider,
        user: {
          name: user?.email || 'Anonymous',
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onSave(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="prose max-w-none">
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-2 border-b flex gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${
              editor.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'
            }`}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${
              editor.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'
            }`}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-gray-200'
                : 'hover:bg-gray-200'
            }`}
          >
            Heading
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${
              editor.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-200'
            }`}
          >
            Bullet List
          </button>
        </div>
        <EditorContent editor={editor} className="p-4" />
      </div>
    </div>
  );
}