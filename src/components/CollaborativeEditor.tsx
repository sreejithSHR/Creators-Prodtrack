import React, { useEffect, useState } from 'react';
import {
  Remirror,
  useRemirror,
  ThemeProvider,
  Toolbar,
  ToggleBoldButton,
  ToggleItalicButton,
  ToggleBulletListButton,
  HeadingLevelButtonGroup,
  EditorComponent,
} from '@remirror/react';
import {
  BoldExtension,
  ItalicExtension,
  BulletListExtension,
  HeadingExtension,
} from 'remirror/extensions';
import { CollaborationExtension } from '@remirror/extension-collaboration';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from 'y-prosemirror';
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

  const extensions = () => [
    new BoldExtension(),
    new ItalicExtension(),
    new BulletListExtension(),
    new HeadingExtension({ levels: [1, 2, 3] }),
    new CollaborationExtension({
      document: provider?.doc,
      cursorBuilder: (user) => ({
        name: user.name,
        color: user.color || '#999',
      }),
    }),
  ];

  const { manager, state, onChange } = useRemirror({
    extensions,
    content,
    stringHandler: 'html',
    selection: 'end',
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        initialContent={state}
        onChange={({ helpers }) => {
          const html = helpers.getHTML();
          onSave(html);
        }}
      >
        <Toolbar>
          <ToggleBoldButton />
          <ToggleItalicButton />
          <ToggleBulletListButton />
          <HeadingLevelButtonGroup />
        </Toolbar>
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
}
